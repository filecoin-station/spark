import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assertEquals } from 'zinnia:assert'

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
  await spark.fetchCAR(URL)
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
  await spark.submitRetrieval({ id: 0, success: true })
})
