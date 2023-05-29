import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'

test('integration', async () => {
  const spark = new Spark()
  for (let i = 0; i < 10; i++) {
    try {
      await spark.nextRetrieval()
      break
    } catch (err) {
      console.error(err)
    }
  }
})
