/* global Zinnia */

import { ActivityState } from './activity-state.js'
import { SPARK_VERSION, DELAY_BETWEEN_RETRIEVALS, MAX_CAR_SIZE } from './constants.js'
import { encodeHex } from './deno-encoding-hex.js'

const sleep = dt => new Promise(resolve => setTimeout(resolve, dt))

export default class Spark {
  #fetch
  #activity = new ActivityState()

  constructor ({ fetch = globalThis.fetch } = {}) {
    this.#fetch = fetch
  }

  async getRetrieval () {
    console.log('Getting retrieval...')
    const res = await this.#fetch('https://spark.fly.dev/rounds/current', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    await assertOkResponse(res, 'Failed to fetch the current SPARK round')
    const { retrievalTasks, ...round } = await res.json()
    console.log('Current SPARK round:', round)
    console.log('  %s retrieval tasks', retrievalTasks.length)

    const retrieval = retrievalTasks[Math.floor(Math.random() * retrievalTasks.length)]
    console.log({ retrieval })
    return retrieval
  }

  async fetchCAR (url, stats) {
    console.log(`Fetching ${url}...`)

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
    const res = await this.#fetch('https://spark.fly.dev/measurements', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    await assertOkResponse(res, 'Failed to submit measurement')
    const { id } = await res.json()
    console.log('Measurement submitted (id: %s)', id)
    return id
  }

  async nextRetrieval () {
    const { id: retrievalId, ...retrieval } = await this.getRetrieval()

    let success = false
    const stats = {
      timeout: false,
      startAt: new Date(),
      firstByteAt: null,
      endAt: null,
      carTooLarge: false,
      byteLength: 0,
      carChecksum: null,
      statusCode: null
    }
    const searchParams = new URLSearchParams({
      protocols: retrieval.protocol,
      providers: retrieval.providerAddress
    })
    const url = `ipfs://${retrieval.cid}?${searchParams.toString()}`
    try {
      await this.fetchCAR(url, stats)
      success = true
    } catch (err) {
      console.error(`Failed to fetch ${url}`)
      console.error(err)
    }

    const measurementId = await this.submitMeasurement(retrieval, { success, ...stats })
    Zinnia.jobCompleted()
    return measurementId
  }

  async run () {
    while (true) {
      try {
        await this.nextRetrieval()
        this.#activity.onHealthy()
      } catch (err) {
        if (err.statusCode === 400 && err.serverMessage === 'OUTDATED CLIENT') {
          this.#activity.onOutdatedClient()
        } else {
          this.#activity.onError()
        }
        console.error(err)
      }
      await sleep(DELAY_BETWEEN_RETRIEVALS)
    }
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
