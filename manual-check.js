//
// Usage:
// zinnia run manual-check.js
//

import { multiaddrToHttpUrl } from './lib/multiaddr.js'
import Spark from './lib/spark.js'

// The task to check, replace with your own values
const cid = 'bafybeiepi56qxfcwqgpstg25r6sonig7y3pzd37lwambzmlcmbnujjri4a'
const minerId = 'f010479'

// Run the check
const spark = new Spark()
const stats = { cid, minerId, indexerResult: null, statusCode: null, byteLength: 0 }
await spark.executeRetrievalCheck({ cid, minerId }, stats)
console.log('Measurement: %o', stats)

if (stats.providerAddress && stats.statusCode !== 200) {
  console.log('\nThe retrieval failed.')
  switch (stats.protocol) {
    case 'graphsync':
      console.log('You can get more details by running Lassie manually:\n')
      console.log('  lassie fetch -o /dev/null -vv --dag-scope block --protocols graphsync --providers %j', stats.providerAddress)
      console.log('\nHow to install Lassie: https://github.com/filecoin-project/lassie?tab=readme-ov-file#installation')
      break
    case 'http':
      try {
        const url = multiaddrToHttpUrl(stats.providerAddress)
        console.log('You can get more details by requesting the following URL yourself:\n')
        console.log('  %s', url)
        console.log('\nE.g. using `curl`:')
        console.log('  curl -i %j', url)
      } catch (err) {
        console.log('The provider address %j cannot be converted to a URL: %s', stats.providerAddress, err.message ?? err)
      }
      break
  }
}
