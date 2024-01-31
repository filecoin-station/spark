import { decodeBase64, decodeVarint } from '../vendor/deno-deps.js'

/**
 *
 * @param {string} cid
 * @returns {Promise<{
 *  indexerResult: string;
 *  provider?: { address: string; protocol: string };
 * }>}
 */
export async function queryTheIndex (cid) {
  const url = `https://cid.contact/cid/${encodeURIComponent(cid)}`

  let providerResults
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error('IPNI query failed, HTTP response: %s %s', res.status, await res.text())
      return { indexerResult: `ERROR_${res.status}` }
    }

    const result = await res.json()
    providerResults = result.MultihashResults.flatMap(r => r.ProviderResults)
    console.log('IPNI returned %s provider results', providerResults.length)
  } catch (err) {
    console.error('IPNI query failed.', err)
    return { indexerResult: 'ERROR_FETCH' }
  }

  let graphsyncProvider
  for (const p of providerResults) {
    // TODO: find only the contact advertised by the SP handling this deal
    // See https://filecoinproject.slack.com/archives/C048DLT4LAF/p1699958601915269?thread_ts=1699956597.137929&cid=C048DLT4LAF
    // bytes of CID of dag-cbor encoded DealProposal
    // https://github.com/filecoin-project/boost/blob/main/indexprovider/wrapper.go#L168-L172
    // https://github.com/filecoin-project/boost/blob/main/indexprovider/wrapper.go#L195

    const [protocolCode] = decodeVarint(decodeBase64(p.Metadata))
    const protocol = {
      0x900: 'bitswap',
      0x910: 'graphsync',
      0x0920: 'http',
      4128768: 'graphsync'
    }[protocolCode]

    const address = p.Provider.Addrs[0]
    if (!address) continue

    switch (protocol) {
      case 'http':
        return {
          indexerResult: 'OK',
          provider: { address, protocol }
        }

      case 'graphsync':
        if (!graphsyncProvider) {
          graphsyncProvider = {
            address: `${address}/p2p/${p.Provider.ID}`,
            protocol
          }
        }
    }
  }
  if (graphsyncProvider) {
    console.log('HTTP protocol is not advertised, falling back to Graphsync.')
    return {
      indexerResult: 'HTTP_NOT_ADVERTISED',
      provider: graphsyncProvider
    }
  }

  console.log('All advertisements are for unsupported protocols.')
  return { indexerResult: 'NO_VALID_ADVERTISEMENT' }
}
