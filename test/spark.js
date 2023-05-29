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
