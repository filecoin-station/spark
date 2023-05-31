import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assertInstanceOf, assertEquals } from 'zinnia:assert'

test('getRetrieval', async () => {
  const retrieval = { retrieval: 'retrieval' }
  const requests = []
  const fetch = async (url, opts) => {
    requests.push({ url, opts })
    return {
      async json () {
        return retrieval
      }
    }
  }
  const spark = new Spark({ fetch })
  assertEquals(await spark.getRetrieval(), retrieval)
  assertEquals(requests, [{
    url: 'https://spark.fly.dev/retrievals',
    opts: { method: 'POST' }
  }])
})

// TODO: test more cases
test('fetchCAR', async () => {
  const URL = 'url'
  const requests = []
  const fetch = async url => {
    requests.push({ url })
    return {
      status: 200,
      ok: true,
      body: (async function * () {
        yield new Uint8Array([1, 2, 3])
      })()
    }
  }
  const spark = new Spark({ fetch })
  const stats = await spark.fetchCAR(URL)
  assertInstanceOf(stats.start, Date)
  assertInstanceOf(stats.firstByte, Date)
  assertInstanceOf(stats.end, Date)
  assertEquals(stats.byteLength, 3)
  assertEquals(stats.status, 200)
  assertEquals(requests, [{ url: URL }])
})

test('submitRetrieval', async () => {
  const requests = []
  const fetch = async (url, opts) => {
    requests.push({ url, opts })
    assertEquals(url, 'https://spark.fly.dev/retrievals/0')
    assertEquals(opts.method, 'PATCH')
    assertEquals(JSON.parse(opts.body), { success: true })
    assertEquals(opts.headers['Content-Type'], 'application/json')
    return { status: 200 }
  }
  const spark = new Spark({ fetch })
  await spark.submitRetrieval(0, { success: true })
  assertEquals(requests, [
    {
      url: 'https://spark.fly.dev/retrievals/0',
      opts: {
        method: 'PATCH',
        body: JSON.stringify({ success: true }),
        headers: { 'Content-Type': 'application/json' }
      }
    }
  ])
})
