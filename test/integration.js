import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'

test('integration', async () => {
  const spark = new Spark()
  await spark.nextRetrieval()
})
