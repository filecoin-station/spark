import { test } from 'zinnia:test'
import { assertMatch, AssertionError } from 'zinnia:assert'
import { lookupMinerPeerId } from '../lib/miner-lookup.js'

const KNOWN_MINER_ID = 'f0142637'

test('lookup peer id of a known miner', async () => {
  const result = await lookupMinerPeerId(KNOWN_MINER_ID)
  assertMatch(result, /^12D3KooW/)
})

test('lookup peer id of a miner that does not exist', async () => {
  try {
    const result = await lookupMinerPeerId('f010')
    throw new AssertionError(
      `Expected "lookupMinerPeerId()" to fail, but it resolved with "${result}" instead.`
    )
  } catch (err) {
    assertMatch(err.toString(), /\bf010\b.*\bactor code is not miner/)
  }
})
