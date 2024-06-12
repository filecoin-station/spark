import { RPC_URL, RPC_AUTH } from './constants.js'

/**
 * @param {string} minerId A miner actor id, e.g. `f0142637`
 * @returns {Promise<string>} Miner's PeerId, e.g. `12D3KooWMsPmAA65yHAHgbxgh7CPkEctJHZMeM3rAvoW8CZKxtpG`
 */
export async function getMinerPeerId (minerId) {
  try {
    const res = await rpc('Filecoin.StateMinerInfo', minerId, null)
    return res.PeerId
  } catch (err) {
    err.message = `Cannot obtain miner info for ${minerId}: ${err.message}`
    throw err
  }
}

/**
 * @param {string} method
 * @param {unknown[]} params
 */
async function rpc (method, ...params) {
  const req = new Request(RPC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accepts: 'application/json',
      authorization: `Bearer ${RPC_AUTH}`
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    })
  })
  const res = await fetch(req, {
    signal: AbortSignal.timeout(60_000)
  })

  if (!res.ok) {
    throw new Error(`JSON RPC failed with ${res.code}: ${(await res.text()).trimEnd()}`)
  }

  const body = await res.json()
  if (body.error) {
    const err = new Error(body.error.message)
    err.name = 'FilecoinRpcError'
    err.code = body.code
    throw err
  }

  return body.result
}
