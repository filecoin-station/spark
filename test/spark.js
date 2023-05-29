import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assertInstanceOf, assertEquals } from 'zinnia:assert'

test('getRetrieval', async () => {
  const retrieval = { retrieval: 'retrieval' }
  const fetch = async (url, opts) => {
    assertEquals(url, 'https://spark.fly.dev/retrievals')
    assertEquals(opts.method, 'POST')
    return {
      async json () {
        return retrieval
      }
    }
  }
  const spark = new Spark({ fetch })
  assertEquals(await spark.getRetrieval(), retrieval)
})

// TODO: test more cases
test('fetchCAR', async () => {
  const URL = 'url'
  const fetch = async url => {
    assertEquals(url, URL)
    return {
      status: 200,
      ok: true,
      body: {
        [Symbol.asyncIterator]: () => {
          let i = 0
          return {
            async next () {
              if (i === 0) {
                i++
                return {
                  value: new Uint8Array([1, 2, 3]),
                  done: false
                }
              } else {
                return {
                  value: undefined,
                  done: true
                }
              }
            }
          }
        }
      }
    }
  }
  const spark = new Spark({ fetch })
  const stats = await spark.fetchCAR(URL)
  assertInstanceOf(stats.start, Date)
  assertInstanceOf(stats.firstByte, Date)
  assertInstanceOf(stats.end, Date)
  assertEquals(stats.byteLength, 3)
  assertEquals(stats.status, 200)
})

test('submitRetrieval', async () => {
  const fetch = async (url, opts) => {
    assertEquals(url, 'https://spark.fly.dev/retrievals/0')
    assertEquals(opts.method, 'PATCH')
    assertEquals(JSON.parse(opts.body), { success: true })
    assertEquals(opts.headers['Content-Type'], 'application/json')
    return { status: 200 }
  }
  const spark = new Spark({ fetch })
  await spark.submitRetrieval(0, { success: true })
})
