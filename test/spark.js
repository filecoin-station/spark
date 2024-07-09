/* global Zinnia */

import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assertInstanceOf, assertEquals, assertArrayIncludes } from 'zinnia:assert'
import { SPARK_VERSION } from '../lib/constants.js'

const KNOWN_CID = 'bafkreih25dih6ug3xtj73vswccw423b56ilrwmnos4cbwhrceudopdp5sq'

test('getRetrieval', async () => {
  const round = {
    roundId: '123',
    retrievalTasks: [
      {
        cid: 'bafkreidysaugf7iuvemebpzwxxas5rctbyiryykagup2ygkojmx7ag64gy',
        providerAddress: '/ip4/38.70.220.96/tcp/10201/p2p/12D3KooWSekjEqdSeHXkpQraVY2STL885svgmh6r2zEFHQKeJ3KD',
        protocol: 'graphsync'
      },
      {
        cid: 'QmUMpWycKJ7GUDJp9GBRX4qWUFUePUmHzri9Tm1CQHEzbJ',
        providerAddress: '/dns4/elastic.dag.house/tcp/443/wss/p2p/QmQzqxhK82kAmKvARFZSkUVS6fo9sySaiogAnx5EnZ6ZmC',
        protocol: 'bitswap'
      }
    ]
  }
  const requests = []
  const fetch = async (url, allOpts) => {
    const { signal, ...opts } = allOpts
    requests.push({ url, opts })
    return {
      status: 200,
      ok: true,
      async json () {
        return round
      }
    }
  }
  const spark = new Spark({ fetch })
  const retrieval = await spark.getRetrieval()
  assertArrayIncludes(round.retrievalTasks, [retrieval])
  assertEquals(requests, [{
    url: 'https://api.filspark.com/rounds/current',
    opts: {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  }])
})

// TODO: test more cases
test('fetchCAR', async () => {
  const requests = []
  const mockedFetch = async url => {
    requests.push(url.toString())
    return fetch(url)
  }
  const spark = new Spark({ fetch: mockedFetch })
  const stats = {
    timeout: false,
    startAt: new Date(),
    firstByteAt: null,
    endAt: null,
    carTooLarge: false,
    byteLength: 0,
    carChecksum: null,
    statusCode: null
  }
  await spark.fetchCAR('http', '/dns/frisbii.fly.dev/tcp/443/https', KNOWN_CID, stats)
  assertEquals(stats.statusCode, 200, 'stats.statusCode')
  assertEquals(stats.timeout, false, 'stats.timeout')
  assertInstanceOf(stats.startAt, Date)
  assertInstanceOf(stats.firstByteAt, Date)
  assertInstanceOf(stats.endAt, Date)
  assertEquals(stats.carTooLarge, false, 'stats.carTooLarge')
  assertEquals(stats.byteLength, 200, 'stats.byteLength')
  assertEquals(stats.carChecksum, '122069f03061f7ad4c14a5691b7e96d3ddd109023a6539a0b4230ea3dc92050e7136', 'stats.carChecksum')
  assertEquals(requests, [`https://frisbii.fly.dev/ipfs/${KNOWN_CID}?dag-scope=block`])
})

/* Disabled as long as we are fetching the top-level block only
test('fetchCAR exceeding MAX_CAR_SIZE', async () => {
  const fetch = async url => {
    return {
      status: 200,
      ok: true,
      body: (async function * () {
        const data = new Uint8Array(MAX_CAR_SIZE + 1)
        data.fill(11, 0, -1)
        yield data
      })()
    }
  }
  const spark = new Spark({ fetch })
  const stats = {
    timeout: false,
    carTooLarge: false,
    byteLength: 0,
    carChecksum: null,
    statusCode: null
  }
  await spark.fetchCAR('http', '/ip4/127.0.0.1/tcp/80/http', 'bafy', stats)
  assertEquals(stats.timeout, false)
  assertEquals(stats.carTooLarge, true)
  assertEquals(stats.byteLength, MAX_CAR_SIZE + 1)
  assertEquals(stats.carChecksum, null)
  assertEquals(stats.statusCode, 200)
})
*/

test('submitRetrieval', async () => {
  const requests = []
  const fetch = async (url, allOpts) => {
    const { signal, ...opts } = allOpts
    requests.push({ url, opts })
    return { status: 200, ok: true, async json () { return { id: 123 } } }
  }
  const spark = new Spark({ fetch })
  await spark.submitMeasurement({ cid: 'bafytest' }, {})
  assertEquals(requests, [
    {
      url: 'https://api.filspark.com/measurements',
      opts: {
        method: 'POST',
        body: JSON.stringify({
          sparkVersion: SPARK_VERSION,
          zinniaVersion: Zinnia.versions.zinnia,
          cid: 'bafytest',
          participantAddress: Zinnia.walletAddress,
          stationId: Zinnia.stationId
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    }
  ])
})
