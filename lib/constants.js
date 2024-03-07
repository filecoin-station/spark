export const SPARK_VERSION = '1.9.0'
export const MAX_CAR_SIZE = 200 * 1024 * 1024 // 200 MB
export const APPROX_ROUND_LENGTH_IN_MS = 20 * 60_000 // 20 minutes

export const RPC_REQUEST = new Request('https://api.node.glif.io/', {
  headers: {
    authorization: 'Bearer 6bbc171ebfdd78b2644602ce7463c938'
  }
})
