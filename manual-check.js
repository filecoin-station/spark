//
// Usage:
// zinnia run manual-check.js
//

import Spark from './lib/spark.js'

// The task to check, replace with your own values
const cid = 'bafybeiepi56qxfcwqgpstg25r6sonig7y3pzd37lwambzmlcmbnujjri4a'
const minerId = 'f010479'

// Run the check
const spark = new Spark()
const stats = { cid, minerId, indexerResult: null, statusCode: null, byteLength: 0 }
await spark.executeRetrievalCheck({ cid, minerId }, stats)
console.log('Measurement: %o', stats)
