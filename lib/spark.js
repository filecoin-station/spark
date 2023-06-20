/* global Zinnia */

import { ActivityState } from './activity-state.js'

const sleep = dt => new Promise(resolve => setTimeout(resolve, dt))
const DELAY_BETWEEN_RETRIEVALS = 10_000

export default class Spark {
  #fetch
  #activity = new ActivityState()

  constructor ({ fetch = globalThis.fetch } = {}) {
    this.#fetch = fetch
  }

  async getRetrieval () {
    console.log('Getting retrieval...')
    const res = await this.#fetch('https://spark.fly.dev/retrievals', {
      method: 'POST'
    })
    const retrieval = await res.json()
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
          resetTimeout()
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

  async submitRetrieval (id, stats) {
    console.log('Submitting retrieval...')
    const res = await this.#fetch(`https://spark.fly.dev/retrievals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...stats,
        walletAddress: Zinnia.walletAddress
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (res.status !== 200) {
      let body
      try {
        body = await res.text()
      } catch {}
      throw new Error(`Failed to submit retrieval (${res.status}): ${body}`)
    }
    console.log('Retrieval submitted')
  }

  async nextRetrieval () {
    const retrieval = await this.getRetrieval()

    let success = false
    const stats = {
      timeout: false,
      startAt: new Date(),
      firstByteAt: null,
      endAt: null,
      byteLength: 0,
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

    await this.submitRetrieval(retrieval.id, { success, ...stats })
    Zinnia.jobCompleted()
    return retrieval.id
  }

  async run () {
    while (true) {
      try {
        await this.nextRetrieval()
        this.#activity.onSuccess()
      } catch (err) {
        this.#activity.onError()
        console.error(err)
      }
      await sleep(DELAY_BETWEEN_RETRIEVALS)
    }
  }
}
