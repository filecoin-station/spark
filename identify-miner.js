import { rpc } from './lib/miner-info.js'
import { decodeBase64 } from './vendor/deno-deps.js'
import { multiaddr } from './vendor/multiaddr.js'

const minerId = 'f03156722'

const info = await rpc('Filecoin.StateMinerInfo', minerId, null)
console.log(info)

const binary = info.Multiaddrs[0]
console.log(binary)
const addr = multiaddr(decodeBase64(binary))
console.log(addr.toString())

const res = await Zinnia.requestProtocol(
    addr.toString() + '/p2p/' + info.PeerId,
    '/ipfs/id/1.0.0',
    new Uint8Array(0)
)

const chunks = []
for await (const chunk of res) {
    chunks.push(chunk);
}
const bytes =chunks.map(c => c.values()).flat()
console.log('BYTES', bytes)

const data = new Uint8Array(bytes)
console.log('DATA: %o', data)

