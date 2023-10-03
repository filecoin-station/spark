// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually
//
// You can re-create this file by running the following command:
// deno bundle "https://deno.land/std@0.203.0/encoding/hex.ts" > lib/deno-encoding-hex.js

const encoder = new TextEncoder()
function getTypeName (value) {
  const type = typeof value
  if (type !== 'object') {
    return type
  } else if (value === null) {
    return 'null'
  } else {
    return value?.constructor?.name ?? 'object'
  }
}
function validateBinaryLike (source) {
  if (typeof source === 'string') {
    return encoder.encode(source)
  } else if (source instanceof Uint8Array) {
    return source
  } else if (source instanceof ArrayBuffer) {
    return new Uint8Array(source)
  }
  throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`)
}
const hexTable = new TextEncoder().encode('0123456789abcdef')
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()
function errInvalidByte (__byte) {
  return new TypeError(`Invalid byte '${String.fromCharCode(__byte)}'`)
}
function errLength () {
  return new RangeError('Odd length hex string')
}
function fromHexChar (__byte) {
  if (__byte >= 48 && __byte <= 57) return __byte - 48
  if (__byte >= 97 && __byte <= 102) return __byte - 97 + 10
  if (__byte >= 65 && __byte <= 70) return __byte - 65 + 10
  throw errInvalidByte(__byte)
}
function encode (src) {
  const dst = new Uint8Array(src.length * 2)
  for (let i = 0; i < dst.length; i++) {
    const v = src[i]
    dst[i * 2] = hexTable[v >> 4]
    dst[i * 2 + 1] = hexTable[v & 0x0f]
  }
  return dst
}
function encodeHex (src) {
  const u8 = validateBinaryLike(src)
  const dst = new Uint8Array(u8.length * 2)
  for (let i = 0; i < dst.length; i++) {
    const v = u8[i]
    dst[i * 2] = hexTable[v >> 4]
    dst[i * 2 + 1] = hexTable[v & 0x0f]
  }
  return textDecoder.decode(dst)
}
function decode (src) {
  const dst = new Uint8Array(src.length / 2)
  for (let i = 0; i < dst.length; i++) {
    const a = fromHexChar(src[i * 2])
    const b = fromHexChar(src[i * 2 + 1])
    dst[i] = a << 4 | b
  }
  if (src.length % 2 === 1) {
    fromHexChar(src[dst.length * 2])
    throw errLength()
  }
  return dst
}
function decodeHex (src) {
  const u8 = textEncoder.encode(src)
  const dst = new Uint8Array(u8.length / 2)
  for (let i = 0; i < dst.length; i++) {
    const a = fromHexChar(u8[i * 2])
    const b = fromHexChar(u8[i * 2 + 1])
    dst[i] = a << 4 | b
  }
  if (u8.length % 2 === 1) {
    fromHexChar(u8[dst.length * 2])
    throw errLength()
  }
  return dst
}
export { encode }
export { encodeHex }
export { decode }
export { decodeHex }
