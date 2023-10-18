import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assert } from 'zinnia:assert'

test('integration', async () => {
  const spark = new Spark()
  const measurementId = await spark.nextRetrieval()
  const res = await fetch(`https://api.filspark.com/measurements/${measurementId}`)
  assert(res.ok)
  const retrieval = await res.json()
  assert(retrieval.startAt)
  assert(retrieval.finishedAt)
})
