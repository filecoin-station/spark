// 3rd-party dependencies from Denoland
//
// Run the following script after making change in this file:
//   deno bundle deps.ts vendor/deno-deps.js
//

export { encodeHex } from 'https://deno.land/std@0.203.0/encoding/hex.ts'
export { decode as decodeVarint } from 'https://deno.land/x/varint@v2.0.0/varint.ts'
