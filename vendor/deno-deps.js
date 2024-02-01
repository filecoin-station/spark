// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const encoder = new TextEncoder();
function getTypeName(value) {
    const type = typeof value;
    if (type !== "object") {
        return type;
    } else if (value === null) {
        return "null";
    } else {
        return value?.constructor?.name ?? "object";
    }
}
function validateBinaryLike(source) {
    if (typeof source === "string") {
        return encoder.encode(source);
    } else if (source instanceof Uint8Array) {
        return source;
    } else if (source instanceof ArrayBuffer) {
        return new Uint8Array(source);
    }
    throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer. Received a value of the type ${getTypeName(source)}.`);
}
const hexTable = new TextEncoder().encode("0123456789abcdef");
new TextEncoder();
const textDecoder = new TextDecoder();
function encodeHex(src) {
    const u8 = validateBinaryLike(src);
    const dst = new Uint8Array(u8.length * 2);
    for(let i = 0; i < dst.length; i++){
        const v = u8[i];
        dst[i * 2] = hexTable[v >> 4];
        dst[i * 2 + 1] = hexTable[v & 0x0f];
    }
    return textDecoder.decode(dst);
}
function decodeBase64(b64) {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for(let i = 0; i < size; i++){
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes;
}
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
export { encodeHex as encodeHex };
export { decodeBase64 as decodeBase64 };
export { decode as decodeVarint };
