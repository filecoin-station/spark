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
