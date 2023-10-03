/* global Zinnia */

import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assertInstanceOf, assertEquals, assertArrayIncludes } from 'zinnia:assert'
import { SPARK_VERSION } from '../lib/constants.js'

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
  const fetch = async (url, opts) => {
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
    url: 'https://spark.fly.dev/rounds/current',
    opts: {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  }])
})

// TODO: test more cases
test('fetchCAR', async () => {
  const URL = 'url'
  const requests = []
  const fetch = async url => {
    requests.push({ url })
    return {
      status: 200,
      ok: true,
      body: (async function * () {
        yield new Uint8Array([1, 2, 3])
      })()
    }
  }
  const spark = new Spark({ fetch })
  const stats = {
    timeout: false,
    startAt: new Date(),
    firstByteAt: null,
    endAt: null,
    byteLength: 0,
    statusCode: null
  }
  await spark.fetchCAR(URL, stats)
  assertEquals(stats.timeout, false)
  assertInstanceOf(stats.startAt, Date)
  assertInstanceOf(stats.firstByteAt, Date)
  assertInstanceOf(stats.endAt, Date)
  assertEquals(stats.byteLength, 3)
  assertEquals(stats.statusCode, 200)
  assertEquals(requests, [{ url: URL }])
})

test('submitRetrieval', async () => {
  const requests = []
  const fetch = async (url, opts) => {
    requests.push({ url, opts })
    return { status: 200, ok: true, async json () { return { id: 123 } } }
  }
  const spark = new Spark({ fetch })
  await spark.submitMeasurement({ cid: 'bafytest' }, { success: true })
  assertEquals(requests, [
    {
      url: 'https://spark.fly.dev/measurements',
      opts: {
        method: 'POST',
        body: JSON.stringify({
          sparkVersion: SPARK_VERSION,
          zinniaVersion: Zinnia.versions.zinnia,
          cid: 'bafytest',
          success: true,
          participantAddress: Zinnia.walletAddress
        }),
        headers: { 'Content-Type': 'application/json' }
      }
    }
  ])
})
