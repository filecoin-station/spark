import Spark from '../lib/spark.js'
import { test } from 'zinnia:test'
import { assert, assertEquals } from 'zinnia:assert'

const KNOWN_CID = 'bafkreih25dih6ug3xtj73vswccw423b56ilrwmnos4cbwhrceudopdp5sq'

test('integration', async () => {
  const spark = new Spark()
  const measurementId = await spark.nextRetrieval()
  const res = await fetch(`https://api.filspark.com/measurements/${measurementId}`)
  assert(res.ok)
  const retrieval = await res.json()
  assert(retrieval.startAt)
  assert(retrieval.finishedAt)
})

test('retrieval check for our CID', async () => {
  const spark = new Spark()
  spark.getRetrieval = async () => ({ cid: KNOWN_CID })
  const measurementId = await spark.nextRetrieval()
  const res = await fetch(`https://api.filspark.com/measurements/${measurementId}`)
  assert(res.ok)
  const m = await res.json()
  const assertProp = (prop, expectedValue) => assertEquals(m[prop], expectedValue, prop)

  assertProp('cid', KNOWN_CID)
  // TODO - spark-api does not record this field yet
  // assertProp('indexerResult', 'OK')
  assertProp('providerAddress', '/dns/frisbii.fly.dev/tcp/443/https')
  assertProp('protocol', 'http')
  assertProp('timeout', false)
  assertProp('statusCode', 200)
  assertProp('byteLength', 200)
  assertProp('carTooLarge', false)
  // TODO - spark-api does not record this field yet
  // assertProp('carChecksum', '122069f03061f7ad4c14a5691b7e96d3ddd109023a6539a0b4230ea3dc92050e7136')
})
