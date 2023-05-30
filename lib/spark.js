/* global Zinnia */

import { assertEquals } from 'zinnia:assert'

const sleep = dt => new Promise(resolve => setTimeout(resolve, dt))

export default class Spark {
  #fetch

  constructor ({ fetch = globalThis.fetch } = {}) {
    this.#fetch = fetch
  }

  async getRetrieval () {
    console.log('Geting retrieval...')
    const res = await this.#fetch('https://spark.fly.dev/retrievals', {
      method: 'POST'
    })
    const retrieval = await res.json()
    console.log({ retrieval })
    return retrieval
  }

  async fetchCAR (url) {
    // TODO: Ensure these fields are persisted by `spark-api`
    const stats = {
      start: new Date(),
      firstByte: null,
      end: null,
      byteLength: 0,
      status: null
    }
    console.log('Fetching CAR...')

    // Abort if no progress was made for 10 seconds
    const controller = new AbortController()
    const { signal } = controller
    let timeout
    const startTimeout = () => {
      if (timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => controller.abort(), 10_000)
    }

    try {
      startTimeout()
      const res = await this.#fetch(url, { signal })
      stats.status = res.status

      if (res.ok) {
        startTimeout()
        for await (const value of res.body) {
          if (stats.firstByte === null) {
            stats.firstByte = new Date()
          }
          stats.byteLength += value.byteLength
          startTimeout()
        }
      }
    } finally {
      clearTimeout(timeout)
    }

    stats.end = new Date()
    console.log(stats)
    return stats
  }

  async submitRetrieval (id, stats) {
    console.log('Submitting retrieval...')
    const res = await this.#fetch(`https://spark.fly.dev/retrievals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(stats),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    assertEquals(res.status, 200)
    console.log('Retrieval submitted')
  }

  async nextRetrieval () {
    const retrieval = await this.getRetrieval()

    let success = false
    let stats
    const url = `https://strn.pl/ipfs/${retrieval.cid}`
    try {
      stats = await this.fetchCAR(url)
      success = true
    } catch (err) {
      console.error(`Failed to fetch ${url}`)
      console.error(err)
    }

    await this.submitRetrieval(retrieval.id, { success, ...stats })
    Zinnia.jobCompleted()
  }

  async run () {
    while (true) {
      try {
        await this.nextRetrieval()
      } catch (err) {
        Zinnia.activity.error('SPARK failed reporting retrieval')
        console.error(err)
      }
      await sleep(1_000)
    }
  }
}
