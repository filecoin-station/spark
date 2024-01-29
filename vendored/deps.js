// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const MaxUInt64 = 18446744073709551615n;
const REST = 0x7f;
const SHIFT = 7;
function decode(buf, offset = 0) {
    for(let i = offset, len = Math.min(buf.length, offset + 10), shift = 0, decoded = 0n; i < len; i += 1, shift += SHIFT){
        let __byte = buf[i];
        decoded += BigInt((__byte & REST) * Math.pow(2, shift));
        if (!(__byte & 0x80) && decoded > MaxUInt64) {
            throw new RangeError("overflow varint");
        }
        if (!(__byte & 0x80)) return [
            decoded,
            i + 1
        ];
    }
    throw new RangeError("malformed or overflow varint");
}
export { decode as decodeVarint };
