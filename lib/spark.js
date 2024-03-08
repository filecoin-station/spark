/* global Zinnia */

import { ActivityState } from './activity-state.js'
import { SPARK_VERSION, MAX_CAR_SIZE, APPROX_ROUND_LENGTH_IN_MS } from './constants.js'
import { queryTheIndex } from './ipni-client.js'
import { lookupMinerPeerId } from './miner-lookup.js'
import {
  encodeHex
} from '../vendor/deno-deps.js'

const sleep = dt => new Promise(resolve => setTimeout(resolve, dt))

export default class Spark {
  #fetch
  #activity = new ActivityState()
  #maxTasksPerNode = 360

  constructor ({ fetch = globalThis.fetch } = {}) {
    this.#fetch = fetch
    this.lookupMinerPeerId = lookupMinerPeerId
  }

  async getRetrieval () {
    console.log('Getting current SPARK round details...')
    const res = await this.#fetch('https://api.filspark.com/rounds/current', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000)
    })
    await assertOkResponse(res, 'Failed to fetch the current SPARK round')
    this.#activity.onHealthy()
    const { retrievalTasks, maxTasksPerNode, ...round } = await res.json()
    console.log('Current SPARK round:', round)
    console.log('  %s max tasks per node', maxTasksPerNode ?? '<n/a>')
    console.log('  %s retrieval tasks', retrievalTasks.length)
    if (maxTasksPerNode) this.#maxTasksPerNode = maxTasksPerNode

    const retrieval = retrievalTasks[Math.floor(Math.random() * retrievalTasks.length)]
    console.log({ retrieval })
    return retrieval
  }

  async executeRetrievalCheck (retrieval, stats) {
    console.log(`Calling Filecoin JSON-RPC to get PeerId of miner ${retrieval.minerId}`)
    try {
      const peerId = await this.lookupMinerPeerId(retrieval.minerId)
      console.log(`Found peer id: ${peerId}`)
      stats.providerId = peerId
    } catch (err) {
      console.error(err)
      // There are three common error cases:
      //  1. We are offline
      //  2. The JSON RPC provider is down
      //  3. JSON RPC errors like when Miner ID is not a known actor
      // There isn't much we can do in the first two cases. We can notify the user that we are not
      // performing any jobs and wait until the problem is resolved.
      // The third case should not happen unless we made a mistake, so we want to learn about it
      if (err.name === 'FilecoinRpcError') {
        // TODO: report the error to Sentry
        console.error('The error printed above was not expected, please report it on GitHub:')
        console.error('https://github.com/filecoin-station/spark/issues/new')
      } else {
        this.#activity.onError()
      }
      err.reported = true
      // Abort the check, no measurement should be recorded
      throw err
    }

    console.log(`Querying IPNI to find retrieval providers for ${retrieval.cid}`)
    const { indexerResult, provider } = await queryTheIndex(retrieval.cid, stats.providerId)
    stats.indexerResult = indexerResult

    const providerFound = indexerResult === 'OK' || indexerResult === 'HTTP_NOT_ADVERTISED'
    if (!providerFound) return

    stats.protocol = provider.protocol
    stats.providerAddress = provider.address

    const searchParams = new URLSearchParams({
      // See https://github.com/filecoin-project/lassie/blob/main/docs/HTTP_SPEC.md#dag-scope-request-query-parameter
      // Only the root block at the end of the path is returned after blocks required to verify the specified path segments.
      'dag-scope': 'block',
      protocols: provider.protocol,
      providers: provider.address
    })
    const url = `ipfs://${retrieval.cid}?${searchParams.toString()}`
    try {
      await this.fetchCAR(url, stats)
    } catch (err) {
      console.error(`Failed to fetch ${url}`)
      console.error(err)
    }
  }

  async fetchCAR (url, stats) {
    console.log(`Fetching: ${url}`)

    // Abort if no progress was made for 60 seconds
    const controller = new AbortController()
    const { signal } = controller
    let timeout
    const resetTimeout = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        stats.timeout = true
        controller.abort()
      }, 60_000)
    }

    // WebCrypto API does not support streams yet, the hashing function requires entire data
    // to be provided at once. See https://github.com/w3c/webcrypto/issues/73
    const carBuffer = new ArrayBuffer(0, { maxByteLength: MAX_CAR_SIZE })
    const carBytes = new Uint8Array(carBuffer)

    try {
      resetTimeout()
      const res = await this.#fetch(url, { signal })
      stats.statusCode = res.status

      if (res.ok) {
        resetTimeout()
        for await (const value of res.body) {
          if (stats.firstByteAt === null) {
            stats.firstByteAt = new Date()
          }
          stats.byteLength += value.byteLength

          // We want to limit how large content we are willing to download.
          // 1. To make sure we don't spend too much time (and network bandwidth) on a single task,
          //    so that we can complete more tasks per round
          // 2. Until we have streaming hashes, we need to keep the entire payload in memory, and so
          //    we need to put an upper limit on how much memory we consume.
          if (stats.byteLength > MAX_CAR_SIZE) {
            stats.carTooLarge = true
            break
          }

          const offset = carBuffer.byteLength
          carBuffer.resize(offset + value.byteLength)
          carBytes.set(value, offset)

          resetTimeout()
        }

        if (!stats.carTooLarge) {
          const digest = await crypto.subtle.digest('sha-256', carBytes)
          // 12 is the code for sha2-256
          // 20 is the digest length (32 bytes = 256 bits)
          stats.carChecksum = '1220' + encodeHex(digest)
        }
      } else {
        console.error('Retrieval failed with status code %s: %s',
          res.status, await res.text())
      }
    } finally {
      clearTimeout(timeout)
    }

    stats.endAt = new Date()
    console.log(stats)
  }

  async submitMeasurement (task, stats) {
    console.log('Submitting measurement...')
    const payload = {
      sparkVersion: SPARK_VERSION,
      zinniaVersion: Zinnia.versions.zinnia,
      ...task,
      ...stats,
      participantAddress: Zinnia.walletAddress
    }
    console.log('%o', payload)
    const res = await this.#fetch('https://api.filspark.com/measurements', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10_000)
    })
    await assertOkResponse(res, 'Failed to submit measurement')
    const { id } = await res.json()
    console.log('Measurement submitted (id: %s)', id)
    return id
  }

  async nextRetrieval () {
    const { id: retrievalId, ...retrieval } = await this.getRetrieval()

    const stats = {
      timeout: false,
      startAt: new Date(),
      firstByteAt: null,
      endAt: null,
      carTooLarge: false,
      byteLength: 0,
      carChecksum: null,
      statusCode: null,
      providerId: null,
      indexerResult: null
    }

    await this.executeRetrievalCheck(retrieval, stats)

    const measurementId = await this.submitMeasurement(retrieval, { ...stats })
    Zinnia.jobCompleted()
    return measurementId
  }

  async run () {
    while (true) {
      const started = Date.now()
      try {
        await this.nextRetrieval()
        this.#activity.onHealthy()
      } catch (err) {
        this.handleRunError(err)
      }
      const duration = Date.now() - started
      const baseDelay = APPROX_ROUND_LENGTH_IN_MS / this.#maxTasksPerNode
      const delay = baseDelay - duration
      if (delay > 0) {
        console.log('Sleeping for %s seconds before starting the next task...', Math.round(delay / 1000))
        await sleep(delay)
      }
    }
  }

  handleRunError (err) {
    if (err.reported) return

    if (err.statusCode === 400 && err.serverMessage === 'OUTDATED CLIENT') {
      this.#activity.onOutdatedClient()
    } else {
      this.#activity.onError()
    }
    console.error(err)
  }
}

async function assertOkResponse (res, errorMsg) {
  if (res.ok) return

  let body
  try {
    body = await res.text()
  } catch {}
  const err = new Error(`${errorMsg ?? 'Fetch failed'} (${res.status}): ${body}`)
  err.statusCode = res.status
  err.serverMessage = body
  throw err
}
