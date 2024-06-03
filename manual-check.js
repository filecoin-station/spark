//
// Usage:
// zinnia run manual-check.js
//

import Spark from './lib/spark.js'

// The task to check, replace with your own values
const cid = 'bafkreih25dih6ug3xtj73vswccw423b56ilrwmnos4cbwhrceudopdp5sq'
const minerId = 'f010479'

// Run the check
const spark = new Spark()
const stats = { cid, minerId, indexerResult: null, statusCode: null, byteLength: 0 }
await spark.executeRetrievalCheck({ cid, minerId }, stats)
console.log('Measurement: %o', stats)
