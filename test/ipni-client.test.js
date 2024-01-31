import { test } from 'zinnia:test'
import { assertEquals } from 'zinnia:assert'
import { queryTheIndex } from '../lib/ipni-client.js'

const KNOWN_CID = 'bafkreih25dih6ug3xtj73vswccw423b56ilrwmnos4cbwhrceudopdp5sq'

test('query advertised CID', async () => {
  const result = await queryTheIndex(KNOWN_CID)
  assertEquals(result, {
    indexerResult: 'OK',
    provider: {
      address: '/dns/frisbii.fly.dev/tcp/443/https',
      protocol: 'http'
    }
  })
})
