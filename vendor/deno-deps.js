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
const typeofs = [
    "string",
    "number",
    "bigint",
    "symbol"
];
const objectTypeNames = [
    "Function",
    "Generator",
    "AsyncGenerator",
    "GeneratorFunction",
    "AsyncGeneratorFunction",
    "AsyncFunction",
    "Observable",
    "Array",
    "Buffer",
    "Object",
    "RegExp",
    "Date",
    "Error",
    "Map",
    "Set",
    "WeakMap",
    "WeakSet",
    "ArrayBuffer",
    "SharedArrayBuffer",
    "DataView",
    "Promise",
    "URL",
    "HTMLElement",
    "Int8Array",
    "Uint8Array",
    "Uint8ClampedArray",
    "Int16Array",
    "Uint16Array",
    "Int32Array",
    "Uint32Array",
    "Float32Array",
    "Float64Array",
    "BigInt64Array",
    "BigUint64Array"
];
function is(value) {
    if (value === null) {
        return "null";
    }
    if (value === void 0) {
        return "undefined";
    }
    if (value === true || value === false) {
        return "boolean";
    }
    const typeOf = typeof value;
    if (typeofs.includes(typeOf)) {
        return typeOf;
    }
    if (typeOf === "function") {
        return "Function";
    }
    if (Array.isArray(value)) {
        return "Array";
    }
    if (isBuffer(value)) {
        return "Buffer";
    }
    const objectType = getObjectType(value);
    if (objectType) {
        return objectType;
    }
    return "Object";
}
function isBuffer(value) {
    return value && value.constructor && value.constructor.isBuffer && value.constructor.isBuffer.call(null, value);
}
function getObjectType(value) {
    const objectTypeName = Object.prototype.toString.call(value).slice(8, -1);
    if (objectTypeNames.includes(objectTypeName)) {
        return objectTypeName;
    }
    return void 0;
}
class Type {
    constructor(major, name, terminal){
        this.major = major;
        this.majorEncoded = major << 5;
        this.name = name;
        this.terminal = terminal;
    }
    toString() {
        return `Type[${this.major}].${this.name}`;
    }
    compare(typ) {
        return this.major < typ.major ? -1 : this.major > typ.major ? 1 : 0;
    }
}
Type.uint = new Type(0, "uint", true);
Type.negint = new Type(1, "negint", true);
Type.bytes = new Type(2, "bytes", true);
Type.string = new Type(3, "string", true);
Type.array = new Type(4, "array", false);
Type.map = new Type(5, "map", false);
Type.tag = new Type(6, "tag", false);
Type.float = new Type(7, "float", true);
Type.false = new Type(7, "false", true);
Type.true = new Type(7, "true", true);
Type.null = new Type(7, "null", true);
Type.undefined = new Type(7, "undefined", true);
Type.break = new Type(7, "break", true);
class Token {
    constructor(type, value, encodedLength){
        this.type = type;
        this.value = value;
        this.encodedLength = encodedLength;
        this.encodedBytes = void 0;
        this.byteValue = void 0;
    }
    toString() {
        return `Token[${this.type}].${this.value}`;
    }
}
const useBuffer = globalThis.process && !globalThis.process.browser && globalThis.Buffer && typeof globalThis.Buffer.isBuffer === "function";
const textDecoder1 = new TextDecoder();
const textEncoder = new TextEncoder();
function isBuffer$1(buf2) {
    return useBuffer && globalThis.Buffer.isBuffer(buf2);
}
function asU8A(buf2) {
    if (!(buf2 instanceof Uint8Array)) {
        return Uint8Array.from(buf2);
    }
    return isBuffer$1(buf2) ? new Uint8Array(buf2.buffer, buf2.byteOffset, buf2.byteLength) : buf2;
}
const toString = useBuffer ? (bytes, start, end)=>{
    return end - start > 64 ? globalThis.Buffer.from(bytes.subarray(start, end)).toString("utf8") : utf8Slice(bytes, start, end);
} : (bytes, start, end)=>{
    return end - start > 64 ? textDecoder1.decode(bytes.subarray(start, end)) : utf8Slice(bytes, start, end);
};
const fromString = useBuffer ? (string)=>{
    return string.length > 64 ? globalThis.Buffer.from(string) : utf8ToBytes(string);
} : (string)=>{
    return string.length > 64 ? textEncoder.encode(string) : utf8ToBytes(string);
};
const fromArray = (arr)=>{
    return Uint8Array.from(arr);
};
const slice = useBuffer ? (bytes, start, end)=>{
    if (isBuffer$1(bytes)) {
        return new Uint8Array(bytes.subarray(start, end));
    }
    return bytes.slice(start, end);
} : (bytes, start, end)=>{
    return bytes.slice(start, end);
};
const concat = useBuffer ? (chunks, length)=>{
    chunks = chunks.map((c)=>c instanceof Uint8Array ? c : globalThis.Buffer.from(c));
    return asU8A(globalThis.Buffer.concat(chunks, length));
} : (chunks, length)=>{
    const out = new Uint8Array(length);
    let off = 0;
    for (let b of chunks){
        if (off + b.length > out.length) {
            b = b.subarray(0, out.length - off);
        }
        out.set(b, off);
        off += b.length;
    }
    return out;
};
const alloc = useBuffer ? (size)=>{
    return globalThis.Buffer.allocUnsafe(size);
} : (size)=>{
    return new Uint8Array(size);
};
function compare(b1, b2) {
    if (isBuffer$1(b1) && isBuffer$1(b2)) {
        return b1.compare(b2);
    }
    for(let i = 0; i < b1.length; i++){
        if (b1[i] === b2[i]) {
            continue;
        }
        return b1[i] < b2[i] ? -1 : 1;
    }
    return 0;
}
function utf8ToBytes(str) {
    const out = [];
    let p = 0;
    for(let i = 0; i < str.length; i++){
        let c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = c >> 6 | 192;
            out[p++] = c & 63 | 128;
        } else if ((c & 64512) === 55296 && i + 1 < str.length && (str.charCodeAt(i + 1) & 64512) === 56320) {
            c = 65536 + ((c & 1023) << 10) + (str.charCodeAt(++i) & 1023);
            out[p++] = c >> 18 | 240;
            out[p++] = c >> 12 & 63 | 128;
            out[p++] = c >> 6 & 63 | 128;
            out[p++] = c & 63 | 128;
        } else {
            out[p++] = c >> 12 | 224;
            out[p++] = c >> 6 & 63 | 128;
            out[p++] = c & 63 | 128;
        }
    }
    return out;
}
function utf8Slice(buf2, offset, end) {
    const res = [];
    while(offset < end){
        const firstByte = buf2[offset];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (offset + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch(bytesPerSequence){
                case 1:
                    if (firstByte < 128) {
                        codePoint = firstByte;
                    }
                    break;
                case 2:
                    secondByte = buf2[offset + 1];
                    if ((secondByte & 192) === 128) {
                        tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                        if (tempCodePoint > 127) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 3:
                    secondByte = buf2[offset + 1];
                    thirdByte = buf2[offset + 2];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                        if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                            codePoint = tempCodePoint;
                        }
                    }
                    break;
                case 4:
                    secondByte = buf2[offset + 1];
                    thirdByte = buf2[offset + 2];
                    fourthByte = buf2[offset + 3];
                    if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                        tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                        if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                            codePoint = tempCodePoint;
                        }
                    }
            }
        }
        if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
        } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        offset += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
}
const MAX_ARGUMENTS_LENGTH = 4096;
function decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= 4096) {
        return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i = 0;
    while(i < len){
        res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
}
class Bl {
    constructor(chunkSize = 256){
        this.chunkSize = chunkSize;
        this.cursor = 0;
        this.maxCursor = -1;
        this.chunks = [];
        this._initReuseChunk = null;
    }
    reset() {
        this.cursor = 0;
        this.maxCursor = -1;
        if (this.chunks.length) {
            this.chunks = [];
        }
        if (this._initReuseChunk !== null) {
            this.chunks.push(this._initReuseChunk);
            this.maxCursor = this._initReuseChunk.length - 1;
        }
    }
    push(bytes) {
        let topChunk = this.chunks[this.chunks.length - 1];
        const newMax = this.cursor + bytes.length;
        if (newMax <= this.maxCursor + 1) {
            const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
            topChunk.set(bytes, chunkPos);
        } else {
            if (topChunk) {
                const chunkPos = topChunk.length - (this.maxCursor - this.cursor) - 1;
                if (chunkPos < topChunk.length) {
                    this.chunks[this.chunks.length - 1] = topChunk.subarray(0, chunkPos);
                    this.maxCursor = this.cursor - 1;
                }
            }
            if (bytes.length < 64 && bytes.length < this.chunkSize) {
                topChunk = alloc(this.chunkSize);
                this.chunks.push(topChunk);
                this.maxCursor += topChunk.length;
                if (this._initReuseChunk === null) {
                    this._initReuseChunk = topChunk;
                }
                topChunk.set(bytes, 0);
            } else {
                this.chunks.push(bytes);
                this.maxCursor += bytes.length;
            }
        }
        this.cursor += bytes.length;
    }
    toBytes(reset = false) {
        let byts;
        if (this.chunks.length === 1) {
            const chunk = this.chunks[0];
            if (reset && this.cursor > chunk.length / 2) {
                byts = this.cursor === chunk.length ? chunk : chunk.subarray(0, this.cursor);
                this._initReuseChunk = null;
                this.chunks = [];
            } else {
                byts = slice(chunk, 0, this.cursor);
            }
        } else {
            byts = concat(this.chunks, this.cursor);
        }
        if (reset) {
            this.reset();
        }
        return byts;
    }
}
const decodeErrPrefix = "CBOR decode error:";
const encodeErrPrefix = "CBOR encode error:";
const uintMinorPrefixBytes = [];
uintMinorPrefixBytes[23] = 1;
uintMinorPrefixBytes[24] = 2;
uintMinorPrefixBytes[25] = 3;
uintMinorPrefixBytes[26] = 5;
uintMinorPrefixBytes[27] = 9;
function assertEnoughData(data, pos, need) {
    if (data.length - pos < need) {
        throw new Error(`${decodeErrPrefix} not enough data for type`);
    }
}
const uintBoundaries = [
    24,
    256,
    65536,
    4294967296,
    BigInt("18446744073709551616")
];
function readUint8(data, offset, options) {
    assertEnoughData(data, offset, 1);
    const value = data[offset];
    if (options.strict === true && value < uintBoundaries[0]) {
        throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    return value;
}
function readUint16(data, offset, options) {
    assertEnoughData(data, offset, 2);
    const value = data[offset] << 8 | data[offset + 1];
    if (options.strict === true && value < uintBoundaries[1]) {
        throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    return value;
}
function readUint32(data, offset, options) {
    assertEnoughData(data, offset, 4);
    const value = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
    if (options.strict === true && value < uintBoundaries[2]) {
        throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    return value;
}
function readUint64(data, offset, options) {
    assertEnoughData(data, offset, 8);
    const hi = data[offset] * 16777216 + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3];
    const lo = data[offset + 4] * 16777216 + (data[offset + 5] << 16) + (data[offset + 6] << 8) + data[offset + 7];
    const value = (BigInt(hi) << BigInt(32)) + BigInt(lo);
    if (options.strict === true && value < uintBoundaries[3]) {
        throw new Error(`${decodeErrPrefix} integer encoded in more bytes than necessary (strict decode)`);
    }
    if (value <= Number.MAX_SAFE_INTEGER) {
        return Number(value);
    }
    if (options.allowBigInt === true) {
        return value;
    }
    throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
}
function decodeUint8(data, pos, _minor, options) {
    return new Token(Type.uint, readUint8(data, pos + 1, options), 2);
}
function decodeUint16(data, pos, _minor, options) {
    return new Token(Type.uint, readUint16(data, pos + 1, options), 3);
}
function decodeUint32(data, pos, _minor, options) {
    return new Token(Type.uint, readUint32(data, pos + 1, options), 5);
}
function decodeUint64(data, pos, _minor, options) {
    return new Token(Type.uint, readUint64(data, pos + 1, options), 9);
}
function encodeUint(buf2, token) {
    return encodeUintValue(buf2, 0, token.value);
}
function encodeUintValue(buf2, major, uint) {
    if (uint < uintBoundaries[0]) {
        const nuint = Number(uint);
        buf2.push([
            major | nuint
        ]);
    } else if (uint < uintBoundaries[1]) {
        const nuint = Number(uint);
        buf2.push([
            major | 24,
            nuint
        ]);
    } else if (uint < uintBoundaries[2]) {
        const nuint = Number(uint);
        buf2.push([
            major | 25,
            nuint >>> 8,
            nuint & 255
        ]);
    } else if (uint < uintBoundaries[3]) {
        const nuint = Number(uint);
        buf2.push([
            major | 26,
            nuint >>> 24 & 255,
            nuint >>> 16 & 255,
            nuint >>> 8 & 255,
            nuint & 255
        ]);
    } else {
        const buint = BigInt(uint);
        if (buint < uintBoundaries[4]) {
            const set = [
                major | 27,
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ];
            let lo = Number(buint & BigInt(4294967295));
            let hi = Number(buint >> BigInt(32) & BigInt(4294967295));
            set[8] = lo & 255;
            lo = lo >> 8;
            set[7] = lo & 255;
            lo = lo >> 8;
            set[6] = lo & 255;
            lo = lo >> 8;
            set[5] = lo & 255;
            set[4] = hi & 255;
            hi = hi >> 8;
            set[3] = hi & 255;
            hi = hi >> 8;
            set[2] = hi & 255;
            hi = hi >> 8;
            set[1] = hi & 255;
            buf2.push(set);
        } else {
            throw new Error(`${decodeErrPrefix} encountered BigInt larger than allowable range`);
        }
    }
}
encodeUint.encodedSize = function encodedSize(token) {
    return encodeUintValue.encodedSize(token.value);
};
encodeUintValue.encodedSize = function encodedSize2(uint) {
    if (uint < uintBoundaries[0]) {
        return 1;
    }
    if (uint < uintBoundaries[1]) {
        return 2;
    }
    if (uint < uintBoundaries[2]) {
        return 3;
    }
    if (uint < uintBoundaries[3]) {
        return 5;
    }
    return 9;
};
encodeUint.compareTokens = function compareTokens(tok1, tok2) {
    return tok1.value < tok2.value ? -1 : tok1.value > tok2.value ? 1 : 0;
};
function decodeNegint8(data, pos, _minor, options) {
    return new Token(Type.negint, -1 - readUint8(data, pos + 1, options), 2);
}
function decodeNegint16(data, pos, _minor, options) {
    return new Token(Type.negint, -1 - readUint16(data, pos + 1, options), 3);
}
function decodeNegint32(data, pos, _minor, options) {
    return new Token(Type.negint, -1 - readUint32(data, pos + 1, options), 5);
}
const neg1b = BigInt(-1);
const pos1b = BigInt(1);
function decodeNegint64(data, pos, _minor, options) {
    const __int = readUint64(data, pos + 1, options);
    if (typeof __int !== "bigint") {
        const value = -1 - __int;
        if (value >= Number.MIN_SAFE_INTEGER) {
            return new Token(Type.negint, value, 9);
        }
    }
    if (options.allowBigInt !== true) {
        throw new Error(`${decodeErrPrefix} integers outside of the safe integer range are not supported`);
    }
    return new Token(Type.negint, neg1b - BigInt(__int), 9);
}
function encodeNegint(buf2, token) {
    const negint = token.value;
    const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
    encodeUintValue(buf2, token.type.majorEncoded, unsigned);
}
encodeNegint.encodedSize = function encodedSize3(token) {
    const negint = token.value;
    const unsigned = typeof negint === "bigint" ? negint * neg1b - pos1b : negint * -1 - 1;
    if (unsigned < uintBoundaries[0]) {
        return 1;
    }
    if (unsigned < uintBoundaries[1]) {
        return 2;
    }
    if (unsigned < uintBoundaries[2]) {
        return 3;
    }
    if (unsigned < uintBoundaries[3]) {
        return 5;
    }
    return 9;
};
encodeNegint.compareTokens = function compareTokens2(tok1, tok2) {
    return tok1.value < tok2.value ? 1 : tok1.value > tok2.value ? -1 : 0;
};
function toToken(data, pos, prefix, length) {
    assertEnoughData(data, pos, prefix + length);
    const buf2 = slice(data, pos + prefix, pos + prefix + length);
    return new Token(Type.bytes, buf2, prefix + length);
}
function decodeBytesCompact(data, pos, minor, _options) {
    return toToken(data, pos, 1, minor);
}
function decodeBytes8(data, pos, _minor, options) {
    return toToken(data, pos, 2, readUint8(data, pos + 1, options));
}
function decodeBytes16(data, pos, _minor, options) {
    return toToken(data, pos, 3, readUint16(data, pos + 1, options));
}
function decodeBytes32(data, pos, _minor, options) {
    return toToken(data, pos, 5, readUint32(data, pos + 1, options));
}
function decodeBytes64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
        throw new Error(`${decodeErrPrefix} 64-bit integer bytes lengths not supported`);
    }
    return toToken(data, pos, 9, l);
}
function tokenBytes(token) {
    if (token.encodedBytes === void 0) {
        token.encodedBytes = token.type === Type.string ? fromString(token.value) : token.value;
    }
    return token.encodedBytes;
}
function encodeBytes(buf2, token) {
    const bytes = tokenBytes(token);
    encodeUintValue(buf2, token.type.majorEncoded, bytes.length);
    buf2.push(bytes);
}
encodeBytes.encodedSize = function encodedSize4(token) {
    const bytes = tokenBytes(token);
    return encodeUintValue.encodedSize(bytes.length) + bytes.length;
};
encodeBytes.compareTokens = function compareTokens3(tok1, tok2) {
    return compareBytes(tokenBytes(tok1), tokenBytes(tok2));
};
function compareBytes(b1, b2) {
    return b1.length < b2.length ? -1 : b1.length > b2.length ? 1 : compare(b1, b2);
}
function toToken$1(data, pos, prefix, length, options) {
    const totLength = prefix + length;
    assertEnoughData(data, pos, totLength);
    const tok = new Token(Type.string, toString(data, pos + prefix, pos + totLength), totLength);
    if (options.retainStringBytes === true) {
        tok.byteValue = slice(data, pos + prefix, pos + totLength);
    }
    return tok;
}
function decodeStringCompact(data, pos, minor, options) {
    return toToken$1(data, pos, 1, minor, options);
}
function decodeString8(data, pos, _minor, options) {
    return toToken$1(data, pos, 2, readUint8(data, pos + 1, options), options);
}
function decodeString16(data, pos, _minor, options) {
    return toToken$1(data, pos, 3, readUint16(data, pos + 1, options), options);
}
function decodeString32(data, pos, _minor, options) {
    return toToken$1(data, pos, 5, readUint32(data, pos + 1, options), options);
}
function decodeString64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
        throw new Error(`${decodeErrPrefix} 64-bit integer string lengths not supported`);
    }
    return toToken$1(data, pos, 9, l, options);
}
const encodeString = encodeBytes;
function toToken$2(_data, _pos, prefix, length) {
    return new Token(Type.array, length, prefix);
}
function decodeArrayCompact(data, pos, minor, _options) {
    return toToken$2(data, pos, 1, minor);
}
function decodeArray8(data, pos, _minor, options) {
    return toToken$2(data, pos, 2, readUint8(data, pos + 1, options));
}
function decodeArray16(data, pos, _minor, options) {
    return toToken$2(data, pos, 3, readUint16(data, pos + 1, options));
}
function decodeArray32(data, pos, _minor, options) {
    return toToken$2(data, pos, 5, readUint32(data, pos + 1, options));
}
function decodeArray64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
        throw new Error(`${decodeErrPrefix} 64-bit integer array lengths not supported`);
    }
    return toToken$2(data, pos, 9, l);
}
function decodeArrayIndefinite(data, pos, _minor, options) {
    if (options.allowIndefinite === false) {
        throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
    }
    return toToken$2(data, pos, 1, Infinity);
}
function encodeArray(buf2, token) {
    encodeUintValue(buf2, Type.array.majorEncoded, token.value);
}
encodeArray.compareTokens = encodeUint.compareTokens;
encodeArray.encodedSize = function encodedSize5(token) {
    return encodeUintValue.encodedSize(token.value);
};
function toToken$3(_data, _pos, prefix, length) {
    return new Token(Type.map, length, prefix);
}
function decodeMapCompact(data, pos, minor, _options) {
    return toToken$3(data, pos, 1, minor);
}
function decodeMap8(data, pos, _minor, options) {
    return toToken$3(data, pos, 2, readUint8(data, pos + 1, options));
}
function decodeMap16(data, pos, _minor, options) {
    return toToken$3(data, pos, 3, readUint16(data, pos + 1, options));
}
function decodeMap32(data, pos, _minor, options) {
    return toToken$3(data, pos, 5, readUint32(data, pos + 1, options));
}
function decodeMap64(data, pos, _minor, options) {
    const l = readUint64(data, pos + 1, options);
    if (typeof l === "bigint") {
        throw new Error(`${decodeErrPrefix} 64-bit integer map lengths not supported`);
    }
    return toToken$3(data, pos, 9, l);
}
function decodeMapIndefinite(data, pos, _minor, options) {
    if (options.allowIndefinite === false) {
        throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
    }
    return toToken$3(data, pos, 1, Infinity);
}
function encodeMap(buf2, token) {
    encodeUintValue(buf2, Type.map.majorEncoded, token.value);
}
encodeMap.compareTokens = encodeUint.compareTokens;
encodeMap.encodedSize = function encodedSize6(token) {
    return encodeUintValue.encodedSize(token.value);
};
function decodeTagCompact(_data, _pos, minor, _options) {
    return new Token(Type.tag, minor, 1);
}
function decodeTag8(data, pos, _minor, options) {
    return new Token(Type.tag, readUint8(data, pos + 1, options), 2);
}
function decodeTag16(data, pos, _minor, options) {
    return new Token(Type.tag, readUint16(data, pos + 1, options), 3);
}
function decodeTag32(data, pos, _minor, options) {
    return new Token(Type.tag, readUint32(data, pos + 1, options), 5);
}
function decodeTag64(data, pos, _minor, options) {
    return new Token(Type.tag, readUint64(data, pos + 1, options), 9);
}
function encodeTag(buf2, token) {
    encodeUintValue(buf2, Type.tag.majorEncoded, token.value);
}
encodeTag.compareTokens = encodeUint.compareTokens;
encodeTag.encodedSize = function encodedSize7(token) {
    return encodeUintValue.encodedSize(token.value);
};
function decodeUndefined(_data, _pos, _minor, options) {
    if (options.allowUndefined === false) {
        throw new Error(`${decodeErrPrefix} undefined values are not supported`);
    } else if (options.coerceUndefinedToNull === true) {
        return new Token(Type.null, null, 1);
    }
    return new Token(Type.undefined, void 0, 1);
}
function decodeBreak(_data, _pos, _minor, options) {
    if (options.allowIndefinite === false) {
        throw new Error(`${decodeErrPrefix} indefinite length items not allowed`);
    }
    return new Token(Type.break, void 0, 1);
}
function createToken(value, bytes, options) {
    if (options) {
        if (options.allowNaN === false && Number.isNaN(value)) {
            throw new Error(`${decodeErrPrefix} NaN values are not supported`);
        }
        if (options.allowInfinity === false && (value === Infinity || value === -Infinity)) {
            throw new Error(`${decodeErrPrefix} Infinity values are not supported`);
        }
    }
    return new Token(Type.float, value, bytes);
}
function decodeFloat16(data, pos, _minor, options) {
    return createToken(readFloat16(data, pos + 1), 3, options);
}
function decodeFloat32(data, pos, _minor, options) {
    return createToken(readFloat32(data, pos + 1), 5, options);
}
function decodeFloat64(data, pos, _minor, options) {
    return createToken(readFloat64(data, pos + 1), 9, options);
}
function encodeFloat(buf2, token, options) {
    const __float = token.value;
    if (__float === false) {
        buf2.push([
            Type.float.majorEncoded | 20
        ]);
    } else if (__float === true) {
        buf2.push([
            Type.float.majorEncoded | 21
        ]);
    } else if (__float === null) {
        buf2.push([
            Type.float.majorEncoded | 22
        ]);
    } else if (__float === void 0) {
        buf2.push([
            Type.float.majorEncoded | 23
        ]);
    } else {
        let decoded;
        let success = false;
        if (!options || options.float64 !== true) {
            encodeFloat16(__float);
            decoded = readFloat16(ui8a, 1);
            if (__float === decoded || Number.isNaN(__float)) {
                ui8a[0] = 249;
                buf2.push(ui8a.slice(0, 3));
                success = true;
            } else {
                encodeFloat32(__float);
                decoded = readFloat32(ui8a, 1);
                if (__float === decoded) {
                    ui8a[0] = 250;
                    buf2.push(ui8a.slice(0, 5));
                    success = true;
                }
            }
        }
        if (!success) {
            encodeFloat64(__float);
            decoded = readFloat64(ui8a, 1);
            ui8a[0] = 251;
            buf2.push(ui8a.slice(0, 9));
        }
    }
}
encodeFloat.encodedSize = function encodedSize8(token, options) {
    const __float = token.value;
    if (__float === false || __float === true || __float === null || __float === void 0) {
        return 1;
    }
    if (!options || options.float64 !== true) {
        encodeFloat16(__float);
        let decoded = readFloat16(ui8a, 1);
        if (__float === decoded || Number.isNaN(__float)) {
            return 3;
        }
        encodeFloat32(__float);
        decoded = readFloat32(ui8a, 1);
        if (__float === decoded) {
            return 5;
        }
    }
    return 9;
};
const buffer = new ArrayBuffer(9);
const dataView = new DataView(buffer, 1);
const ui8a = new Uint8Array(buffer, 0);
function encodeFloat16(inp) {
    if (inp === Infinity) {
        dataView.setUint16(0, 31744, false);
    } else if (inp === -Infinity) {
        dataView.setUint16(0, 64512, false);
    } else if (Number.isNaN(inp)) {
        dataView.setUint16(0, 32256, false);
    } else {
        dataView.setFloat32(0, inp);
        const valu32 = dataView.getUint32(0);
        const exponent = (valu32 & 2139095040) >> 23;
        const mantissa = valu32 & 8388607;
        if (exponent === 255) {
            dataView.setUint16(0, 31744, false);
        } else if (exponent === 0) {
            dataView.setUint16(0, (inp & 2147483648) >> 16 | mantissa >> 13, false);
        } else {
            const logicalExponent = exponent - 127;
            if (logicalExponent < -24) {
                dataView.setUint16(0, 0);
            } else if (logicalExponent < -14) {
                dataView.setUint16(0, (valu32 & 2147483648) >> 16 | 1 << 24 + logicalExponent, false);
            } else {
                dataView.setUint16(0, (valu32 & 2147483648) >> 16 | logicalExponent + 15 << 10 | mantissa >> 13, false);
            }
        }
    }
}
function readFloat16(ui8a2, pos) {
    if (ui8a2.length - pos < 2) {
        throw new Error(`${decodeErrPrefix} not enough data for float16`);
    }
    const half = (ui8a2[pos] << 8) + ui8a2[pos + 1];
    if (half === 31744) {
        return Infinity;
    }
    if (half === 64512) {
        return -Infinity;
    }
    if (half === 32256) {
        return NaN;
    }
    const exp = half >> 10 & 31;
    const mant = half & 1023;
    let val;
    if (exp === 0) {
        val = mant * 2 ** -24;
    } else if (exp !== 31) {
        val = (mant + 1024) * 2 ** (exp - 25);
    } else {
        val = mant === 0 ? Infinity : NaN;
    }
    return half & 32768 ? -val : val;
}
function encodeFloat32(inp) {
    dataView.setFloat32(0, inp, false);
}
function readFloat32(ui8a2, pos) {
    if (ui8a2.length - pos < 4) {
        throw new Error(`${decodeErrPrefix} not enough data for float32`);
    }
    const offset = (ui8a2.byteOffset || 0) + pos;
    return new DataView(ui8a2.buffer, offset, 4).getFloat32(0, false);
}
function encodeFloat64(inp) {
    dataView.setFloat64(0, inp, false);
}
function readFloat64(ui8a2, pos) {
    if (ui8a2.length - pos < 8) {
        throw new Error(`${decodeErrPrefix} not enough data for float64`);
    }
    const offset = (ui8a2.byteOffset || 0) + pos;
    return new DataView(ui8a2.buffer, offset, 8).getFloat64(0, false);
}
encodeFloat.compareTokens = encodeUint.compareTokens;
function invalidMinor(data, pos, minor) {
    throw new Error(`${decodeErrPrefix} encountered invalid minor (${minor}) for major ${data[pos] >>> 5}`);
}
function errorer(msg) {
    return ()=>{
        throw new Error(`${decodeErrPrefix} ${msg}`);
    };
}
const jump = [];
for(let i = 0; i <= 23; i++){
    jump[i] = invalidMinor;
}
jump[24] = decodeUint8;
jump[25] = decodeUint16;
jump[26] = decodeUint32;
jump[27] = decodeUint64;
jump[28] = invalidMinor;
jump[29] = invalidMinor;
jump[30] = invalidMinor;
jump[31] = invalidMinor;
for(let i = 32; i <= 55; i++){
    jump[i] = invalidMinor;
}
jump[56] = decodeNegint8;
jump[57] = decodeNegint16;
jump[58] = decodeNegint32;
jump[59] = decodeNegint64;
jump[60] = invalidMinor;
jump[61] = invalidMinor;
jump[62] = invalidMinor;
jump[63] = invalidMinor;
for(let i = 64; i <= 87; i++){
    jump[i] = decodeBytesCompact;
}
jump[88] = decodeBytes8;
jump[89] = decodeBytes16;
jump[90] = decodeBytes32;
jump[91] = decodeBytes64;
jump[92] = invalidMinor;
jump[93] = invalidMinor;
jump[94] = invalidMinor;
jump[95] = errorer("indefinite length bytes/strings are not supported");
for(let i = 96; i <= 119; i++){
    jump[i] = decodeStringCompact;
}
jump[120] = decodeString8;
jump[121] = decodeString16;
jump[122] = decodeString32;
jump[123] = decodeString64;
jump[124] = invalidMinor;
jump[125] = invalidMinor;
jump[126] = invalidMinor;
jump[127] = errorer("indefinite length bytes/strings are not supported");
for(let i = 128; i <= 151; i++){
    jump[i] = decodeArrayCompact;
}
jump[152] = decodeArray8;
jump[153] = decodeArray16;
jump[154] = decodeArray32;
jump[155] = decodeArray64;
jump[156] = invalidMinor;
jump[157] = invalidMinor;
jump[158] = invalidMinor;
jump[159] = decodeArrayIndefinite;
for(let i = 160; i <= 183; i++){
    jump[i] = decodeMapCompact;
}
jump[184] = decodeMap8;
jump[185] = decodeMap16;
jump[186] = decodeMap32;
jump[187] = decodeMap64;
jump[188] = invalidMinor;
jump[189] = invalidMinor;
jump[190] = invalidMinor;
jump[191] = decodeMapIndefinite;
for(let i = 192; i <= 215; i++){
    jump[i] = decodeTagCompact;
}
jump[216] = decodeTag8;
jump[217] = decodeTag16;
jump[218] = decodeTag32;
jump[219] = decodeTag64;
jump[220] = invalidMinor;
jump[221] = invalidMinor;
jump[222] = invalidMinor;
jump[223] = invalidMinor;
for(let i = 224; i <= 243; i++){
    jump[i] = errorer("simple values are not supported");
}
jump[244] = invalidMinor;
jump[245] = invalidMinor;
jump[246] = invalidMinor;
jump[247] = decodeUndefined;
jump[248] = errorer("simple values are not supported");
jump[249] = decodeFloat16;
jump[250] = decodeFloat32;
jump[251] = decodeFloat64;
jump[252] = invalidMinor;
jump[253] = invalidMinor;
jump[254] = invalidMinor;
jump[255] = decodeBreak;
const quick = [];
for(let i = 0; i < 24; i++){
    quick[i] = new Token(Type.uint, i, 1);
}
for(let i = -1; i >= -24; i--){
    quick[31 - i] = new Token(Type.negint, i, 1);
}
quick[64] = new Token(Type.bytes, new Uint8Array(0), 1);
quick[96] = new Token(Type.string, "", 1);
quick[128] = new Token(Type.array, 0, 1);
quick[160] = new Token(Type.map, 0, 1);
quick[244] = new Token(Type.false, false, 1);
quick[245] = new Token(Type.true, true, 1);
quick[246] = new Token(Type.null, null, 1);
function quickEncodeToken(token) {
    switch(token.type){
        case Type.false:
            return fromArray([
                244
            ]);
        case Type.true:
            return fromArray([
                245
            ]);
        case Type.null:
            return fromArray([
                246
            ]);
        case Type.bytes:
            if (!token.value.length) {
                return fromArray([
                    64
                ]);
            }
            return;
        case Type.string:
            if (token.value === "") {
                return fromArray([
                    96
                ]);
            }
            return;
        case Type.array:
            if (token.value === 0) {
                return fromArray([
                    128
                ]);
            }
            return;
        case Type.map:
            if (token.value === 0) {
                return fromArray([
                    160
                ]);
            }
            return;
        case Type.uint:
            if (token.value < 24) {
                return fromArray([
                    Number(token.value)
                ]);
            }
            return;
        case Type.negint:
            if (token.value >= -24) {
                return fromArray([
                    31 - Number(token.value)
                ]);
            }
    }
}
const defaultEncodeOptions = {
    float64: false,
    mapSorter,
    quickEncodeToken
};
function makeCborEncoders() {
    const encoders = [];
    encoders[Type.uint.major] = encodeUint;
    encoders[Type.negint.major] = encodeNegint;
    encoders[Type.bytes.major] = encodeBytes;
    encoders[Type.string.major] = encodeString;
    encoders[Type.array.major] = encodeArray;
    encoders[Type.map.major] = encodeMap;
    encoders[Type.tag.major] = encodeTag;
    encoders[Type.float.major] = encodeFloat;
    return encoders;
}
const cborEncoders = makeCborEncoders();
const buf = new Bl();
class Ref {
    constructor(obj, parent){
        this.obj = obj;
        this.parent = parent;
    }
    includes(obj) {
        let p = this;
        do {
            if (p.obj === obj) {
                return true;
            }
        }while (p = p.parent)
        return false;
    }
    static createCheck(stack, obj) {
        if (stack && stack.includes(obj)) {
            throw new Error(`${encodeErrPrefix} object contains circular references`);
        }
        return new Ref(obj, stack);
    }
}
const simpleTokens = {
    null: new Token(Type.null, null),
    undefined: new Token(Type.undefined, void 0),
    true: new Token(Type.true, true),
    false: new Token(Type.false, false),
    emptyArray: new Token(Type.array, 0),
    emptyMap: new Token(Type.map, 0)
};
const typeEncoders = {
    number (obj, _typ, _options, _refStack) {
        if (!Number.isInteger(obj) || !Number.isSafeInteger(obj)) {
            return new Token(Type.float, obj);
        } else if (obj >= 0) {
            return new Token(Type.uint, obj);
        } else {
            return new Token(Type.negint, obj);
        }
    },
    bigint (obj, _typ, _options, _refStack) {
        if (obj >= BigInt(0)) {
            return new Token(Type.uint, obj);
        } else {
            return new Token(Type.negint, obj);
        }
    },
    Uint8Array (obj, _typ, _options, _refStack) {
        return new Token(Type.bytes, obj);
    },
    string (obj, _typ, _options, _refStack) {
        return new Token(Type.string, obj);
    },
    boolean (obj, _typ, _options, _refStack) {
        return obj ? simpleTokens.true : simpleTokens.false;
    },
    null (_obj, _typ, _options, _refStack) {
        return simpleTokens.null;
    },
    undefined (_obj, _typ, _options, _refStack) {
        return simpleTokens.undefined;
    },
    ArrayBuffer (obj, _typ, _options, _refStack) {
        return new Token(Type.bytes, new Uint8Array(obj));
    },
    DataView (obj, _typ, _options, _refStack) {
        return new Token(Type.bytes, new Uint8Array(obj.buffer, obj.byteOffset, obj.byteLength));
    },
    Array (obj, _typ, options, refStack) {
        if (!obj.length) {
            if (options.addBreakTokens === true) {
                return [
                    simpleTokens.emptyArray,
                    new Token(Type.break)
                ];
            }
            return simpleTokens.emptyArray;
        }
        refStack = Ref.createCheck(refStack, obj);
        const entries = [];
        let i = 0;
        for (const e of obj){
            entries[i++] = objectToTokens(e, options, refStack);
        }
        if (options.addBreakTokens) {
            return [
                new Token(Type.array, obj.length),
                entries,
                new Token(Type.break)
            ];
        }
        return [
            new Token(Type.array, obj.length),
            entries
        ];
    },
    Object (obj, typ, options, refStack) {
        const isMap = typ !== "Object";
        const keys = isMap ? obj.keys() : Object.keys(obj);
        const length = isMap ? obj.size : keys.length;
        if (!length) {
            if (options.addBreakTokens === true) {
                return [
                    simpleTokens.emptyMap,
                    new Token(Type.break)
                ];
            }
            return simpleTokens.emptyMap;
        }
        refStack = Ref.createCheck(refStack, obj);
        const entries = [];
        let i = 0;
        for (const key of keys){
            entries[i++] = [
                objectToTokens(key, options, refStack),
                objectToTokens(isMap ? obj.get(key) : obj[key], options, refStack)
            ];
        }
        sortMapEntries(entries, options);
        if (options.addBreakTokens) {
            return [
                new Token(Type.map, length),
                entries,
                new Token(Type.break)
            ];
        }
        return [
            new Token(Type.map, length),
            entries
        ];
    }
};
typeEncoders.Map = typeEncoders.Object;
typeEncoders.Buffer = typeEncoders.Uint8Array;
for (const typ of "Uint8Clamped Uint16 Uint32 Int8 Int16 Int32 BigUint64 BigInt64 Float32 Float64".split(" ")){
    typeEncoders[`${typ}Array`] = typeEncoders.DataView;
}
function objectToTokens(obj, options = {}, refStack) {
    const typ = is(obj);
    const customTypeEncoder = options && options.typeEncoders && options.typeEncoders[typ] || typeEncoders[typ];
    if (typeof customTypeEncoder === "function") {
        const tokens = customTypeEncoder(obj, typ, options, refStack);
        if (tokens != null) {
            return tokens;
        }
    }
    const typeEncoder = typeEncoders[typ];
    if (!typeEncoder) {
        throw new Error(`${encodeErrPrefix} unsupported type: ${typ}`);
    }
    return typeEncoder(obj, typ, options, refStack);
}
function sortMapEntries(entries, options) {
    if (options.mapSorter) {
        entries.sort(options.mapSorter);
    }
}
function mapSorter(e1, e2) {
    const keyToken1 = Array.isArray(e1[0]) ? e1[0][0] : e1[0];
    const keyToken2 = Array.isArray(e2[0]) ? e2[0][0] : e2[0];
    if (keyToken1.type !== keyToken2.type) {
        return keyToken1.type.compare(keyToken2.type);
    }
    const major = keyToken1.type.major;
    const tcmp = cborEncoders[major].compareTokens(keyToken1, keyToken2);
    if (tcmp === 0) {
        console.warn("WARNING: complex key types used, CBOR key sorting guarantees are gone");
    }
    return tcmp;
}
function tokensToEncoded(buf2, tokens, encoders, options) {
    if (Array.isArray(tokens)) {
        for (const token of tokens){
            tokensToEncoded(buf2, token, encoders, options);
        }
    } else {
        encoders[tokens.type.major](buf2, tokens, options);
    }
}
function encodeCustom(data, encoders, options) {
    const tokens = objectToTokens(data, options);
    if (!Array.isArray(tokens) && options.quickEncodeToken) {
        const quickBytes = options.quickEncodeToken(tokens);
        if (quickBytes) {
            return quickBytes;
        }
        const encoder = encoders[tokens.type.major];
        if (encoder.encodedSize) {
            const size = encoder.encodedSize(tokens, options);
            const buf2 = new Bl(size);
            encoder(buf2, tokens, options);
            if (buf2.chunks.length !== 1) {
                throw new Error(`Unexpected error: pre-calculated length for ${tokens} was wrong`);
            }
            return asU8A(buf2.chunks[0]);
        }
    }
    buf.reset();
    tokensToEncoded(buf, tokens, encoders, options);
    return buf.toBytes(true);
}
function encode(data, options) {
    options = Object.assign({}, defaultEncodeOptions, options);
    return encodeCustom(data, cborEncoders, options);
}
const defaultDecodeOptions = {
    strict: false,
    allowIndefinite: true,
    allowUndefined: true,
    allowBigInt: true
};
class Tokeniser {
    constructor(data, options = {}){
        this._pos = 0;
        this.data = data;
        this.options = options;
    }
    pos() {
        return this._pos;
    }
    done() {
        return this._pos >= this.data.length;
    }
    next() {
        const byt = this.data[this._pos];
        let token = quick[byt];
        if (token === void 0) {
            const decoder = jump[byt];
            if (!decoder) {
                throw new Error(`${decodeErrPrefix} no decoder for major type ${byt >>> 5} (byte 0x${byt.toString(16).padStart(2, "0")})`);
            }
            const minor = byt & 31;
            token = decoder(this.data, this._pos, minor, this.options);
        }
        this._pos += token.encodedLength;
        return token;
    }
}
const DONE = Symbol.for("DONE");
const BREAK = Symbol.for("BREAK");
function tokenToArray(token, tokeniser, options) {
    const arr = [];
    for(let i = 0; i < token.value; i++){
        const value = tokensToObject(tokeniser, options);
        if (value === BREAK) {
            if (token.value === Infinity) {
                break;
            }
            throw new Error(`${decodeErrPrefix} got unexpected break to lengthed array`);
        }
        if (value === DONE) {
            throw new Error(`${decodeErrPrefix} found array but not enough entries (got ${i}, expected ${token.value})`);
        }
        arr[i] = value;
    }
    return arr;
}
function tokenToMap(token, tokeniser, options) {
    const useMaps = options.useMaps === true;
    const obj = useMaps ? void 0 : {};
    const m = useMaps ? new Map() : void 0;
    for(let i = 0; i < token.value; i++){
        const key = tokensToObject(tokeniser, options);
        if (key === BREAK) {
            if (token.value === Infinity) {
                break;
            }
            throw new Error(`${decodeErrPrefix} got unexpected break to lengthed map`);
        }
        if (key === DONE) {
            throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${i} [no key], expected ${token.value})`);
        }
        if (useMaps !== true && typeof key !== "string") {
            throw new Error(`${decodeErrPrefix} non-string keys not supported (got ${typeof key})`);
        }
        if (options.rejectDuplicateMapKeys === true) {
            if (useMaps && m.has(key) || !useMaps && key in obj) {
                throw new Error(`${decodeErrPrefix} found repeat map key "${key}"`);
            }
        }
        const value = tokensToObject(tokeniser, options);
        if (value === DONE) {
            throw new Error(`${decodeErrPrefix} found map but not enough entries (got ${i} [no value], expected ${token.value})`);
        }
        if (useMaps) {
            m.set(key, value);
        } else {
            obj[key] = value;
        }
    }
    return useMaps ? m : obj;
}
function tokensToObject(tokeniser, options) {
    if (tokeniser.done()) {
        return DONE;
    }
    const token = tokeniser.next();
    if (token.type === Type.break) {
        return BREAK;
    }
    if (token.type.terminal) {
        return token.value;
    }
    if (token.type === Type.array) {
        return tokenToArray(token, tokeniser, options);
    }
    if (token.type === Type.map) {
        return tokenToMap(token, tokeniser, options);
    }
    if (token.type === Type.tag) {
        if (options.tags && typeof options.tags[token.value] === "function") {
            const tagged = tokensToObject(tokeniser, options);
            return options.tags[token.value](tagged);
        }
        throw new Error(`${decodeErrPrefix} tag not supported (${token.value})`);
    }
    throw new Error("unsupported");
}
function decodeFirst(data, options) {
    if (!(data instanceof Uint8Array)) {
        throw new Error(`${decodeErrPrefix} data to decode must be a Uint8Array`);
    }
    options = Object.assign({}, defaultDecodeOptions, options);
    const tokeniser = options.tokenizer || new Tokeniser(data, options);
    const decoded = tokensToObject(tokeniser, options);
    if (decoded === DONE) {
        throw new Error(`${decodeErrPrefix} did not find any content to decode`);
    }
    if (decoded === BREAK) {
        throw new Error(`${decodeErrPrefix} got unexpected break`);
    }
    return [
        decoded,
        data.subarray(tokeniser.pos())
    ];
}
function decode1(data, options) {
    const [decoded, remainder] = decodeFirst(data, options);
    if (remainder.length > 0) {
        throw new Error(`${decodeErrPrefix} too many terminals, data makes no sense`);
    }
    return decoded;
}
const empty = new Uint8Array(0);
function toHex(d) {
    return d.reduce((hex, __byte)=>hex + __byte.toString(16).padStart(2, "0"), "");
}
function fromHex(hex) {
    const hexes = hex.match(/../g);
    return hexes != null ? new Uint8Array(hexes.map((b)=>parseInt(b, 16))) : empty;
}
function equals(aa, bb) {
    if (aa === bb) return true;
    if (aa.byteLength !== bb.byteLength) {
        return false;
    }
    for(let ii = 0; ii < aa.byteLength; ii++){
        if (aa[ii] !== bb[ii]) {
            return false;
        }
    }
    return true;
}
function coerce(o) {
    if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") return o;
    if (o instanceof ArrayBuffer) return new Uint8Array(o);
    if (ArrayBuffer.isView(o)) {
        return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error("Unknown type, must be binary type");
}
function isBinary(o) {
    return o instanceof ArrayBuffer || ArrayBuffer.isView(o);
}
function fromString1(str) {
    return new TextEncoder().encode(str);
}
function toString1(b) {
    return new TextDecoder().decode(b);
}
Object.freeze({
    __proto__: null,
    empty,
    toHex,
    fromHex,
    equals,
    coerce,
    isBinary,
    fromString: fromString1,
    toString: toString1
});
var __defProp = Object.defineProperty;
var __publicField = (obj, key, value)=>{
    if (typeof key !== "symbol") key += "";
    if (key in obj) return __defProp(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    });
    return obj[key] = value;
};
function base(ALPHABET, name) {
    if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
    }
    var BASE_MAP = new Uint8Array(256);
    for(var j = 0; j < BASE_MAP.length; j++){
        BASE_MAP[j] = 255;
    }
    for(var i = 0; i < ALPHABET.length; i++){
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode2(source) {
        if (source instanceof Uint8Array) ;
        else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
            throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
            return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while(pbegin !== pend && source[pbegin] === 0){
            pbegin++;
            zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while(pbegin !== pend){
            var carry = source[pbegin];
            var i2 = 0;
            for(var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++){
                carry += 256 * b58[it1] >>> 0;
                b58[it1] = carry % BASE >>> 0;
                carry = carry / BASE >>> 0;
            }
            if (carry !== 0) {
                throw new Error("Non-zero carry");
            }
            length = i2;
            pbegin++;
        }
        var it2 = size - length;
        while(it2 !== size && b58[it2] === 0){
            it2++;
        }
        var str = LEADER.repeat(zeroes);
        for(; it2 < size; ++it2){
            str += ALPHABET.charAt(b58[it2]);
        }
        return str;
    }
    function decodeUnsafe(source) {
        if (typeof source !== "string") {
            throw new TypeError("Expected String");
        }
        if (source.length === 0) {
            return new Uint8Array();
        }
        var psz = 0;
        if (source[psz] === " ") {
            return;
        }
        var zeroes = 0;
        var length = 0;
        while(source[psz] === LEADER){
            zeroes++;
            psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while(source[psz]){
            var carry = BASE_MAP[source.charCodeAt(psz)];
            if (carry === 255) {
                return;
            }
            var i2 = 0;
            for(var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++){
                carry += BASE * b256[it3] >>> 0;
                b256[it3] = carry % 256 >>> 0;
                carry = carry / 256 >>> 0;
            }
            if (carry !== 0) {
                throw new Error("Non-zero carry");
            }
            length = i2;
            psz++;
        }
        if (source[psz] === " ") {
            return;
        }
        var it4 = size - length;
        while(it4 !== size && b256[it4] === 0){
            it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while(it4 !== size){
            vch[j2++] = b256[it4++];
        }
        return vch;
    }
    function decode2(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
            return buffer;
        }
        throw new Error(`Non-${name} character`);
    }
    return {
        encode: encode2,
        decodeUnsafe,
        decode: decode2
    };
}
var src = base;
var _brrp__multiformats_scope_baseX = src;
class Encoder {
    constructor(name, prefix, baseEncode){
        __publicField(this, "name");
        __publicField(this, "prefix");
        __publicField(this, "baseEncode");
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
    }
    encode(bytes) {
        if (bytes instanceof Uint8Array) {
            return `${this.prefix}${this.baseEncode(bytes)}`;
        } else {
            throw Error("Unknown type, must be binary type");
        }
    }
}
class Decoder {
    constructor(name, prefix, baseDecode){
        __publicField(this, "name");
        __publicField(this, "prefix");
        __publicField(this, "baseDecode");
        __publicField(this, "prefixCodePoint");
        this.name = name;
        this.prefix = prefix;
        if (prefix.codePointAt(0) === void 0) {
            throw new Error("Invalid prefix character");
        }
        this.prefixCodePoint = prefix.codePointAt(0);
        this.baseDecode = baseDecode;
    }
    decode(text) {
        if (typeof text === "string") {
            if (text.codePointAt(0) !== this.prefixCodePoint) {
                throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            }
            return this.baseDecode(text.slice(this.prefix.length));
        } else {
            throw Error("Can only multibase decode strings");
        }
    }
    or(decoder) {
        return or(this, decoder);
    }
}
class ComposedDecoder {
    constructor(decoders){
        __publicField(this, "decoders");
        this.decoders = decoders;
    }
    or(decoder) {
        return or(this, decoder);
    }
    decode(input) {
        const prefix = input[0];
        const decoder = this.decoders[prefix];
        if (decoder != null) {
            return decoder.decode(input);
        } else {
            throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
        }
    }
}
function or(left, right) {
    var _a, _b;
    return new ComposedDecoder({
        ...(_a = left.decoders) != null ? _a : {
            [left.prefix]: left
        },
        ...(_b = right.decoders) != null ? _b : {
            [right.prefix]: right
        }
    });
}
class Codec {
    constructor(name, prefix, baseEncode, baseDecode){
        __publicField(this, "name");
        __publicField(this, "prefix");
        __publicField(this, "baseEncode");
        __publicField(this, "baseDecode");
        __publicField(this, "encoder");
        __publicField(this, "decoder");
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
        this.baseDecode = baseDecode;
        this.encoder = new Encoder(name, prefix, baseEncode);
        this.decoder = new Decoder(name, prefix, baseDecode);
    }
    encode(input) {
        return this.encoder.encode(input);
    }
    decode(input) {
        return this.decoder.decode(input);
    }
}
function from({ name, prefix, encode: encode2, decode: decode2 }) {
    return new Codec(name, prefix, encode2, decode2);
}
function baseX({ name, prefix, alphabet }) {
    const { encode: encode2, decode: decode2 } = _brrp__multiformats_scope_baseX(alphabet, name);
    return from({
        prefix,
        name,
        encode: encode2,
        decode: (text)=>coerce(decode2(text))
    });
}
function decode2(string, alphabet, bitsPerChar, name) {
    const codes = {};
    for(let i = 0; i < alphabet.length; ++i){
        codes[alphabet[i]] = i;
    }
    let end = string.length;
    while(string[end - 1] === "="){
        --end;
    }
    const out = new Uint8Array(end * bitsPerChar / 8 | 0);
    let bits = 0;
    let buffer = 0;
    let written = 0;
    for(let i = 0; i < end; ++i){
        const value = codes[string[i]];
        if (value === void 0) {
            throw new SyntaxError(`Non-${name} character`);
        }
        buffer = buffer << bitsPerChar | value;
        bits += bitsPerChar;
        if (bits >= 8) {
            bits -= 8;
            out[written++] = 255 & buffer >> bits;
        }
    }
    if (bits >= bitsPerChar || (255 & buffer << 8 - bits) !== 0) {
        throw new SyntaxError("Unexpected end of data");
    }
    return out;
}
function encode1(data, alphabet, bitsPerChar) {
    const pad = alphabet[alphabet.length - 1] === "=";
    const mask = (1 << bitsPerChar) - 1;
    let out = "";
    let bits = 0;
    let buffer = 0;
    for(let i = 0; i < data.length; ++i){
        buffer = buffer << 8 | data[i];
        bits += 8;
        while(bits > bitsPerChar){
            bits -= bitsPerChar;
            out += alphabet[mask & buffer >> bits];
        }
    }
    if (bits !== 0) {
        out += alphabet[mask & buffer << bitsPerChar - bits];
    }
    if (pad) {
        while((out.length * bitsPerChar & 7) !== 0){
            out += "=";
        }
    }
    return out;
}
function rfc4648({ name, prefix, bitsPerChar, alphabet }) {
    return from({
        prefix,
        name,
        encode (input) {
            return encode1(input, alphabet, bitsPerChar);
        },
        decode (input) {
            return decode2(input, alphabet, bitsPerChar, name);
        }
    });
}
const base32 = rfc4648({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
});
const base32upper = rfc4648({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
});
const base32pad = rfc4648({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
});
const base32padupper = rfc4648({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
});
const base32hex = rfc4648({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
});
const base32hexupper = rfc4648({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
});
const base32hexpad = rfc4648({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
});
const base32hexpadupper = rfc4648({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
});
const base32z = rfc4648({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
Object.freeze({
    __proto__: null,
    base32,
    base32upper,
    base32pad,
    base32padupper,
    base32hex,
    base32hexupper,
    base32hexpad,
    base32hexpadupper,
    base32z
});
const base58btc = baseX({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
const base58flickr = baseX({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
Object.freeze({
    __proto__: null,
    base58btc,
    base58flickr
});
var __defProp1 = Object.defineProperty;
var __publicField1 = (obj, key, value)=>{
    if (typeof key !== "symbol") key += "";
    if (key in obj) return __defProp1(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    });
    return obj[key] = value;
};
var encode_1 = encode2;
var MSB = 128, REST1 = 127, MSBALL = ~REST1, INT = Math.pow(2, 31);
function encode2(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while(num >= INT){
        out[offset++] = num & 255 | MSB;
        num /= 128;
    }
    while(num & MSBALL){
        out[offset++] = num & 255 | MSB;
        num >>>= 7;
    }
    out[offset] = num | 0;
    encode2.bytes = offset - oldOffset + 1;
    return out;
}
var decode3 = read;
var MSB$1 = 128, REST$1 = 127;
function read(buf, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
    do {
        if (counter >= l) {
            read.bytes = 0;
            throw new RangeError("Could not decode varint");
        }
        b = buf[counter++];
        res += shift < 28 ? (b & REST$1) << shift : (b & REST$1) * Math.pow(2, shift);
        shift += 7;
    }while (b >= MSB$1)
    read.bytes = counter - offset;
    return res;
}
var N1 = Math.pow(2, 7);
var N2 = Math.pow(2, 14);
var N3 = Math.pow(2, 21);
var N4 = Math.pow(2, 28);
var N5 = Math.pow(2, 35);
var N6 = Math.pow(2, 42);
var N7 = Math.pow(2, 49);
var N8 = Math.pow(2, 56);
var N9 = Math.pow(2, 63);
var length = function(value) {
    return value < N1 ? 1 : value < N2 ? 2 : value < N3 ? 3 : value < N4 ? 4 : value < N5 ? 5 : value < N6 ? 6 : value < N7 ? 7 : value < N8 ? 8 : value < N9 ? 9 : 10;
};
var varint = {
    encode: encode_1,
    decode: decode3,
    encodingLength: length
};
var _brrp_varint = varint;
function decode$1(data, offset = 0) {
    const code = _brrp_varint.decode(data, offset);
    return [
        code,
        _brrp_varint.decode.bytes
    ];
}
function encodeTo(__int, target, offset = 0) {
    _brrp_varint.encode(__int, target, offset);
    return target;
}
function encodingLength(__int) {
    return _brrp_varint.encodingLength(__int);
}
Object.freeze({
    __proto__: null,
    decode: decode$1,
    encodeTo,
    encodingLength
});
function create(code, digest2) {
    const size = digest2.byteLength;
    const sizeOffset = encodingLength(code);
    const digestOffset = sizeOffset + encodingLength(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo(code, bytes, 0);
    encodeTo(size, bytes, sizeOffset);
    bytes.set(digest2, digestOffset);
    return new Digest(code, size, digest2, bytes);
}
function decode$2(multihash) {
    const bytes = coerce(multihash);
    const [code, sizeOffset] = decode$1(bytes);
    const [size, digestOffset] = decode$1(bytes.subarray(sizeOffset));
    const digest2 = bytes.subarray(sizeOffset + digestOffset);
    if (digest2.byteLength !== size) {
        throw new Error("Incorrect length");
    }
    return new Digest(code, size, digest2, bytes);
}
function equals1(a, b) {
    if (a === b) {
        return true;
    } else {
        const data = b;
        return a.code === data.code && a.size === data.size && data.bytes instanceof Uint8Array && equals(a.bytes, data.bytes);
    }
}
class Digest {
    constructor(code, size, digest2, bytes){
        __publicField1(this, "code");
        __publicField1(this, "size");
        __publicField1(this, "digest");
        __publicField1(this, "bytes");
        this.code = code;
        this.size = size;
        this.digest = digest2;
        this.bytes = bytes;
    }
}
Object.freeze({
    __proto__: null,
    create,
    decode: decode$2,
    equals: equals1,
    Digest
});
var __defProp2 = Object.defineProperty;
var __publicField2 = (obj, key, value)=>{
    if (typeof key !== "symbol") key += "";
    if (key in obj) return __defProp2(obj, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value
    });
    return obj[key] = value;
};
var _a;
function format(link, base) {
    const { bytes, version } = link;
    switch(version){
        case 0:
            return toStringV0(bytes, baseCache(link), base != null ? base : base58btc.encoder);
        default:
            return toStringV1(bytes, baseCache(link), base != null ? base : base32.encoder);
    }
}
const cache = new WeakMap();
function baseCache(cid) {
    const baseCache2 = cache.get(cid);
    if (baseCache2 == null) {
        const baseCache3 = new Map();
        cache.set(cid, baseCache3);
        return baseCache3;
    }
    return baseCache2;
}
class CID {
    constructor(version, code, multihash, bytes){
        __publicField2(this, "code");
        __publicField2(this, "version");
        __publicField2(this, "multihash");
        __publicField2(this, "bytes");
        __publicField2(this, "/");
        __publicField2(this, _a, "CID");
        this.code = code;
        this.version = version;
        this.multihash = multihash;
        this.bytes = bytes;
        this["/"] = bytes;
    }
    get asCID() {
        return this;
    }
    get byteOffset() {
        return this.bytes.byteOffset;
    }
    get byteLength() {
        return this.bytes.byteLength;
    }
    toV0() {
        switch(this.version){
            case 0:
                {
                    return this;
                }
            case 1:
                {
                    const { code, multihash } = this;
                    if (code !== DAG_PB_CODE) {
                        throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                    }
                    if (multihash.code !== SHA_256_CODE) {
                        throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
                    }
                    return CID.createV0(multihash);
                }
            default:
                {
                    throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
                }
        }
    }
    toV1() {
        switch(this.version){
            case 0:
                {
                    const { code, digest: digest$1 } = this.multihash;
                    const multihash = create(code, digest$1);
                    return CID.createV1(this.code, multihash);
                }
            case 1:
                {
                    return this;
                }
            default:
                {
                    throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
                }
        }
    }
    equals(other) {
        return CID.equals(this, other);
    }
    static equals(self1, other) {
        const unknown = other;
        return unknown != null && self1.code === unknown.code && self1.version === unknown.version && equals1(self1.multihash, unknown.multihash);
    }
    toString(base) {
        return format(this, base);
    }
    toJSON() {
        return {
            "/": format(this)
        };
    }
    link() {
        return this;
    }
    [(_a = Symbol.toStringTag, Symbol.for("nodejs.util.inspect.custom"))]() {
        return `CID(${this.toString()})`;
    }
    static asCID(input) {
        if (input == null) {
            return null;
        }
        const value = input;
        if (value instanceof CID) {
            return value;
        } else if (value["/"] != null && value["/"] === value.bytes || value.asCID === value) {
            const { version, code, multihash, bytes } = value;
            return new CID(version, code, multihash, bytes != null ? bytes : encodeCID(version, code, multihash.bytes));
        } else if (value[cidSymbol] === true) {
            const { version, multihash, code } = value;
            const digest$1 = decode$2(multihash);
            return CID.create(version, code, digest$1);
        } else {
            return null;
        }
    }
    static create(version, code, digest) {
        if (typeof code !== "number") {
            throw new Error("String codecs are no longer supported");
        }
        if (!(digest.bytes instanceof Uint8Array)) {
            throw new Error("Invalid digest");
        }
        switch(version){
            case 0:
                {
                    if (code !== DAG_PB_CODE) {
                        throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE}) block encoding`);
                    } else {
                        return new CID(version, code, digest, digest.bytes);
                    }
                }
            case 1:
                {
                    const bytes = encodeCID(version, code, digest.bytes);
                    return new CID(version, code, digest, bytes);
                }
            default:
                {
                    throw new Error("Invalid version");
                }
        }
    }
    static createV0(digest) {
        return CID.create(0, DAG_PB_CODE, digest);
    }
    static createV1(code, digest) {
        return CID.create(1, code, digest);
    }
    static decode(bytes) {
        const [cid, remainder] = CID.decodeFirst(bytes);
        if (remainder.length !== 0) {
            throw new Error("Incorrect length");
        }
        return cid;
    }
    static decodeFirst(bytes) {
        const specs = CID.inspectBytes(bytes);
        const prefixSize = specs.size - specs.multihashSize;
        const multihashBytes = coerce(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
        if (multihashBytes.byteLength !== specs.multihashSize) {
            throw new Error("Incorrect length");
        }
        const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
        const digest$1 = new Digest(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
        const cid = specs.version === 0 ? CID.createV0(digest$1) : CID.createV1(specs.codec, digest$1);
        return [
            cid,
            bytes.subarray(specs.size)
        ];
    }
    static inspectBytes(initialBytes) {
        let offset = 0;
        const next = ()=>{
            const [i, length] = decode$1(initialBytes.subarray(offset));
            offset += length;
            return i;
        };
        let version = next();
        let codec = DAG_PB_CODE;
        if (version === 18) {
            version = 0;
            offset = 0;
        } else {
            codec = next();
        }
        if (version !== 0 && version !== 1) {
            throw new RangeError(`Invalid CID version ${version}`);
        }
        const prefixSize = offset;
        const multihashCode = next();
        const digestSize = next();
        const size = offset + digestSize;
        const multihashSize = size - prefixSize;
        return {
            version,
            codec,
            multihashCode,
            digestSize,
            multihashSize,
            size
        };
    }
    static parse(source, base) {
        const [prefix, bytes] = parseCIDtoBytes(source, base);
        const cid = CID.decode(bytes);
        if (cid.version === 0 && source[0] !== "Q") {
            throw Error("Version 0 CID string must not include multibase prefix");
        }
        baseCache(cid).set(prefix, source);
        return cid;
    }
}
function parseCIDtoBytes(source, base) {
    switch(source[0]){
        case "Q":
            {
                const decoder = base != null ? base : base58btc;
                return [
                    base58btc.prefix,
                    decoder.decode(`${base58btc.prefix}${source}`)
                ];
            }
        case base58btc.prefix:
            {
                const decoder = base != null ? base : base58btc;
                return [
                    base58btc.prefix,
                    decoder.decode(source)
                ];
            }
        case base32.prefix:
            {
                const decoder = base != null ? base : base32;
                return [
                    base32.prefix,
                    decoder.decode(source)
                ];
            }
        default:
            {
                if (base == null) {
                    throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
                }
                return [
                    source[0],
                    base.decode(source)
                ];
            }
    }
}
function toStringV0(bytes, cache2, base) {
    const { prefix } = base;
    if (prefix !== base58btc.prefix) {
        throw Error(`Cannot string encode V0 in ${base.name} encoding`);
    }
    const cid = cache2.get(prefix);
    if (cid == null) {
        const cid2 = base.encode(bytes).slice(1);
        cache2.set(prefix, cid2);
        return cid2;
    } else {
        return cid;
    }
}
function toStringV1(bytes, cache2, base) {
    const { prefix } = base;
    const cid = cache2.get(prefix);
    if (cid == null) {
        const cid2 = base.encode(bytes);
        cache2.set(prefix, cid2);
        return cid2;
    } else {
        return cid;
    }
}
const DAG_PB_CODE = 112;
const SHA_256_CODE = 18;
function encodeCID(version, code, multihash) {
    const codeOffset = encodingLength(version);
    const hashOffset = codeOffset + encodingLength(code);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo(version, bytes, 0);
    encodeTo(code, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
}
const cidSymbol = Symbol.for("@ipld/js-cid/CID");
const CID_CBOR_TAG = 42;
function toByteView(buf) {
    if (buf instanceof ArrayBuffer) {
        return new Uint8Array(buf, 0, buf.byteLength);
    }
    return buf;
}
function cidEncoder(obj) {
    if (obj.asCID !== obj && obj["/"] !== obj.bytes) {
        return null;
    }
    const cid2 = CID.asCID(obj);
    if (!cid2) {
        return null;
    }
    const bytes = new Uint8Array(cid2.bytes.byteLength + 1);
    bytes.set(cid2.bytes, 1);
    return [
        new Token(Type.tag, 42),
        new Token(Type.bytes, bytes)
    ];
}
function undefinedEncoder() {
    throw new Error("`undefined` is not supported by the IPLD Data Model and cannot be encoded");
}
function numberEncoder(num) {
    if (Number.isNaN(num)) {
        throw new Error("`NaN` is not supported by the IPLD Data Model and cannot be encoded");
    }
    if (num === Infinity || num === -Infinity) {
        throw new Error("`Infinity` and `-Infinity` is not supported by the IPLD Data Model and cannot be encoded");
    }
    return null;
}
const _encodeOptions = {
    float64: true,
    typeEncoders: {
        Object: cidEncoder,
        undefined: undefinedEncoder,
        number: numberEncoder
    }
};
({
    ..._encodeOptions,
    typeEncoders: {
        ..._encodeOptions.typeEncoders
    }
});
function cidDecoder(bytes) {
    if (bytes[0] !== 0) {
        throw new Error("Invalid CID for CBOR tag 42; expected leading 0x00");
    }
    return CID.decode(bytes.subarray(1));
}
const _decodeOptions = {
    allowIndefinite: false,
    coerceUndefinedToNull: true,
    allowNaN: false,
    allowInfinity: false,
    allowBigInt: true,
    strict: true,
    useMaps: false,
    rejectDuplicateMapKeys: true,
    tags: []
};
_decodeOptions.tags[CID_CBOR_TAG] = cidDecoder;
({
    ..._decodeOptions,
    tags: _decodeOptions.tags.slice()
});
const encode3 = (node)=>encode(node, _encodeOptions);
const decode4 = (data)=>decode1(toByteView(data), _decodeOptions);
var encode_11 = encode4;
var MSB1 = 128, REST2 = 127, MSBALL1 = ~REST2, INT1 = Math.pow(2, 31);
function encode4(num, out, offset) {
    if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
        encode4.bytes = 0;
        throw new RangeError("Could not encode varint");
    }
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while(num >= INT1){
        out[offset++] = num & 255 | MSB1;
        num /= 128;
    }
    while(num & MSBALL1){
        out[offset++] = num & 255 | MSB1;
        num >>>= 7;
    }
    out[offset] = num | 0;
    encode4.bytes = offset - oldOffset + 1;
    return out;
}
var decode5 = read1;
var MSB$11 = 128, REST$11 = 127;
function read1(buf, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
    do {
        if (counter >= l || shift > 49) {
            read1.bytes = 0;
            throw new RangeError("Could not decode varint");
        }
        b = buf[counter++];
        res += shift < 28 ? (b & REST$11) << shift : (b & REST$11) * Math.pow(2, shift);
        shift += 7;
    }while (b >= MSB$11)
    read1.bytes = counter - offset;
    return res;
}
var N11 = Math.pow(2, 7);
var N21 = Math.pow(2, 14);
var N31 = Math.pow(2, 21);
var N41 = Math.pow(2, 28);
var N51 = Math.pow(2, 35);
var N61 = Math.pow(2, 42);
var N71 = Math.pow(2, 49);
var N81 = Math.pow(2, 56);
var N91 = Math.pow(2, 63);
var length1 = function(value) {
    return value < N11 ? 1 : value < N21 ? 2 : value < N31 ? 3 : value < N41 ? 4 : value < N51 ? 5 : value < N61 ? 6 : value < N71 ? 7 : value < N81 ? 8 : value < N91 ? 9 : 10;
};
var varint1 = {
    encode: encode_11,
    decode: decode5,
    encodingLength: length1
};
varint1.encode;
const CIDV0_BYTES = {
    SHA2_256: 18,
    LENGTH: 32,
    DAG_PB: 112
};
const V2_HEADER_LENGTH = 16 + 8 + 8 + 8;
function decodeVarint(bytes, seeker) {
    if (!bytes.length) {
        throw new Error("Unexpected end of data");
    }
    const i = varint1.decode(bytes);
    seeker.seek(varint1.decode.bytes);
    return i;
}
function decodeV2Header(bytes) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 0;
    const header = {
        version: 2,
        characteristics: [
            dv.getBigUint64(offset, true),
            dv.getBigUint64(offset += 8, true)
        ],
        dataOffset: Number(dv.getBigUint64(offset += 8, true)),
        dataSize: Number(dv.getBigUint64(offset += 8, true)),
        indexOffset: Number(dv.getBigUint64(offset += 8, true))
    };
    return header;
}
function getMultihashLength(bytes) {
    varint1.decode(bytes);
    const codeLength = varint1.decode.bytes;
    const length = varint1.decode(bytes.subarray(varint1.decode.bytes));
    const lengthLength = varint1.decode.bytes;
    const mhLength = codeLength + lengthLength + length;
    return mhLength;
}
const Kinds = {
    Null: (obj)=>obj === null ? obj : void 0,
    Int: (obj)=>Number.isInteger(obj) ? obj : void 0,
    Float: (obj)=>typeof obj === "number" && Number.isFinite(obj) ? obj : void 0,
    String: (obj)=>typeof obj === "string" ? obj : void 0,
    Bool: (obj)=>typeof obj === "boolean" ? obj : void 0,
    Bytes: (obj)=>obj instanceof Uint8Array ? obj : void 0,
    Link: (obj)=>obj !== null && typeof obj === "object" && obj.asCID === obj ? obj : void 0,
    List: (obj)=>Array.isArray(obj) ? obj : void 0,
    Map: (obj)=>obj !== null && typeof obj === "object" && obj.asCID !== obj && !Array.isArray(obj) && !(obj instanceof Uint8Array) ? obj : void 0
};
const Types = {
    "CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)": Kinds.Link,
    "CarV1HeaderOrV2Pragma > roots (anon)": (obj)=>{
        if (Kinds.List(obj) === void 0) {
            return void 0;
        }
        for(let i = 0; i < obj.length; i++){
            let v = obj[i];
            v = Types["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v);
            if (v === void 0) {
                return void 0;
            }
            if (v !== obj[i]) {
                const ret = obj.slice(0, i);
                for(let j = i; j < obj.length; j++){
                    let v2 = obj[j];
                    v2 = Types["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v2);
                    if (v2 === void 0) {
                        return void 0;
                    }
                    ret.push(v2);
                }
                return ret;
            }
        }
        return obj;
    },
    Int: Kinds.Int,
    CarV1HeaderOrV2Pragma: (obj)=>{
        if (Kinds.Map(obj) === void 0) {
            return void 0;
        }
        const entries = Object.entries(obj);
        let ret = obj;
        let requiredCount = 1;
        for(let i = 0; i < entries.length; i++){
            const [key, value] = entries[i];
            switch(key){
                case "roots":
                    {
                        const v = Types["CarV1HeaderOrV2Pragma > roots (anon)"](obj[key]);
                        if (v === void 0) {
                            return void 0;
                        }
                        if (v !== value || ret !== obj) {
                            if (ret === obj) {
                                ret = {};
                                for(let j = 0; j < i; j++){
                                    ret[entries[j][0]] = entries[j][1];
                                }
                            }
                            ret.roots = v;
                        }
                    }
                    break;
                case "version":
                    {
                        requiredCount--;
                        const v = Types.Int(obj[key]);
                        if (v === void 0) {
                            return void 0;
                        }
                        if (v !== value || ret !== obj) {
                            if (ret === obj) {
                                ret = {};
                                for(let j = 0; j < i; j++){
                                    ret[entries[j][0]] = entries[j][1];
                                }
                            }
                            ret.version = v;
                        }
                    }
                    break;
                default:
                    return void 0;
            }
        }
        if (requiredCount > 0) {
            return void 0;
        }
        return ret;
    }
};
const Reprs = {
    "CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)": Kinds.Link,
    "CarV1HeaderOrV2Pragma > roots (anon)": (obj)=>{
        if (Kinds.List(obj) === void 0) {
            return void 0;
        }
        for(let i = 0; i < obj.length; i++){
            let v = obj[i];
            v = Reprs["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v);
            if (v === void 0) {
                return void 0;
            }
            if (v !== obj[i]) {
                const ret = obj.slice(0, i);
                for(let j = i; j < obj.length; j++){
                    let v2 = obj[j];
                    v2 = Reprs["CarV1HeaderOrV2Pragma > roots (anon) > valueType (anon)"](v2);
                    if (v2 === void 0) {
                        return void 0;
                    }
                    ret.push(v2);
                }
                return ret;
            }
        }
        return obj;
    },
    Int: Kinds.Int,
    CarV1HeaderOrV2Pragma: (obj)=>{
        if (Kinds.Map(obj) === void 0) {
            return void 0;
        }
        const entries = Object.entries(obj);
        let ret = obj;
        let requiredCount = 1;
        for(let i = 0; i < entries.length; i++){
            const [key, value] = entries[i];
            switch(key){
                case "roots":
                    {
                        const v = Reprs["CarV1HeaderOrV2Pragma > roots (anon)"](value);
                        if (v === void 0) {
                            return void 0;
                        }
                        if (v !== value || ret !== obj) {
                            if (ret === obj) {
                                ret = {};
                                for(let j = 0; j < i; j++){
                                    ret[entries[j][0]] = entries[j][1];
                                }
                            }
                            ret.roots = v;
                        }
                    }
                    break;
                case "version":
                    {
                        requiredCount--;
                        const v = Reprs.Int(value);
                        if (v === void 0) {
                            return void 0;
                        }
                        if (v !== value || ret !== obj) {
                            if (ret === obj) {
                                ret = {};
                                for(let j = 0; j < i; j++){
                                    ret[entries[j][0]] = entries[j][1];
                                }
                            }
                            ret.version = v;
                        }
                    }
                    break;
                default:
                    return void 0;
            }
        }
        if (requiredCount > 0) {
            return void 0;
        }
        return ret;
    }
};
const CarV1HeaderOrV2Pragma = {
    toTyped: Types.CarV1HeaderOrV2Pragma,
    toRepresentation: Reprs.CarV1HeaderOrV2Pragma
};
const cborEncoders1 = makeCborEncoders();
const defaultEncodeOptions1 = {
    float64: false,
    quickEncodeToken
};
function tokensToLength(tokens, encoders = cborEncoders1, options = defaultEncodeOptions1) {
    if (Array.isArray(tokens)) {
        let len = 0;
        for (const token of tokens){
            len += tokensToLength(token, encoders, options);
        }
        return len;
    } else {
        const encoder = encoders[tokens.type.major];
        if (encoder.encodedSize === void 0 || typeof encoder.encodedSize !== "function") {
            throw new Error(`Encoder for ${tokens.type.name} does not have an encodedSize()`);
        }
        return encoder.encodedSize(tokens, options);
    }
}
async function readHeader(reader, strictVersion) {
    const length = decodeVarint(await reader.upTo(8), reader);
    if (length === 0) {
        throw new Error("Invalid CAR header (zero length)");
    }
    const header = await reader.exactly(length, true);
    const block = decode4(header);
    if (CarV1HeaderOrV2Pragma.toTyped(block) === void 0) {
        throw new Error("Invalid CAR header format");
    }
    if (block.version !== 1 && block.version !== 2 || strictVersion !== void 0 && block.version !== strictVersion) {
        throw new Error(`Invalid CAR version: ${block.version}${strictVersion !== void 0 ? ` (expected ${strictVersion})` : ""}`);
    }
    if (block.version === 1) {
        if (!Array.isArray(block.roots)) {
            throw new Error("Invalid CAR header format");
        }
        return block;
    }
    if (block.roots !== void 0) {
        throw new Error("Invalid CAR header format");
    }
    const v2Header = decodeV2Header(await reader.exactly(V2_HEADER_LENGTH, true));
    reader.seek(v2Header.dataOffset - reader.pos);
    const v1Header = await readHeader(reader, 1);
    return Object.assign(v1Header, v2Header);
}
async function readCid(reader) {
    const first = await reader.exactly(2, false);
    if (first[0] === CIDV0_BYTES.SHA2_256 && first[1] === CIDV0_BYTES.LENGTH) {
        const bytes2 = await reader.exactly(34, true);
        const multihash2 = decode$2(bytes2);
        return CID.create(0, CIDV0_BYTES.DAG_PB, multihash2);
    }
    const version = decodeVarint(await reader.upTo(8), reader);
    if (version !== 1) {
        throw new Error(`Unexpected CID version (${version})`);
    }
    const codec = decodeVarint(await reader.upTo(8), reader);
    const bytes = await reader.exactly(getMultihashLength(await reader.upTo(8)), true);
    const multihash = decode$2(bytes);
    return CID.create(version, codec, multihash);
}
async function readBlockHead(reader) {
    const start = reader.pos;
    let length = decodeVarint(await reader.upTo(8), reader);
    if (length === 0) {
        throw new Error("Invalid CAR section (zero length)");
    }
    length += reader.pos - start;
    const cid2 = await readCid(reader);
    const blockLength = length - Number(reader.pos - start);
    return {
        cid: cid2,
        length,
        blockLength
    };
}
async function readBlock(reader) {
    const { cid: cid2, blockLength } = await readBlockHead(reader);
    const bytes = await reader.exactly(blockLength, true);
    return {
        bytes,
        cid: cid2
    };
}
async function readBlockIndex(reader) {
    const offset = reader.pos;
    const { cid: cid2, length, blockLength } = await readBlockHead(reader);
    const index = {
        cid: cid2,
        length,
        blockLength,
        offset,
        blockOffset: reader.pos
    };
    reader.seek(index.blockLength);
    return index;
}
function createDecoder(reader) {
    const headerPromise = (async ()=>{
        const header = await readHeader(reader);
        if (header.version === 2) {
            const v1length = reader.pos - header.dataOffset;
            reader = limitReader(reader, header.dataSize - v1length);
        }
        return header;
    })();
    return {
        header: ()=>headerPromise,
        async *blocks () {
            await headerPromise;
            while((await reader.upTo(8)).length > 0){
                yield await readBlock(reader);
            }
        },
        async *blocksIndex () {
            await headerPromise;
            while((await reader.upTo(8)).length > 0){
                yield await readBlockIndex(reader);
            }
        }
    };
}
function bytesReader(bytes) {
    let pos = 0;
    return {
        async upTo (length) {
            const out = bytes.subarray(pos, pos + Math.min(length, bytes.length - pos));
            return out;
        },
        async exactly (length, seek = false) {
            if (length > bytes.length - pos) {
                throw new Error("Unexpected end of data");
            }
            const out = bytes.subarray(pos, pos + length);
            if (seek) {
                pos += length;
            }
            return out;
        },
        seek (length) {
            pos += length;
        },
        get pos () {
            return pos;
        }
    };
}
function chunkReader(readChunk) {
    let pos = 0;
    let have = 0;
    let offset = 0;
    let currentChunk = new Uint8Array(0);
    const read = async (length)=>{
        have = currentChunk.length - offset;
        const bufa = [
            currentChunk.subarray(offset)
        ];
        while(have < length){
            const chunk = await readChunk();
            if (chunk == null) {
                break;
            }
            if (have < 0) {
                if (chunk.length > have) {
                    bufa.push(chunk.subarray(-have));
                }
            } else {
                bufa.push(chunk);
            }
            have += chunk.length;
        }
        currentChunk = new Uint8Array(bufa.reduce((p, c)=>p + c.length, 0));
        let off = 0;
        for (const b of bufa){
            currentChunk.set(b, off);
            off += b.length;
        }
        offset = 0;
    };
    return {
        async upTo (length) {
            if (currentChunk.length - offset < length) {
                await read(length);
            }
            return currentChunk.subarray(offset, offset + Math.min(currentChunk.length - offset, length));
        },
        async exactly (length, seek = false) {
            if (currentChunk.length - offset < length) {
                await read(length);
            }
            if (currentChunk.length - offset < length) {
                throw new Error("Unexpected end of data");
            }
            const out = currentChunk.subarray(offset, offset + length);
            if (seek) {
                pos += length;
                offset += length;
            }
            return out;
        },
        seek (length) {
            pos += length;
            offset += length;
        },
        get pos () {
            return pos;
        }
    };
}
function asyncIterableReader(asyncIterable) {
    const iterator = asyncIterable[Symbol.asyncIterator]();
    async function readChunk() {
        const next = await iterator.next();
        if (next.done) {
            return null;
        }
        return next.value;
    }
    return chunkReader(readChunk);
}
function limitReader(reader, byteLimit) {
    let bytesRead = 0;
    return {
        async upTo (length) {
            let bytes = await reader.upTo(length);
            if (bytes.length + bytesRead > byteLimit) {
                bytes = bytes.subarray(0, byteLimit - bytesRead);
            }
            return bytes;
        },
        async exactly (length, seek = false) {
            const bytes = await reader.exactly(length, seek);
            if (bytes.length + bytesRead > byteLimit) {
                throw new Error("Unexpected end of data");
            }
            if (seek) {
                bytesRead += length;
            }
            return bytes;
        },
        seek (length) {
            bytesRead += length;
            reader.seek(length);
        },
        get pos () {
            return reader.pos;
        }
    };
}
class CarBufferWriter {
    constructor(bytes, headerSize){
        this.bytes = bytes;
        this.byteOffset = headerSize;
        this.roots = [];
        this.headerSize = headerSize;
    }
    addRoot(root, options) {
        addRoot(this, root, options);
        return this;
    }
    write(block) {
        addBlock(this, block);
        return this;
    }
    close(options) {
        return close(this, options);
    }
}
const addRoot = (writer, root, options = {})=>{
    const { resize = false } = options;
    const { bytes, headerSize, byteOffset, roots } = writer;
    writer.roots.push(root);
    const size = headerLength(writer);
    if (size > headerSize) {
        if (size - headerSize + byteOffset < bytes.byteLength) {
            if (resize) {
                resizeHeader(writer, size);
            } else {
                roots.pop();
                throw new RangeError(`Header of size ${headerSize} has no capacity for new root ${root}.
  However there is a space in the buffer and you could call addRoot(root, { resize: root }) to resize header to make a space for this root.`);
            }
        } else {
            roots.pop();
            throw new RangeError(`Buffer has no capacity for a new root ${root}`);
        }
    }
};
const blockLength = ({ cid, bytes })=>{
    const size = cid.bytes.byteLength + bytes.byteLength;
    return varint1.encodingLength(size) + size;
};
const addBlock = (writer, { cid, bytes })=>{
    const byteLength = cid.bytes.byteLength + bytes.byteLength;
    const size = varint1.encode(byteLength);
    if (writer.byteOffset + size.length + byteLength > writer.bytes.byteLength) {
        throw new RangeError("Buffer has no capacity for this block");
    } else {
        writeBytes(writer, size);
        writeBytes(writer, cid.bytes);
        writeBytes(writer, bytes);
    }
};
const close = (writer, options = {})=>{
    const { resize = false } = options;
    const { roots, bytes, byteOffset, headerSize } = writer;
    const headerBytes = encode3({
        version: 1,
        roots
    });
    const varintBytes = varint1.encode(headerBytes.length);
    const size = varintBytes.length + headerBytes.byteLength;
    const offset = headerSize - size;
    if (offset === 0) {
        writeHeader(writer, varintBytes, headerBytes);
        return bytes.subarray(0, byteOffset);
    } else if (resize) {
        resizeHeader(writer, size);
        writeHeader(writer, varintBytes, headerBytes);
        return bytes.subarray(0, writer.byteOffset);
    } else {
        throw new RangeError(`Header size was overestimated.
You can use close({ resize: true }) to resize header`);
    }
};
const resizeHeader = (writer, byteLength)=>{
    const { bytes, headerSize } = writer;
    bytes.set(bytes.subarray(headerSize, writer.byteOffset), byteLength);
    writer.byteOffset += byteLength - headerSize;
    writer.headerSize = byteLength;
};
const writeBytes = (writer, bytes)=>{
    writer.bytes.set(bytes, writer.byteOffset);
    writer.byteOffset += bytes.length;
};
const writeHeader = ({ bytes }, varint3, header)=>{
    bytes.set(varint3);
    bytes.set(header, varint3.length);
};
const headerPreludeTokens = [
    new Token(Type.map, 2),
    new Token(Type.string, "version"),
    new Token(Type.uint, 1),
    new Token(Type.string, "roots")
];
const CID_TAG = new Token(Type.tag, 42);
const calculateHeaderLength = (rootLengths)=>{
    const tokens = [
        ...headerPreludeTokens
    ];
    tokens.push(new Token(Type.array, rootLengths.length));
    for (const rootLength of rootLengths){
        tokens.push(CID_TAG);
        tokens.push(new Token(Type.bytes, {
            length: rootLength + 1
        }));
    }
    const length2 = tokensToLength(tokens);
    return varint1.encodingLength(length2) + length2;
};
const headerLength = ({ roots })=>calculateHeaderLength(roots.map((cid)=>cid.bytes.byteLength));
const estimateHeaderLength = (rootCount, rootByteLength = 36)=>calculateHeaderLength(new Array(rootCount).fill(rootByteLength));
const createWriter = (buffer, options = {})=>{
    const { roots = [], byteOffset = 0, byteLength = buffer.byteLength, headerSize = headerLength({
        roots
    }) } = options;
    const bytes = new Uint8Array(buffer, byteOffset, byteLength);
    const writer = new CarBufferWriter(bytes, headerSize);
    for (const root of roots){
        writer.addRoot(root);
    }
    return writer;
};
Object.freeze({
    __proto__: null,
    addRoot,
    blockLength,
    addBlock,
    close,
    resizeHeader,
    calculateHeaderLength,
    headerLength,
    estimateHeaderLength,
    createWriter
});
class CarIndexer {
    constructor(version, roots, iterator){
        this._version = version;
        this._roots = roots;
        this._iterator = iterator;
    }
    get version() {
        return this._version;
    }
    async getRoots() {
        return this._roots;
    }
    [Symbol.asyncIterator]() {
        return this._iterator;
    }
    static async fromBytes(bytes) {
        if (!(bytes instanceof Uint8Array)) {
            throw new TypeError("fromBytes() requires a Uint8Array");
        }
        return decodeIndexerComplete(bytesReader(bytes));
    }
    static async fromIterable(asyncIterable) {
        if (!asyncIterable || !(typeof asyncIterable[Symbol.asyncIterator] === "function")) {
            throw new TypeError("fromIterable() requires an async iterable");
        }
        return decodeIndexerComplete(asyncIterableReader(asyncIterable));
    }
}
class CarIteratorBase {
    constructor(version, roots, iterable){
        this._version = version;
        this._roots = roots;
        this._iterable = iterable;
        this._decoded = false;
    }
    get version() {
        return this._version;
    }
    async getRoots() {
        return this._roots;
    }
}
class CarBlockIterator extends CarIteratorBase {
    [Symbol.asyncIterator]() {
        if (this._decoded) {
            throw new Error("Cannot decode more than once");
        }
        if (!this._iterable) {
            throw new Error("Block iterable not found");
        }
        this._decoded = true;
        return this._iterable[Symbol.asyncIterator]();
    }
    static async fromBytes(bytes) {
        const { version, roots, iterator } = await fromBytes(bytes);
        return new CarBlockIterator(version, roots, iterator);
    }
    static async fromIterable(asyncIterable) {
        const { version, roots, iterator } = await fromIterable(asyncIterable);
        return new CarBlockIterator(version, roots, iterator);
    }
}
class CarCIDIterator extends CarIteratorBase {
    [Symbol.asyncIterator]() {
        if (this._decoded) {
            throw new Error("Cannot decode more than once");
        }
        if (!this._iterable) {
            throw new Error("Block iterable not found");
        }
        this._decoded = true;
        const iterable = this._iterable[Symbol.asyncIterator]();
        return {
            async next () {
                const next = await iterable.next();
                if (next.done) {
                    return next;
                }
                return {
                    done: false,
                    value: next.value.cid
                };
            }
        };
    }
    static async fromBytes(bytes) {
        const { version, roots, iterator } = await fromBytes(bytes);
        return new CarCIDIterator(version, roots, iterator);
    }
    static async fromIterable(asyncIterable) {
        const { version, roots, iterator } = await fromIterable(asyncIterable);
        return new CarCIDIterator(version, roots, iterator);
    }
}
async function fromBytes(bytes) {
    if (!(bytes instanceof Uint8Array)) {
        throw new TypeError("fromBytes() requires a Uint8Array");
    }
    return decodeIterator(bytesReader(bytes));
}
async function fromIterable(asyncIterable) {
    if (!asyncIterable || !(typeof asyncIterable[Symbol.asyncIterator] === "function")) {
        throw new TypeError("fromIterable() requires an async iterable");
    }
    return decodeIterator(asyncIterableReader(asyncIterable));
}
async function decodeIterator(reader) {
    const decoder2 = createDecoder(reader);
    const { version, roots } = await decoder2.header();
    return {
        version,
        roots,
        iterator: decoder2.blocks()
    };
}
class CarWriterOut {
    constructor(iterator){
        this._iterator = iterator;
    }
    [Symbol.asyncIterator]() {
        if (this._iterating) {
            throw new Error("Multiple iterator not supported");
        }
        this._iterating = true;
        return this._iterator;
    }
}
const empty1 = new Uint8Array(0);
const toHex1 = (d)=>d.reduce((hex, __byte)=>hex + __byte.toString(16).padStart(2, "0"), "");
const fromHex1 = (hex)=>{
    const hexes = hex.match(/../g);
    return hexes ? new Uint8Array(hexes.map((b)=>parseInt(b, 16))) : empty1;
};
const equals2 = (aa, bb)=>{
    if (aa === bb) return true;
    if (aa.byteLength !== bb.byteLength) {
        return false;
    }
    for(let ii = 0; ii < aa.byteLength; ii++){
        if (aa[ii] !== bb[ii]) {
            return false;
        }
    }
    return true;
};
const coerce1 = (o)=>{
    if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") return o;
    if (o instanceof ArrayBuffer) return new Uint8Array(o);
    if (ArrayBuffer.isView(o)) {
        return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error("Unknown type, must be binary type");
};
const isBinary1 = (o)=>o instanceof ArrayBuffer || ArrayBuffer.isView(o);
const fromString2 = (str)=>new TextEncoder().encode(str);
const toString2 = (b)=>new TextDecoder().decode(b);
var bytes = Object.freeze({
    __proto__: null,
    equals: equals2,
    coerce: coerce1,
    isBinary: isBinary1,
    fromHex: fromHex1,
    toHex: toHex1,
    fromString: fromString2,
    toString: toString2,
    empty: empty1
});
var encode_12 = encode5;
var MSB2 = 128, REST3 = 127, MSBALL2 = ~REST3, INT2 = Math.pow(2, 31);
function encode5(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while(num >= INT2){
        out[offset++] = num & 255 | MSB2;
        num /= 128;
    }
    while(num & MSBALL2){
        out[offset++] = num & 255 | MSB2;
        num >>>= 7;
    }
    out[offset] = num | 0;
    encode5.bytes = offset - oldOffset + 1;
    return out;
}
var decode6 = read2;
var MSB$12 = 128, REST$12 = 127;
function read2(buf, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
    do {
        if (counter >= l) {
            read2.bytes = 0;
            throw new RangeError("Could not decode varint");
        }
        b = buf[counter++];
        res += shift < 28 ? (b & REST$12) << shift : (b & REST$12) * Math.pow(2, shift);
        shift += 7;
    }while (b >= MSB$12)
    read2.bytes = counter - offset;
    return res;
}
var N12 = Math.pow(2, 7);
var N22 = Math.pow(2, 14);
var N32 = Math.pow(2, 21);
var N42 = Math.pow(2, 28);
var N52 = Math.pow(2, 35);
var N62 = Math.pow(2, 42);
var N72 = Math.pow(2, 49);
var N82 = Math.pow(2, 56);
var N92 = Math.pow(2, 63);
var length2 = function(value) {
    return value < N12 ? 1 : value < N22 ? 2 : value < N32 ? 3 : value < N42 ? 4 : value < N52 ? 5 : value < N62 ? 6 : value < N72 ? 7 : value < N82 ? 8 : value < N92 ? 9 : 10;
};
var varint2 = {
    encode: encode_12,
    decode: decode6,
    encodingLength: length2
};
var _brrp_varint1 = varint2;
const decode$11 = (data, offset = 0)=>{
    const code = _brrp_varint1.decode(data, offset);
    return [
        code,
        _brrp_varint1.decode.bytes
    ];
};
const encodeTo1 = (__int, target, offset = 0)=>{
    _brrp_varint1.encode(__int, target, offset);
    return target;
};
const encodingLength1 = (__int)=>{
    return _brrp_varint1.encodingLength(__int);
};
Object.freeze({
    __proto__: null,
    decode: decode$11,
    encodeTo: encodeTo1,
    encodingLength: encodingLength1
});
const create1 = (code, digest2)=>{
    const size = digest2.byteLength;
    const sizeOffset = encodingLength1(code);
    const digestOffset = sizeOffset + encodingLength1(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo1(code, bytes, 0);
    encodeTo1(size, bytes, sizeOffset);
    bytes.set(digest2, digestOffset);
    return new Digest1(code, size, digest2, bytes);
};
const decode$21 = (multihash)=>{
    const bytes = coerce1(multihash);
    const [code, sizeOffset] = decode$11(bytes);
    const [size, digestOffset] = decode$11(bytes.subarray(sizeOffset));
    const digest2 = bytes.subarray(sizeOffset + digestOffset);
    if (digest2.byteLength !== size) {
        throw new Error("Incorrect length");
    }
    return new Digest1(code, size, digest2, bytes);
};
const equals3 = (a, b)=>{
    if (a === b) {
        return true;
    } else {
        return a.code === b.code && a.size === b.size && equals2(a.bytes, b.bytes);
    }
};
class Digest1 {
    constructor(code, size, digest2, bytes){
        this.code = code;
        this.size = size;
        this.digest = digest2;
        this.bytes = bytes;
    }
}
Object.freeze({
    __proto__: null,
    create: create1,
    decode: decode$21,
    equals: equals3,
    Digest: Digest1
});
const from1 = ({ name, code, encode })=>new Hasher(name, code, encode);
class Hasher {
    constructor(name, code, encode){
        this.name = name;
        this.code = code;
        this.encode = encode;
    }
    digest(input) {
        if (input instanceof Uint8Array) {
            const result = this.encode(input);
            return result instanceof Uint8Array ? create1(this.code, result) : result.then((digest$1)=>create1(this.code, digest$1));
        } else {
            throw Error("Unknown type, must be binary type");
        }
    }
}
Object.freeze({
    __proto__: null,
    from: from1,
    Hasher
});
const sha = (name)=>async (data)=>new Uint8Array(await crypto.subtle.digest(name, data));
const sha256 = from1({
    name: "sha2-256",
    code: 18,
    encode: sha("SHA-256")
});
const sha512 = from1({
    name: "sha2-512",
    code: 19,
    encode: sha("SHA-512")
});
var sha2 = Object.freeze({
    __proto__: null,
    sha256,
    sha512
});
const empty2 = new Uint8Array(0);
const toHex2 = (d)=>d.reduce((hex, __byte)=>hex + __byte.toString(16).padStart(2, "0"), "");
const fromHex2 = (hex)=>{
    const hexes = hex.match(/../g);
    return hexes ? new Uint8Array(hexes.map((b)=>parseInt(b, 16))) : empty2;
};
const equals4 = (aa, bb)=>{
    if (aa === bb) return true;
    if (aa.byteLength !== bb.byteLength) {
        return false;
    }
    for(let ii = 0; ii < aa.byteLength; ii++){
        if (aa[ii] !== bb[ii]) {
            return false;
        }
    }
    return true;
};
const coerce2 = (o)=>{
    if (o instanceof Uint8Array && o.constructor.name === "Uint8Array") return o;
    if (o instanceof ArrayBuffer) return new Uint8Array(o);
    if (ArrayBuffer.isView(o)) {
        return new Uint8Array(o.buffer, o.byteOffset, o.byteLength);
    }
    throw new Error("Unknown type, must be binary type");
};
const isBinary2 = (o)=>o instanceof ArrayBuffer || ArrayBuffer.isView(o);
const fromString3 = (str)=>new TextEncoder().encode(str);
const toString3 = (b)=>new TextDecoder().decode(b);
var bytes1 = Object.freeze({
    __proto__: null,
    equals: equals4,
    coerce: coerce2,
    isBinary: isBinary2,
    fromHex: fromHex2,
    toHex: toHex2,
    fromString: fromString3,
    toString: toString3,
    empty: empty2
});
var encode_13 = encode6;
var MSB3 = 128, REST4 = 127, MSBALL3 = ~REST4, INT3 = Math.pow(2, 31);
function encode6(num, out, offset) {
    out = out || [];
    offset = offset || 0;
    var oldOffset = offset;
    while(num >= INT3){
        out[offset++] = num & 255 | MSB3;
        num /= 128;
    }
    while(num & MSBALL3){
        out[offset++] = num & 255 | MSB3;
        num >>>= 7;
    }
    out[offset] = num | 0;
    encode6.bytes = offset - oldOffset + 1;
    return out;
}
var decode7 = read3;
var MSB$13 = 128, REST$13 = 127;
function read3(buf, offset) {
    var res = 0, offset = offset || 0, shift = 0, counter = offset, b, l = buf.length;
    do {
        if (counter >= l) {
            read3.bytes = 0;
            throw new RangeError("Could not decode varint");
        }
        b = buf[counter++];
        res += shift < 28 ? (b & REST$13) << shift : (b & REST$13) * Math.pow(2, shift);
        shift += 7;
    }while (b >= MSB$13)
    read3.bytes = counter - offset;
    return res;
}
var N13 = Math.pow(2, 7);
var N23 = Math.pow(2, 14);
var N33 = Math.pow(2, 21);
var N43 = Math.pow(2, 28);
var N53 = Math.pow(2, 35);
var N63 = Math.pow(2, 42);
var N73 = Math.pow(2, 49);
var N83 = Math.pow(2, 56);
var N93 = Math.pow(2, 63);
var length3 = function(value) {
    return value < N13 ? 1 : value < N23 ? 2 : value < N33 ? 3 : value < N43 ? 4 : value < N53 ? 5 : value < N63 ? 6 : value < N73 ? 7 : value < N83 ? 8 : value < N93 ? 9 : 10;
};
var varint3 = {
    encode: encode_13,
    decode: decode7,
    encodingLength: length3
};
var _brrp_varint2 = varint3;
const decode$12 = (data)=>{
    const code = _brrp_varint2.decode(data);
    return [
        code,
        _brrp_varint2.decode.bytes
    ];
};
const encodeTo2 = (__int, target, offset = 0)=>{
    _brrp_varint2.encode(__int, target, offset);
    return target;
};
const encodingLength2 = (__int)=>{
    return _brrp_varint2.encodingLength(__int);
};
Object.freeze({
    __proto__: null,
    decode: decode$12,
    encodeTo: encodeTo2,
    encodingLength: encodingLength2
});
const create2 = (code, digest2)=>{
    const size = digest2.byteLength;
    const sizeOffset = encodingLength2(code);
    const digestOffset = sizeOffset + encodingLength2(size);
    const bytes = new Uint8Array(digestOffset + size);
    encodeTo2(code, bytes, 0);
    encodeTo2(size, bytes, sizeOffset);
    bytes.set(digest2, digestOffset);
    return new Digest2(code, size, digest2, bytes);
};
const decode$22 = (multihash)=>{
    const bytes = coerce2(multihash);
    const [code, sizeOffset] = decode$12(bytes);
    const [size, digestOffset] = decode$12(bytes.subarray(sizeOffset));
    const digest2 = bytes.subarray(sizeOffset + digestOffset);
    if (digest2.byteLength !== size) {
        throw new Error("Incorrect length");
    }
    return new Digest2(code, size, digest2, bytes);
};
const equals5 = (a, b)=>{
    if (a === b) {
        return true;
    } else {
        return a.code === b.code && a.size === b.size && equals4(a.bytes, b.bytes);
    }
};
class Digest2 {
    constructor(code, size, digest2, bytes){
        this.code = code;
        this.size = size;
        this.digest = digest2;
        this.bytes = bytes;
    }
}
Object.freeze({
    __proto__: null,
    create: create2,
    decode: decode$22,
    equals: equals5,
    Digest: Digest2
});
const from2 = ({ name, code, encode })=>new Hasher1(name, code, encode);
class Hasher1 {
    constructor(name, code, encode){
        this.name = name;
        this.code = code;
        this.encode = encode;
    }
    digest(input) {
        if (input instanceof Uint8Array) {
            const result = this.encode(input);
            return result instanceof Uint8Array ? create2(this.code, result) : result.then((digest$1)=>create2(this.code, digest$1));
        } else {
            throw Error("Unknown type, must be binary type");
        }
    }
}
Object.freeze({
    __proto__: null,
    from: from2,
    Hasher: Hasher1
});
function base1(ALPHABET, name) {
    if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
    }
    var BASE_MAP = new Uint8Array(256);
    for(var j = 0; j < BASE_MAP.length; j++){
        BASE_MAP[j] = 255;
    }
    for(var i = 0; i < ALPHABET.length; i++){
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode2(source) {
        if (source instanceof Uint8Array) ;
        else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
            throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
            return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while(pbegin !== pend && source[pbegin] === 0){
            pbegin++;
            zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while(pbegin !== pend){
            var carry = source[pbegin];
            var i2 = 0;
            for(var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++){
                carry += 256 * b58[it1] >>> 0;
                b58[it1] = carry % BASE >>> 0;
                carry = carry / BASE >>> 0;
            }
            if (carry !== 0) {
                throw new Error("Non-zero carry");
            }
            length = i2;
            pbegin++;
        }
        var it2 = size - length;
        while(it2 !== size && b58[it2] === 0){
            it2++;
        }
        var str = LEADER.repeat(zeroes);
        for(; it2 < size; ++it2){
            str += ALPHABET.charAt(b58[it2]);
        }
        return str;
    }
    function decodeUnsafe(source) {
        if (typeof source !== "string") {
            throw new TypeError("Expected String");
        }
        if (source.length === 0) {
            return new Uint8Array();
        }
        var psz = 0;
        if (source[psz] === " ") {
            return;
        }
        var zeroes = 0;
        var length = 0;
        while(source[psz] === LEADER){
            zeroes++;
            psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while(source[psz]){
            var carry = BASE_MAP[source.charCodeAt(psz)];
            if (carry === 255) {
                return;
            }
            var i2 = 0;
            for(var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++){
                carry += BASE * b256[it3] >>> 0;
                b256[it3] = carry % 256 >>> 0;
                carry = carry / 256 >>> 0;
            }
            if (carry !== 0) {
                throw new Error("Non-zero carry");
            }
            length = i2;
            psz++;
        }
        if (source[psz] === " ") {
            return;
        }
        var it4 = size - length;
        while(it4 !== size && b256[it4] === 0){
            it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while(it4 !== size){
            vch[j2++] = b256[it4++];
        }
        return vch;
    }
    function decode2(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
            return buffer;
        }
        throw new Error(`Non-${name} character`);
    }
    return {
        encode: encode2,
        decodeUnsafe,
        decode: decode2
    };
}
var src1 = base1;
var _brrp__multiformats_scope_baseX1 = src1;
class Encoder1 {
    constructor(name, prefix, baseEncode){
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
    }
    encode(bytes) {
        if (bytes instanceof Uint8Array) {
            return `${this.prefix}${this.baseEncode(bytes)}`;
        } else {
            throw Error("Unknown type, must be binary type");
        }
    }
}
class Decoder1 {
    constructor(name, prefix, baseDecode){
        this.name = name;
        this.prefix = prefix;
        this.baseDecode = baseDecode;
    }
    decode(text) {
        if (typeof text === "string") {
            switch(text[0]){
                case this.prefix:
                    {
                        return this.baseDecode(text.slice(1));
                    }
                default:
                    {
                        throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
                    }
            }
        } else {
            throw Error("Can only multibase decode strings");
        }
    }
    or(decoder) {
        return or1(this, decoder);
    }
}
class ComposedDecoder1 {
    constructor(decoders){
        this.decoders = decoders;
    }
    or(decoder) {
        return or1(this, decoder);
    }
    decode(input) {
        const prefix = input[0];
        const decoder = this.decoders[prefix];
        if (decoder) {
            return decoder.decode(input);
        } else {
            throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
        }
    }
}
const or1 = (left, right)=>new ComposedDecoder1({
        ...left.decoders || {
            [left.prefix]: left
        },
        ...right.decoders || {
            [right.prefix]: right
        }
    });
class Codec1 {
    constructor(name, prefix, baseEncode, baseDecode){
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
        this.baseDecode = baseDecode;
        this.encoder = new Encoder1(name, prefix, baseEncode);
        this.decoder = new Decoder1(name, prefix, baseDecode);
    }
    encode(input) {
        return this.encoder.encode(input);
    }
    decode(input) {
        return this.decoder.decode(input);
    }
}
const from3 = ({ name, prefix, encode: encode2, decode: decode2 })=>new Codec1(name, prefix, encode2, decode2);
const baseX1 = ({ prefix, name, alphabet })=>{
    const { encode: encode2, decode: decode2 } = _brrp__multiformats_scope_baseX1(alphabet, name);
    return from3({
        prefix,
        name,
        encode: encode2,
        decode: (text)=>coerce2(decode2(text))
    });
};
const decode8 = (string, alphabet, bitsPerChar, name)=>{
    const codes = {};
    for(let i = 0; i < alphabet.length; ++i){
        codes[alphabet[i]] = i;
    }
    let end = string.length;
    while(string[end - 1] === "="){
        --end;
    }
    const out = new Uint8Array(end * bitsPerChar / 8 | 0);
    let bits = 0;
    let buffer = 0;
    let written = 0;
    for(let i = 0; i < end; ++i){
        const value = codes[string[i]];
        if (value === void 0) {
            throw new SyntaxError(`Non-${name} character`);
        }
        buffer = buffer << bitsPerChar | value;
        bits += bitsPerChar;
        if (bits >= 8) {
            bits -= 8;
            out[written++] = 255 & buffer >> bits;
        }
    }
    if (bits >= bitsPerChar || 255 & buffer << 8 - bits) {
        throw new SyntaxError("Unexpected end of data");
    }
    return out;
};
const encode7 = (data, alphabet, bitsPerChar)=>{
    const pad = alphabet[alphabet.length - 1] === "=";
    const mask = (1 << bitsPerChar) - 1;
    let out = "";
    let bits = 0;
    let buffer = 0;
    for(let i = 0; i < data.length; ++i){
        buffer = buffer << 8 | data[i];
        bits += 8;
        while(bits > bitsPerChar){
            bits -= bitsPerChar;
            out += alphabet[mask & buffer >> bits];
        }
    }
    if (bits) {
        out += alphabet[mask & buffer << bitsPerChar - bits];
    }
    if (pad) {
        while(out.length * bitsPerChar & 7){
            out += "=";
        }
    }
    return out;
};
const rfc46481 = ({ name, prefix, bitsPerChar, alphabet })=>{
    return from3({
        prefix,
        name,
        encode (input) {
            return encode7(input, alphabet, bitsPerChar);
        },
        decode (input) {
            return decode8(input, alphabet, bitsPerChar, name);
        }
    });
};
const base58btc1 = baseX1({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
const base58flickr1 = baseX1({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
Object.freeze({
    __proto__: null,
    base58btc: base58btc1,
    base58flickr: base58flickr1
});
const base321 = rfc46481({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
});
const base32upper1 = rfc46481({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
});
const base32pad1 = rfc46481({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
});
const base32padupper1 = rfc46481({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
});
const base32hex1 = rfc46481({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
});
const base32hexupper1 = rfc46481({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
});
const base32hexpad1 = rfc46481({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
});
const base32hexpadupper1 = rfc46481({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
});
const base32z1 = rfc46481({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
Object.freeze({
    __proto__: null,
    base32: base321,
    base32upper: base32upper1,
    base32pad: base32pad1,
    base32padupper: base32padupper1,
    base32hex: base32hex1,
    base32hexupper: base32hexupper1,
    base32hexpad: base32hexpad1,
    base32hexpadupper: base32hexpadupper1,
    base32z: base32z1
});
class CID1 {
    constructor(version2, code, multihash, bytes){
        this.code = code;
        this.version = version2;
        this.multihash = multihash;
        this.bytes = bytes;
        this.byteOffset = bytes.byteOffset;
        this.byteLength = bytes.byteLength;
        this.asCID = this;
        this._baseCache = new Map();
        Object.defineProperties(this, {
            byteOffset: hidden,
            byteLength: hidden,
            code: readonly,
            version: readonly,
            multihash: readonly,
            bytes: readonly,
            _baseCache: hidden,
            asCID: hidden
        });
    }
    toV0() {
        switch(this.version){
            case 0:
                {
                    return this;
                }
            default:
                {
                    const { code, multihash } = this;
                    if (code !== DAG_PB_CODE1) {
                        throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                    }
                    if (multihash.code !== SHA_256_CODE1) {
                        throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
                    }
                    return CID1.createV0(multihash);
                }
        }
    }
    toV1() {
        switch(this.version){
            case 0:
                {
                    const { code, digest: digest$1 } = this.multihash;
                    const multihash = create2(code, digest$1);
                    return CID1.createV1(this.code, multihash);
                }
            case 1:
                {
                    return this;
                }
            default:
                {
                    throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
                }
        }
    }
    equals(other) {
        return other && this.code === other.code && this.version === other.version && equals5(this.multihash, other.multihash);
    }
    toString(base) {
        const { bytes, version: version2, _baseCache } = this;
        switch(version2){
            case 0:
                return toStringV01(bytes, _baseCache, base || base58btc1.encoder);
            default:
                return toStringV11(bytes, _baseCache, base || base321.encoder);
        }
    }
    toJSON() {
        return {
            code: this.code,
            version: this.version,
            hash: this.multihash.bytes
        };
    }
    get [Symbol.toStringTag]() {
        return "CID";
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return "CID(" + this.toString() + ")";
    }
    static isCID(value) {
        deprecate(/^0\.0/, IS_CID_DEPRECATION);
        return !!(value && (value[cidSymbol1] || value.asCID === value));
    }
    get toBaseEncodedString() {
        throw new Error("Deprecated, use .toString()");
    }
    get codec() {
        throw new Error('"codec" property is deprecated, use integer "code" property instead');
    }
    get buffer() {
        throw new Error("Deprecated .buffer property, use .bytes to get Uint8Array instead");
    }
    get multibaseName() {
        throw new Error('"multibaseName" property is deprecated');
    }
    get prefix() {
        throw new Error('"prefix" property is deprecated');
    }
    static asCID(value) {
        if (value instanceof CID1) {
            return value;
        } else if (value != null && value.asCID === value) {
            const { version: version2, code, multihash, bytes } = value;
            return new CID1(version2, code, multihash, bytes || encodeCID1(version2, code, multihash.bytes));
        } else if (value != null && value[cidSymbol1] === true) {
            const { version: version2, multihash, code } = value;
            const digest$1 = decode$22(multihash);
            return CID1.create(version2, code, digest$1);
        } else {
            return null;
        }
    }
    static create(version2, code, digest) {
        if (typeof code !== "number") {
            throw new Error("String codecs are no longer supported");
        }
        switch(version2){
            case 0:
                {
                    if (code !== DAG_PB_CODE1) {
                        throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE1}) block encoding`);
                    } else {
                        return new CID1(version2, code, digest, digest.bytes);
                    }
                }
            case 1:
                {
                    const bytes = encodeCID1(version2, code, digest.bytes);
                    return new CID1(version2, code, digest, bytes);
                }
            default:
                {
                    throw new Error("Invalid version");
                }
        }
    }
    static createV0(digest) {
        return CID1.create(0, DAG_PB_CODE1, digest);
    }
    static createV1(code, digest) {
        return CID1.create(1, code, digest);
    }
    static decode(bytes) {
        const [cid, remainder] = CID1.decodeFirst(bytes);
        if (remainder.length) {
            throw new Error("Incorrect length");
        }
        return cid;
    }
    static decodeFirst(bytes) {
        const specs = CID1.inspectBytes(bytes);
        const prefixSize = specs.size - specs.multihashSize;
        const multihashBytes = coerce2(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
        if (multihashBytes.byteLength !== specs.multihashSize) {
            throw new Error("Incorrect length");
        }
        const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
        const digest$1 = new Digest2(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
        const cid = specs.version === 0 ? CID1.createV0(digest$1) : CID1.createV1(specs.codec, digest$1);
        return [
            cid,
            bytes.subarray(specs.size)
        ];
    }
    static inspectBytes(initialBytes) {
        let offset = 0;
        const next = ()=>{
            const [i, length] = decode$12(initialBytes.subarray(offset));
            offset += length;
            return i;
        };
        let version2 = next();
        let codec = DAG_PB_CODE1;
        if (version2 === 18) {
            version2 = 0;
            offset = 0;
        } else if (version2 === 1) {
            codec = next();
        }
        if (version2 !== 0 && version2 !== 1) {
            throw new RangeError(`Invalid CID version ${version2}`);
        }
        const prefixSize = offset;
        const multihashCode = next();
        const digestSize = next();
        const size = offset + digestSize;
        const multihashSize = size - prefixSize;
        return {
            version: version2,
            codec,
            multihashCode,
            digestSize,
            multihashSize,
            size
        };
    }
    static parse(source, base) {
        const [prefix, bytes] = parseCIDtoBytes1(source, base);
        const cid = CID1.decode(bytes);
        cid._baseCache.set(prefix, source);
        return cid;
    }
}
const parseCIDtoBytes1 = (source, base)=>{
    switch(source[0]){
        case "Q":
            {
                const decoder = base || base58btc1;
                return [
                    base58btc1.prefix,
                    decoder.decode(`${base58btc1.prefix}${source}`)
                ];
            }
        case base58btc1.prefix:
            {
                const decoder = base || base58btc1;
                return [
                    base58btc1.prefix,
                    decoder.decode(source)
                ];
            }
        case base321.prefix:
            {
                const decoder = base || base321;
                return [
                    base321.prefix,
                    decoder.decode(source)
                ];
            }
        default:
            {
                if (base == null) {
                    throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
                }
                return [
                    source[0],
                    base.decode(source)
                ];
            }
    }
};
const toStringV01 = (bytes, cache, base)=>{
    const { prefix } = base;
    if (prefix !== base58btc1.prefix) {
        throw Error(`Cannot string encode V0 in ${base.name} encoding`);
    }
    const cid = cache.get(prefix);
    if (cid == null) {
        const cid2 = base.encode(bytes).slice(1);
        cache.set(prefix, cid2);
        return cid2;
    } else {
        return cid;
    }
};
const toStringV11 = (bytes, cache, base)=>{
    const { prefix } = base;
    const cid = cache.get(prefix);
    if (cid == null) {
        const cid2 = base.encode(bytes);
        cache.set(prefix, cid2);
        return cid2;
    } else {
        return cid;
    }
};
const DAG_PB_CODE1 = 112;
const SHA_256_CODE1 = 18;
const encodeCID1 = (version2, code, multihash)=>{
    const codeOffset = encodingLength2(version2);
    const hashOffset = codeOffset + encodingLength2(code);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo2(version2, bytes, 0);
    encodeTo2(code, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
};
const cidSymbol1 = Symbol.for("@ipld/js-cid/CID");
const readonly = {
    writable: false,
    configurable: false,
    enumerable: true
};
const hidden = {
    writable: false,
    enumerable: false,
    configurable: false
};
const version = "0.0.0-dev";
const deprecate = (range, message)=>{
    if (range.test(version)) {
        console.warn(message);
    } else {
        throw new Error(message);
    }
};
const IS_CID_DEPRECATION = `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`;
function createCommonjsModule(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var murmurHash3js = createCommonjsModule(function(module, exports) {
    (function(root, undefined$1) {
        var library = {
            version: "3.0.0",
            x86: {},
            x64: {},
            inputValidation: true
        };
        function _validBytes(bytes) {
            if (!Array.isArray(bytes) && !ArrayBuffer.isView(bytes)) {
                return false;
            }
            for(var i = 0; i < bytes.length; i++){
                if (!Number.isInteger(bytes[i]) || bytes[i] < 0 || bytes[i] > 255) {
                    return false;
                }
            }
            return true;
        }
        function _x86Multiply(m, n) {
            return (m & 65535) * n + (((m >>> 16) * n & 65535) << 16);
        }
        function _x86Rotl(m, n) {
            return m << n | m >>> 32 - n;
        }
        function _x86Fmix(h) {
            h ^= h >>> 16;
            h = _x86Multiply(h, 2246822507);
            h ^= h >>> 13;
            h = _x86Multiply(h, 3266489909);
            h ^= h >>> 16;
            return h;
        }
        function _x64Add(m, n) {
            m = [
                m[0] >>> 16,
                m[0] & 65535,
                m[1] >>> 16,
                m[1] & 65535
            ];
            n = [
                n[0] >>> 16,
                n[0] & 65535,
                n[1] >>> 16,
                n[1] & 65535
            ];
            var o = [
                0,
                0,
                0,
                0
            ];
            o[3] += m[3] + n[3];
            o[2] += o[3] >>> 16;
            o[3] &= 65535;
            o[2] += m[2] + n[2];
            o[1] += o[2] >>> 16;
            o[2] &= 65535;
            o[1] += m[1] + n[1];
            o[0] += o[1] >>> 16;
            o[1] &= 65535;
            o[0] += m[0] + n[0];
            o[0] &= 65535;
            return [
                o[0] << 16 | o[1],
                o[2] << 16 | o[3]
            ];
        }
        function _x64Multiply(m, n) {
            m = [
                m[0] >>> 16,
                m[0] & 65535,
                m[1] >>> 16,
                m[1] & 65535
            ];
            n = [
                n[0] >>> 16,
                n[0] & 65535,
                n[1] >>> 16,
                n[1] & 65535
            ];
            var o = [
                0,
                0,
                0,
                0
            ];
            o[3] += m[3] * n[3];
            o[2] += o[3] >>> 16;
            o[3] &= 65535;
            o[2] += m[2] * n[3];
            o[1] += o[2] >>> 16;
            o[2] &= 65535;
            o[2] += m[3] * n[2];
            o[1] += o[2] >>> 16;
            o[2] &= 65535;
            o[1] += m[1] * n[3];
            o[0] += o[1] >>> 16;
            o[1] &= 65535;
            o[1] += m[2] * n[2];
            o[0] += o[1] >>> 16;
            o[1] &= 65535;
            o[1] += m[3] * n[1];
            o[0] += o[1] >>> 16;
            o[1] &= 65535;
            o[0] += m[0] * n[3] + m[1] * n[2] + m[2] * n[1] + m[3] * n[0];
            o[0] &= 65535;
            return [
                o[0] << 16 | o[1],
                o[2] << 16 | o[3]
            ];
        }
        function _x64Rotl(m, n) {
            n %= 64;
            if (n === 32) {
                return [
                    m[1],
                    m[0]
                ];
            } else if (n < 32) {
                return [
                    m[0] << n | m[1] >>> 32 - n,
                    m[1] << n | m[0] >>> 32 - n
                ];
            } else {
                n -= 32;
                return [
                    m[1] << n | m[0] >>> 32 - n,
                    m[0] << n | m[1] >>> 32 - n
                ];
            }
        }
        function _x64LeftShift(m, n) {
            n %= 64;
            if (n === 0) {
                return m;
            } else if (n < 32) {
                return [
                    m[0] << n | m[1] >>> 32 - n,
                    m[1] << n
                ];
            } else {
                return [
                    m[1] << n - 32,
                    0
                ];
            }
        }
        function _x64Xor(m, n) {
            return [
                m[0] ^ n[0],
                m[1] ^ n[1]
            ];
        }
        function _x64Fmix(h) {
            h = _x64Xor(h, [
                0,
                h[0] >>> 1
            ]);
            h = _x64Multiply(h, [
                4283543511,
                3981806797
            ]);
            h = _x64Xor(h, [
                0,
                h[0] >>> 1
            ]);
            h = _x64Multiply(h, [
                3301882366,
                444984403
            ]);
            h = _x64Xor(h, [
                0,
                h[0] >>> 1
            ]);
            return h;
        }
        library.x86.hash32 = function(bytes, seed) {
            if (library.inputValidation && !_validBytes(bytes)) {
                return undefined$1;
            }
            seed = seed || 0;
            var remainder = bytes.length % 4;
            var blocks = bytes.length - remainder;
            var h1 = seed;
            var k1 = 0;
            var c1 = 3432918353;
            var c2 = 461845907;
            for(var i = 0; i < blocks; i = i + 4){
                k1 = bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24;
                k1 = _x86Multiply(k1, c1);
                k1 = _x86Rotl(k1, 15);
                k1 = _x86Multiply(k1, c2);
                h1 ^= k1;
                h1 = _x86Rotl(h1, 13);
                h1 = _x86Multiply(h1, 5) + 3864292196;
            }
            k1 = 0;
            switch(remainder){
                case 3:
                    k1 ^= bytes[i + 2] << 16;
                case 2:
                    k1 ^= bytes[i + 1] << 8;
                case 1:
                    k1 ^= bytes[i];
                    k1 = _x86Multiply(k1, c1);
                    k1 = _x86Rotl(k1, 15);
                    k1 = _x86Multiply(k1, c2);
                    h1 ^= k1;
            }
            h1 ^= bytes.length;
            h1 = _x86Fmix(h1);
            return h1 >>> 0;
        };
        library.x86.hash128 = function(bytes, seed) {
            if (library.inputValidation && !_validBytes(bytes)) {
                return undefined$1;
            }
            seed = seed || 0;
            var remainder = bytes.length % 16;
            var blocks = bytes.length - remainder;
            var h1 = seed;
            var h2 = seed;
            var h3 = seed;
            var h4 = seed;
            var k1 = 0;
            var k2 = 0;
            var k3 = 0;
            var k4 = 0;
            var c1 = 597399067;
            var c2 = 2869860233;
            var c3 = 951274213;
            var c4 = 2716044179;
            for(var i = 0; i < blocks; i = i + 16){
                k1 = bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24;
                k2 = bytes[i + 4] | bytes[i + 5] << 8 | bytes[i + 6] << 16 | bytes[i + 7] << 24;
                k3 = bytes[i + 8] | bytes[i + 9] << 8 | bytes[i + 10] << 16 | bytes[i + 11] << 24;
                k4 = bytes[i + 12] | bytes[i + 13] << 8 | bytes[i + 14] << 16 | bytes[i + 15] << 24;
                k1 = _x86Multiply(k1, c1);
                k1 = _x86Rotl(k1, 15);
                k1 = _x86Multiply(k1, c2);
                h1 ^= k1;
                h1 = _x86Rotl(h1, 19);
                h1 += h2;
                h1 = _x86Multiply(h1, 5) + 1444728091;
                k2 = _x86Multiply(k2, c2);
                k2 = _x86Rotl(k2, 16);
                k2 = _x86Multiply(k2, c3);
                h2 ^= k2;
                h2 = _x86Rotl(h2, 17);
                h2 += h3;
                h2 = _x86Multiply(h2, 5) + 197830471;
                k3 = _x86Multiply(k3, c3);
                k3 = _x86Rotl(k3, 17);
                k3 = _x86Multiply(k3, c4);
                h3 ^= k3;
                h3 = _x86Rotl(h3, 15);
                h3 += h4;
                h3 = _x86Multiply(h3, 5) + 2530024501;
                k4 = _x86Multiply(k4, c4);
                k4 = _x86Rotl(k4, 18);
                k4 = _x86Multiply(k4, c1);
                h4 ^= k4;
                h4 = _x86Rotl(h4, 13);
                h4 += h1;
                h4 = _x86Multiply(h4, 5) + 850148119;
            }
            k1 = 0;
            k2 = 0;
            k3 = 0;
            k4 = 0;
            switch(remainder){
                case 15:
                    k4 ^= bytes[i + 14] << 16;
                case 14:
                    k4 ^= bytes[i + 13] << 8;
                case 13:
                    k4 ^= bytes[i + 12];
                    k4 = _x86Multiply(k4, c4);
                    k4 = _x86Rotl(k4, 18);
                    k4 = _x86Multiply(k4, c1);
                    h4 ^= k4;
                case 12:
                    k3 ^= bytes[i + 11] << 24;
                case 11:
                    k3 ^= bytes[i + 10] << 16;
                case 10:
                    k3 ^= bytes[i + 9] << 8;
                case 9:
                    k3 ^= bytes[i + 8];
                    k3 = _x86Multiply(k3, c3);
                    k3 = _x86Rotl(k3, 17);
                    k3 = _x86Multiply(k3, c4);
                    h3 ^= k3;
                case 8:
                    k2 ^= bytes[i + 7] << 24;
                case 7:
                    k2 ^= bytes[i + 6] << 16;
                case 6:
                    k2 ^= bytes[i + 5] << 8;
                case 5:
                    k2 ^= bytes[i + 4];
                    k2 = _x86Multiply(k2, c2);
                    k2 = _x86Rotl(k2, 16);
                    k2 = _x86Multiply(k2, c3);
                    h2 ^= k2;
                case 4:
                    k1 ^= bytes[i + 3] << 24;
                case 3:
                    k1 ^= bytes[i + 2] << 16;
                case 2:
                    k1 ^= bytes[i + 1] << 8;
                case 1:
                    k1 ^= bytes[i];
                    k1 = _x86Multiply(k1, c1);
                    k1 = _x86Rotl(k1, 15);
                    k1 = _x86Multiply(k1, c2);
                    h1 ^= k1;
            }
            h1 ^= bytes.length;
            h2 ^= bytes.length;
            h3 ^= bytes.length;
            h4 ^= bytes.length;
            h1 += h2;
            h1 += h3;
            h1 += h4;
            h2 += h1;
            h3 += h1;
            h4 += h1;
            h1 = _x86Fmix(h1);
            h2 = _x86Fmix(h2);
            h3 = _x86Fmix(h3);
            h4 = _x86Fmix(h4);
            h1 += h2;
            h1 += h3;
            h1 += h4;
            h2 += h1;
            h3 += h1;
            h4 += h1;
            return ("00000000" + (h1 >>> 0).toString(16)).slice(-8) + ("00000000" + (h2 >>> 0).toString(16)).slice(-8) + ("00000000" + (h3 >>> 0).toString(16)).slice(-8) + ("00000000" + (h4 >>> 0).toString(16)).slice(-8);
        };
        library.x64.hash128 = function(bytes, seed) {
            if (library.inputValidation && !_validBytes(bytes)) {
                return undefined$1;
            }
            seed = seed || 0;
            var remainder = bytes.length % 16;
            var blocks = bytes.length - remainder;
            var h1 = [
                0,
                seed
            ];
            var h2 = [
                0,
                seed
            ];
            var k1 = [
                0,
                0
            ];
            var k2 = [
                0,
                0
            ];
            var c1 = [
                2277735313,
                289559509
            ];
            var c2 = [
                1291169091,
                658871167
            ];
            for(var i = 0; i < blocks; i = i + 16){
                k1 = [
                    bytes[i + 4] | bytes[i + 5] << 8 | bytes[i + 6] << 16 | bytes[i + 7] << 24,
                    bytes[i] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | bytes[i + 3] << 24
                ];
                k2 = [
                    bytes[i + 12] | bytes[i + 13] << 8 | bytes[i + 14] << 16 | bytes[i + 15] << 24,
                    bytes[i + 8] | bytes[i + 9] << 8 | bytes[i + 10] << 16 | bytes[i + 11] << 24
                ];
                k1 = _x64Multiply(k1, c1);
                k1 = _x64Rotl(k1, 31);
                k1 = _x64Multiply(k1, c2);
                h1 = _x64Xor(h1, k1);
                h1 = _x64Rotl(h1, 27);
                h1 = _x64Add(h1, h2);
                h1 = _x64Add(_x64Multiply(h1, [
                    0,
                    5
                ]), [
                    0,
                    1390208809
                ]);
                k2 = _x64Multiply(k2, c2);
                k2 = _x64Rotl(k2, 33);
                k2 = _x64Multiply(k2, c1);
                h2 = _x64Xor(h2, k2);
                h2 = _x64Rotl(h2, 31);
                h2 = _x64Add(h2, h1);
                h2 = _x64Add(_x64Multiply(h2, [
                    0,
                    5
                ]), [
                    0,
                    944331445
                ]);
            }
            k1 = [
                0,
                0
            ];
            k2 = [
                0,
                0
            ];
            switch(remainder){
                case 15:
                    k2 = _x64Xor(k2, _x64LeftShift([
                        0,
                        bytes[i + 14]
                    ], 48));
                case 14:
                    k2 = _x64Xor(k2, _x64LeftShift([
                        0,
                        bytes[i + 13]
                    ], 40));
                case 13:
                    k2 = _x64Xor(k2, _x64LeftShift([
                        0,
                        bytes[i + 12]
                    ], 32));
                case 12:
                    k2 = _x64Xor(k2, _x64LeftShift([
                        0,
                        bytes[i + 11]
                    ], 24));
                case 11:
                    k2 = _x64Xor(k2, _x64LeftShift([
                        0,
                        bytes[i + 10]
                    ], 16));
                case 10:
                    k2 = _x64Xor(k2, _x64LeftShift([
                        0,
                        bytes[i + 9]
                    ], 8));
                case 9:
                    k2 = _x64Xor(k2, [
                        0,
                        bytes[i + 8]
                    ]);
                    k2 = _x64Multiply(k2, c2);
                    k2 = _x64Rotl(k2, 33);
                    k2 = _x64Multiply(k2, c1);
                    h2 = _x64Xor(h2, k2);
                case 8:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 7]
                    ], 56));
                case 7:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 6]
                    ], 48));
                case 6:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 5]
                    ], 40));
                case 5:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 4]
                    ], 32));
                case 4:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 3]
                    ], 24));
                case 3:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 2]
                    ], 16));
                case 2:
                    k1 = _x64Xor(k1, _x64LeftShift([
                        0,
                        bytes[i + 1]
                    ], 8));
                case 1:
                    k1 = _x64Xor(k1, [
                        0,
                        bytes[i]
                    ]);
                    k1 = _x64Multiply(k1, c1);
                    k1 = _x64Rotl(k1, 31);
                    k1 = _x64Multiply(k1, c2);
                    h1 = _x64Xor(h1, k1);
            }
            h1 = _x64Xor(h1, [
                0,
                bytes.length
            ]);
            h2 = _x64Xor(h2, [
                0,
                bytes.length
            ]);
            h1 = _x64Add(h1, h2);
            h2 = _x64Add(h2, h1);
            h1 = _x64Fmix(h1);
            h2 = _x64Fmix(h2);
            h1 = _x64Add(h1, h2);
            h2 = _x64Add(h2, h1);
            return ("00000000" + (h1[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h1[1] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[0] >>> 0).toString(16)).slice(-8) + ("00000000" + (h2[1] >>> 0).toString(16)).slice(-8);
        };
        {
            if (module.exports) {
                exports = module.exports = library;
            }
            exports.murmurHash3 = library;
        }
    })();
});
var murmurhash3jsRevisited = murmurHash3js;
murmurhash3jsRevisited.murmurHash3;
function fromNumberTo32BitBuf(number) {
    const bytes2 = new Array(4);
    for(let i = 0; i < 4; i++){
        bytes2[i] = number & 255;
        number = number >> 8;
    }
    return new Uint8Array(bytes2);
}
const murmur332 = from2({
    name: "murmur3-32",
    code: 35,
    encode: (input)=>fromNumberTo32BitBuf(murmurhash3jsRevisited.x86.hash32(input))
});
const murmur3128 = from2({
    name: "murmur3-128",
    code: 34,
    encode: (input)=>bytes1.fromHex(murmurhash3jsRevisited.x64.hash128(input))
});
const ERROR_MSG_INPUT = "Input must be an string, Buffer or Uint8Array";
function normalizeInput(input) {
    let ret;
    if (input instanceof Uint8Array) {
        ret = input;
    } else if (typeof input === "string") {
        const encoder = new TextEncoder();
        ret = encoder.encode(input);
    } else {
        throw new Error(ERROR_MSG_INPUT);
    }
    return ret;
}
function toHex3(bytes) {
    return Array.prototype.map.call(bytes, function(n) {
        return (n < 16 ? "0" : "") + n.toString(16);
    }).join("");
}
function uint32ToHex(val) {
    return (4294967296 + val).toString(16).substring(1);
}
function debugPrint(label, arr, size) {
    let msg = "\n" + label + " = ";
    for(let i = 0; i < arr.length; i += 2){
        if (size === 32) {
            msg += uint32ToHex(arr[i]).toUpperCase();
            msg += " ";
            msg += uint32ToHex(arr[i + 1]).toUpperCase();
        } else if (size === 64) {
            msg += uint32ToHex(arr[i + 1]).toUpperCase();
            msg += uint32ToHex(arr[i]).toUpperCase();
        } else throw new Error("Invalid size " + size);
        if (i % 6 === 4) {
            msg += "\n" + new Array(label.length + 4).join(" ");
        } else if (i < arr.length - 2) {
            msg += " ";
        }
    }
    console.log(msg);
}
function testSpeed(hashFn, N, M) {
    let startMs = new Date().getTime();
    const input = new Uint8Array(N);
    for(let i = 0; i < N; i++){
        input[i] = i % 256;
    }
    const genMs = new Date().getTime();
    console.log("Generated random input in " + (genMs - startMs) + "ms");
    startMs = genMs;
    for(let i = 0; i < M; i++){
        const hashHex = hashFn(input);
        const hashMs = new Date().getTime();
        const ms = hashMs - startMs;
        startMs = hashMs;
        console.log("Hashed in " + ms + "ms: " + hashHex.substring(0, 20) + "...");
        console.log(Math.round(N / (1 << 20) / (ms / 1e3) * 100) / 100 + " MB PER SECOND");
    }
}
var util = {
    normalizeInput,
    toHex: toHex3,
    debugPrint,
    testSpeed
};
function ADD64AA(v2, a, b) {
    const o0 = v2[a] + v2[b];
    let o1 = v2[a + 1] + v2[b + 1];
    if (o0 >= 4294967296) {
        o1++;
    }
    v2[a] = o0;
    v2[a + 1] = o1;
}
function ADD64AC(v2, a, b0, b1) {
    let o0 = v2[a] + b0;
    if (b0 < 0) {
        o0 += 4294967296;
    }
    let o1 = v2[a + 1] + b1;
    if (o0 >= 4294967296) {
        o1++;
    }
    v2[a] = o0;
    v2[a + 1] = o1;
}
function B2B_GET32(arr, i) {
    return arr[i] ^ arr[i + 1] << 8 ^ arr[i + 2] << 16 ^ arr[i + 3] << 24;
}
function B2B_G(a, b, c, d, ix, iy) {
    const x0 = m[ix];
    const x1 = m[ix + 1];
    const y0 = m[iy];
    const y1 = m[iy + 1];
    ADD64AA(v, a, b);
    ADD64AC(v, a, x0, x1);
    let xor0 = v[d] ^ v[a];
    let xor1 = v[d + 1] ^ v[a + 1];
    v[d] = xor1;
    v[d + 1] = xor0;
    ADD64AA(v, c, d);
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = xor0 >>> 24 ^ xor1 << 8;
    v[b + 1] = xor1 >>> 24 ^ xor0 << 8;
    ADD64AA(v, a, b);
    ADD64AC(v, a, y0, y1);
    xor0 = v[d] ^ v[a];
    xor1 = v[d + 1] ^ v[a + 1];
    v[d] = xor0 >>> 16 ^ xor1 << 16;
    v[d + 1] = xor1 >>> 16 ^ xor0 << 16;
    ADD64AA(v, c, d);
    xor0 = v[b] ^ v[c];
    xor1 = v[b + 1] ^ v[c + 1];
    v[b] = xor1 >>> 31 ^ xor0 << 1;
    v[b + 1] = xor0 >>> 31 ^ xor1 << 1;
}
const BLAKE2B_IV32 = new Uint32Array([
    4089235720,
    1779033703,
    2227873595,
    3144134277,
    4271175723,
    1013904242,
    1595750129,
    2773480762,
    2917565137,
    1359893119,
    725511199,
    2600822924,
    4215389547,
    528734635,
    327033209,
    1541459225
]);
const SIGMA8 = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3,
    11,
    8,
    12,
    0,
    5,
    2,
    15,
    13,
    10,
    14,
    3,
    6,
    7,
    1,
    9,
    4,
    7,
    9,
    3,
    1,
    13,
    12,
    11,
    14,
    2,
    6,
    5,
    10,
    4,
    0,
    15,
    8,
    9,
    0,
    5,
    7,
    2,
    4,
    10,
    15,
    14,
    1,
    11,
    12,
    6,
    8,
    3,
    13,
    2,
    12,
    6,
    10,
    0,
    11,
    8,
    3,
    4,
    13,
    7,
    5,
    15,
    14,
    1,
    9,
    12,
    5,
    1,
    15,
    14,
    13,
    4,
    10,
    0,
    7,
    6,
    3,
    9,
    2,
    8,
    11,
    13,
    11,
    7,
    14,
    12,
    1,
    3,
    9,
    5,
    0,
    15,
    4,
    8,
    6,
    2,
    10,
    6,
    15,
    14,
    9,
    11,
    3,
    0,
    8,
    12,
    2,
    13,
    7,
    1,
    4,
    10,
    5,
    10,
    2,
    8,
    4,
    7,
    6,
    1,
    5,
    15,
    11,
    9,
    14,
    3,
    12,
    13,
    0,
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3
];
const SIGMA82 = new Uint8Array(SIGMA8.map(function(x) {
    return x * 2;
}));
const v = new Uint32Array(32);
const m = new Uint32Array(32);
function blake2bCompress(ctx, last) {
    let i = 0;
    for(i = 0; i < 16; i++){
        v[i] = ctx.h[i];
        v[i + 16] = BLAKE2B_IV32[i];
    }
    v[24] = v[24] ^ ctx.t;
    v[25] = v[25] ^ ctx.t / 4294967296;
    if (last) {
        v[28] = ~v[28];
        v[29] = ~v[29];
    }
    for(i = 0; i < 32; i++){
        m[i] = B2B_GET32(ctx.b, 4 * i);
    }
    for(i = 0; i < 12; i++){
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
    }
    for(i = 0; i < 16; i++){
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
    }
}
const parameterBlock = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
]);
function blake2bInit(outlen, key, salt, personal) {
    if (outlen === 0 || outlen > 64) {
        throw new Error("Illegal output length, expected 0 < length <= 64");
    }
    if (key && key.length > 64) {
        throw new Error("Illegal key, expected Uint8Array with 0 < length <= 64");
    }
    if (salt && salt.length !== 16) {
        throw new Error("Illegal salt, expected Uint8Array with length is 16");
    }
    if (personal && personal.length !== 16) {
        throw new Error("Illegal personal, expected Uint8Array with length is 16");
    }
    const ctx = {
        b: new Uint8Array(128),
        h: new Uint32Array(16),
        t: 0,
        c: 0,
        outlen
    };
    parameterBlock.fill(0);
    parameterBlock[0] = outlen;
    if (key) parameterBlock[1] = key.length;
    parameterBlock[2] = 1;
    parameterBlock[3] = 1;
    if (salt) parameterBlock.set(salt, 32);
    if (personal) parameterBlock.set(personal, 48);
    for(let i = 0; i < 16; i++){
        ctx.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameterBlock, i * 4);
    }
    if (key) {
        blake2bUpdate(ctx, key);
        ctx.c = 128;
    }
    return ctx;
}
function blake2bUpdate(ctx, input) {
    for(let i = 0; i < input.length; i++){
        if (ctx.c === 128) {
            ctx.t += ctx.c;
            blake2bCompress(ctx, false);
            ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
    }
}
function blake2bFinal(ctx) {
    ctx.t += ctx.c;
    while(ctx.c < 128){
        ctx.b[ctx.c++] = 0;
    }
    blake2bCompress(ctx, true);
    const out = new Uint8Array(ctx.outlen);
    for(let i = 0; i < ctx.outlen; i++){
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3);
    }
    return out;
}
function blake2b(input, key, outlen, salt, personal) {
    outlen = outlen || 64;
    input = util.normalizeInput(input);
    if (salt) {
        salt = util.normalizeInput(salt);
    }
    if (personal) {
        personal = util.normalizeInput(personal);
    }
    const ctx = blake2bInit(outlen, key, salt, personal);
    blake2bUpdate(ctx, input);
    return blake2bFinal(ctx);
}
function blake2bHex(input, key, outlen, salt, personal) {
    const output = blake2b(input, key, outlen, salt, personal);
    return util.toHex(output);
}
var blake2b_1 = {
    blake2b,
    blake2bHex,
    blake2bInit,
    blake2bUpdate,
    blake2bFinal
};
function B2S_GET32(v2, i) {
    return v2[i] ^ v2[i + 1] << 8 ^ v2[i + 2] << 16 ^ v2[i + 3] << 24;
}
function B2S_G(a, b, c, d, x, y) {
    v$1[a] = v$1[a] + v$1[b] + x;
    v$1[d] = ROTR32(v$1[d] ^ v$1[a], 16);
    v$1[c] = v$1[c] + v$1[d];
    v$1[b] = ROTR32(v$1[b] ^ v$1[c], 12);
    v$1[a] = v$1[a] + v$1[b] + y;
    v$1[d] = ROTR32(v$1[d] ^ v$1[a], 8);
    v$1[c] = v$1[c] + v$1[d];
    v$1[b] = ROTR32(v$1[b] ^ v$1[c], 7);
}
function ROTR32(x, y) {
    return x >>> y ^ x << 32 - y;
}
const BLAKE2S_IV = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
]);
const SIGMA = new Uint8Array([
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    14,
    10,
    4,
    8,
    9,
    15,
    13,
    6,
    1,
    12,
    0,
    2,
    11,
    7,
    5,
    3,
    11,
    8,
    12,
    0,
    5,
    2,
    15,
    13,
    10,
    14,
    3,
    6,
    7,
    1,
    9,
    4,
    7,
    9,
    3,
    1,
    13,
    12,
    11,
    14,
    2,
    6,
    5,
    10,
    4,
    0,
    15,
    8,
    9,
    0,
    5,
    7,
    2,
    4,
    10,
    15,
    14,
    1,
    11,
    12,
    6,
    8,
    3,
    13,
    2,
    12,
    6,
    10,
    0,
    11,
    8,
    3,
    4,
    13,
    7,
    5,
    15,
    14,
    1,
    9,
    12,
    5,
    1,
    15,
    14,
    13,
    4,
    10,
    0,
    7,
    6,
    3,
    9,
    2,
    8,
    11,
    13,
    11,
    7,
    14,
    12,
    1,
    3,
    9,
    5,
    0,
    15,
    4,
    8,
    6,
    2,
    10,
    6,
    15,
    14,
    9,
    11,
    3,
    0,
    8,
    12,
    2,
    13,
    7,
    1,
    4,
    10,
    5,
    10,
    2,
    8,
    4,
    7,
    6,
    1,
    5,
    15,
    11,
    9,
    14,
    3,
    12,
    13,
    0
]);
const v$1 = new Uint32Array(16);
const m$1 = new Uint32Array(16);
function blake2sCompress(ctx, last) {
    let i = 0;
    for(i = 0; i < 8; i++){
        v$1[i] = ctx.h[i];
        v$1[i + 8] = BLAKE2S_IV[i];
    }
    v$1[12] ^= ctx.t;
    v$1[13] ^= ctx.t / 4294967296;
    if (last) {
        v$1[14] = ~v$1[14];
    }
    for(i = 0; i < 16; i++){
        m$1[i] = B2S_GET32(ctx.b, 4 * i);
    }
    for(i = 0; i < 10; i++){
        B2S_G(0, 4, 8, 12, m$1[SIGMA[i * 16 + 0]], m$1[SIGMA[i * 16 + 1]]);
        B2S_G(1, 5, 9, 13, m$1[SIGMA[i * 16 + 2]], m$1[SIGMA[i * 16 + 3]]);
        B2S_G(2, 6, 10, 14, m$1[SIGMA[i * 16 + 4]], m$1[SIGMA[i * 16 + 5]]);
        B2S_G(3, 7, 11, 15, m$1[SIGMA[i * 16 + 6]], m$1[SIGMA[i * 16 + 7]]);
        B2S_G(0, 5, 10, 15, m$1[SIGMA[i * 16 + 8]], m$1[SIGMA[i * 16 + 9]]);
        B2S_G(1, 6, 11, 12, m$1[SIGMA[i * 16 + 10]], m$1[SIGMA[i * 16 + 11]]);
        B2S_G(2, 7, 8, 13, m$1[SIGMA[i * 16 + 12]], m$1[SIGMA[i * 16 + 13]]);
        B2S_G(3, 4, 9, 14, m$1[SIGMA[i * 16 + 14]], m$1[SIGMA[i * 16 + 15]]);
    }
    for(i = 0; i < 8; i++){
        ctx.h[i] ^= v$1[i] ^ v$1[i + 8];
    }
}
function blake2sInit(outlen, key) {
    if (!(outlen > 0 && outlen <= 32)) {
        throw new Error("Incorrect output length, should be in [1, 32]");
    }
    const keylen = key ? key.length : 0;
    if (key && !(keylen > 0 && keylen <= 32)) {
        throw new Error("Incorrect key length, should be in [1, 32]");
    }
    const ctx = {
        h: new Uint32Array(BLAKE2S_IV),
        b: new Uint8Array(64),
        c: 0,
        t: 0,
        outlen
    };
    ctx.h[0] ^= 16842752 ^ keylen << 8 ^ outlen;
    if (keylen > 0) {
        blake2sUpdate(ctx, key);
        ctx.c = 64;
    }
    return ctx;
}
function blake2sUpdate(ctx, input) {
    for(let i = 0; i < input.length; i++){
        if (ctx.c === 64) {
            ctx.t += ctx.c;
            blake2sCompress(ctx, false);
            ctx.c = 0;
        }
        ctx.b[ctx.c++] = input[i];
    }
}
function blake2sFinal(ctx) {
    ctx.t += ctx.c;
    while(ctx.c < 64){
        ctx.b[ctx.c++] = 0;
    }
    blake2sCompress(ctx, true);
    const out = new Uint8Array(ctx.outlen);
    for(let i = 0; i < ctx.outlen; i++){
        out[i] = ctx.h[i >> 2] >> 8 * (i & 3) & 255;
    }
    return out;
}
function blake2s(input, key, outlen) {
    outlen = outlen || 32;
    input = util.normalizeInput(input);
    const ctx = blake2sInit(outlen, key);
    blake2sUpdate(ctx, input);
    return blake2sFinal(ctx);
}
function blake2sHex(input, key, outlen) {
    const output = blake2s(input, key, outlen);
    return util.toHex(output);
}
var blake2s_1 = {
    blake2s,
    blake2sHex,
    blake2sInit,
    blake2sUpdate,
    blake2sFinal
};
var blakejs = {
    blake2b: blake2b_1.blake2b,
    blake2bHex: blake2b_1.blake2bHex,
    blake2bInit: blake2b_1.blake2bInit,
    blake2bUpdate: blake2b_1.blake2bUpdate,
    blake2bFinal: blake2b_1.blake2bFinal,
    blake2s: blake2s_1.blake2s,
    blake2sHex: blake2s_1.blake2sHex,
    blake2sInit: blake2s_1.blake2sInit,
    blake2sUpdate: blake2s_1.blake2sUpdate,
    blake2sFinal: blake2s_1.blake2sFinal
};
blakejs.blake2b;
function base2(ALPHABET, name) {
    if (ALPHABET.length >= 255) {
        throw new TypeError("Alphabet too long");
    }
    var BASE_MAP = new Uint8Array(256);
    for(var j = 0; j < BASE_MAP.length; j++){
        BASE_MAP[j] = 255;
    }
    for(var i = 0; i < ALPHABET.length; i++){
        var x = ALPHABET.charAt(i);
        var xc = x.charCodeAt(0);
        if (BASE_MAP[xc] !== 255) {
            throw new TypeError(x + " is ambiguous");
        }
        BASE_MAP[xc] = i;
    }
    var BASE = ALPHABET.length;
    var LEADER = ALPHABET.charAt(0);
    var FACTOR = Math.log(BASE) / Math.log(256);
    var iFACTOR = Math.log(256) / Math.log(BASE);
    function encode2(source) {
        if (source instanceof Uint8Array) ;
        else if (ArrayBuffer.isView(source)) {
            source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
        } else if (Array.isArray(source)) {
            source = Uint8Array.from(source);
        }
        if (!(source instanceof Uint8Array)) {
            throw new TypeError("Expected Uint8Array");
        }
        if (source.length === 0) {
            return "";
        }
        var zeroes = 0;
        var length = 0;
        var pbegin = 0;
        var pend = source.length;
        while(pbegin !== pend && source[pbegin] === 0){
            pbegin++;
            zeroes++;
        }
        var size = (pend - pbegin) * iFACTOR + 1 >>> 0;
        var b58 = new Uint8Array(size);
        while(pbegin !== pend){
            var carry = source[pbegin];
            var i2 = 0;
            for(var it1 = size - 1; (carry !== 0 || i2 < length) && it1 !== -1; it1--, i2++){
                carry += 256 * b58[it1] >>> 0;
                b58[it1] = carry % BASE >>> 0;
                carry = carry / BASE >>> 0;
            }
            if (carry !== 0) {
                throw new Error("Non-zero carry");
            }
            length = i2;
            pbegin++;
        }
        var it2 = size - length;
        while(it2 !== size && b58[it2] === 0){
            it2++;
        }
        var str = LEADER.repeat(zeroes);
        for(; it2 < size; ++it2){
            str += ALPHABET.charAt(b58[it2]);
        }
        return str;
    }
    function decodeUnsafe(source) {
        if (typeof source !== "string") {
            throw new TypeError("Expected String");
        }
        if (source.length === 0) {
            return new Uint8Array();
        }
        var psz = 0;
        if (source[psz] === " ") {
            return;
        }
        var zeroes = 0;
        var length = 0;
        while(source[psz] === LEADER){
            zeroes++;
            psz++;
        }
        var size = (source.length - psz) * FACTOR + 1 >>> 0;
        var b256 = new Uint8Array(size);
        while(source[psz]){
            var carry = BASE_MAP[source.charCodeAt(psz)];
            if (carry === 255) {
                return;
            }
            var i2 = 0;
            for(var it3 = size - 1; (carry !== 0 || i2 < length) && it3 !== -1; it3--, i2++){
                carry += BASE * b256[it3] >>> 0;
                b256[it3] = carry % 256 >>> 0;
                carry = carry / 256 >>> 0;
            }
            if (carry !== 0) {
                throw new Error("Non-zero carry");
            }
            length = i2;
            psz++;
        }
        if (source[psz] === " ") {
            return;
        }
        var it4 = size - length;
        while(it4 !== size && b256[it4] === 0){
            it4++;
        }
        var vch = new Uint8Array(zeroes + (size - it4));
        var j2 = zeroes;
        while(it4 !== size){
            vch[j2++] = b256[it4++];
        }
        return vch;
    }
    function decode2(string) {
        var buffer = decodeUnsafe(string);
        if (buffer) {
            return buffer;
        }
        throw new Error(`Non-${name} character`);
    }
    return {
        encode: encode2,
        decodeUnsafe,
        decode: decode2
    };
}
var src2 = base2;
var _brrp__multiformats_scope_baseX2 = src2;
class Encoder2 {
    constructor(name, prefix, baseEncode){
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
    }
    encode(bytes) {
        if (bytes instanceof Uint8Array) {
            return `${this.prefix}${this.baseEncode(bytes)}`;
        } else {
            throw Error("Unknown type, must be binary type");
        }
    }
}
class Decoder2 {
    constructor(name, prefix, baseDecode){
        this.name = name;
        this.prefix = prefix;
        if (prefix.codePointAt(0) === void 0) {
            throw new Error("Invalid prefix character");
        }
        this.prefixCodePoint = prefix.codePointAt(0);
        this.baseDecode = baseDecode;
    }
    decode(text) {
        if (typeof text === "string") {
            if (text.codePointAt(0) !== this.prefixCodePoint) {
                throw Error(`Unable to decode multibase string ${JSON.stringify(text)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            }
            return this.baseDecode(text.slice(this.prefix.length));
        } else {
            throw Error("Can only multibase decode strings");
        }
    }
    or(decoder) {
        return or2(this, decoder);
    }
}
class ComposedDecoder2 {
    constructor(decoders){
        this.decoders = decoders;
    }
    or(decoder) {
        return or2(this, decoder);
    }
    decode(input) {
        const prefix = input[0];
        const decoder = this.decoders[prefix];
        if (decoder) {
            return decoder.decode(input);
        } else {
            throw RangeError(`Unable to decode multibase string ${JSON.stringify(input)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
        }
    }
}
const or2 = (left, right)=>new ComposedDecoder2({
        ...left.decoders || {
            [left.prefix]: left
        },
        ...right.decoders || {
            [right.prefix]: right
        }
    });
class Codec2 {
    constructor(name, prefix, baseEncode, baseDecode){
        this.name = name;
        this.prefix = prefix;
        this.baseEncode = baseEncode;
        this.baseDecode = baseDecode;
        this.encoder = new Encoder2(name, prefix, baseEncode);
        this.decoder = new Decoder2(name, prefix, baseDecode);
    }
    encode(input) {
        return this.encoder.encode(input);
    }
    decode(input) {
        return this.decoder.decode(input);
    }
}
const from4 = ({ name, prefix, encode: encode2, decode: decode2 })=>new Codec2(name, prefix, encode2, decode2);
const baseX2 = ({ prefix, name, alphabet })=>{
    const { encode: encode2, decode: decode2 } = _brrp__multiformats_scope_baseX2(alphabet, name);
    return from4({
        prefix,
        name,
        encode: encode2,
        decode: (text)=>coerce1(decode2(text))
    });
};
const decode9 = (string, alphabet, bitsPerChar, name)=>{
    const codes = {};
    for(let i = 0; i < alphabet.length; ++i){
        codes[alphabet[i]] = i;
    }
    let end = string.length;
    while(string[end - 1] === "="){
        --end;
    }
    const out = new Uint8Array(end * bitsPerChar / 8 | 0);
    let bits = 0;
    let buffer = 0;
    let written = 0;
    for(let i = 0; i < end; ++i){
        const value = codes[string[i]];
        if (value === void 0) {
            throw new SyntaxError(`Non-${name} character`);
        }
        buffer = buffer << bitsPerChar | value;
        bits += bitsPerChar;
        if (bits >= 8) {
            bits -= 8;
            out[written++] = 255 & buffer >> bits;
        }
    }
    if (bits >= bitsPerChar || 255 & buffer << 8 - bits) {
        throw new SyntaxError("Unexpected end of data");
    }
    return out;
};
const encode8 = (data, alphabet, bitsPerChar)=>{
    const pad = alphabet[alphabet.length - 1] === "=";
    const mask = (1 << bitsPerChar) - 1;
    let out = "";
    let bits = 0;
    let buffer = 0;
    for(let i = 0; i < data.length; ++i){
        buffer = buffer << 8 | data[i];
        bits += 8;
        while(bits > bitsPerChar){
            bits -= bitsPerChar;
            out += alphabet[mask & buffer >> bits];
        }
    }
    if (bits) {
        out += alphabet[mask & buffer << bitsPerChar - bits];
    }
    if (pad) {
        while(out.length * bitsPerChar & 7){
            out += "=";
        }
    }
    return out;
};
const rfc46482 = ({ name, prefix, bitsPerChar, alphabet })=>{
    return from4({
        prefix,
        name,
        encode (input) {
            return encode8(input, alphabet, bitsPerChar);
        },
        decode (input) {
            return decode9(input, alphabet, bitsPerChar, name);
        }
    });
};
const base58btc2 = baseX2({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
const base58flickr2 = baseX2({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
var base58 = Object.freeze({
    __proto__: null,
    base58btc: base58btc2,
    base58flickr: base58flickr2
});
const base322 = rfc46482({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
});
const base32upper2 = rfc46482({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
});
const base32pad2 = rfc46482({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
});
const base32padupper2 = rfc46482({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
});
const base32hex2 = rfc46482({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
});
const base32hexupper2 = rfc46482({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
});
const base32hexpad2 = rfc46482({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
});
const base32hexpadupper2 = rfc46482({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
});
const base32z2 = rfc46482({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
var base32$1 = Object.freeze({
    __proto__: null,
    base32: base322,
    base32upper: base32upper2,
    base32pad: base32pad2,
    base32padupper: base32padupper2,
    base32hex: base32hex2,
    base32hexupper: base32hexupper2,
    base32hexpad: base32hexpad2,
    base32hexpadupper: base32hexpadupper2,
    base32z: base32z2
});
class CID2 {
    constructor(version2, code, multihash, bytes){
        this.code = code;
        this.version = version2;
        this.multihash = multihash;
        this.bytes = bytes;
        this.byteOffset = bytes.byteOffset;
        this.byteLength = bytes.byteLength;
        this.asCID = this;
        this._baseCache = new Map();
        Object.defineProperties(this, {
            byteOffset: hidden1,
            byteLength: hidden1,
            code: readonly1,
            version: readonly1,
            multihash: readonly1,
            bytes: readonly1,
            _baseCache: hidden1,
            asCID: hidden1
        });
    }
    toV0() {
        switch(this.version){
            case 0:
                {
                    return this;
                }
            default:
                {
                    const { code, multihash } = this;
                    if (code !== DAG_PB_CODE2) {
                        throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                    }
                    if (multihash.code !== SHA_256_CODE2) {
                        throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
                    }
                    return CID2.createV0(multihash);
                }
        }
    }
    toV1() {
        switch(this.version){
            case 0:
                {
                    const { code, digest: digest$1 } = this.multihash;
                    const multihash = create1(code, digest$1);
                    return CID2.createV1(this.code, multihash);
                }
            case 1:
                {
                    return this;
                }
            default:
                {
                    throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
                }
        }
    }
    equals(other) {
        return other && this.code === other.code && this.version === other.version && equals3(this.multihash, other.multihash);
    }
    toString(base) {
        const { bytes, version: version2, _baseCache } = this;
        switch(version2){
            case 0:
                return toStringV02(bytes, _baseCache, base || base58btc2.encoder);
            default:
                return toStringV12(bytes, _baseCache, base || base322.encoder);
        }
    }
    toJSON() {
        return {
            code: this.code,
            version: this.version,
            hash: this.multihash.bytes
        };
    }
    get [Symbol.toStringTag]() {
        return "CID";
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return "CID(" + this.toString() + ")";
    }
    static isCID(value) {
        deprecate1(/^0\.0/, IS_CID_DEPRECATION1);
        return !!(value && (value[cidSymbol2] || value.asCID === value));
    }
    get toBaseEncodedString() {
        throw new Error("Deprecated, use .toString()");
    }
    get codec() {
        throw new Error('"codec" property is deprecated, use integer "code" property instead');
    }
    get buffer() {
        throw new Error("Deprecated .buffer property, use .bytes to get Uint8Array instead");
    }
    get multibaseName() {
        throw new Error('"multibaseName" property is deprecated');
    }
    get prefix() {
        throw new Error('"prefix" property is deprecated');
    }
    static asCID(value) {
        if (value instanceof CID2) {
            return value;
        } else if (value != null && value.asCID === value) {
            const { version: version2, code, multihash, bytes } = value;
            return new CID2(version2, code, multihash, bytes || encodeCID2(version2, code, multihash.bytes));
        } else if (value != null && value[cidSymbol2] === true) {
            const { version: version2, multihash, code } = value;
            const digest$1 = decode$21(multihash);
            return CID2.create(version2, code, digest$1);
        } else {
            return null;
        }
    }
    static create(version2, code, digest) {
        if (typeof code !== "number") {
            throw new Error("String codecs are no longer supported");
        }
        switch(version2){
            case 0:
                {
                    if (code !== DAG_PB_CODE2) {
                        throw new Error(`Version 0 CID must use dag-pb (code: ${DAG_PB_CODE2}) block encoding`);
                    } else {
                        return new CID2(version2, code, digest, digest.bytes);
                    }
                }
            case 1:
                {
                    const bytes = encodeCID2(version2, code, digest.bytes);
                    return new CID2(version2, code, digest, bytes);
                }
            default:
                {
                    throw new Error("Invalid version");
                }
        }
    }
    static createV0(digest) {
        return CID2.create(0, DAG_PB_CODE2, digest);
    }
    static createV1(code, digest) {
        return CID2.create(1, code, digest);
    }
    static decode(bytes) {
        const [cid, remainder] = CID2.decodeFirst(bytes);
        if (remainder.length) {
            throw new Error("Incorrect length");
        }
        return cid;
    }
    static decodeFirst(bytes) {
        const specs = CID2.inspectBytes(bytes);
        const prefixSize = specs.size - specs.multihashSize;
        const multihashBytes = coerce1(bytes.subarray(prefixSize, prefixSize + specs.multihashSize));
        if (multihashBytes.byteLength !== specs.multihashSize) {
            throw new Error("Incorrect length");
        }
        const digestBytes = multihashBytes.subarray(specs.multihashSize - specs.digestSize);
        const digest$1 = new Digest1(specs.multihashCode, specs.digestSize, digestBytes, multihashBytes);
        const cid = specs.version === 0 ? CID2.createV0(digest$1) : CID2.createV1(specs.codec, digest$1);
        return [
            cid,
            bytes.subarray(specs.size)
        ];
    }
    static inspectBytes(initialBytes) {
        let offset = 0;
        const next = ()=>{
            const [i, length] = decode$11(initialBytes.subarray(offset));
            offset += length;
            return i;
        };
        let version2 = next();
        let codec = DAG_PB_CODE2;
        if (version2 === 18) {
            version2 = 0;
            offset = 0;
        } else if (version2 === 1) {
            codec = next();
        }
        if (version2 !== 0 && version2 !== 1) {
            throw new RangeError(`Invalid CID version ${version2}`);
        }
        const prefixSize = offset;
        const multihashCode = next();
        const digestSize = next();
        const size = offset + digestSize;
        const multihashSize = size - prefixSize;
        return {
            version: version2,
            codec,
            multihashCode,
            digestSize,
            multihashSize,
            size
        };
    }
    static parse(source, base) {
        const [prefix, bytes] = parseCIDtoBytes2(source, base);
        const cid = CID2.decode(bytes);
        cid._baseCache.set(prefix, source);
        return cid;
    }
}
const parseCIDtoBytes2 = (source, base)=>{
    switch(source[0]){
        case "Q":
            {
                const decoder = base || base58btc2;
                return [
                    base58btc2.prefix,
                    decoder.decode(`${base58btc2.prefix}${source}`)
                ];
            }
        case base58btc2.prefix:
            {
                const decoder = base || base58btc2;
                return [
                    base58btc2.prefix,
                    decoder.decode(source)
                ];
            }
        case base322.prefix:
            {
                const decoder = base || base322;
                return [
                    base322.prefix,
                    decoder.decode(source)
                ];
            }
        default:
            {
                if (base == null) {
                    throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
                }
                return [
                    source[0],
                    base.decode(source)
                ];
            }
    }
};
const toStringV02 = (bytes, cache, base)=>{
    const { prefix } = base;
    if (prefix !== base58btc2.prefix) {
        throw Error(`Cannot string encode V0 in ${base.name} encoding`);
    }
    const cid = cache.get(prefix);
    if (cid == null) {
        const cid2 = base.encode(bytes).slice(1);
        cache.set(prefix, cid2);
        return cid2;
    } else {
        return cid;
    }
};
const toStringV12 = (bytes, cache, base)=>{
    const { prefix } = base;
    const cid = cache.get(prefix);
    if (cid == null) {
        const cid2 = base.encode(bytes);
        cache.set(prefix, cid2);
        return cid2;
    } else {
        return cid;
    }
};
const DAG_PB_CODE2 = 112;
const SHA_256_CODE2 = 18;
const encodeCID2 = (version2, code, multihash)=>{
    const codeOffset = encodingLength1(version2);
    const hashOffset = codeOffset + encodingLength1(code);
    const bytes = new Uint8Array(hashOffset + multihash.byteLength);
    encodeTo1(version2, bytes, 0);
    encodeTo1(code, bytes, codeOffset);
    bytes.set(multihash, hashOffset);
    return bytes;
};
const cidSymbol2 = Symbol.for("@ipld/js-cid/CID");
const readonly1 = {
    writable: false,
    configurable: false,
    enumerable: true
};
const hidden1 = {
    writable: false,
    enumerable: false,
    configurable: false
};
const version1 = "0.0.0-dev";
const deprecate1 = (range, message)=>{
    if (range.test(version1)) {
        console.warn(message);
    } else {
        throw new Error(message);
    }
};
const IS_CID_DEPRECATION1 = `CID.isCID(v) is deprecated and will be removed in the next major release.
Following code pattern:

if (CID.isCID(value)) {
  doSomethingWithCID(value)
}

Is replaced with:

const cid = CID.asCID(value)
if (cid) {
  // Make sure to use cid instead of value
  doSomethingWithCID(cid)
}
`;
const { blake2b: blake2b1 } = blakejs;
const blake2b8 = from1({
    name: "blake2b-8",
    code: 45569,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 1))
});
const blake2b16 = from1({
    name: "blake2b-16",
    code: 45570,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 2))
});
const blake2b24 = from1({
    name: "blake2b-24",
    code: 45571,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 3))
});
const blake2b32 = from1({
    name: "blake2b-32",
    code: 45572,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 4))
});
const blake2b40 = from1({
    name: "blake2b-40",
    code: 45573,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 5))
});
const blake2b48 = from1({
    name: "blake2b-48",
    code: 45574,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 6))
});
const blake2b56 = from1({
    name: "blake2b-56",
    code: 45575,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 7))
});
const blake2b64 = from1({
    name: "blake2b-64",
    code: 45576,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 8))
});
const blake2b72 = from1({
    name: "blake2b-72",
    code: 45577,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 9))
});
const blake2b80 = from1({
    name: "blake2b-80",
    code: 45578,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 10))
});
const blake2b88 = from1({
    name: "blake2b-88",
    code: 45579,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 11))
});
const blake2b96 = from1({
    name: "blake2b-96",
    code: 45580,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 12))
});
const blake2b104 = from1({
    name: "blake2b-104",
    code: 45581,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 13))
});
const blake2b112 = from1({
    name: "blake2b-112",
    code: 45582,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 14))
});
const blake2b120 = from1({
    name: "blake2b-120",
    code: 45583,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 15))
});
const blake2b128 = from1({
    name: "blake2b-128",
    code: 45584,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 16))
});
const blake2b136 = from1({
    name: "blake2b-136",
    code: 45585,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 17))
});
const blake2b144 = from1({
    name: "blake2b-144",
    code: 45586,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 18))
});
const blake2b152 = from1({
    name: "blake2b-152",
    code: 45587,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 19))
});
const blake2b160 = from1({
    name: "blake2b-160",
    code: 45588,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 20))
});
const blake2b168 = from1({
    name: "blake2b-168",
    code: 45589,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 21))
});
const blake2b176 = from1({
    name: "blake2b-176",
    code: 45590,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 22))
});
const blake2b184 = from1({
    name: "blake2b-184",
    code: 45591,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 23))
});
const blake2b192 = from1({
    name: "blake2b-192",
    code: 45592,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 24))
});
const blake2b200 = from1({
    name: "blake2b-200",
    code: 45593,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 25))
});
const blake2b208 = from1({
    name: "blake2b-208",
    code: 45594,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 26))
});
const blake2b216 = from1({
    name: "blake2b-216",
    code: 45595,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 27))
});
const blake2b224 = from1({
    name: "blake2b-224",
    code: 45596,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 28))
});
const blake2b232 = from1({
    name: "blake2b-232",
    code: 45597,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 29))
});
const blake2b240 = from1({
    name: "blake2b-240",
    code: 45598,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 30))
});
const blake2b248 = from1({
    name: "blake2b-248",
    code: 45599,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 31))
});
const blake2b256 = from1({
    name: "blake2b-256",
    code: 45600,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 32))
});
const blake2b264 = from1({
    name: "blake2b-264",
    code: 45601,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 33))
});
const blake2b272 = from1({
    name: "blake2b-272",
    code: 45602,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 34))
});
const blake2b280 = from1({
    name: "blake2b-280",
    code: 45603,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 35))
});
const blake2b288 = from1({
    name: "blake2b-288",
    code: 45604,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 36))
});
const blake2b296 = from1({
    name: "blake2b-296",
    code: 45605,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 37))
});
const blake2b304 = from1({
    name: "blake2b-304",
    code: 45606,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 38))
});
const blake2b312 = from1({
    name: "blake2b-312",
    code: 45607,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 39))
});
const blake2b320 = from1({
    name: "blake2b-320",
    code: 45608,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 40))
});
const blake2b328 = from1({
    name: "blake2b-328",
    code: 45609,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 41))
});
const blake2b336 = from1({
    name: "blake2b-336",
    code: 45610,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 42))
});
const blake2b344 = from1({
    name: "blake2b-344",
    code: 45611,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 43))
});
const blake2b352 = from1({
    name: "blake2b-352",
    code: 45612,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 44))
});
const blake2b360 = from1({
    name: "blake2b-360",
    code: 45613,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 45))
});
const blake2b368 = from1({
    name: "blake2b-368",
    code: 45614,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 46))
});
const blake2b376 = from1({
    name: "blake2b-376",
    code: 45615,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 47))
});
const blake2b384 = from1({
    name: "blake2b-384",
    code: 45616,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 48))
});
const blake2b392 = from1({
    name: "blake2b-392",
    code: 45617,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 49))
});
const blake2b400 = from1({
    name: "blake2b-400",
    code: 45618,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 50))
});
const blake2b408 = from1({
    name: "blake2b-408",
    code: 45619,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 51))
});
const blake2b416 = from1({
    name: "blake2b-416",
    code: 45620,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 52))
});
const blake2b424 = from1({
    name: "blake2b-424",
    code: 45621,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 53))
});
const blake2b432 = from1({
    name: "blake2b-432",
    code: 45622,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 54))
});
const blake2b440 = from1({
    name: "blake2b-440",
    code: 45623,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 55))
});
const blake2b448 = from1({
    name: "blake2b-448",
    code: 45624,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 56))
});
const blake2b456 = from1({
    name: "blake2b-456",
    code: 45625,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 57))
});
const blake2b464 = from1({
    name: "blake2b-464",
    code: 45626,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 58))
});
const blake2b472 = from1({
    name: "blake2b-472",
    code: 45627,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 59))
});
const blake2b480 = from1({
    name: "blake2b-480",
    code: 45628,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 60))
});
const blake2b488 = from1({
    name: "blake2b-488",
    code: 45629,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 61))
});
const blake2b496 = from1({
    name: "blake2b-496",
    code: 45630,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 62))
});
const blake2b504 = from1({
    name: "blake2b-504",
    code: 45631,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 63))
});
const blake2b512 = from1({
    name: "blake2b-512",
    code: 45632,
    encode: (input)=>bytes.coerce(blake2b1(input, void 0, 64))
});
Object.freeze({
    __proto__: null,
    blake2b8,
    blake2b16,
    blake2b24,
    blake2b32,
    blake2b40,
    blake2b48,
    blake2b56,
    blake2b64,
    blake2b72,
    blake2b80,
    blake2b88,
    blake2b96,
    blake2b104,
    blake2b112,
    blake2b120,
    blake2b128,
    blake2b136,
    blake2b144,
    blake2b152,
    blake2b160,
    blake2b168,
    blake2b176,
    blake2b184,
    blake2b192,
    blake2b200,
    blake2b208,
    blake2b216,
    blake2b224,
    blake2b232,
    blake2b240,
    blake2b248,
    blake2b256,
    blake2b264,
    blake2b272,
    blake2b280,
    blake2b288,
    blake2b296,
    blake2b304,
    blake2b312,
    blake2b320,
    blake2b328,
    blake2b336,
    blake2b344,
    blake2b352,
    blake2b360,
    blake2b368,
    blake2b376,
    blake2b384,
    blake2b392,
    blake2b400,
    blake2b408,
    blake2b416,
    blake2b424,
    blake2b432,
    blake2b440,
    blake2b448,
    blake2b456,
    blake2b464,
    blake2b472,
    blake2b480,
    blake2b488,
    blake2b496,
    blake2b504,
    blake2b512
});
const { blake2s: blake2s1 } = blakejs;
const blake2s8 = from1({
    name: "blake2s-8",
    code: 45633,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 1))
});
const blake2s16 = from1({
    name: "blake2s-16",
    code: 45634,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 2))
});
const blake2s24 = from1({
    name: "blake2s-24",
    code: 45635,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 3))
});
const blake2s32 = from1({
    name: "blake2s-32",
    code: 45636,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 4))
});
const blake2s40 = from1({
    name: "blake2s-40",
    code: 45637,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 5))
});
const blake2s48 = from1({
    name: "blake2s-48",
    code: 45638,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 6))
});
const blake2s56 = from1({
    name: "blake2s-56",
    code: 45639,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 7))
});
const blake2s64 = from1({
    name: "blake2s-64",
    code: 45640,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 8))
});
const blake2s72 = from1({
    name: "blake2s-72",
    code: 45641,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 9))
});
const blake2s80 = from1({
    name: "blake2s-80",
    code: 45642,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 10))
});
const blake2s88 = from1({
    name: "blake2s-88",
    code: 45643,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 11))
});
const blake2s96 = from1({
    name: "blake2s-96",
    code: 45644,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 12))
});
const blake2s104 = from1({
    name: "blake2s-104",
    code: 45645,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 13))
});
const blake2s112 = from1({
    name: "blake2s-112",
    code: 45646,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 14))
});
const blake2s120 = from1({
    name: "blake2s-120",
    code: 45647,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 15))
});
const blake2s128 = from1({
    name: "blake2s-128",
    code: 45648,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 16))
});
const blake2s136 = from1({
    name: "blake2s-136",
    code: 45649,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 17))
});
const blake2s144 = from1({
    name: "blake2s-144",
    code: 45650,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 18))
});
const blake2s152 = from1({
    name: "blake2s-152",
    code: 45651,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 19))
});
const blake2s160 = from1({
    name: "blake2s-160",
    code: 45652,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 20))
});
const blake2s168 = from1({
    name: "blake2s-168",
    code: 45653,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 21))
});
const blake2s176 = from1({
    name: "blake2s-176",
    code: 45654,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 22))
});
const blake2s184 = from1({
    name: "blake2s-184",
    code: 45655,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 23))
});
const blake2s192 = from1({
    name: "blake2s-192",
    code: 45656,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 24))
});
const blake2s200 = from1({
    name: "blake2s-200",
    code: 45657,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 25))
});
const blake2s208 = from1({
    name: "blake2s-208",
    code: 45658,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 26))
});
const blake2s216 = from1({
    name: "blake2s-216",
    code: 45659,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 27))
});
const blake2s224 = from1({
    name: "blake2s-224",
    code: 45660,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 28))
});
const blake2s232 = from1({
    name: "blake2s-232",
    code: 45661,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 29))
});
const blake2s240 = from1({
    name: "blake2s-240",
    code: 45662,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 30))
});
const blake2s248 = from1({
    name: "blake2s-248",
    code: 45663,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 31))
});
const blake2s256 = from1({
    name: "blake2s-256",
    code: 45664,
    encode: (input)=>bytes.coerce(blake2s1(input, void 0, 32))
});
Object.freeze({
    __proto__: null,
    blake2s8,
    blake2s16,
    blake2s24,
    blake2s32,
    blake2s40,
    blake2s48,
    blake2s56,
    blake2s64,
    blake2s72,
    blake2s80,
    blake2s88,
    blake2s96,
    blake2s104,
    blake2s112,
    blake2s120,
    blake2s128,
    blake2s136,
    blake2s144,
    blake2s152,
    blake2s160,
    blake2s168,
    blake2s176,
    blake2s184,
    blake2s192,
    blake2s200,
    blake2s208,
    blake2s216,
    blake2s224,
    blake2s232,
    blake2s240,
    blake2s248,
    blake2s256
});
function defaultSetTimout() {
    throw new Error("setTimeout has not been defined");
}
function defaultClearTimeout() {
    throw new Error("clearTimeout has not been defined");
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
var globalContext;
if (typeof window !== "undefined") {
    globalContext = window;
} else if (typeof self !== "undefined") {
    globalContext = self;
} else {
    globalContext = {};
}
if (typeof globalContext.setTimeout === "function") {
    cachedSetTimeout = setTimeout;
}
if (typeof globalContext.clearTimeout === "function") {
    cachedClearTimeout = clearTimeout;
}
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        return cachedSetTimeout(fun, 0);
    } catch (e) {
        try {
            return cachedSetTimeout.call(null, fun, 0);
        } catch (e2) {
            return cachedSetTimeout.call(this, fun, 0);
        }
    }
}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        return cachedClearTimeout(marker);
    } catch (e) {
        try {
            return cachedClearTimeout.call(null, marker);
        } catch (e2) {
            return cachedClearTimeout.call(this, marker);
        }
    }
}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;
function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}
function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while(len){
        currentQueue = queue;
        queue = [];
        while(++queueIndex < len){
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for(var i = 1; i < arguments.length; i++){
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function() {
    this.fun.apply(null, this.array);
};
var title = "browser";
var platform = "browser";
var browser = true;
var argv = [];
var version2 = "";
var versions = {};
var release = {};
var config = {};
function noop() {}
var on = noop;
var addListener = noop;
var once = noop;
var off = noop;
var removeListener = noop;
var removeAllListeners = noop;
var emit = noop;
function binding(name) {
    throw new Error("process.binding is not supported");
}
function cwd() {
    return "/";
}
function chdir(dir) {
    throw new Error("process.chdir is not supported");
}
function umask() {
    return 0;
}
var performance = globalContext.performance || {};
var performanceNow = performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow || function() {
    return new Date().getTime();
};
function hrtime(previousTimestamp) {
    var clocktime = performanceNow.call(performance) * 1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor(clocktime % 1 * 1e9);
    if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds < 0) {
            seconds--;
            nanoseconds += 1e9;
        }
    }
    return [
        seconds,
        nanoseconds
    ];
}
var startTime = new Date();
function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1e3;
}
var process = {
    nextTick,
    title,
    browser,
    env: {
        NODE_ENV: "production"
    },
    argv,
    version: version2,
    versions,
    on,
    addListener,
    once,
    off,
    removeListener,
    removeAllListeners,
    emit,
    binding,
    cwd,
    chdir,
    umask,
    hrtime,
    platform,
    release,
    config,
    uptime
};
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function createCommonjsModule1(fn, basedir, module) {
    return module = {
        path: basedir,
        exports: {},
        require: function(path, base) {
            return commonjsRequire1(path, base === void 0 || base === null ? module.path : base);
        }
    }, fn(module, module.exports), module.exports;
}
function commonjsRequire1() {
    throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var sha3 = createCommonjsModule1(function(module) {
    (function() {
        var INPUT_ERROR = "input is invalid type";
        var FINALIZE_ERROR = "finalize already called";
        var WINDOW = typeof window === "object";
        var root = WINDOW ? window : {};
        if (root.JS_SHA3_NO_WINDOW) {
            WINDOW = false;
        }
        var WEB_WORKER = !WINDOW && typeof self === "object";
        var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === "object" && process.versions && process.versions.node;
        if (NODE_JS) {
            root = commonjsGlobal;
        } else if (WEB_WORKER) {
            root = self;
        }
        var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && true && module.exports;
        var ARRAY_BUFFER = !root.JS_SHA3_NO_ARRAY_BUFFER && typeof ArrayBuffer !== "undefined";
        var HEX_CHARS = "0123456789abcdef".split("");
        var SHAKE_PADDING = [
            31,
            7936,
            2031616,
            520093696
        ];
        var CSHAKE_PADDING = [
            4,
            1024,
            262144,
            67108864
        ];
        var KECCAK_PADDING = [
            1,
            256,
            65536,
            16777216
        ];
        var PADDING = [
            6,
            1536,
            393216,
            100663296
        ];
        var SHIFT = [
            0,
            8,
            16,
            24
        ];
        var RC = [
            1,
            0,
            32898,
            0,
            32906,
            2147483648,
            2147516416,
            2147483648,
            32907,
            0,
            2147483649,
            0,
            2147516545,
            2147483648,
            32777,
            2147483648,
            138,
            0,
            136,
            0,
            2147516425,
            0,
            2147483658,
            0,
            2147516555,
            0,
            139,
            2147483648,
            32905,
            2147483648,
            32771,
            2147483648,
            32770,
            2147483648,
            128,
            2147483648,
            32778,
            0,
            2147483658,
            2147483648,
            2147516545,
            2147483648,
            32896,
            2147483648,
            2147483649,
            0,
            2147516424,
            2147483648
        ];
        var BITS = [
            224,
            256,
            384,
            512
        ];
        var SHAKE_BITS = [
            128,
            256
        ];
        var OUTPUT_TYPES = [
            "hex",
            "buffer",
            "arrayBuffer",
            "array",
            "digest"
        ];
        var CSHAKE_BYTEPAD = {
            "128": 168,
            "256": 136
        };
        if (root.JS_SHA3_NO_NODE_JS || !Array.isArray) {
            Array.isArray = function(obj) {
                return Object.prototype.toString.call(obj) === "[object Array]";
            };
        }
        if (ARRAY_BUFFER && (root.JS_SHA3_NO_ARRAY_BUFFER_IS_VIEW || !ArrayBuffer.isView)) {
            ArrayBuffer.isView = function(obj) {
                return typeof obj === "object" && obj.buffer && obj.buffer.constructor === ArrayBuffer;
            };
        }
        var createOutputMethod = function(bits2, padding, outputType) {
            return function(message) {
                return new Keccak(bits2, padding, bits2).update(message)[outputType]();
            };
        };
        var createShakeOutputMethod = function(bits2, padding, outputType) {
            return function(message, outputBits) {
                return new Keccak(bits2, padding, outputBits).update(message)[outputType]();
            };
        };
        var createCshakeOutputMethod = function(bits2, padding, outputType) {
            return function(message, outputBits, n, s) {
                return methods["cshake" + bits2].update(message, outputBits, n, s)[outputType]();
            };
        };
        var createKmacOutputMethod = function(bits2, padding, outputType) {
            return function(key, message, outputBits, s) {
                return methods["kmac" + bits2].update(key, message, outputBits, s)[outputType]();
            };
        };
        var createOutputMethods = function(method, createMethod2, bits2, padding) {
            for(var i2 = 0; i2 < OUTPUT_TYPES.length; ++i2){
                var type = OUTPUT_TYPES[i2];
                method[type] = createMethod2(bits2, padding, type);
            }
            return method;
        };
        var createMethod = function(bits2, padding) {
            var method = createOutputMethod(bits2, padding, "hex");
            method.create = function() {
                return new Keccak(bits2, padding, bits2);
            };
            method.update = function(message) {
                return method.create().update(message);
            };
            return createOutputMethods(method, createOutputMethod, bits2, padding);
        };
        var createShakeMethod = function(bits2, padding) {
            var method = createShakeOutputMethod(bits2, padding, "hex");
            method.create = function(outputBits) {
                return new Keccak(bits2, padding, outputBits);
            };
            method.update = function(message, outputBits) {
                return method.create(outputBits).update(message);
            };
            return createOutputMethods(method, createShakeOutputMethod, bits2, padding);
        };
        var createCshakeMethod = function(bits2, padding) {
            var w = CSHAKE_BYTEPAD[bits2];
            var method = createCshakeOutputMethod(bits2, padding, "hex");
            method.create = function(outputBits, n, s) {
                if (!n && !s) {
                    return methods["shake" + bits2].create(outputBits);
                } else {
                    return new Keccak(bits2, padding, outputBits).bytepad([
                        n,
                        s
                    ], w);
                }
            };
            method.update = function(message, outputBits, n, s) {
                return method.create(outputBits, n, s).update(message);
            };
            return createOutputMethods(method, createCshakeOutputMethod, bits2, padding);
        };
        var createKmacMethod = function(bits2, padding) {
            var w = CSHAKE_BYTEPAD[bits2];
            var method = createKmacOutputMethod(bits2, padding, "hex");
            method.create = function(key, outputBits, s) {
                return new Kmac(bits2, padding, outputBits).bytepad([
                    "KMAC",
                    s
                ], w).bytepad([
                    key
                ], w);
            };
            method.update = function(key, message, outputBits, s) {
                return method.create(key, outputBits, s).update(message);
            };
            return createOutputMethods(method, createKmacOutputMethod, bits2, padding);
        };
        var algorithms = [
            {
                name: "keccak",
                padding: KECCAK_PADDING,
                bits: BITS,
                createMethod
            },
            {
                name: "sha3",
                padding: PADDING,
                bits: BITS,
                createMethod
            },
            {
                name: "shake",
                padding: SHAKE_PADDING,
                bits: SHAKE_BITS,
                createMethod: createShakeMethod
            },
            {
                name: "cshake",
                padding: CSHAKE_PADDING,
                bits: SHAKE_BITS,
                createMethod: createCshakeMethod
            },
            {
                name: "kmac",
                padding: CSHAKE_PADDING,
                bits: SHAKE_BITS,
                createMethod: createKmacMethod
            }
        ];
        var methods = {}, methodNames = [];
        for(var i = 0; i < algorithms.length; ++i){
            var algorithm = algorithms[i];
            var bits = algorithm.bits;
            for(var j = 0; j < bits.length; ++j){
                var methodName = algorithm.name + "_" + bits[j];
                methodNames.push(methodName);
                methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
                if (algorithm.name !== "sha3") {
                    var newMethodName = algorithm.name + bits[j];
                    methodNames.push(newMethodName);
                    methods[newMethodName] = methods[methodName];
                }
            }
        }
        function Keccak(bits2, padding, outputBits) {
            this.blocks = [];
            this.s = [];
            this.padding = padding;
            this.outputBits = outputBits;
            this.reset = true;
            this.finalized = false;
            this.block = 0;
            this.start = 0;
            this.blockCount = 1600 - (bits2 << 1) >> 5;
            this.byteCount = this.blockCount << 2;
            this.outputBlocks = outputBits >> 5;
            this.extraBytes = (outputBits & 31) >> 3;
            for(var i2 = 0; i2 < 50; ++i2){
                this.s[i2] = 0;
            }
        }
        Keccak.prototype.update = function(message) {
            if (this.finalized) {
                throw new Error(FINALIZE_ERROR);
            }
            var notString, type = typeof message;
            if (type !== "string") {
                if (type === "object") {
                    if (message === null) {
                        throw new Error(INPUT_ERROR);
                    } else if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
                        message = new Uint8Array(message);
                    } else if (!Array.isArray(message)) {
                        if (!ARRAY_BUFFER || !ArrayBuffer.isView(message)) {
                            throw new Error(INPUT_ERROR);
                        }
                    }
                } else {
                    throw new Error(INPUT_ERROR);
                }
                notString = true;
            }
            var blocks = this.blocks, byteCount = this.byteCount, length = message.length, blockCount = this.blockCount, index = 0, s = this.s, i2, code;
            while(index < length){
                if (this.reset) {
                    this.reset = false;
                    blocks[0] = this.block;
                    for(i2 = 1; i2 < blockCount + 1; ++i2){
                        blocks[i2] = 0;
                    }
                }
                if (notString) {
                    for(i2 = this.start; index < length && i2 < byteCount; ++index){
                        blocks[i2 >> 2] |= message[index] << SHIFT[i2++ & 3];
                    }
                } else {
                    for(i2 = this.start; index < length && i2 < byteCount; ++index){
                        code = message.charCodeAt(index);
                        if (code < 128) {
                            blocks[i2 >> 2] |= code << SHIFT[i2++ & 3];
                        } else if (code < 2048) {
                            blocks[i2 >> 2] |= (192 | code >> 6) << SHIFT[i2++ & 3];
                            blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
                        } else if (code < 55296 || code >= 57344) {
                            blocks[i2 >> 2] |= (224 | code >> 12) << SHIFT[i2++ & 3];
                            blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
                            blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
                        } else {
                            code = 65536 + ((code & 1023) << 10 | message.charCodeAt(++index) & 1023);
                            blocks[i2 >> 2] |= (240 | code >> 18) << SHIFT[i2++ & 3];
                            blocks[i2 >> 2] |= (128 | code >> 12 & 63) << SHIFT[i2++ & 3];
                            blocks[i2 >> 2] |= (128 | code >> 6 & 63) << SHIFT[i2++ & 3];
                            blocks[i2 >> 2] |= (128 | code & 63) << SHIFT[i2++ & 3];
                        }
                    }
                }
                this.lastByteIndex = i2;
                if (i2 >= byteCount) {
                    this.start = i2 - byteCount;
                    this.block = blocks[blockCount];
                    for(i2 = 0; i2 < blockCount; ++i2){
                        s[i2] ^= blocks[i2];
                    }
                    f(s);
                    this.reset = true;
                } else {
                    this.start = i2;
                }
            }
            return this;
        };
        Keccak.prototype.encode = function(x, right) {
            var o = x & 255, n = 1;
            var bytes = [
                o
            ];
            x = x >> 8;
            o = x & 255;
            while(o > 0){
                bytes.unshift(o);
                x = x >> 8;
                o = x & 255;
                ++n;
            }
            if (right) {
                bytes.push(n);
            } else {
                bytes.unshift(n);
            }
            this.update(bytes);
            return bytes.length;
        };
        Keccak.prototype.encodeString = function(str) {
            var notString, type = typeof str;
            if (type !== "string") {
                if (type === "object") {
                    if (str === null) {
                        throw new Error(INPUT_ERROR);
                    } else if (ARRAY_BUFFER && str.constructor === ArrayBuffer) {
                        str = new Uint8Array(str);
                    } else if (!Array.isArray(str)) {
                        if (!ARRAY_BUFFER || !ArrayBuffer.isView(str)) {
                            throw new Error(INPUT_ERROR);
                        }
                    }
                } else {
                    throw new Error(INPUT_ERROR);
                }
                notString = true;
            }
            var bytes = 0, length = str.length;
            if (notString) {
                bytes = length;
            } else {
                for(var i2 = 0; i2 < str.length; ++i2){
                    var code = str.charCodeAt(i2);
                    if (code < 128) {
                        bytes += 1;
                    } else if (code < 2048) {
                        bytes += 2;
                    } else if (code < 55296 || code >= 57344) {
                        bytes += 3;
                    } else {
                        code = 65536 + ((code & 1023) << 10 | str.charCodeAt(++i2) & 1023);
                        bytes += 4;
                    }
                }
            }
            bytes += this.encode(bytes * 8);
            this.update(str);
            return bytes;
        };
        Keccak.prototype.bytepad = function(strs, w) {
            var bytes = this.encode(w);
            for(var i2 = 0; i2 < strs.length; ++i2){
                bytes += this.encodeString(strs[i2]);
            }
            var paddingBytes = w - bytes % w;
            var zeros = [];
            zeros.length = paddingBytes;
            this.update(zeros);
            return this;
        };
        Keccak.prototype.finalize = function() {
            if (this.finalized) {
                return;
            }
            this.finalized = true;
            var blocks = this.blocks, i2 = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
            blocks[i2 >> 2] |= this.padding[i2 & 3];
            if (this.lastByteIndex === this.byteCount) {
                blocks[0] = blocks[blockCount];
                for(i2 = 1; i2 < blockCount + 1; ++i2){
                    blocks[i2] = 0;
                }
            }
            blocks[blockCount - 1] |= 2147483648;
            for(i2 = 0; i2 < blockCount; ++i2){
                s[i2] ^= blocks[i2];
            }
            f(s);
        };
        Keccak.prototype.toString = Keccak.prototype.hex = function() {
            this.finalize();
            var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
            var hex = "", block;
            while(j2 < outputBlocks){
                for(i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2){
                    block = s[i2];
                    hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15] + HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15] + HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15] + HEX_CHARS[block >> 28 & 15] + HEX_CHARS[block >> 24 & 15];
                }
                if (j2 % blockCount === 0) {
                    f(s);
                    i2 = 0;
                }
            }
            if (extraBytes) {
                block = s[i2];
                hex += HEX_CHARS[block >> 4 & 15] + HEX_CHARS[block & 15];
                if (extraBytes > 1) {
                    hex += HEX_CHARS[block >> 12 & 15] + HEX_CHARS[block >> 8 & 15];
                }
                if (extraBytes > 2) {
                    hex += HEX_CHARS[block >> 20 & 15] + HEX_CHARS[block >> 16 & 15];
                }
            }
            return hex;
        };
        Keccak.prototype.arrayBuffer = function() {
            this.finalize();
            var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
            var bytes = this.outputBits >> 3;
            var buffer;
            if (extraBytes) {
                buffer = new ArrayBuffer(outputBlocks + 1 << 2);
            } else {
                buffer = new ArrayBuffer(bytes);
            }
            var array = new Uint32Array(buffer);
            while(j2 < outputBlocks){
                for(i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2){
                    array[j2] = s[i2];
                }
                if (j2 % blockCount === 0) {
                    f(s);
                }
            }
            if (extraBytes) {
                array[i2] = s[i2];
                buffer = buffer.slice(0, bytes);
            }
            return buffer;
        };
        Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;
        Keccak.prototype.digest = Keccak.prototype.array = function() {
            this.finalize();
            var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks, extraBytes = this.extraBytes, i2 = 0, j2 = 0;
            var array = [], offset, block;
            while(j2 < outputBlocks){
                for(i2 = 0; i2 < blockCount && j2 < outputBlocks; ++i2, ++j2){
                    offset = j2 << 2;
                    block = s[i2];
                    array[offset] = block & 255;
                    array[offset + 1] = block >> 8 & 255;
                    array[offset + 2] = block >> 16 & 255;
                    array[offset + 3] = block >> 24 & 255;
                }
                if (j2 % blockCount === 0) {
                    f(s);
                }
            }
            if (extraBytes) {
                offset = j2 << 2;
                block = s[i2];
                array[offset] = block & 255;
                if (extraBytes > 1) {
                    array[offset + 1] = block >> 8 & 255;
                }
                if (extraBytes > 2) {
                    array[offset + 2] = block >> 16 & 255;
                }
            }
            return array;
        };
        function Kmac(bits2, padding, outputBits) {
            Keccak.call(this, bits2, padding, outputBits);
        }
        Kmac.prototype = new Keccak();
        Kmac.prototype.finalize = function() {
            this.encode(this.outputBits, true);
            return Keccak.prototype.finalize.call(this);
        };
        var f = function(s) {
            var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17, b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33, b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
            for(n = 0; n < 48; n += 2){
                c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
                c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
                c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
                c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
                c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
                c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
                c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
                c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
                c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
                c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];
                h = c8 ^ (c2 << 1 | c3 >>> 31);
                l = c9 ^ (c3 << 1 | c2 >>> 31);
                s[0] ^= h;
                s[1] ^= l;
                s[10] ^= h;
                s[11] ^= l;
                s[20] ^= h;
                s[21] ^= l;
                s[30] ^= h;
                s[31] ^= l;
                s[40] ^= h;
                s[41] ^= l;
                h = c0 ^ (c4 << 1 | c5 >>> 31);
                l = c1 ^ (c5 << 1 | c4 >>> 31);
                s[2] ^= h;
                s[3] ^= l;
                s[12] ^= h;
                s[13] ^= l;
                s[22] ^= h;
                s[23] ^= l;
                s[32] ^= h;
                s[33] ^= l;
                s[42] ^= h;
                s[43] ^= l;
                h = c2 ^ (c6 << 1 | c7 >>> 31);
                l = c3 ^ (c7 << 1 | c6 >>> 31);
                s[4] ^= h;
                s[5] ^= l;
                s[14] ^= h;
                s[15] ^= l;
                s[24] ^= h;
                s[25] ^= l;
                s[34] ^= h;
                s[35] ^= l;
                s[44] ^= h;
                s[45] ^= l;
                h = c4 ^ (c8 << 1 | c9 >>> 31);
                l = c5 ^ (c9 << 1 | c8 >>> 31);
                s[6] ^= h;
                s[7] ^= l;
                s[16] ^= h;
                s[17] ^= l;
                s[26] ^= h;
                s[27] ^= l;
                s[36] ^= h;
                s[37] ^= l;
                s[46] ^= h;
                s[47] ^= l;
                h = c6 ^ (c0 << 1 | c1 >>> 31);
                l = c7 ^ (c1 << 1 | c0 >>> 31);
                s[8] ^= h;
                s[9] ^= l;
                s[18] ^= h;
                s[19] ^= l;
                s[28] ^= h;
                s[29] ^= l;
                s[38] ^= h;
                s[39] ^= l;
                s[48] ^= h;
                s[49] ^= l;
                b0 = s[0];
                b1 = s[1];
                b32 = s[11] << 4 | s[10] >>> 28;
                b33 = s[10] << 4 | s[11] >>> 28;
                b14 = s[20] << 3 | s[21] >>> 29;
                b15 = s[21] << 3 | s[20] >>> 29;
                b46 = s[31] << 9 | s[30] >>> 23;
                b47 = s[30] << 9 | s[31] >>> 23;
                b28 = s[40] << 18 | s[41] >>> 14;
                b29 = s[41] << 18 | s[40] >>> 14;
                b20 = s[2] << 1 | s[3] >>> 31;
                b21 = s[3] << 1 | s[2] >>> 31;
                b2 = s[13] << 12 | s[12] >>> 20;
                b3 = s[12] << 12 | s[13] >>> 20;
                b34 = s[22] << 10 | s[23] >>> 22;
                b35 = s[23] << 10 | s[22] >>> 22;
                b16 = s[33] << 13 | s[32] >>> 19;
                b17 = s[32] << 13 | s[33] >>> 19;
                b48 = s[42] << 2 | s[43] >>> 30;
                b49 = s[43] << 2 | s[42] >>> 30;
                b40 = s[5] << 30 | s[4] >>> 2;
                b41 = s[4] << 30 | s[5] >>> 2;
                b22 = s[14] << 6 | s[15] >>> 26;
                b23 = s[15] << 6 | s[14] >>> 26;
                b4 = s[25] << 11 | s[24] >>> 21;
                b5 = s[24] << 11 | s[25] >>> 21;
                b36 = s[34] << 15 | s[35] >>> 17;
                b37 = s[35] << 15 | s[34] >>> 17;
                b18 = s[45] << 29 | s[44] >>> 3;
                b19 = s[44] << 29 | s[45] >>> 3;
                b10 = s[6] << 28 | s[7] >>> 4;
                b11 = s[7] << 28 | s[6] >>> 4;
                b42 = s[17] << 23 | s[16] >>> 9;
                b43 = s[16] << 23 | s[17] >>> 9;
                b24 = s[26] << 25 | s[27] >>> 7;
                b25 = s[27] << 25 | s[26] >>> 7;
                b6 = s[36] << 21 | s[37] >>> 11;
                b7 = s[37] << 21 | s[36] >>> 11;
                b38 = s[47] << 24 | s[46] >>> 8;
                b39 = s[46] << 24 | s[47] >>> 8;
                b30 = s[8] << 27 | s[9] >>> 5;
                b31 = s[9] << 27 | s[8] >>> 5;
                b12 = s[18] << 20 | s[19] >>> 12;
                b13 = s[19] << 20 | s[18] >>> 12;
                b44 = s[29] << 7 | s[28] >>> 25;
                b45 = s[28] << 7 | s[29] >>> 25;
                b26 = s[38] << 8 | s[39] >>> 24;
                b27 = s[39] << 8 | s[38] >>> 24;
                b8 = s[48] << 14 | s[49] >>> 18;
                b9 = s[49] << 14 | s[48] >>> 18;
                s[0] = b0 ^ ~b2 & b4;
                s[1] = b1 ^ ~b3 & b5;
                s[10] = b10 ^ ~b12 & b14;
                s[11] = b11 ^ ~b13 & b15;
                s[20] = b20 ^ ~b22 & b24;
                s[21] = b21 ^ ~b23 & b25;
                s[30] = b30 ^ ~b32 & b34;
                s[31] = b31 ^ ~b33 & b35;
                s[40] = b40 ^ ~b42 & b44;
                s[41] = b41 ^ ~b43 & b45;
                s[2] = b2 ^ ~b4 & b6;
                s[3] = b3 ^ ~b5 & b7;
                s[12] = b12 ^ ~b14 & b16;
                s[13] = b13 ^ ~b15 & b17;
                s[22] = b22 ^ ~b24 & b26;
                s[23] = b23 ^ ~b25 & b27;
                s[32] = b32 ^ ~b34 & b36;
                s[33] = b33 ^ ~b35 & b37;
                s[42] = b42 ^ ~b44 & b46;
                s[43] = b43 ^ ~b45 & b47;
                s[4] = b4 ^ ~b6 & b8;
                s[5] = b5 ^ ~b7 & b9;
                s[14] = b14 ^ ~b16 & b18;
                s[15] = b15 ^ ~b17 & b19;
                s[24] = b24 ^ ~b26 & b28;
                s[25] = b25 ^ ~b27 & b29;
                s[34] = b34 ^ ~b36 & b38;
                s[35] = b35 ^ ~b37 & b39;
                s[44] = b44 ^ ~b46 & b48;
                s[45] = b45 ^ ~b47 & b49;
                s[6] = b6 ^ ~b8 & b0;
                s[7] = b7 ^ ~b9 & b1;
                s[16] = b16 ^ ~b18 & b10;
                s[17] = b17 ^ ~b19 & b11;
                s[26] = b26 ^ ~b28 & b20;
                s[27] = b27 ^ ~b29 & b21;
                s[36] = b36 ^ ~b38 & b30;
                s[37] = b37 ^ ~b39 & b31;
                s[46] = b46 ^ ~b48 & b40;
                s[47] = b47 ^ ~b49 & b41;
                s[8] = b8 ^ ~b0 & b2;
                s[9] = b9 ^ ~b1 & b3;
                s[18] = b18 ^ ~b10 & b12;
                s[19] = b19 ^ ~b11 & b13;
                s[28] = b28 ^ ~b20 & b22;
                s[29] = b29 ^ ~b21 & b23;
                s[38] = b38 ^ ~b30 & b32;
                s[39] = b39 ^ ~b31 & b33;
                s[48] = b48 ^ ~b40 & b42;
                s[49] = b49 ^ ~b41 & b43;
                s[0] ^= RC[n];
                s[1] ^= RC[n + 1];
            }
        };
        if (COMMON_JS) {
            module.exports = methods;
        } else {
            for(i = 0; i < methodNames.length; ++i){
                root[methodNames[i]] = methods[methodNames[i]];
            }
        }
    })();
});
sha3.cshake128;
sha3.cshake256;
sha3.cshake_128;
sha3.cshake_256;
sha3.keccak224;
sha3.keccak256;
sha3.keccak384;
sha3.keccak512;
sha3.keccak_224;
sha3.keccak_256;
sha3.keccak_384;
sha3.keccak_512;
sha3.kmac128;
sha3.kmac256;
sha3.kmac_128;
sha3.kmac_256;
sha3.sha3_224;
sha3.sha3_256;
sha3.sha3_384;
sha3.sha3_512;
sha3.shake128;
sha3.shake256;
sha3.shake_128;
sha3.shake_256;
function encoder1(fn) {
    return (b)=>new Uint8Array(fn.array(b));
}
const sha3224 = from1({
    code: 23,
    name: "sha3-224",
    encode: encoder1(sha3.sha3_224)
});
const sha3256 = from1({
    code: 22,
    name: "sha3-256",
    encode: encoder1(sha3.sha3_256)
});
const sha3384 = from1({
    code: 21,
    name: "sha3-384",
    encode: encoder1(sha3.sha3_384)
});
const sha3512 = from1({
    code: 20,
    name: "sha3-512",
    encode: encoder1(sha3.sha3_512)
});
const shake128 = from1({
    code: 24,
    name: "shake-128",
    encode: (b)=>new Uint8Array(sha3.shake128.array(b, 256))
});
const shake256 = from1({
    code: 25,
    name: "shake-256",
    encode: (b)=>new Uint8Array(sha3.shake256.array(b, 512))
});
const keccak224 = from1({
    code: 26,
    name: "keccak-224",
    encode: encoder1(sha3.keccak224)
});
const keccak256 = from1({
    code: 27,
    name: "keccak-256",
    encode: encoder1(sha3.keccak256)
});
const keccak384 = from1({
    code: 28,
    name: "keccak-384",
    encode: encoder1(sha3.keccak384)
});
const keccak512 = from1({
    code: 29,
    name: "keccak-512",
    encode: encoder1(sha3.keccak512)
});
function asUint8Array(buf) {
    if (globalThis.Buffer != null) {
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    return buf;
}
function allocUnsafe(size = 0) {
    if (globalThis.Buffer != null && globalThis.Buffer.allocUnsafe != null) {
        return asUint8Array(globalThis.Buffer.allocUnsafe(size));
    }
    return new Uint8Array(size);
}
const identity = from4({
    prefix: "\0",
    name: "identity",
    encode: (buf)=>toString2(buf),
    decode: (str)=>fromString2(str)
});
var identityBase = Object.freeze({
    __proto__: null,
    identity
});
const base21 = rfc46482({
    prefix: "0",
    name: "base2",
    alphabet: "01",
    bitsPerChar: 1
});
var base2$1 = Object.freeze({
    __proto__: null,
    base2: base21
});
const base8 = rfc46482({
    prefix: "7",
    name: "base8",
    alphabet: "01234567",
    bitsPerChar: 3
});
var base8$1 = Object.freeze({
    __proto__: null,
    base8
});
const base10 = baseX2({
    prefix: "9",
    name: "base10",
    alphabet: "0123456789"
});
var base10$1 = Object.freeze({
    __proto__: null,
    base10
});
const base16 = rfc46482({
    prefix: "f",
    name: "base16",
    alphabet: "0123456789abcdef",
    bitsPerChar: 4
});
const base16upper = rfc46482({
    prefix: "F",
    name: "base16upper",
    alphabet: "0123456789ABCDEF",
    bitsPerChar: 4
});
var base16$1 = Object.freeze({
    __proto__: null,
    base16,
    base16upper
});
const base36 = baseX2({
    prefix: "k",
    name: "base36",
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
});
const base36upper = baseX2({
    prefix: "K",
    name: "base36upper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
var base36$1 = Object.freeze({
    __proto__: null,
    base36,
    base36upper
});
const base64 = rfc46482({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6
});
const base64pad = rfc46482({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6
});
const base64url = rfc46482({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6
});
const base64urlpad = rfc46482({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6
});
var base64$1 = Object.freeze({
    __proto__: null,
    base64,
    base64pad,
    base64url,
    base64urlpad
});
const alphabet = Array.from("\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}");
const alphabetBytesToChars = alphabet.reduce((p, c, i)=>{
    p[i] = c;
    return p;
}, []);
const alphabetCharsToBytes = alphabet.reduce((p, c, i)=>{
    p[c.codePointAt(0)] = i;
    return p;
}, []);
function encode9(data) {
    return data.reduce((p, c)=>{
        p += alphabetBytesToChars[c];
        return p;
    }, "");
}
function decode10(str) {
    const byts = [];
    for (const __char of str){
        const byt = alphabetCharsToBytes[__char.codePointAt(0)];
        if (byt === void 0) {
            throw new Error(`Non-base256emoji character: ${__char}`);
        }
        byts.push(byt);
    }
    return new Uint8Array(byts);
}
const base256emoji = from4({
    prefix: "\u{1F680}",
    name: "base256emoji",
    encode: encode9,
    decode: decode10
});
var base256emoji$1 = Object.freeze({
    __proto__: null,
    base256emoji
});
const name = "identity";
const digest = (input)=>create1(0, coerce1(input));
const identity1 = {
    code: 0,
    name,
    encode: coerce1,
    digest
};
var identity$1 = Object.freeze({
    __proto__: null,
    identity: identity1
});
const name1 = "raw";
const encode10 = (node)=>coerce1(node);
const decode11 = (data)=>coerce1(data);
Object.freeze({
    __proto__: null,
    name: name1,
    code: 85,
    encode: encode10,
    decode: decode11
});
const textEncoder1 = new TextEncoder();
const textDecoder2 = new TextDecoder();
const name2 = "json";
const encode11 = (node)=>textEncoder1.encode(JSON.stringify(node));
const decode12 = (data)=>JSON.parse(textDecoder2.decode(data));
Object.freeze({
    __proto__: null,
    name: name2,
    code: 512,
    encode: encode11,
    decode: decode12
});
const bases = {
    ...identityBase,
    ...base2$1,
    ...base8$1,
    ...base10$1,
    ...base16$1,
    ...base32$1,
    ...base36$1,
    ...base58,
    ...base64$1,
    ...base256emoji$1
};
({
    ...sha2,
    ...identity$1
});
function createCodec(name, prefix, encode, decode) {
    return {
        name,
        prefix,
        encoder: {
            name,
            prefix,
            encode
        },
        decoder: {
            decode
        }
    };
}
const string = createCodec("utf8", "u", (buf)=>{
    const decoder = new TextDecoder("utf8");
    return "u" + decoder.decode(buf);
}, (str)=>{
    const encoder = new TextEncoder();
    return encoder.encode(str.substring(1));
});
const ascii = createCodec("ascii", "a", (buf)=>{
    let string2 = "a";
    for(let i = 0; i < buf.length; i++){
        string2 += String.fromCharCode(buf[i]);
    }
    return string2;
}, (str)=>{
    str = str.substring(1);
    const buf = allocUnsafe(str.length);
    for(let i = 0; i < str.length; i++){
        buf[i] = str.charCodeAt(i);
    }
    return buf;
});
({
    utf8: string,
    "utf-8": string,
    hex: bases.base16,
    latin1: ascii,
    ascii,
    binary: ascii,
    ...bases
});
function equals6(a, b) {
    if (a === b) {
        return true;
    }
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    for(let i = 0; i < a.byteLength; i++){
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
const hashMap = new Map([
    sha256,
    sha512,
    murmur3128,
    murmur332,
    blake2b256,
    blake2s256,
    sha3224,
    sha3256,
    sha3384,
    sha3512,
    shake128,
    shake256,
    keccak224,
    keccak256,
    keccak384,
    keccak512
].map((hash)=>[
        hash.code,
        hash
    ]));
class UnsupportedHashError extends Error {
    constructor(code){
        super(`multihash code ${code} is not supported`);
    }
}
class HashMismatchError extends Error {
    constructor(){
        super("CID hash does not match bytes");
    }
}
function validateBlock(block) {
    const hasher = hashMap.get(block.cid.multihash.code);
    if (!hasher) {
        throw new UnsupportedHashError(block.cid.multihash.code);
    }
    const result = hasher.digest(block.bytes);
    const compareDigests = (h)=>{
        if (!equals6(h.digest, block.cid.multihash.digest)) {
            throw new HashMismatchError();
        }
    };
    if (result instanceof Promise) {
        return result.then(compareDigests);
    }
    compareDigests(result);
}
const o = "object" == typeof globalThis && "crypto" in globalThis ? globalThis.crypto : void 0;
function t(t1, ...e) {
    if (!((s = t1) instanceof Uint8Array || null != s && "object" == typeof s && "Uint8Array" === s.constructor.name)) throw new Error("Uint8Array expected");
    var s;
    if (e.length > 0 && !e.includes(t1.length)) throw new Error(`Uint8Array expected of length ${e}, not of length=${t1.length}`);
}
function e(t, e = !0) {
    if (t.destroyed) throw new Error("Hash instance has been destroyed");
    if (e && t.finished) throw new Error("Hash#digest() has already been called");
}
const s = (t)=>new DataView(t.buffer, t.byteOffset, t.byteLength), n = (t, e)=>t << 32 - e | t >>> e;
function i(e) {
    return "string" == typeof e && (e = function(t) {
        if ("string" != typeof t) throw new Error("utf8ToBytes expected string, got " + typeof t);
        return new Uint8Array((new TextEncoder).encode(t));
    }(e)), t(e), e;
}
new Uint8Array(new Uint32Array([
    287454020
]).buffer)[0];
class r {
    clone() {
        return this._cloneInto();
    }
}
function o1(t) {
    const e = (e)=>t().update(i(e)).digest(), s = t();
    return e.outputLen = s.outputLen, e.blockLen = s.blockLen, e.create = ()=>t(), e;
}
const h = (t, e, s)=>t & e ^ t & s ^ e & s;
class f extends r {
    constructor(t, e, n, i){
        super(), this.blockLen = t, this.outputLen = e, this.padOffset = n, this.isLE = i, this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.buffer = new Uint8Array(t), this.view = s(this.buffer);
    }
    update(t) {
        e(this);
        const { view: n, buffer: r, blockLen: o } = this, h = (t = i(t)).length;
        for(let e = 0; e < h;){
            const i = Math.min(o - this.pos, h - e);
            if (i !== o) r.set(t.subarray(e, e + i), this.pos), this.pos += i, e += i, this.pos === o && (this.process(n, 0), this.pos = 0);
            else {
                const n = s(t);
                for(; o <= h - e; e += o)this.process(n, e);
            }
        }
        return this.length += t.length, this.roundClean(), this;
    }
    digestInto(n) {
        e(this), function(e, s) {
            t(e);
            const n = s.outputLen;
            if (e.length < n) throw new Error(`digestInto() expects output buffer of length at least ${n}`);
        }(n, this), this.finished = !0;
        const { buffer: i, view: r, blockLen: o, isLE: h } = this;
        let { pos: f } = this;
        i[f++] = 128, this.buffer.subarray(f).fill(0), this.padOffset > o - f && (this.process(r, 0), f = 0);
        for(let t = f; t < o; t++)i[t] = 0;
        !function(t, e, s, n) {
            if ("function" == typeof t.setBigUint64) return t.setBigUint64(e, s, n);
            const i = BigInt(32), r = BigInt(4294967295), o = Number(s >> i & r), h = Number(s & r), f = n ? 4 : 0, u = n ? 0 : 4;
            t.setUint32(e + f, o, n), t.setUint32(e + u, h, n);
        }(r, o - 8, BigInt(8 * this.length), h), this.process(r, 0);
        const u = s(n), c = this.outputLen;
        if (c % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
        const l = c / 4, a = this.get();
        if (l > a.length) throw new Error("_sha2: outputLen bigger than state");
        for(let t = 0; t < l; t++)u.setUint32(4 * t, a[t], h);
    }
    digest() {
        const { buffer: t, outputLen: e } = this;
        this.digestInto(t);
        const s = t.slice(0, e);
        return this.destroy(), s;
    }
    _cloneInto(t) {
        t || (t = new this.constructor), t.set(...this.get());
        const { blockLen: e, buffer: s, length: n, finished: i, destroyed: r, pos: o } = this;
        return t.length = n, t.pos = o, t.finished = i, t.destroyed = r, n % e && t.buffer.set(s), t;
    }
}
const u = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
]), c = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
]), l = new Uint32Array(64);
class a extends f {
    constructor(){
        super(64, 32, 8, !1), this.A = 0 | c[0], this.B = 0 | c[1], this.C = 0 | c[2], this.D = 0 | c[3], this.E = 0 | c[4], this.F = 0 | c[5], this.G = 0 | c[6], this.H = 0 | c[7];
    }
    get() {
        const { A: t, B: e, C: s, D: n, E: i, F: r, G: o, H: h } = this;
        return [
            t,
            e,
            s,
            n,
            i,
            r,
            o,
            h
        ];
    }
    set(t, e, s, n, i, r, o, h) {
        this.A = 0 | t, this.B = 0 | e, this.C = 0 | s, this.D = 0 | n, this.E = 0 | i, this.F = 0 | r, this.G = 0 | o, this.H = 0 | h;
    }
    process(t, e) {
        for(let s = 0; s < 16; s++, e += 4)l[s] = t.getUint32(e, !1);
        for(let t = 16; t < 64; t++){
            const e = l[t - 15], s = l[t - 2], i = n(e, 7) ^ n(e, 18) ^ e >>> 3, r = n(s, 17) ^ n(s, 19) ^ s >>> 10;
            l[t] = r + l[t - 7] + i + l[t - 16] | 0;
        }
        let { A: s, B: i, C: r, D: o, E: f, F: c, G: a, H: p } = this;
        for(let t = 0; t < 64; t++){
            const e = p + (n(f, 6) ^ n(f, 11) ^ n(f, 25)) + ((d = f) & c ^ ~d & a) + u[t] + l[t] | 0, g = (n(s, 2) ^ n(s, 13) ^ n(s, 22)) + h(s, i, r) | 0;
            p = a, a = c, c = f, f = o + e | 0, o = r, r = i, i = s, s = e + g | 0;
        }
        var d;
        s = s + this.A | 0, i = i + this.B | 0, r = r + this.C | 0, o = o + this.D | 0, f = f + this.E | 0, c = c + this.F | 0, a = a + this.G | 0, p = p + this.H | 0, this.set(s, i, r, o, f, c, a, p);
    }
    roundClean() {
        l.fill(0);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
    }
}
class p extends a {
    constructor(){
        super(), this.A = -1056596264, this.B = 914150663, this.C = 812702999, this.D = -150054599, this.E = -4191439, this.F = 1750603025, this.G = 1694076839, this.H = -1090891868, this.outputLen = 28;
    }
}
const d = o1(()=>new a), g = o1(()=>new p);
68 === new Uint8Array(new Uint32Array([
    287454020
]).buffer)[0];
Array.from({
    length: 256
}, (t, e)=>e.toString(16).padStart(2, "0"));
function O(e = 32) {
    if (o && "function" == typeof o.getRandomValues) return o.getRandomValues(new Uint8Array(e));
    throw new Error("crypto.getRandomValues must be defined");
}
const c1 = BigInt(0), a1 = BigInt(1), f1 = BigInt(2);
function r1(e) {
    return e instanceof Uint8Array || null != e && "object" == typeof e && "Uint8Array" === e.constructor.name;
}
function n1(e) {
    if (!r1(e)) throw new Error("Uint8Array expected");
}
const d1 = Array.from({
    length: 256
}, (e, t)=>t.toString(16).padStart(2, "0"));
function i1(e) {
    n1(e);
    let t = "";
    for(let c = 0; c < e.length; c++)t += d1[e[c]];
    return t;
}
function o2(e) {
    if ("string" != typeof e) throw new Error("hex string expected, got " + typeof e);
    return BigInt("" === e ? "0" : `0x${e}`);
}
const b = {
    _0: 48,
    _9: 57,
    _A: 65,
    _F: 70,
    _a: 97,
    _f: 102
};
function s1(e) {
    return e >= b._0 && e <= b._9 ? e - b._0 : e >= b._A && e <= b._F ? e - (b._A - 10) : e >= b._a && e <= b._f ? e - (b._a - 10) : void 0;
}
function u1(e) {
    if ("string" != typeof e) throw new Error("hex string expected, got " + typeof e);
    const t = e.length, c = t / 2;
    if (t % 2) throw new Error("padded hex string expected, got unpadded hex of length " + t);
    const a = new Uint8Array(c);
    for(let t = 0, f = 0; t < c; t++, f += 2){
        const c = s1(e.charCodeAt(f)), r = s1(e.charCodeAt(f + 1));
        if (void 0 === c || void 0 === r) {
            const t = e[f] + e[f + 1];
            throw new Error('hex string expected, got non-hex character "' + t + '" at index ' + f);
        }
        a[t] = 16 * c + r;
    }
    return a;
}
function l1(e) {
    return o2(i1(e));
}
function m1(e) {
    return n1(e), o2(i1(Uint8Array.from(e).reverse()));
}
function p1(e, t) {
    return u1(e.toString(16).padStart(2 * t, "0"));
}
function g1(e, t) {
    return p1(e, t).reverse();
}
function y(e, t, c) {
    let a;
    if ("string" == typeof t) try {
        a = u1(t);
    } catch (c) {
        throw new Error(`${e} must be valid hex string, got "${t}". Cause: ${c}`);
    }
    else {
        if (!r1(t)) throw new Error(`${e} must be hex string or Uint8Array`);
        a = Uint8Array.from(t);
    }
    const f = a.length;
    if ("number" == typeof c && f !== c) throw new Error(`${e} expected ${c} bytes, got ${f}`);
    return a;
}
function B(...e) {
    let t = 0;
    for(let c = 0; c < e.length; c++){
        const a = e[c];
        n1(a), t += a.length;
    }
    const c = new Uint8Array(t);
    for(let t = 0, a = 0; t < e.length; t++){
        const f = e[t];
        c.set(f, a), a += f.length;
    }
    return c;
}
function x(e) {
    if ("string" != typeof e) throw new Error("utf8ToBytes expected string, got " + typeof e);
    return new Uint8Array((new TextEncoder).encode(e));
}
function E(e) {
    let t;
    for(t = 0; e > c1; e >>= a1, t += 1);
    return t;
}
function h1(e, t) {
    return e >> BigInt(t) & a1;
}
const w = (e)=>(f1 << BigInt(e - 1)) - a1, v1 = {
    bigint: (e)=>"bigint" == typeof e,
    function: (e)=>"function" == typeof e,
    boolean: (e)=>"boolean" == typeof e,
    string: (e)=>"string" == typeof e,
    stringOrUint8Array: (e)=>"string" == typeof e || r1(e),
    isSafeInteger: (e)=>Number.isSafeInteger(e),
    array: (e)=>Array.isArray(e),
    field: (e, t)=>t.Fp.isValid(e),
    hash: (e)=>"function" == typeof e && Number.isSafeInteger(e.outputLen)
};
function I(e, t, c = {}) {
    const a = (t, c, a)=>{
        const f = v1[c];
        if ("function" != typeof f) throw new Error(`Invalid validator "${c}", expected function`);
        const r = e[t];
        if (!(a && void 0 === r || f(r, e))) throw new Error(`Invalid param ${String(t)}=${r} (${typeof r}), expected ${c}`);
    };
    for (const [e, c] of Object.entries(t))a(e, c, !1);
    for (const [e, t] of Object.entries(c))a(e, t, !0);
    return e;
}
const O1 = BigInt(0), S = BigInt(1), R = BigInt(2), q = BigInt(3), P = BigInt(4), T = BigInt(5), A = BigInt(8);
function N(e, t) {
    const c = e % t;
    return c >= O1 ? c : t + c;
}
function Z(e, t, c) {
    if (c <= O1 || t < O1) throw new Error("Expected power/modulo > 0");
    if (c === S) return O1;
    let a = S;
    for(; t > O1;)t & S && (a = a * e % c), e = e * e % c, t >>= S;
    return a;
}
function _(e, t) {
    if (e === O1 || t <= O1) throw new Error(`invert: expected positive integers, got n=${e} mod=${t}`);
    let c = N(e, t), a = t, f = O1, r = S;
    for(; c !== O1;){
        const e = a % c, t = f - r * (a / c);
        a = c, c = e, f = r, r = t;
    }
    if (a !== S) throw new Error("invert: does not exist");
    return N(f, t);
}
function j(e) {
    if (e % P === q) {
        const t = (e + S) / P;
        return function(e, c) {
            const a = e.pow(c, t);
            if (!e.eql(e.sqr(a), c)) throw new Error("Cannot find square root");
            return a;
        };
    }
    if (e % A === T) {
        const t = (e - T) / A;
        return function(e, c) {
            const a = e.mul(c, R), f = e.pow(a, t), r = e.mul(c, f), n = e.mul(e.mul(r, R), f), d = e.mul(r, e.sub(n, e.ONE));
            if (!e.eql(e.sqr(d), c)) throw new Error("Cannot find square root");
            return d;
        };
    }
    return function(e) {
        const t = (e - S) / R;
        let c, a, f;
        for(c = e - S, a = 0; c % R === O1; c /= R, a++);
        for(f = R; f < e && Z(f, t, e) !== e - S; f++);
        if (1 === a) {
            const t = (e + S) / P;
            return function(e, c) {
                const a = e.pow(c, t);
                if (!e.eql(e.sqr(a), c)) throw new Error("Cannot find square root");
                return a;
            };
        }
        const r = (c + S) / R;
        return function(e, n) {
            if (e.pow(n, t) === e.neg(e.ONE)) throw new Error("Cannot find square root");
            let d = a, i = e.pow(e.mul(e.ONE, f), c), o = e.pow(n, r), b = e.pow(n, c);
            for(; !e.eql(b, e.ONE);){
                if (e.eql(b, e.ZERO)) return e.ZERO;
                let t = 1;
                for(let c = e.sqr(b); t < d && !e.eql(c, e.ONE); t++)c = e.sqr(c);
                const c = e.pow(i, S << BigInt(d - t - 1));
                i = e.sqr(c), o = e.mul(o, c), b = e.mul(b, i), d = t;
            }
            return o;
        };
    }(e);
}
BigInt(9), BigInt(16);
const F = [
    "create",
    "isValid",
    "is0",
    "neg",
    "inv",
    "sqrt",
    "sqr",
    "eql",
    "add",
    "sub",
    "mul",
    "pow",
    "div",
    "addN",
    "subN",
    "mulN",
    "sqrN"
];
function G(e) {
    return I(e, F.reduce((e, t)=>(e[t] = "function", e), {
        ORDER: "bigint",
        MASK: "bigint",
        BYTES: "isSafeInteger",
        BITS: "isSafeInteger"
    }));
}
function D(e, t, c) {
    if (c < O1) throw new Error("Expected power > 0");
    if (c === O1) return e.ONE;
    if (c === S) return t;
    let a = e.ONE, f = t;
    for(; c > O1;)c & S && (a = e.mul(a, f)), f = e.sqr(f), c >>= S;
    return a;
}
function V(e, t) {
    const c = new Array(t.length), a = t.reduce((t, a, f)=>e.is0(a) ? t : (c[f] = t, e.mul(t, a)), e.ONE), f = e.inv(a);
    return t.reduceRight((t, a, f)=>e.is0(a) ? t : (c[f] = e.mul(t, c[f]), e.mul(t, a)), f), c;
}
function M(e, t) {
    const c = void 0 !== t ? t : e.toString(2).length;
    return {
        nBitLength: c,
        nByteLength: Math.ceil(c / 8)
    };
}
function U(e, t, c = !1, a = {}) {
    if (e <= O1) throw new Error(`Expected Field ORDER > 0, got ${e}`);
    const { nBitLength: f, nByteLength: r } = M(e, t);
    if (r > 2048) throw new Error("Field lengths over 2048 bytes are not supported");
    const n = j(e), d = Object.freeze({
        ORDER: e,
        BITS: f,
        BYTES: r,
        MASK: w(f),
        ZERO: O1,
        ONE: S,
        create: (t)=>N(t, e),
        isValid: (t)=>{
            if ("bigint" != typeof t) throw new Error("Invalid field element: expected bigint, got " + typeof t);
            return O1 <= t && t < e;
        },
        is0: (e)=>e === O1,
        isOdd: (e)=>(e & S) === S,
        neg: (t)=>N(-t, e),
        eql: (e, t)=>e === t,
        sqr: (t)=>N(t * t, e),
        add: (t, c)=>N(t + c, e),
        sub: (t, c)=>N(t - c, e),
        mul: (t, c)=>N(t * c, e),
        pow: (e, t)=>D(d, e, t),
        div: (t, c)=>N(t * _(c, e), e),
        sqrN: (e)=>e * e,
        addN: (e, t)=>e + t,
        subN: (e, t)=>e - t,
        mulN: (e, t)=>e * t,
        inv: (t)=>_(t, e),
        sqrt: a.sqrt || ((e)=>n(d, e)),
        invertBatch: (e)=>V(d, e),
        cmov: (e, t, c)=>c ? t : e,
        toBytes: (e)=>c ? g1(e, r) : p1(e, r),
        fromBytes: (e)=>{
            if (e.length !== r) throw new Error(`Fp.fromBytes: expected ${r}, got ${e.length}`);
            return c ? m1(e) : l1(e);
        }
    });
    return Object.freeze(d);
}
function C(e) {
    if ("bigint" != typeof e) throw new Error("field order must be bigint");
    const t = e.toString(2).length;
    return Math.ceil(t / 8);
}
function Y(e) {
    const t = C(e);
    return t + Math.ceil(t / 2);
}
const L = l1;
function $(e, t) {
    if (e < 0 || e >= 1 << 8 * t) throw new Error(`bad I2OSP call: value=${e} length=${t}`);
    const c = Array.from({
        length: t
    }).fill(0);
    for(let a = t - 1; a >= 0; a--)c[a] = 255 & e, e >>>= 8;
    return new Uint8Array(c);
}
function z(e, t) {
    const c = new Uint8Array(e.length);
    for(let a = 0; a < e.length; a++)c[a] = e[a] ^ t[a];
    return c;
}
function K(e) {
    if (!Number.isSafeInteger(e)) throw new Error("number expected");
}
function k(e, t, c) {
    I(c, {
        DST: "stringOrUint8Array",
        p: "bigint",
        m: "isSafeInteger",
        k: "isSafeInteger",
        hash: "hash"
    });
    const { p: a, k: f, m: r, hash: d, expand: i, DST: o } = c;
    n1(e), K(t);
    const b = "string" == typeof o ? x(o) : o, s = a.toString(2).length, u = Math.ceil((s + f) / 8), l = t * r * u;
    let m;
    if ("xmd" === i) m = function(e, t, c, a) {
        n1(e), n1(t), K(c), t.length > 255 && (t = a(B(x("H2C-OVERSIZE-DST-"), t)));
        const { outputLen: f, blockLen: r } = a, d = Math.ceil(c / f);
        if (d > 255) throw new Error("Invalid xmd length");
        const i = B(t, $(t.length, 1)), o = $(0, r), b = $(c, 2), s = new Array(d), u = a(B(o, e, b, $(0, 1), i));
        s[0] = a(B(u, $(1, 1), i));
        for(let e = 1; e <= d; e++){
            const t = [
                z(u, s[e - 1]),
                $(e + 1, 1),
                i
            ];
            s[e] = a(B(...t));
        }
        return B(...s).slice(0, c);
    }(e, b, l, d);
    else if ("xof" === i) m = function(e, t, c, a, f) {
        if (n1(e), n1(t), K(c), t.length > 255) {
            const e = Math.ceil(2 * a / 8);
            t = f.create({
                dkLen: e
            }).update(x("H2C-OVERSIZE-DST-")).update(t).digest();
        }
        if (c > 65535 || t.length > 255) throw new Error("expand_message_xof: invalid lenInBytes");
        return f.create({
            dkLen: c
        }).update(e).update($(c, 2)).update(t).update($(t.length, 1)).digest();
    }(e, b, l, f, d);
    else {
        if ("_internal_pass" !== i) throw new Error('expand must be "xmd" or "xof"');
        m = e;
    }
    const p = new Array(t);
    for(let e = 0; e < t; e++){
        const t = new Array(r);
        for(let c = 0; c < r; c++){
            const f = u * (c + e * r), n = m.subarray(f, f + u);
            t[c] = N(L(n), a);
        }
        p[e] = t;
    }
    return p;
}
function H(e, t) {
    const c = t.map((e)=>Array.from(e).reverse());
    return (t, a)=>{
        const [f, r, n, d] = c.map((c)=>c.reduce((c, a)=>e.add(e.mul(c, t), a)));
        return t = e.div(f, r), a = e.mul(a, e.div(n, d)), {
            x: t,
            y: a
        };
    };
}
function W(e, t, c) {
    if ("function" != typeof t) throw new Error("mapToCurve() must be defined");
    return {
        hashToCurve (a, f) {
            const r = k(a, 2, {
                ...c,
                DST: c.DST,
                ...f
            }), n = e.fromAffine(t(r[0])), d = e.fromAffine(t(r[1])), i = n.add(d).clearCofactor();
            return i.assertValidity(), i;
        },
        encodeToCurve (a, f) {
            const r = k(a, 1, {
                ...c,
                DST: c.encodeDST,
                ...f
            }), n = e.fromAffine(t(r[0])).clearCofactor();
            return n.assertValidity(), n;
        },
        mapToCurve (c) {
            if (!Array.isArray(c)) throw new Error("mapToCurve: expected array of bigints");
            for (const e of c)if ("bigint" != typeof e) throw new Error(`mapToCurve: expected array of bigints, got ${e} in array`);
            const a = e.fromAffine(t(c)).clearCofactor();
            return a.assertValidity(), a;
        }
    };
}
const X = BigInt(0), J = BigInt(1);
function Q(e) {
    const t = function(e) {
        return G(e.Fp), I(e, {
            n: "bigint",
            h: "bigint",
            Gx: "field",
            Gy: "field"
        }, {
            nBitLength: "isSafeInteger",
            nByteLength: "isSafeInteger"
        }), Object.freeze({
            ...M(e.n, e.nBitLength),
            ...e,
            p: e.Fp.ORDER
        });
    }(e);
    I(t, {
        a: "field",
        b: "field"
    }, {
        allowedPrivateKeyLengths: "array",
        wrapPrivateKey: "boolean",
        isTorsionFree: "function",
        clearCofactor: "function",
        allowInfinityPoint: "boolean",
        fromBytes: "function",
        toBytes: "function"
    });
    const { endo: c, Fp: a, a: f } = t;
    if (c) {
        if (!a.eql(f, a.ZERO)) throw new Error("Endomorphism can only be defined for Koblitz curves that have a=0");
        if ("object" != typeof c || "bigint" != typeof c.beta || "function" != typeof c.splitScalar) throw new Error("Expected endomorphism with beta: bigint and splitScalar: function");
    }
    return Object.freeze({
        ...t
    });
}
const ee = BigInt(0), te = BigInt(1), ce = BigInt(2), ae = BigInt(3), fe = BigInt(4);
function re(e) {
    const t = Q(e), { Fp: c } = t, a = t.toBytes || ((e, t, a)=>{
        const f = t.toAffine();
        return B(Uint8Array.from([
            4
        ]), c.toBytes(f.x), c.toBytes(f.y));
    }), f = t.fromBytes || ((e)=>{
        const t = e.subarray(1);
        return {
            x: c.fromBytes(t.subarray(0, c.BYTES)),
            y: c.fromBytes(t.subarray(c.BYTES, 2 * c.BYTES))
        };
    });
    function n(e) {
        const { a: a, b: f } = t, r = c.sqr(e), n = c.mul(r, e);
        return c.add(c.add(n, c.mul(e, a)), f);
    }
    if (!c.eql(c.sqr(t.Gy), n(t.Gx))) throw new Error("bad generator point: equation left != right");
    function d(e) {
        return "bigint" == typeof e && ee < e && e < t.n;
    }
    function o(e) {
        if (!d(e)) throw new Error("Expected valid bigint: 0 < bigint < curve.n");
    }
    function b(e) {
        const { allowedPrivateKeyLengths: c, nByteLength: a, wrapPrivateKey: f, n: n } = t;
        if (c && "bigint" != typeof e) {
            if (r1(e) && (e = i1(e)), "string" != typeof e || !c.includes(e.length)) throw new Error("Invalid key");
            e = e.padStart(2 * a, "0");
        }
        let d;
        try {
            d = "bigint" == typeof e ? e : l1(y("private key", e, a));
        } catch (t) {
            throw new Error(`private key must be ${a} bytes, hex or bigint, not ${typeof e}`);
        }
        return f && (d = N(d, n)), o(d), d;
    }
    const s = new Map;
    function u(e) {
        if (!(e instanceof m)) throw new Error("ProjectivePoint expected");
    }
    class m {
        constructor(e, t, a){
            if (this.px = e, this.py = t, this.pz = a, null == e || !c.isValid(e)) throw new Error("x required");
            if (null == t || !c.isValid(t)) throw new Error("y required");
            if (null == a || !c.isValid(a)) throw new Error("z required");
        }
        static fromAffine(e) {
            const { x: t, y: a } = e || {};
            if (!e || !c.isValid(t) || !c.isValid(a)) throw new Error("invalid affine point");
            if (e instanceof m) throw new Error("projective point not allowed");
            const f = (e)=>c.eql(e, c.ZERO);
            return f(t) && f(a) ? m.ZERO : new m(t, a, c.ONE);
        }
        get x() {
            return this.toAffine().x;
        }
        get y() {
            return this.toAffine().y;
        }
        static normalizeZ(e) {
            const t = c.invertBatch(e.map((e)=>e.pz));
            return e.map((e, c)=>e.toAffine(t[c])).map(m.fromAffine);
        }
        static fromHex(e) {
            const t = m.fromAffine(f(y("pointHex", e)));
            return t.assertValidity(), t;
        }
        static fromPrivateKey(e) {
            return m.BASE.multiply(b(e));
        }
        _setWindowSize(e) {
            this._WINDOW_SIZE = e, s.delete(this);
        }
        assertValidity() {
            if (this.is0()) {
                if (t.allowInfinityPoint && !c.is0(this.py)) return;
                throw new Error("bad point: ZERO");
            }
            const { x: e, y: a } = this.toAffine();
            if (!c.isValid(e) || !c.isValid(a)) throw new Error("bad point: x or y not FE");
            const f = c.sqr(a), r = n(e);
            if (!c.eql(f, r)) throw new Error("bad point: equation left != right");
            if (!this.isTorsionFree()) throw new Error("bad point: not in prime-order subgroup");
        }
        hasEvenY() {
            const { y: e } = this.toAffine();
            if (c.isOdd) return !c.isOdd(e);
            throw new Error("Field doesn't support isOdd");
        }
        equals(e) {
            u(e);
            const { px: t, py: a, pz: f } = this, { px: r, py: n, pz: d } = e, i = c.eql(c.mul(t, d), c.mul(r, f)), o = c.eql(c.mul(a, d), c.mul(n, f));
            return i && o;
        }
        negate() {
            return new m(this.px, c.neg(this.py), this.pz);
        }
        double() {
            const { a: e, b: a } = t, f = c.mul(a, ae), { px: r, py: n, pz: d } = this;
            let i = c.ZERO, o = c.ZERO, b = c.ZERO, s = c.mul(r, r), u = c.mul(n, n), l = c.mul(d, d), p = c.mul(r, n);
            return p = c.add(p, p), b = c.mul(r, d), b = c.add(b, b), i = c.mul(e, b), o = c.mul(f, l), o = c.add(i, o), i = c.sub(u, o), o = c.add(u, o), o = c.mul(i, o), i = c.mul(p, i), b = c.mul(f, b), l = c.mul(e, l), p = c.sub(s, l), p = c.mul(e, p), p = c.add(p, b), b = c.add(s, s), s = c.add(b, s), s = c.add(s, l), s = c.mul(s, p), o = c.add(o, s), l = c.mul(n, d), l = c.add(l, l), s = c.mul(l, p), i = c.sub(i, s), b = c.mul(l, u), b = c.add(b, b), b = c.add(b, b), new m(i, o, b);
        }
        add(e) {
            u(e);
            const { px: a, py: f, pz: r } = this, { px: n, py: d, pz: i } = e;
            let o = c.ZERO, b = c.ZERO, s = c.ZERO;
            const l = t.a, p = c.mul(t.b, ae);
            let g = c.mul(a, n), y = c.mul(f, d), B = c.mul(r, i), x = c.add(a, f), E = c.add(n, d);
            x = c.mul(x, E), E = c.add(g, y), x = c.sub(x, E), E = c.add(a, r);
            let h = c.add(n, i);
            return E = c.mul(E, h), h = c.add(g, B), E = c.sub(E, h), h = c.add(f, r), o = c.add(d, i), h = c.mul(h, o), o = c.add(y, B), h = c.sub(h, o), s = c.mul(l, E), o = c.mul(p, B), s = c.add(o, s), o = c.sub(y, s), s = c.add(y, s), b = c.mul(o, s), y = c.add(g, g), y = c.add(y, g), B = c.mul(l, B), E = c.mul(p, E), y = c.add(y, B), B = c.sub(g, B), B = c.mul(l, B), E = c.add(E, B), g = c.mul(y, E), b = c.add(b, g), g = c.mul(h, E), o = c.mul(x, o), o = c.sub(o, g), g = c.mul(x, y), s = c.mul(h, s), s = c.add(s, g), new m(o, b, s);
        }
        subtract(e) {
            return this.add(e.negate());
        }
        is0() {
            return this.equals(m.ZERO);
        }
        wNAF(e) {
            return g.wNAFCached(this, s, e, (e)=>{
                const t = c.invertBatch(e.map((e)=>e.pz));
                return e.map((e, c)=>e.toAffine(t[c])).map(m.fromAffine);
            });
        }
        multiplyUnsafe(e) {
            const a = m.ZERO;
            if (e === ee) return a;
            if (o(e), e === te) return this;
            const { endo: f } = t;
            if (!f) return g.unsafeLadder(this, e);
            let { k1neg: r, k1: n, k2neg: d, k2: i } = f.splitScalar(e), b = a, s = a, u = this;
            for(; n > ee || i > ee;)n & te && (b = b.add(u)), i & te && (s = s.add(u)), u = u.double(), n >>= te, i >>= te;
            return r && (b = b.negate()), d && (s = s.negate()), s = new m(c.mul(s.px, f.beta), s.py, s.pz), b.add(s);
        }
        multiply(e) {
            o(e);
            let a, f, r = e;
            const { endo: n } = t;
            if (n) {
                const { k1neg: e, k1: t, k2neg: d, k2: i } = n.splitScalar(r);
                let { p: o, f: b } = this.wNAF(t), { p: s, f: u } = this.wNAF(i);
                o = g.constTimeNegate(e, o), s = g.constTimeNegate(d, s), s = new m(c.mul(s.px, n.beta), s.py, s.pz), a = o.add(s), f = b.add(u);
            } else {
                const { p: e, f: t } = this.wNAF(r);
                a = e, f = t;
            }
            return m.normalizeZ([
                a,
                f
            ])[0];
        }
        multiplyAndAddUnsafe(e, t, c) {
            const a = m.BASE, f = (e, t)=>t !== ee && t !== te && e.equals(a) ? e.multiply(t) : e.multiplyUnsafe(t), r = f(this, t).add(f(e, c));
            return r.is0() ? void 0 : r;
        }
        toAffine(e) {
            const { px: t, py: a, pz: f } = this, r = this.is0();
            null == e && (e = r ? c.ONE : c.inv(f));
            const n = c.mul(t, e), d = c.mul(a, e), i = c.mul(f, e);
            if (r) return {
                x: c.ZERO,
                y: c.ZERO
            };
            if (!c.eql(i, c.ONE)) throw new Error("invZ was invalid");
            return {
                x: n,
                y: d
            };
        }
        isTorsionFree() {
            const { h: e, isTorsionFree: c } = t;
            if (e === te) return !0;
            if (c) return c(m, this);
            throw new Error("isTorsionFree() has not been declared for the elliptic curve");
        }
        clearCofactor() {
            const { h: e, clearCofactor: c } = t;
            return e === te ? this : c ? c(m, this) : this.multiplyUnsafe(t.h);
        }
        toRawBytes(e = !0) {
            return this.assertValidity(), a(m, this, e);
        }
        toHex(e = !0) {
            return i1(this.toRawBytes(e));
        }
    }
    m.BASE = new m(t.Gx, t.Gy, c.ONE), m.ZERO = new m(c.ZERO, c.ONE, c.ZERO);
    const p = t.nBitLength, g = function(e, t) {
        const c = (e, t)=>{
            const c = t.negate();
            return e ? c : t;
        }, a = (e)=>({
                windows: Math.ceil(t / e) + 1,
                windowSize: 2 ** (e - 1)
            });
        return {
            constTimeNegate: c,
            unsafeLadder (t, c) {
                let a = e.ZERO, f = t;
                for(; c > X;)c & J && (a = a.add(f)), f = f.double(), c >>= J;
                return a;
            },
            precomputeWindow (e, t) {
                const { windows: c, windowSize: f } = a(t), r = [];
                let n = e, d = n;
                for(let e = 0; e < c; e++){
                    d = n, r.push(d);
                    for(let e = 1; e < f; e++)d = d.add(n), r.push(d);
                    n = d.double();
                }
                return r;
            },
            wNAF (t, f, r) {
                const { windows: n, windowSize: d } = a(t);
                let i = e.ZERO, o = e.BASE;
                const b = BigInt(2 ** t - 1), s = 2 ** t, u = BigInt(t);
                for(let e = 0; e < n; e++){
                    const t = e * d;
                    let a = Number(r & b);
                    r >>= u, a > d && (a -= s, r += J);
                    const n = t, l = t + Math.abs(a) - 1, m = e % 2 != 0, p = a < 0;
                    0 === a ? o = o.add(c(m, f[n])) : i = i.add(c(p, f[l]));
                }
                return {
                    p: i,
                    f: o
                };
            },
            wNAFCached (e, t, c, a) {
                const f = e._WINDOW_SIZE || 1;
                let r = t.get(e);
                return r || (r = this.precomputeWindow(e, f), 1 !== f && t.set(e, a(r))), this.wNAF(f, r, c);
            }
        };
    }(m, t.endo ? Math.ceil(p / 2) : p);
    return {
        CURVE: t,
        ProjectivePoint: m,
        normPrivateKeyToScalar: b,
        weierstrassEquation: n,
        isWithinCurveOrder: d
    };
}
function ne(e, t) {
    if (G(e), !e.isValid(t.A) || !e.isValid(t.B) || !e.isValid(t.Z)) throw new Error("mapToCurveSimpleSWU: invalid opts");
    const c = function(e, t) {
        const c = e.ORDER;
        let a = ee;
        for(let e = c - te; e % ce === ee; e /= ce)a += te;
        const f = a, r = ce << f - te - te, n = r * ce, d = (c - te) / n, i = (d - te) / ce, o = n - te, b = r, s = e.pow(t, d), u = e.pow(t, (d + te) / ce);
        let l = (t, c)=>{
            let a = s, r = e.pow(c, o), n = e.sqr(r);
            n = e.mul(n, c);
            let d = e.mul(t, n);
            d = e.pow(d, i), d = e.mul(d, r), r = e.mul(d, c), n = e.mul(d, t);
            let l = e.mul(n, r);
            d = e.pow(l, b);
            let m = e.eql(d, e.ONE);
            r = e.mul(n, u), d = e.mul(l, a), n = e.cmov(r, n, m), l = e.cmov(d, l, m);
            for(let t = f; t > te; t--){
                let c = t - ce;
                c = ce << c - te;
                let f = e.pow(l, c);
                const d = e.eql(f, e.ONE);
                r = e.mul(n, a), a = e.mul(a, a), f = e.mul(l, a), n = e.cmov(r, n, d), l = e.cmov(f, l, d);
            }
            return {
                isValid: m,
                value: n
            };
        };
        if (e.ORDER % fe === ae) {
            const c = (e.ORDER - ae) / fe, a = e.sqrt(e.neg(t));
            l = (t, f)=>{
                let r = e.sqr(f);
                const n = e.mul(t, f);
                r = e.mul(r, n);
                let d = e.pow(r, c);
                d = e.mul(d, n);
                const i = e.mul(d, a), o = e.mul(e.sqr(d), f), b = e.eql(o, t);
                return {
                    isValid: b,
                    value: e.cmov(i, d, b)
                };
            };
        }
        return l;
    }(e, t.Z);
    if (!e.isOdd) throw new Error("Fp.isOdd is not implemented!");
    return (a)=>{
        let f, r, n, d, i, o, b, s;
        f = e.sqr(a), f = e.mul(f, t.Z), r = e.sqr(f), r = e.add(r, f), n = e.add(r, e.ONE), n = e.mul(n, t.B), d = e.cmov(t.Z, e.neg(r), !e.eql(r, e.ZERO)), d = e.mul(d, t.A), r = e.sqr(n), o = e.sqr(d), i = e.mul(o, t.A), r = e.add(r, i), r = e.mul(r, n), o = e.mul(o, d), i = e.mul(o, t.B), r = e.add(r, i), b = e.mul(f, n);
        const { isValid: u, value: l } = c(r, o);
        s = e.mul(f, a), s = e.mul(s, l), b = e.cmov(b, n, u), s = e.cmov(s, l, u);
        const m = e.isOdd(a) === e.isOdd(s);
        return s = e.cmov(e.neg(s), s, m), b = e.div(b, d), {
            x: b,
            y: s
        };
    };
}
const de = BigInt(2), ie = BigInt(3);
const oe = BigInt(0), be = BigInt(1), se = BigInt(2), ue = BigInt(3), le = BigInt(4), me = BigInt(8), pe = BigInt(16), ge = BigInt("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaab"), ye = U(ge), Be = U(BigInt("0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001")), xe = ({ c0: e, c1: t }, { c0: c, c1: a })=>({
        c0: ye.add(e, c),
        c1: ye.add(t, a)
    }), Ee = ({ c0: e, c1: t }, { c0: c, c1: a })=>({
        c0: ye.sub(e, c),
        c1: ye.sub(t, a)
    }), he = ({ c0: e, c1: t }, c)=>{
    if ("bigint" == typeof c) return {
        c0: ye.mul(e, c),
        c1: ye.mul(t, c)
    };
    const { c0: a, c1: f } = c;
    let r = ye.mul(e, a), n = ye.mul(t, f);
    return {
        c0: ye.sub(r, n),
        c1: ye.sub(ye.mul(ye.add(e, t), ye.add(a, f)), ye.add(r, n))
    };
}, we = ({ c0: e, c1: t })=>{
    const c = ye.add(e, t), a = ye.sub(e, t), f = ye.add(e, e);
    return {
        c0: ye.mul(c, a),
        c1: ye.mul(f, t)
    };
}, ve = ge * ge, Ie = {
    ORDER: ve,
    BITS: E(ve),
    BYTES: Math.ceil(E(ve) / 8),
    MASK: w(E(ve)),
    ZERO: {
        c0: ye.ZERO,
        c1: ye.ZERO
    },
    ONE: {
        c0: ye.ONE,
        c1: ye.ZERO
    },
    create: (e)=>e,
    isValid: ({ c0: e, c1: t })=>"bigint" == typeof e && "bigint" == typeof t,
    is0: ({ c0: e, c1: t })=>ye.is0(e) && ye.is0(t),
    eql: ({ c0: e, c1: t }, { c0: c, c1: a })=>ye.eql(e, c) && ye.eql(t, a),
    neg: ({ c0: e, c1: t })=>({
            c0: ye.neg(e),
            c1: ye.neg(t)
        }),
    pow: (e, t)=>D(Ie, e, t),
    invertBatch: (e)=>V(Ie, e),
    add: xe,
    sub: Ee,
    mul: he,
    sqr: we,
    addN: xe,
    subN: Ee,
    mulN: he,
    sqrN: we,
    div: (e, t)=>Ie.mul(e, "bigint" == typeof t ? ye.inv(ye.create(t)) : Ie.inv(t)),
    inv: ({ c0: e, c1: t })=>{
        const c = ye.inv(ye.create(e * e + t * t));
        return {
            c0: ye.mul(c, ye.create(e)),
            c1: ye.mul(c, ye.create(-t))
        };
    },
    sqrt: (e)=>{
        if (Ie.eql(e, Ie.ZERO)) return Ie.ZERO;
        const t = Ie.pow(e, (Ie.ORDER + me) / pe), c = Ie.div(Ie.sqr(t), e), a = Re, f = [
            a[0],
            a[2],
            a[4],
            a[6]
        ].find((e)=>Ie.eql(e, c));
        if (!f) throw new Error("No root");
        const r = a.indexOf(f), n = a[r / 2];
        if (!n) throw new Error("Invalid root");
        const d = Ie.div(t, n), i = Ie.neg(d), { re: o, im: b } = Ie.reim(d), { re: s, im: u } = Ie.reim(i);
        return b > u || b === u && o > s ? d : i;
    },
    isOdd: (e)=>{
        const { re: t, im: c } = Ie.reim(e);
        return BigInt(t % se || t === oe && c % se) == be;
    },
    fromBytes (e) {
        if (e.length !== Ie.BYTES) throw new Error(`fromBytes wrong length=${e.length}`);
        return {
            c0: ye.fromBytes(e.subarray(0, ye.BYTES)),
            c1: ye.fromBytes(e.subarray(ye.BYTES))
        };
    },
    toBytes: ({ c0: e, c1: t })=>B(ye.toBytes(e), ye.toBytes(t)),
    cmov: ({ c0: e, c1: t }, { c0: c, c1: a }, f)=>({
            c0: ye.cmov(e, c, f),
            c1: ye.cmov(t, a, f)
        }),
    reim: ({ c0: e, c1: t })=>({
            re: e,
            im: t
        }),
    mulByNonresidue: ({ c0: e, c1: t })=>({
            c0: ye.sub(e, t),
            c1: ye.add(e, t)
        }),
    multiplyByB: ({ c0: e, c1: t })=>{
        let c = ye.mul(e, le), a = ye.mul(t, le);
        return {
            c0: ye.sub(c, a),
            c1: ye.add(c, a)
        };
    },
    fromBigTuple: (e)=>{
        if (2 !== e.length) throw new Error("Invalid tuple");
        const t = e.map((e)=>ye.create(e));
        return {
            c0: t[0],
            c1: t[1]
        };
    },
    frobeniusMap: ({ c0: e, c1: t }, c)=>({
            c0: e,
            c1: ye.mul(t, Oe[c % 2])
        })
}, Oe = [
    BigInt("0x1"),
    BigInt("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaa")
].map((e)=>ye.create(e)), Se = BigInt("0x6af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09"), Re = [
    [
        be,
        oe
    ],
    [
        Se,
        -Se
    ],
    [
        oe,
        be
    ],
    [
        Se,
        Se
    ],
    [
        -be,
        oe
    ],
    [
        -Se,
        Se
    ],
    [
        oe,
        -be
    ],
    [
        -Se,
        -Se
    ]
].map((e)=>Ie.fromBigTuple(e)), qe = ({ c0: e, c1: t, c2: c }, { c0: a, c1: f, c2: r })=>({
        c0: Ie.add(e, a),
        c1: Ie.add(t, f),
        c2: Ie.add(c, r)
    }), Pe = ({ c0: e, c1: t, c2: c }, { c0: a, c1: f, c2: r })=>({
        c0: Ie.sub(e, a),
        c1: Ie.sub(t, f),
        c2: Ie.sub(c, r)
    }), Te = ({ c0: e, c1: t, c2: c }, a)=>{
    if ("bigint" == typeof a) return {
        c0: Ie.mul(e, a),
        c1: Ie.mul(t, a),
        c2: Ie.mul(c, a)
    };
    const { c0: f, c1: r, c2: n } = a, d = Ie.mul(e, f), i = Ie.mul(t, r), o = Ie.mul(c, n);
    return {
        c0: Ie.add(d, Ie.mulByNonresidue(Ie.sub(Ie.mul(Ie.add(t, c), Ie.add(r, n)), Ie.add(i, o)))),
        c1: Ie.add(Ie.sub(Ie.mul(Ie.add(e, t), Ie.add(f, r)), Ie.add(d, i)), Ie.mulByNonresidue(o)),
        c2: Ie.sub(Ie.add(i, Ie.mul(Ie.add(e, c), Ie.add(f, n))), Ie.add(d, o))
    };
}, Ae = ({ c0: e, c1: t, c2: c })=>{
    let a = Ie.sqr(e), f = Ie.mul(Ie.mul(e, t), se), r = Ie.mul(Ie.mul(t, c), se), n = Ie.sqr(c);
    return {
        c0: Ie.add(Ie.mulByNonresidue(r), a),
        c1: Ie.add(Ie.mulByNonresidue(n), f),
        c2: Ie.sub(Ie.sub(Ie.add(Ie.add(f, Ie.sqr(Ie.add(Ie.sub(e, t), c))), r), a), n)
    };
}, Ne = {
    ORDER: Ie.ORDER,
    BITS: 3 * Ie.BITS,
    BYTES: 3 * Ie.BYTES,
    MASK: w(3 * Ie.BITS),
    ZERO: {
        c0: Ie.ZERO,
        c1: Ie.ZERO,
        c2: Ie.ZERO
    },
    ONE: {
        c0: Ie.ONE,
        c1: Ie.ZERO,
        c2: Ie.ZERO
    },
    create: (e)=>e,
    isValid: ({ c0: e, c1: t, c2: c })=>Ie.isValid(e) && Ie.isValid(t) && Ie.isValid(c),
    is0: ({ c0: e, c1: t, c2: c })=>Ie.is0(e) && Ie.is0(t) && Ie.is0(c),
    neg: ({ c0: e, c1: t, c2: c })=>({
            c0: Ie.neg(e),
            c1: Ie.neg(t),
            c2: Ie.neg(c)
        }),
    eql: ({ c0: e, c1: t, c2: c }, { c0: a, c1: f, c2: r })=>Ie.eql(e, a) && Ie.eql(t, f) && Ie.eql(c, r),
    sqrt: ()=>{
        throw new Error("Not implemented");
    },
    div: (e, t)=>Ne.mul(e, "bigint" == typeof t ? ye.inv(ye.create(t)) : Ne.inv(t)),
    pow: (e, t)=>D(Ne, e, t),
    invertBatch: (e)=>V(Ne, e),
    add: qe,
    sub: Pe,
    mul: Te,
    sqr: Ae,
    addN: qe,
    subN: Pe,
    mulN: Te,
    sqrN: Ae,
    inv: ({ c0: e, c1: t, c2: c })=>{
        let a = Ie.sub(Ie.sqr(e), Ie.mulByNonresidue(Ie.mul(c, t))), f = Ie.sub(Ie.mulByNonresidue(Ie.sqr(c)), Ie.mul(e, t)), r = Ie.sub(Ie.sqr(t), Ie.mul(e, c)), n = Ie.inv(Ie.add(Ie.mulByNonresidue(Ie.add(Ie.mul(c, f), Ie.mul(t, r))), Ie.mul(e, a)));
        return {
            c0: Ie.mul(n, a),
            c1: Ie.mul(n, f),
            c2: Ie.mul(n, r)
        };
    },
    fromBytes: (e)=>{
        if (e.length !== Ne.BYTES) throw new Error(`fromBytes wrong length=${e.length}`);
        return {
            c0: Ie.fromBytes(e.subarray(0, Ie.BYTES)),
            c1: Ie.fromBytes(e.subarray(Ie.BYTES, 2 * Ie.BYTES)),
            c2: Ie.fromBytes(e.subarray(2 * Ie.BYTES))
        };
    },
    toBytes: ({ c0: e, c1: t, c2: c })=>B(Ie.toBytes(e), Ie.toBytes(t), Ie.toBytes(c)),
    cmov: ({ c0: e, c1: t, c2: c }, { c0: a, c1: f, c2: r }, n)=>({
            c0: Ie.cmov(e, a, n),
            c1: Ie.cmov(t, f, n),
            c2: Ie.cmov(c, r, n)
        }),
    fromBigSix: (e)=>{
        if (!Array.isArray(e) || 6 !== e.length) throw new Error("Invalid Fp6 usage");
        return {
            c0: Ie.fromBigTuple(e.slice(0, 2)),
            c1: Ie.fromBigTuple(e.slice(2, 4)),
            c2: Ie.fromBigTuple(e.slice(4, 6))
        };
    },
    frobeniusMap: ({ c0: e, c1: t, c2: c }, a)=>({
            c0: Ie.frobeniusMap(e, a),
            c1: Ie.mul(Ie.frobeniusMap(t, a), Ze[a % 6]),
            c2: Ie.mul(Ie.frobeniusMap(c, a), _e[a % 6])
        }),
    mulByNonresidue: ({ c0: e, c1: t, c2: c })=>({
            c0: Ie.mulByNonresidue(c),
            c1: e,
            c2: t
        }),
    multiplyBy1: ({ c0: e, c1: t, c2: c }, a)=>({
            c0: Ie.mulByNonresidue(Ie.mul(c, a)),
            c1: Ie.mul(e, a),
            c2: Ie.mul(t, a)
        }),
    multiplyBy01 ({ c0: e, c1: t, c2: c }, a, f) {
        let r = Ie.mul(e, a), n = Ie.mul(t, f);
        return {
            c0: Ie.add(Ie.mulByNonresidue(Ie.sub(Ie.mul(Ie.add(t, c), f), n)), r),
            c1: Ie.sub(Ie.sub(Ie.mul(Ie.add(a, f), Ie.add(e, t)), r), n),
            c2: Ie.add(Ie.sub(Ie.mul(Ie.add(e, c), a), r), n)
        };
    },
    multiplyByFp2: ({ c0: e, c1: t, c2: c }, a)=>({
            c0: Ie.mul(e, a),
            c1: Ie.mul(t, a),
            c2: Ie.mul(c, a)
        })
}, Ze = [
    [
        BigInt("0x1"),
        BigInt("0x0")
    ],
    [
        BigInt("0x0"),
        BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaac")
    ],
    [
        BigInt("0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe"),
        BigInt("0x0")
    ],
    [
        BigInt("0x0"),
        BigInt("0x1")
    ],
    [
        BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaac"),
        BigInt("0x0")
    ],
    [
        BigInt("0x0"),
        BigInt("0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe")
    ]
].map((e)=>Ie.fromBigTuple(e)), _e = [
    [
        BigInt("0x1"),
        BigInt("0x0")
    ],
    [
        BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaad"),
        BigInt("0x0")
    ],
    [
        BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaac"),
        BigInt("0x0")
    ],
    [
        BigInt("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaa"),
        BigInt("0x0")
    ],
    [
        BigInt("0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe"),
        BigInt("0x0")
    ],
    [
        BigInt("0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffff"),
        BigInt("0x0")
    ]
].map((e)=>Ie.fromBigTuple(e)), je = BigInt("0xd201000000010000"), Fe = E(je), Ge = ({ c0: e, c1: t }, { c0: c, c1: a })=>({
        c0: Ne.add(e, c),
        c1: Ne.add(t, a)
    }), De = ({ c0: e, c1: t }, { c0: c, c1: a })=>({
        c0: Ne.sub(e, c),
        c1: Ne.sub(t, a)
    }), Ve = ({ c0: e, c1: t }, c)=>{
    if ("bigint" == typeof c) return {
        c0: Ne.mul(e, c),
        c1: Ne.mul(t, c)
    };
    let { c0: a, c1: f } = c, r = Ne.mul(e, a), n = Ne.mul(t, f);
    return {
        c0: Ne.add(r, Ne.mulByNonresidue(n)),
        c1: Ne.sub(Ne.mul(Ne.add(e, t), Ne.add(a, f)), Ne.add(r, n))
    };
}, Me = ({ c0: e, c1: t })=>{
    let c = Ne.mul(e, t);
    return {
        c0: Ne.sub(Ne.sub(Ne.mul(Ne.add(Ne.mulByNonresidue(t), e), Ne.add(e, t)), c), Ne.mulByNonresidue(c)),
        c1: Ne.add(c, c)
    };
};
function Ue(e, t) {
    const c = Ie.sqr(e), a = Ie.sqr(t);
    return {
        first: Ie.add(Ie.mulByNonresidue(a), c),
        second: Ie.sub(Ie.sub(Ie.sqr(Ie.add(e, t)), c), a)
    };
}
const Ce = {
    ORDER: Ie.ORDER,
    BITS: 2 * Ie.BITS,
    BYTES: 2 * Ie.BYTES,
    MASK: w(2 * Ie.BITS),
    ZERO: {
        c0: Ne.ZERO,
        c1: Ne.ZERO
    },
    ONE: {
        c0: Ne.ONE,
        c1: Ne.ZERO
    },
    create: (e)=>e,
    isValid: ({ c0: e, c1: t })=>Ne.isValid(e) && Ne.isValid(t),
    is0: ({ c0: e, c1: t })=>Ne.is0(e) && Ne.is0(t),
    neg: ({ c0: e, c1: t })=>({
            c0: Ne.neg(e),
            c1: Ne.neg(t)
        }),
    eql: ({ c0: e, c1: t }, { c0: c, c1: a })=>Ne.eql(e, c) && Ne.eql(t, a),
    sqrt: ()=>{
        throw new Error("Not implemented");
    },
    inv: ({ c0: e, c1: t })=>{
        let c = Ne.inv(Ne.sub(Ne.sqr(e), Ne.mulByNonresidue(Ne.sqr(t))));
        return {
            c0: Ne.mul(e, c),
            c1: Ne.neg(Ne.mul(t, c))
        };
    },
    div: (e, t)=>Ce.mul(e, "bigint" == typeof t ? ye.inv(ye.create(t)) : Ce.inv(t)),
    pow: (e, t)=>D(Ce, e, t),
    invertBatch: (e)=>V(Ce, e),
    add: Ge,
    sub: De,
    mul: Ve,
    sqr: Me,
    addN: Ge,
    subN: De,
    mulN: Ve,
    sqrN: Me,
    fromBytes: (e)=>{
        if (e.length !== Ce.BYTES) throw new Error(`fromBytes wrong length=${e.length}`);
        return {
            c0: Ne.fromBytes(e.subarray(0, Ne.BYTES)),
            c1: Ne.fromBytes(e.subarray(Ne.BYTES))
        };
    },
    toBytes: ({ c0: e, c1: t })=>B(Ne.toBytes(e), Ne.toBytes(t)),
    cmov: ({ c0: e, c1: t }, { c0: c, c1: a }, f)=>({
            c0: Ne.cmov(e, c, f),
            c1: Ne.cmov(t, a, f)
        }),
    fromBigTwelve: (e)=>({
            c0: Ne.fromBigSix(e.slice(0, 6)),
            c1: Ne.fromBigSix(e.slice(6, 12))
        }),
    frobeniusMap (e, t) {
        const c = Ne.frobeniusMap(e.c0, t), { c0: a, c1: f, c2: r } = Ne.frobeniusMap(e.c1, t), n = Ye[t % 12];
        return {
            c0: c,
            c1: Ne.create({
                c0: Ie.mul(a, n),
                c1: Ie.mul(f, n),
                c2: Ie.mul(r, n)
            })
        };
    },
    multiplyBy014: ({ c0: e, c1: t }, c, a, f)=>{
        let r = Ne.multiplyBy01(e, c, a), n = Ne.multiplyBy1(t, f);
        return {
            c0: Ne.add(Ne.mulByNonresidue(n), r),
            c1: Ne.sub(Ne.sub(Ne.multiplyBy01(Ne.add(t, e), c, Ie.add(a, f)), r), n)
        };
    },
    multiplyByFp2: ({ c0: e, c1: t }, c)=>({
            c0: Ne.multiplyByFp2(e, c),
            c1: Ne.multiplyByFp2(t, c)
        }),
    conjugate: ({ c0: e, c1: t })=>({
            c0: e,
            c1: Ne.neg(t)
        }),
    _cyclotomicSquare: ({ c0: e, c1: t })=>{
        const { c0: c, c1: a, c2: f } = e, { c0: r, c1: n, c2: d } = t, { first: i, second: o } = Ue(c, n), { first: b, second: s } = Ue(r, f), { first: u, second: l } = Ue(a, d);
        let m = Ie.mulByNonresidue(l);
        return {
            c0: Ne.create({
                c0: Ie.add(Ie.mul(Ie.sub(i, c), se), i),
                c1: Ie.add(Ie.mul(Ie.sub(b, a), se), b),
                c2: Ie.add(Ie.mul(Ie.sub(u, f), se), u)
            }),
            c1: Ne.create({
                c0: Ie.add(Ie.mul(Ie.add(m, r), se), m),
                c1: Ie.add(Ie.mul(Ie.add(o, n), se), o),
                c2: Ie.add(Ie.mul(Ie.add(s, d), se), s)
            })
        };
    },
    _cyclotomicExp (e, t) {
        let c = Ce.ONE;
        for(let a = Fe - 1; a >= 0; a--)c = Ce._cyclotomicSquare(c), h1(t, a) && (c = Ce.mul(c, e));
        return c;
    },
    finalExponentiate: (e)=>{
        const t = je, c = Ce.div(Ce.frobeniusMap(e, 6), e), a = Ce.mul(Ce.frobeniusMap(c, 2), c), f = Ce.conjugate(Ce._cyclotomicExp(a, t)), r = Ce.mul(Ce.conjugate(Ce._cyclotomicSquare(a)), f), n = Ce.conjugate(Ce._cyclotomicExp(r, t)), d = Ce.conjugate(Ce._cyclotomicExp(n, t)), i = Ce.mul(Ce.conjugate(Ce._cyclotomicExp(d, t)), Ce._cyclotomicSquare(f)), o = Ce.conjugate(Ce._cyclotomicExp(i, t)), b = Ce.frobeniusMap(Ce.mul(f, d), 2), s = Ce.frobeniusMap(Ce.mul(n, a), 3), u = Ce.frobeniusMap(Ce.mul(i, Ce.conjugate(a)), 1), l = Ce.mul(Ce.mul(o, Ce.conjugate(r)), a);
        return Ce.mul(Ce.mul(Ce.mul(b, s), u), l);
    }
}, Ye = [
    [
        BigInt("0x1"),
        BigInt("0x0")
    ],
    [
        BigInt("0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8"),
        BigInt("0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3")
    ],
    [
        BigInt("0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffeffff"),
        BigInt("0x0")
    ],
    [
        BigInt("0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2"),
        BigInt("0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09")
    ],
    [
        BigInt("0x00000000000000005f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe"),
        BigInt("0x0")
    ],
    [
        BigInt("0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995"),
        BigInt("0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116")
    ],
    [
        BigInt("0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaaaa"),
        BigInt("0x0")
    ],
    [
        BigInt("0x00fc3e2b36c4e03288e9e902231f9fb854a14787b6c7b36fec0c8ec971f63c5f282d5ac14d6c7ec22cf78a126ddc4af3"),
        BigInt("0x1904d3bf02bb0667c231beb4202c0d1f0fd603fd3cbd5f4f7b2443d784bab9c4f67ea53d63e7813d8d0775ed92235fb8")
    ],
    [
        BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaac"),
        BigInt("0x0")
    ],
    [
        BigInt("0x06af0e0437ff400b6831e36d6bd17ffe48395dabc2d3435e77f76e17009241c5ee67992f72ec05f4c81084fbede3cc09"),
        BigInt("0x135203e60180a68ee2e9c448d77a2cd91c3dedd930b1cf60ef396489f61eb45e304466cf3e67fa0af1ee7b04121bdea2")
    ],
    [
        BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaad"),
        BigInt("0x0")
    ],
    [
        BigInt("0x05b2cfd9013a5fd8df47fa6b48b1e045f39816240c0b8fee8beadf4d8e9c0566c63a3e6e257f87329b18fae980078116"),
        BigInt("0x144e4211384586c16bd3ad4afa99cc9170df3560e77982d0db45f3536814f0bd5871c1908bd478cd1ee605167ff82995")
    ]
].map((e)=>Ie.fromBigTuple(e)), Le = H(Ie, [
    [
        [
            "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6",
            "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97d6"
        ],
        [
            "0x0",
            "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71a"
        ],
        [
            "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71e",
            "0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38d"
        ],
        [
            "0x171d6541fa38ccfaed6dea691f5fb614cb14b4e7f4e810aa22d6108f142b85757098e38d0f671c7188e2aaaaaaaa5ed1",
            "0x0"
        ]
    ],
    [
        [
            "0x0",
            "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa63"
        ],
        [
            "0xc",
            "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa9f"
        ],
        [
            "0x1",
            "0x0"
        ]
    ],
    [
        [
            "0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706",
            "0x1530477c7ab4113b59a4c18b076d11930f7da5d4a07f649bf54439d87d27e500fc8c25ebf8c92f6812cfc71c71c6d706"
        ],
        [
            "0x0",
            "0x5c759507e8e333ebb5b7a9a47d7ed8532c52d39fd3a042a88b58423c50ae15d5c2638e343d9c71c6238aaaaaaaa97be"
        ],
        [
            "0x11560bf17baa99bc32126fced787c88f984f87adf7ae0c7f9a208c6b4f20a4181472aaa9cb8d555526a9ffffffffc71c",
            "0x8ab05f8bdd54cde190937e76bc3e447cc27c3d6fbd7063fcd104635a790520c0a395554e5c6aaaa9354ffffffffe38f"
        ],
        [
            "0x124c9ad43b6cf79bfbf7043de3811ad0761b0f37a1e26286b0e977c69aa274524e79097a56dc4bd9e1b371c71c718b10",
            "0x0"
        ]
    ],
    [
        [
            "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fb",
            "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa8fb"
        ],
        [
            "0x0",
            "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffa9d3"
        ],
        [
            "0x12",
            "0x1a0111ea397fe69a4b1ba7b6434bacd764774b84f38512bf6730d2a0f6b0f6241eabfffeb153ffffb9feffffffffaa99"
        ],
        [
            "0x1",
            "0x0"
        ]
    ]
].map((e)=>e.map((e)=>Ie.fromBigTuple(e.map(BigInt))))), $e = H(ye, [
    [
        "0x11a05f2b1e833340b809101dd99815856b303e88a2d7005ff2627b56cdb4e2c85610c2d5f2e62d6eaeac1662734649b7",
        "0x17294ed3e943ab2f0588bab22147a81c7c17e75b2f6a8417f565e33c70d1e86b4838f2a6f318c356e834eef1b3cb83bb",
        "0xd54005db97678ec1d1048c5d10a9a1bce032473295983e56878e501ec68e25c958c3e3d2a09729fe0179f9dac9edcb0",
        "0x1778e7166fcc6db74e0609d307e55412d7f5e4656a8dbf25f1b33289f1b330835336e25ce3107193c5b388641d9b6861",
        "0xe99726a3199f4436642b4b3e4118e5499db995a1257fb3f086eeb65982fac18985a286f301e77c451154ce9ac8895d9",
        "0x1630c3250d7313ff01d1201bf7a74ab5db3cb17dd952799b9ed3ab9097e68f90a0870d2dcae73d19cd13c1c66f652983",
        "0xd6ed6553fe44d296a3726c38ae652bfb11586264f0f8ce19008e218f9c86b2a8da25128c1052ecaddd7f225a139ed84",
        "0x17b81e7701abdbe2e8743884d1117e53356de5ab275b4db1a682c62ef0f2753339b7c8f8c8f475af9ccb5618e3f0c88e",
        "0x80d3cf1f9a78fc47b90b33563be990dc43b756ce79f5574a2c596c928c5d1de4fa295f296b74e956d71986a8497e317",
        "0x169b1f8e1bcfa7c42e0c37515d138f22dd2ecb803a0c5c99676314baf4bb1b7fa3190b2edc0327797f241067be390c9e",
        "0x10321da079ce07e272d8ec09d2565b0dfa7dccdde6787f96d50af36003b14866f69b771f8c285decca67df3f1605fb7b",
        "0x6e08c248e260e70bd1e962381edee3d31d79d7e22c837bc23c0bf1bc24c6b68c24b1b80b64d391fa9c8ba2e8ba2d229"
    ],
    [
        "0x8ca8d548cff19ae18b2e62f4bd3fa6f01d5ef4ba35b48ba9c9588617fc8ac62b558d681be343df8993cf9fa40d21b1c",
        "0x12561a5deb559c4348b4711298e536367041e8ca0cf0800c0126c2588c48bf5713daa8846cb026e9e5c8276ec82b3bff",
        "0xb2962fe57a3225e8137e629bff2991f6f89416f5a718cd1fca64e00b11aceacd6a3d0967c94fedcfcc239ba5cb83e19",
        "0x3425581a58ae2fec83aafef7c40eb545b08243f16b1655154cca8abc28d6fd04976d5243eecf5c4130de8938dc62cd8",
        "0x13a8e162022914a80a6f1d5f43e7a07dffdfc759a12062bb8d6b44e833b306da9bd29ba81f35781d539d395b3532a21e",
        "0xe7355f8e4e667b955390f7f0506c6e9395735e9ce9cad4d0a43bcef24b8982f7400d24bc4228f11c02df9a29f6304a5",
        "0x772caacf16936190f3e0c63e0596721570f5799af53a1894e2e073062aede9cea73b3538f0de06cec2574496ee84a3a",
        "0x14a7ac2a9d64a8b230b3f5b074cf01996e7f63c21bca68a81996e1cdf9822c580fa5b9489d11e2d311f7d99bbdcc5a5e",
        "0xa10ecf6ada54f825e920b3dafc7a3cce07f8d1d7161366b74100da67f39883503826692abba43704776ec3a79a1d641",
        "0x95fc13ab9e92ad4476d6e3eb3a56680f682b4ee96f7d03776df533978f31c1593174e4b4b7865002d6384d168ecdd0a",
        "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
    ],
    [
        "0x90d97c81ba24ee0259d1f094980dcfa11ad138e48a869522b52af6c956543d3cd0c7aee9b3ba3c2be9845719707bb33",
        "0x134996a104ee5811d51036d776fb46831223e96c254f383d0f906343eb67ad34d6c56711962fa8bfe097e75a2e41c696",
        "0xcc786baa966e66f4a384c86a3b49942552e2d658a31ce2c344be4b91400da7d26d521628b00523b8dfe240c72de1f6",
        "0x1f86376e8981c217898751ad8746757d42aa7b90eeb791c09e4a3ec03251cf9de405aba9ec61deca6355c77b0e5f4cb",
        "0x8cc03fdefe0ff135caf4fe2a21529c4195536fbe3ce50b879833fd221351adc2ee7f8dc099040a841b6daecf2e8fedb",
        "0x16603fca40634b6a2211e11db8f0a6a074a7d0d4afadb7bd76505c3d3ad5544e203f6326c95a807299b23ab13633a5f0",
        "0x4ab0b9bcfac1bbcb2c977d027796b3ce75bb8ca2be184cb5231413c4d634f3747a87ac2460f415ec961f8855fe9d6f2",
        "0x987c8d5333ab86fde9926bd2ca6c674170a05bfe3bdd81ffd038da6c26c842642f64550fedfe935a15e4ca31870fb29",
        "0x9fc4018bd96684be88c9e221e4da1bb8f3abd16679dc26c1e8b6e6a1f20cabe69d65201c78607a360370e577bdba587",
        "0xe1bba7a1186bdb5223abde7ada14a23c42a0ca7915af6fe06985e7ed1e4d43b9b3f7055dd4eba6f2bafaaebca731c30",
        "0x19713e47937cd1be0dfd0b8f1d43fb93cd2fcbcb6caf493fd1183e416389e61031bf3a5cce3fbafce813711ad011c132",
        "0x18b46a908f36f6deb918c143fed2edcc523559b8aaf0c2462e6bfe7f911f643249d9cdf41b44d606ce07c8a4d0074d8e",
        "0xb182cac101b9399d155096004f53f447aa7b12a3426b08ec02710e807b4633f06c851c1919211f20d4c04f00b971ef8",
        "0x245a394ad1eca9b72fc00ae7be315dc757b3b080d4c158013e6632d3c40659cc6cf90ad1c232a6442d9d3f5db980133",
        "0x5c129645e44cf1102a159f748c4a3fc5e673d81d7e86568d9ab0f5d396a7ce46ba1049b6579afb7866b1e715475224b",
        "0x15e6be4e990f03ce4ea50b3b42df2eb5cb181d8f84965a3957add4fa95af01b2b665027efec01c7704b456be69c8b604"
    ],
    [
        "0x16112c4c3a9c98b252181140fad0eae9601a6de578980be6eec3232b5be72e7a07f3688ef60c206d01479253b03663c1",
        "0x1962d75c2381201e1a0cbd6c43c348b885c84ff731c4d59ca4a10356f453e01f78a4260763529e3532f6102c2e49a03d",
        "0x58df3306640da276faaae7d6e8eb15778c4855551ae7f310c35a5dd279cd2eca6757cd636f96f891e2538b53dbf67f2",
        "0x16b7d288798e5395f20d23bf89edb4d1d115c5dbddbcd30e123da489e726af41727364f2c28297ada8d26d98445f5416",
        "0xbe0e079545f43e4b00cc912f8228ddcc6d19c9f0f69bbb0542eda0fc9dec916a20b15dc0fd2ededda39142311a5001d",
        "0x8d9e5297186db2d9fb266eaac783182b70152c65550d881c5ecd87b6f0f5a6449f38db9dfa9cce202c6477faaf9b7ac",
        "0x166007c08a99db2fc3ba8734ace9824b5eecfdfa8d0cf8ef5dd365bc400a0051d5fa9c01a58b1fb93d1a1399126a775c",
        "0x16a3ef08be3ea7ea03bcddfabba6ff6ee5a4375efa1f4fd7feb34fd206357132b920f5b00801dee460ee415a15812ed9",
        "0x1866c8ed336c61231a1be54fd1d74cc4f9fb0ce4c6af5920abc5750c4bf39b4852cfe2f7bb9248836b233d9d55535d4a",
        "0x167a55cda70a6e1cea820597d94a84903216f763e13d87bb5308592e7ea7d4fbc7385ea3d529b35e346ef48bb8913f55",
        "0x4d2f259eea405bd48f010a01ad2911d9c6dd039bb61a6290e591b36e636a5c871a5c29f4f83060400f8b49cba8f6aa8",
        "0xaccbb67481d033ff5852c1e48c50c477f94ff8aefce42d28c0f9a88cea7913516f968986f7ebbea9684b529e2561092",
        "0xad6b9514c767fe3c3613144b45f1496543346d98adf02267d5ceef9a00d9b8693000763e3b90ac11e99b138573345cc",
        "0x2660400eb2e4f3b628bdd0d53cd76f2bf565b94e72927c1cb748df27942480e420517bd8714cc80d1fadc1326ed06f7",
        "0xe0fa1d816ddc03e6b24255e0d7819c171c40f65e273b853324efcd6356caa205ca2f570f13497804415473a1d634b8f",
        "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"
    ]
].map((e)=>e.map((e)=>BigInt(e)))), ze = ne(Ie, {
    A: Ie.create({
        c0: ye.create(oe),
        c1: ye.create(BigInt(240))
    }),
    B: Ie.create({
        c0: ye.create(BigInt(1012)),
        c1: ye.create(BigInt(1012))
    }),
    Z: Ie.create({
        c0: ye.create(BigInt(-2)),
        c1: ye.create(BigInt(-1))
    })
}), Ke = ne(ye, {
    A: ye.create(BigInt("0x144698a3b8e9433d693a02c96d4982b0ea985383ee66a8d8e8981aefd881ac98936f8da0e0f97f5cf428082d584c1d")),
    B: ye.create(BigInt("0x12e2908d11688030018b12e8753eee3b2016c1f0f24f4070a0b9c14fcef35ef55a23215a316ceaa5d1cc48e98e172be0")),
    Z: ye.create(BigInt(11))
}), ke = Ne.create({
    c0: Ie.ZERO,
    c1: Ie.ONE,
    c2: Ie.ZERO
}), He = Ce.create({
    c0: ke,
    c1: Ne.ZERO
}), We = Ce.create({
    c0: Ne.ZERO,
    c1: ke
}), [Xe, Je] = Ce.invertBatch([
    He,
    We
]);
function Qe(e, t) {
    const c = t.toAffine(), a = (f = c.x, r = c.y, [
        Ce.mul(Ce.frobeniusMap(Ce.multiplyByFp2(Xe, f), 1), He).c0.c0,
        Ce.mul(Ce.frobeniusMap(Ce.multiplyByFp2(Je, r), 1), We).c0.c0
    ]);
    var f, r;
    return new e(a[0], a[1], Ie.ONE);
}
const et = BigInt("0x1a0111ea397fe699ec02408663d4de85aa0d857d89759ad4897d29650fb85f9b409427eb4f49fffd8bfd00000000aaac");
function tt(e, t) {
    const c = t.toAffine(), a = (f = c.x, r = c.y, [
        Ie.mul(f, et),
        Ie.neg(r)
    ]);
    var f, r;
    return new e(a[0], a[1], Ie.ONE);
}
const ct = Object.freeze({
    DST: "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_",
    encodeDST: "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_",
    p: ye.ORDER,
    m: 2,
    k: 128,
    expand: "xmd",
    hash: d
}), at = rt(ye.toBytes(oe), {
    infinity: !0,
    compressed: !0
});
function ft(e) {
    const t = 224 & (e = e.slice())[0], c = !!(t >> 7 & 1), a = !!(t >> 6 & 1), f = !!(t >> 5 & 1);
    return e[0] &= 31, {
        compressed: c,
        infinity: a,
        sort: f,
        value: e
    };
}
function rt(e, t) {
    if (224 & e[0]) throw new Error("setMask: non-empty mask");
    return t.compressed && (e[0] |= 128), t.infinity && (e[0] |= 64), t.sort && (e[0] |= 32), e;
}
function nt(e) {
    e.assertValidity();
    const t = e.equals(it.G1.ProjectivePoint.ZERO), { x: c, y: a } = e.toAffine();
    if (t) return at.slice();
    const f = ye.ORDER, r = Boolean(a * se / f);
    return rt(p1(c, ye.BYTES), {
        compressed: !0,
        sort: r
    });
}
function dt(e) {
    e.assertValidity();
    const t = ye.BYTES;
    if (e.equals(it.G2.ProjectivePoint.ZERO)) return B(at, p1(oe, t));
    const { x: c, y: a } = e.toAffine(), { re: f, im: r } = Ie.reim(c), { re: n, im: d } = Ie.reim(a), i = Boolean((d > oe ? d * se : n * se) / ye.ORDER & be), o = f;
    return B(rt(p1(r, t), {
        sort: i,
        compressed: !0
    }), p1(o, t));
}
const it = function(e) {
    const { Fp: t, Fr: c, Fp2: a, Fp6: f, Fp12: r } = e.fields, n = E(e.params.x);
    function d(t) {
        const { x: c, y: f } = t, r = c, d = f;
        let i = r, o = d, b = a.ONE, s = [];
        for(let t = n - 2; t >= 0; t--){
            let c = a.sqr(o), f = a.sqr(b), n = a.multiplyByB(a.mul(f, ie)), u = a.mul(n, ie), l = a.sub(a.sub(a.sqr(a.add(o, b)), f), c);
            if (s.push([
                a.sub(n, c),
                a.mul(a.sqr(i), ie),
                a.neg(l)
            ]), i = a.div(a.mul(a.mul(a.sub(c, u), i), o), de), o = a.sub(a.sqr(a.div(a.add(c, u), de)), a.mul(a.sqr(n), ie)), b = a.mul(c, l), h1(e.params.x, t)) {
                let e = a.sub(o, a.mul(d, b)), t = a.sub(i, a.mul(r, b));
                s.push([
                    a.sub(a.mul(e, r), a.mul(t, d)),
                    a.neg(e),
                    t
                ]);
                let c = a.sqr(t), f = a.mul(c, t), n = a.mul(c, i), u = a.add(a.sub(f, a.mul(n, de)), a.mul(a.sqr(e), b));
                i = a.mul(t, u), o = a.sub(a.mul(a.sub(n, u), e), a.mul(f, o)), b = a.mul(b, f);
            }
        }
        return s;
    }
    function i(t, c) {
        const { x: f } = e.params, d = c[0], i = c[1];
        let o = r.ONE;
        for(let e = 0, c = n - 2; c >= 0; c--, e++){
            const n = t[e];
            if (o = r.multiplyBy014(o, n[0], a.mul(n[1], d), a.mul(n[2], i)), h1(f, c)) {
                e += 1;
                const c = t[e];
                o = r.multiplyBy014(o, c[0], a.mul(c[1], d), a.mul(c[2], i));
            }
            0 !== c && (o = r.sqr(o));
        }
        return r.conjugate(o);
    }
    const o = {
        randomPrivateKey: ()=>{
            const t = Y(c.ORDER);
            return function(e, t, c = !1) {
                const a = e.length, f = C(t), r = Y(t);
                if (a < 16 || a < r || a > 1024) throw new Error(`expected ${r}-1024 bytes of input, got ${a}`);
                const n = N(c ? l1(e) : m1(e), t - S) + S;
                return c ? g1(n, f) : p1(n, f);
            }(e.randomBytes(t), c.ORDER);
        },
        calcPairingPrecomputes: d
    }, b = re({
        n: c.ORDER,
        ...e.G1
    }), s = Object.assign(b, W(b.ProjectivePoint, e.G1.mapToCurve, {
        ...e.htfDefaults,
        ...e.G1.htfDefaults
    })), u = re({
        n: c.ORDER,
        ...e.G2
    }), B = Object.assign(u, W(u.ProjectivePoint, e.G2.mapToCurve, {
        ...e.htfDefaults,
        ...e.G2.htfDefaults
    })), { ShortSignature: x } = e.G1, { Signature: w } = e.G2;
    function v(e, t, c = !0) {
        if (e.equals(s.ProjectivePoint.ZERO) || t.equals(B.ProjectivePoint.ZERO)) throw new Error("pairing is not available for ZERO point");
        e.assertValidity(), t.assertValidity();
        const a = e.toAffine(), f = i(function(e) {
            const t = e;
            return t._PPRECOMPUTES || (t._PPRECOMPUTES = d(e.toAffine())), t._PPRECOMPUTES;
        }(t), [
            a.x,
            a.y
        ]);
        return c ? r.finalExponentiate(f) : f;
    }
    function I(e) {
        return e instanceof s.ProjectivePoint ? e : s.ProjectivePoint.fromHex(e);
    }
    function O(e, t) {
        return e instanceof s.ProjectivePoint ? e : s.hashToCurve(y("point", e), t);
    }
    function R(e) {
        return e instanceof B.ProjectivePoint ? e : w.fromHex(e);
    }
    function q(e, t) {
        return e instanceof B.ProjectivePoint ? e : B.hashToCurve(y("point", e), t);
    }
    return s.ProjectivePoint.BASE._setWindowSize(4), {
        getPublicKey: function(e) {
            return s.ProjectivePoint.fromPrivateKey(e).toRawBytes(!0);
        },
        getPublicKeyForShortSignatures: function(e) {
            return B.ProjectivePoint.fromPrivateKey(e).toRawBytes(!0);
        },
        sign: function(e, t, c) {
            const a = q(e, c);
            a.assertValidity();
            const f = a.multiply(s.normPrivateKeyToScalar(t));
            return e instanceof B.ProjectivePoint ? f : w.toRawBytes(f);
        },
        signShortSignature: function(e, t, c) {
            const a = O(e, c);
            a.assertValidity();
            const f = a.multiply(s.normPrivateKeyToScalar(t));
            return e instanceof s.ProjectivePoint ? f : x.toRawBytes(f);
        },
        verify: function(e, t, c, a) {
            const f = I(c), n = q(t, a), d = s.ProjectivePoint.BASE, i = R(e), o = v(f.negate(), n, !1), b = v(d, i, !1), u = r.finalExponentiate(r.mul(b, o));
            return r.eql(u, r.ONE);
        },
        verifyBatch: function(e, t, c, a) {
            if (!t.length) throw new Error("Expected non-empty messages array");
            if (c.length !== t.length) throw new Error("Pubkey count should equal msg count");
            const f = R(e), n = t.map((e)=>q(e, a)), d = c.map(I);
            try {
                const e = [];
                for (const t of new Set(n)){
                    const c = n.reduce((e, c, a)=>c === t ? e.add(d[a]) : e, s.ProjectivePoint.ZERO);
                    e.push(v(c, t, !1));
                }
                e.push(v(s.ProjectivePoint.BASE.negate(), f, !1));
                const t = e.reduce((e, t)=>r.mul(e, t), r.ONE), c = r.finalExponentiate(t);
                return r.eql(c, r.ONE);
            } catch  {
                return !1;
            }
        },
        verifyShortSignature: function(e, t, c, a) {
            const f = R(c), n = O(t, a), d = B.ProjectivePoint.BASE, i = I(e), o = v(n, f, !1), b = v(i, d.negate(), !1), s = r.finalExponentiate(r.mul(b, o));
            return r.eql(s, r.ONE);
        },
        aggregatePublicKeys: function(e) {
            if (!e.length) throw new Error("Expected non-empty array");
            const t = e.map(I).reduce((e, t)=>e.add(t), s.ProjectivePoint.ZERO);
            return e[0] instanceof s.ProjectivePoint ? (t.assertValidity(), t) : t.toRawBytes(!0);
        },
        aggregateSignatures: function(e) {
            if (!e.length) throw new Error("Expected non-empty array");
            const t = e.map(R).reduce((e, t)=>e.add(t), B.ProjectivePoint.ZERO);
            return e[0] instanceof B.ProjectivePoint ? (t.assertValidity(), t) : w.toRawBytes(t);
        },
        aggregateShortSignatures: function(e) {
            if (!e.length) throw new Error("Expected non-empty array");
            const t = e.map(I).reduce((e, t)=>e.add(t), s.ProjectivePoint.ZERO);
            return e[0] instanceof s.ProjectivePoint ? (t.assertValidity(), t) : x.toRawBytes(t);
        },
        millerLoop: i,
        pairing: v,
        G1: s,
        G2: B,
        Signature: w,
        ShortSignature: x,
        fields: {
            Fr: c,
            Fp: t,
            Fp2: a,
            Fp6: f,
            Fp12: r
        },
        params: {
            x: e.params.x,
            r: e.params.r,
            G1b: e.G1.b,
            G2b: e.G2.b
        },
        utils: o
    };
}({
    fields: {
        Fp: ye,
        Fp2: Ie,
        Fp6: Ne,
        Fp12: Ce,
        Fr: Be
    },
    G1: {
        Fp: ye,
        h: BigInt("0x396c8c005555e1568c00aaab0000aaab"),
        Gx: BigInt("0x17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb"),
        Gy: BigInt("0x08b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1"),
        a: ye.ZERO,
        b: le,
        htfDefaults: {
            ...ct,
            m: 1,
            DST: "BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_"
        },
        wrapPrivateKey: !0,
        allowInfinityPoint: !0,
        isTorsionFree: (e, t)=>{
            const c = BigInt("0x5f19672fdf76ce51ba69c6076a0f77eaddb3a93be6f89688de17d813620a00022e01fffffffefffe"), a = new e(ye.mul(t.px, c), t.py, t.pz);
            return t.multiplyUnsafe(it.params.x).negate().multiplyUnsafe(it.params.x).equals(a);
        },
        clearCofactor: (e, t)=>t.multiplyUnsafe(it.params.x).add(t),
        mapToCurve: (e)=>{
            const { x: t, y: c } = Ke(ye.create(e[0]));
            return $e(t, c);
        },
        fromBytes: (e)=>{
            const { compressed: t, infinity: c, sort: a, value: f } = ft(e);
            if (48 === f.length && t) {
                const e = ye.ORDER, t = l1(f), r = ye.create(t & ye.MASK);
                if (c) {
                    if (r !== oe) throw new Error("G1: non-empty compressed point at infinity");
                    return {
                        x: oe,
                        y: oe
                    };
                }
                const n = ye.add(ye.pow(r, ue), ye.create(it.params.G1b));
                let d = ye.sqrt(n);
                if (!d) throw new Error("Invalid compressed G1 point");
                return d * se / e !== BigInt(a) && (d = ye.neg(d)), {
                    x: ye.create(r),
                    y: ye.create(d)
                };
            }
            if (96 !== f.length || t) throw new Error("Invalid point G1, expected 48/96 bytes");
            {
                const e = l1(f.subarray(0, ye.BYTES)), t = l1(f.subarray(ye.BYTES));
                if (c) {
                    if (e !== oe || t !== oe) throw new Error("G1: non-empty point at infinity");
                    return it.G1.ProjectivePoint.ZERO.toAffine();
                }
                return {
                    x: ye.create(e),
                    y: ye.create(t)
                };
            }
        },
        toBytes: (e, t, c)=>{
            const a = t.equals(e.ZERO), { x: f, y: r } = t.toAffine();
            if (c) {
                if (a) return at.slice();
                const e = ye.ORDER, t = Boolean(r * se / e);
                return rt(p1(f, ye.BYTES), {
                    compressed: !0,
                    sort: t
                });
            }
            if (a) {
                return B(new Uint8Array([
                    64
                ]), new Uint8Array(2 * ye.BYTES - 1));
            }
            return B(p1(f, ye.BYTES), p1(r, ye.BYTES));
        },
        ShortSignature: {
            fromHex (e) {
                const { infinity: t, sort: c, value: a } = ft(y("signatureHex", e, 48)), f = ye.ORDER, r = l1(a);
                if (t) return it.G1.ProjectivePoint.ZERO;
                const n = ye.create(r & ye.MASK), d = ye.add(ye.pow(n, ue), ye.create(it.params.G1b));
                let i = ye.sqrt(d);
                if (!i) throw new Error("Invalid compressed G1 point");
                const o = BigInt(c);
                i * se / f !== o && (i = ye.neg(i));
                const b = it.G1.ProjectivePoint.fromAffine({
                    x: n,
                    y: i
                });
                return b.assertValidity(), b;
            },
            toRawBytes: (e)=>nt(e),
            toHex: (e)=>i1(nt(e))
        }
    },
    G2: {
        Fp: Ie,
        h: BigInt("0x5d543a95414e7f1091d50792876a202cd91de4547085abaa68a205b2e5a7ddfa628f1cb4d9e82ef21537e293a6691ae1616ec6e786f0c70cf1c38e31c7238e5"),
        Gx: Ie.fromBigTuple([
            BigInt("0x024aa2b2f08f0a91260805272dc51051c6e47ad4fa403b02b4510b647ae3d1770bac0326a805bbefd48056c8c121bdb8"),
            BigInt("0x13e02b6052719f607dacd3a088274f65596bd0d09920b61ab5da61bbdc7f5049334cf11213945d57e5ac7d055d042b7e")
        ]),
        Gy: Ie.fromBigTuple([
            BigInt("0x0ce5d527727d6e118cc9cdc6da2e351aadfd9baa8cbdd3a76d429a695160d12c923ac9cc3baca289e193548608b82801"),
            BigInt("0x0606c4a02ea734cc32acd2b02bc28b99cb3e287e85a763af267492ab572e99ab3f370d275cec1da1aaa9075ff05f79be")
        ]),
        a: Ie.ZERO,
        b: Ie.fromBigTuple([
            le,
            le
        ]),
        hEff: BigInt("0xbc69f08f2ee75b3584c6a0ea91b352888e2a8e9145ad7689986ff031508ffe1329c2f178731db956d82bf015d1212b02ec0ec69d7477c1ae954cbc06689f6a359894c0adebbf6b4e8020005aaa95551"),
        htfDefaults: {
            ...ct
        },
        wrapPrivateKey: !0,
        allowInfinityPoint: !0,
        mapToCurve: (e)=>{
            const { x: t, y: c } = ze(Ie.fromBigTuple(e));
            return Le(t, c);
        },
        isTorsionFree: (e, t)=>t.multiplyUnsafe(it.params.x).negate().equals(Qe(e, t)),
        clearCofactor: (e, t)=>{
            const c = it.params.x;
            let a = t.multiplyUnsafe(c).negate(), f = Qe(e, t), r = t.double();
            r = tt(e, r), r = r.subtract(f), f = a.add(f), f = f.multiplyUnsafe(c).negate(), r = r.add(f), r = r.subtract(a);
            return r.subtract(t);
        },
        fromBytes: (e)=>{
            const { compressed: t, infinity: c, sort: a, value: f } = ft(e);
            if (!t && !c && a || !t && c && a || a && c && t) throw new Error("Invalid encoding flag: " + (224 & e[0]));
            const r = ye.BYTES, n = (e, t, c)=>l1(e.slice(t, c));
            if (96 === f.length && t) {
                const e = it.params.G2b, t = ye.ORDER;
                if (c) {
                    if (f.reduce((e, t)=>0 !== e ? t + 1 : t, 0) > 0) throw new Error("Invalid compressed G2 point");
                    return {
                        x: Ie.ZERO,
                        y: Ie.ZERO
                    };
                }
                const d = n(f, 0, r), i = n(f, r, 2 * r), o = Ie.create({
                    c0: ye.create(i),
                    c1: ye.create(d)
                }), b = Ie.add(Ie.pow(o, ue), e);
                let s = Ie.sqrt(b);
                const u = s.c1 === oe ? s.c0 * se / t : s.c1 * se / t ? be : oe;
                return s = a && u > 0 ? s : Ie.neg(s), {
                    x: o,
                    y: s
                };
            }
            if (192 !== f.length || t) throw new Error("Invalid point G2, expected 96/192 bytes");
            {
                if (c) {
                    if (f.reduce((e, t)=>0 !== e ? t + 1 : t, 0) > 0) throw new Error("Invalid uncompressed G2 point");
                    return {
                        x: Ie.ZERO,
                        y: Ie.ZERO
                    };
                }
                const e = n(f, 0, r), t = n(f, r, 2 * r), a = n(f, 2 * r, 3 * r), d = n(f, 3 * r, 4 * r);
                return {
                    x: Ie.fromBigTuple([
                        t,
                        e
                    ]),
                    y: Ie.fromBigTuple([
                        d,
                        a
                    ])
                };
            }
        },
        toBytes: (e, t, c)=>{
            const { BYTES: a, ORDER: f } = ye, r = t.equals(e.ZERO), { x: n, y: d } = t.toAffine();
            if (c) {
                if (r) return B(at, p1(oe, a));
                const e = Boolean(d.c1 === oe ? d.c0 * se / f : d.c1 * se / f);
                return B(rt(p1(n.c1, a), {
                    compressed: !0,
                    sort: e
                }), p1(n.c0, a));
            }
            {
                if (r) return B(new Uint8Array([
                    64
                ]), new Uint8Array(4 * a - 1));
                const { re: e, im: t } = Ie.reim(n), { re: c, im: f } = Ie.reim(d);
                return B(p1(t, a), p1(e, a), p1(f, a), p1(c, a));
            }
        },
        Signature: {
            fromHex (e) {
                const { infinity: t, sort: c, value: a } = ft(y("signatureHex", e)), f = ye.ORDER, r = a.length / 2;
                if (48 !== r && 96 !== r) throw new Error("Invalid compressed signature length, must be 96 or 192");
                const n = l1(a.slice(0, r)), d = l1(a.slice(r));
                if (t) return it.G2.ProjectivePoint.ZERO;
                const i = ye.create(n & ye.MASK), o = ye.create(d), b = Ie.create({
                    c0: o,
                    c1: i
                }), s = Ie.add(Ie.pow(b, ue), it.params.G2b);
                let u = Ie.sqrt(s);
                if (!u) throw new Error("Failed to find a square root");
                const { re: m, im: p } = Ie.reim(u), g = BigInt(c);
                (p > oe && p * se / f !== g || p === oe && m * se / f !== g) && (u = Ie.neg(u));
                const B = it.G2.ProjectivePoint.fromAffine({
                    x: b,
                    y: u
                });
                return B.assertValidity(), B;
            },
            toRawBytes: (e)=>dt(e),
            toHex: (e)=>i1(dt(e))
        }
    },
    params: {
        x: je,
        r: Be.ORDER
    },
    htfDefaults: ct,
    hash: d,
    randomBytes: O
});
function t1(t11, ...e) {
    if (!((s = t11) instanceof Uint8Array || null != s && "object" == typeof s && "Uint8Array" === s.constructor.name)) throw new Error("Uint8Array expected");
    var s;
    if (e.length > 0 && !e.includes(t11.length)) throw new Error(`Uint8Array expected of length ${e}, not of length=${t11.length}`);
}
function e1(t, e = !0) {
    if (t.destroyed) throw new Error("Hash instance has been destroyed");
    if (e && t.finished) throw new Error("Hash#digest() has already been called");
}
const s2 = (t)=>new DataView(t.buffer, t.byteOffset, t.byteLength), n2 = (t, e)=>t << 32 - e | t >>> e;
function i2(e) {
    return "string" == typeof e && (e = function(t) {
        if ("string" != typeof t) throw new Error("utf8ToBytes expected string, got " + typeof t);
        return new Uint8Array((new TextEncoder).encode(t));
    }(e)), t1(e), e;
}
new Uint8Array(new Uint32Array([
    287454020
]).buffer)[0];
class r2 {
    clone() {
        return this._cloneInto();
    }
}
function o3(t) {
    const e = (e)=>t().update(i2(e)).digest(), s = t();
    return e.outputLen = s.outputLen, e.blockLen = s.blockLen, e.create = ()=>t(), e;
}
const h2 = (t, e, s)=>t & e ^ t & s ^ e & s;
class f2 extends r2 {
    constructor(t, e, n, i){
        super(), this.blockLen = t, this.outputLen = e, this.padOffset = n, this.isLE = i, this.finished = !1, this.length = 0, this.pos = 0, this.destroyed = !1, this.buffer = new Uint8Array(t), this.view = s2(this.buffer);
    }
    update(t) {
        e1(this);
        const { view: n, buffer: r, blockLen: o } = this, h = (t = i2(t)).length;
        for(let e = 0; e < h;){
            const i = Math.min(o - this.pos, h - e);
            if (i !== o) r.set(t.subarray(e, e + i), this.pos), this.pos += i, e += i, this.pos === o && (this.process(n, 0), this.pos = 0);
            else {
                const n = s2(t);
                for(; o <= h - e; e += o)this.process(n, e);
            }
        }
        return this.length += t.length, this.roundClean(), this;
    }
    digestInto(n) {
        e1(this), function(e, s) {
            t1(e);
            const n = s.outputLen;
            if (e.length < n) throw new Error(`digestInto() expects output buffer of length at least ${n}`);
        }(n, this), this.finished = !0;
        const { buffer: i, view: r, blockLen: o, isLE: h } = this;
        let { pos: f } = this;
        i[f++] = 128, this.buffer.subarray(f).fill(0), this.padOffset > o - f && (this.process(r, 0), f = 0);
        for(let t = f; t < o; t++)i[t] = 0;
        !function(t, e, s, n) {
            if ("function" == typeof t.setBigUint64) return t.setBigUint64(e, s, n);
            const i = BigInt(32), r = BigInt(4294967295), o = Number(s >> i & r), h = Number(s & r), f = n ? 4 : 0, u = n ? 0 : 4;
            t.setUint32(e + f, o, n), t.setUint32(e + u, h, n);
        }(r, o - 8, BigInt(8 * this.length), h), this.process(r, 0);
        const u = s2(n), c = this.outputLen;
        if (c % 4) throw new Error("_sha2: outputLen should be aligned to 32bit");
        const l = c / 4, a = this.get();
        if (l > a.length) throw new Error("_sha2: outputLen bigger than state");
        for(let t = 0; t < l; t++)u.setUint32(4 * t, a[t], h);
    }
    digest() {
        const { buffer: t, outputLen: e } = this;
        this.digestInto(t);
        const s = t.slice(0, e);
        return this.destroy(), s;
    }
    _cloneInto(t) {
        t || (t = new this.constructor), t.set(...this.get());
        const { blockLen: e, buffer: s, length: n, finished: i, destroyed: r, pos: o } = this;
        return t.length = n, t.pos = o, t.finished = i, t.destroyed = r, n % e && t.buffer.set(s), t;
    }
}
const u2 = new Uint32Array([
    1116352408,
    1899447441,
    3049323471,
    3921009573,
    961987163,
    1508970993,
    2453635748,
    2870763221,
    3624381080,
    310598401,
    607225278,
    1426881987,
    1925078388,
    2162078206,
    2614888103,
    3248222580,
    3835390401,
    4022224774,
    264347078,
    604807628,
    770255983,
    1249150122,
    1555081692,
    1996064986,
    2554220882,
    2821834349,
    2952996808,
    3210313671,
    3336571891,
    3584528711,
    113926993,
    338241895,
    666307205,
    773529912,
    1294757372,
    1396182291,
    1695183700,
    1986661051,
    2177026350,
    2456956037,
    2730485921,
    2820302411,
    3259730800,
    3345764771,
    3516065817,
    3600352804,
    4094571909,
    275423344,
    430227734,
    506948616,
    659060556,
    883997877,
    958139571,
    1322822218,
    1537002063,
    1747873779,
    1955562222,
    2024104815,
    2227730452,
    2361852424,
    2428436474,
    2756734187,
    3204031479,
    3329325298
]), c2 = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
]), l2 = new Uint32Array(64);
class a2 extends f2 {
    constructor(){
        super(64, 32, 8, !1), this.A = 0 | c2[0], this.B = 0 | c2[1], this.C = 0 | c2[2], this.D = 0 | c2[3], this.E = 0 | c2[4], this.F = 0 | c2[5], this.G = 0 | c2[6], this.H = 0 | c2[7];
    }
    get() {
        const { A: t, B: e, C: s, D: n, E: i, F: r, G: o, H: h } = this;
        return [
            t,
            e,
            s,
            n,
            i,
            r,
            o,
            h
        ];
    }
    set(t, e, s, n, i, r, o, h) {
        this.A = 0 | t, this.B = 0 | e, this.C = 0 | s, this.D = 0 | n, this.E = 0 | i, this.F = 0 | r, this.G = 0 | o, this.H = 0 | h;
    }
    process(t, e) {
        for(let s = 0; s < 16; s++, e += 4)l2[s] = t.getUint32(e, !1);
        for(let t = 16; t < 64; t++){
            const e = l2[t - 15], s = l2[t - 2], i = n2(e, 7) ^ n2(e, 18) ^ e >>> 3, r = n2(s, 17) ^ n2(s, 19) ^ s >>> 10;
            l2[t] = r + l2[t - 7] + i + l2[t - 16] | 0;
        }
        let { A: s, B: i, C: r, D: o, E: f, F: c, G: a, H: p } = this;
        for(let t = 0; t < 64; t++){
            const e = p + (n2(f, 6) ^ n2(f, 11) ^ n2(f, 25)) + ((d = f) & c ^ ~d & a) + u2[t] + l2[t] | 0, g = (n2(s, 2) ^ n2(s, 13) ^ n2(s, 22)) + h2(s, i, r) | 0;
            p = a, a = c, c = f, f = o + e | 0, o = r, r = i, i = s, s = e + g | 0;
        }
        var d;
        s = s + this.A | 0, i = i + this.B | 0, r = r + this.C | 0, o = o + this.D | 0, f = f + this.E | 0, c = c + this.F | 0, a = a + this.G | 0, p = p + this.H | 0, this.set(s, i, r, o, f, c, a, p);
    }
    roundClean() {
        l2.fill(0);
    }
    destroy() {
        this.set(0, 0, 0, 0, 0, 0, 0, 0), this.buffer.fill(0);
    }
}
class p2 extends a2 {
    constructor(){
        super(), this.A = -1056596264, this.B = 914150663, this.C = 812702999, this.D = -150054599, this.E = -4191439, this.F = 1750603025, this.G = 1694076839, this.H = -1090891868, this.outputLen = 28;
    }
}
o3(()=>new a2), o3(()=>new p2);
BigInt(0), BigInt(1), BigInt(2);
Array.from({
    length: 256
}, (t, n)=>n.toString(16).padStart(2, "0"));
var r3 = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {};
function i3(t) {
    return t && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
var o4 = {}, a3 = {}, s3 = {}, u3 = {};
Object.defineProperty(u3, "__esModule", {
    value: !0
}), u3.LIB_VERSION = void 0, u3.LIB_VERSION = "1.2.6", function(t) {
    Object.defineProperty(t, "__esModule", {
        value: !0
    }), t.retryOnError = t.jsonOrError = t.defaultHttpOptions = t.roundTime = t.roundAt = t.sleep = void 0;
    const e = u3;
    t.sleep = function(t) {
        return new Promise((e)=>{
            t <= 0 && e(), setTimeout(e, t);
        });
    }, t.roundAt = function(t, e) {
        if (!Number.isFinite(t)) throw new Error("Cannot use Infinity or NaN as a beacon time");
        if (t < 1e3 * e.genesis_time) throw Error("Cannot request a round before the genesis time");
        return Math.floor((t - 1e3 * e.genesis_time) / (1e3 * e.period)) + 1;
    }, t.roundTime = function(t, e) {
        if (!Number.isFinite(e)) throw new Error("Cannot use Infinity or NaN as a round number");
        return e = e < 0 ? 0 : e, 1e3 * (t.genesis_time + (e - 1) * t.period);
    }, t.defaultHttpOptions = {
        userAgent: `drand-client-${e.LIB_VERSION}`
    }, t.jsonOrError = async function(e, n = t.defaultHttpOptions) {
        const r = {
            ...n.headers
        };
        n.userAgent && (r["User-Agent"] = n.userAgent);
        const i = await fetch(e, {
            headers: r
        });
        if (!i.ok) throw Error(`Error response fetching ${e} - got ${i.status}`);
        return await i.json();
    }, t.retryOnError = async function t(e, n) {
        try {
            return await e();
        } catch (r) {
            if (0 === n) throw r;
            return t(e, n - 1);
        }
    };
}(s3), Object.defineProperty(a3, "__esModule", {
    value: !0
}), a3.HttpChain = void 0;
const f3 = o4, c3 = s3;
class h3 {
    baseUrl;
    options;
    httpOptions;
    constructor(t, e = f3.defaultChainOptions, n = {}){
        this.baseUrl = t, this.options = e, this.httpOptions = n;
    }
    async info() {
        const t = await (0, c3.jsonOrError)(`${this.baseUrl}/info`, this.httpOptions);
        if (this.options.chainVerificationParams && !function(t, e) {
            return t.hash === e.chainHash && t.public_key === e.publicKey;
        }(t, this.options.chainVerificationParams)) throw Error(`The chain info retrieved from ${this.baseUrl} did not match the verification params!`);
        return t;
    }
}
a3.HttpChain = h3;
a3.default = class {
    baseUrl;
    options;
    chain;
    cachedInfo;
    constructor(t, e = f3.defaultChainOptions){
        this.baseUrl = t, this.options = e, this.chain = new h3(t, e);
    }
    async info() {
        return this.cachedInfo || (this.cachedInfo = await this.chain.info()), this.cachedInfo;
    }
};
var l3 = {};
Object.defineProperty(l3, "__esModule", {
    value: !0
});
const d2 = o4, p3 = s3;
function b1(t, e) {
    return e.noCache ? `${t}?${Date.now()}` : t;
}
l3.default = class {
    someChain;
    options;
    httpOptions;
    constructor(t, e = d2.defaultChainOptions, n = p3.defaultHttpOptions){
        this.someChain = t, this.options = e, this.httpOptions = n;
    }
    async get(t) {
        const e = b1(`${this.someChain.baseUrl}/public/${t}`, this.options);
        return await (0, p3.jsonOrError)(e, this.httpOptions);
    }
    async latest() {
        const t = b1(`${this.someChain.baseUrl}/public/latest`, this.options);
        return await (0, p3.jsonOrError)(t, this.httpOptions);
    }
    chain() {
        return this.someChain;
    }
};
var g2 = {}, _1 = {};
Object.defineProperty(_1, "__esModule", {
    value: !0
}), _1.createSpeedTest = void 0, _1.createSpeedTest = function(t, e, n = 5) {
    let r = new y1(n), i = null;
    const o = async ()=>{
        const e = Date.now();
        try {
            await t(), r.add(Date.now() - e);
        } catch (t) {
            r.add(Number.MAX_SAFE_INTEGER);
        }
    };
    return {
        start: ()=>{
            null == i ? i = setInterval(o, e) : console.warn("Attempted to start a speed test, but it had already been started!");
        },
        stop: ()=>{
            null !== i && (clearInterval(i), i = null, r = new y1(n));
        },
        average: ()=>{
            const t = r.get();
            if (0 === t.length) return Number.MAX_SAFE_INTEGER;
            return t.reduce((t, e)=>t + e, 0) / t.length;
        }
    };
};
class y1 {
    capacity;
    values = [];
    constructor(t){
        this.capacity = t;
    }
    add(t) {
        this.values.push(t), this.values.length > this.capacity && this.values.pop();
    }
    get() {
        return this.values;
    }
}
var w1 = r3 && r3.__createBinding || (Object.create ? function(t, e, n, r) {
    void 0 === r && (r = n);
    var i = Object.getOwnPropertyDescriptor(e, n);
    i && !("get" in i ? !e.__esModule : i.writable || i.configurable) || (i = {
        enumerable: !0,
        get: function() {
            return e[n];
        }
    }), Object.defineProperty(t, r, i);
} : function(t, e, n, r) {
    void 0 === r && (r = n), t[r] = e[n];
}), E1 = r3 && r3.__setModuleDefault || (Object.create ? function(t, e) {
    Object.defineProperty(t, "default", {
        enumerable: !0,
        value: e
    });
} : function(t, e) {
    t.default = e;
}), v2 = r3 && r3.__importStar || function(t) {
    if (t && t.__esModule) return t;
    var e = {};
    if (null != t) for(var n in t)"default" !== n && Object.prototype.hasOwnProperty.call(t, n) && w1(e, t, n);
    return E1(e, t), e;
}, T1 = r3 && r3.__importDefault || function(t) {
    return t && t.__esModule ? t : {
        default: t
    };
};
Object.defineProperty(g2, "__esModule", {
    value: !0
});
const m2 = o4, A1 = v2(a3), C1 = _1, I1 = T1(l3);
g2.default = class {
    baseUrls;
    options;
    speedTestIntervalMs;
    speedTests = [];
    speedTestHttpOptions = {
        userAgent: "drand-web-client-speedtest"
    };
    constructor(t, e = m2.defaultChainOptions, n = 3e5){
        if (this.baseUrls = t, this.options = e, this.speedTestIntervalMs = n, 0 === t.length) throw Error("Can't optimise an empty `baseUrls` array!");
    }
    async latest() {
        return new I1.default(this.current(), this.options).latest();
    }
    async get(t) {
        return new I1.default(this.current(), this.options).get(t);
    }
    chain() {
        return this.current();
    }
    start() {
        1 !== this.baseUrls.length ? this.speedTests = this.baseUrls.map((t)=>{
            const e = (0, C1.createSpeedTest)(async ()=>{
                await new A1.HttpChain(t, this.options, this.speedTestHttpOptions).info();
            }, this.speedTestIntervalMs);
            return e.start(), {
                test: e,
                url: t
            };
        }) : console.warn("There was only a single base URL in the `FastestNodeClient` - not running speed testing");
    }
    current() {
        0 === this.speedTests.length && console.warn("You are not currently running speed tests to choose the fastest client. Run `.start()` to speed test");
        const t = this.speedTests.slice().sort((t, e)=>t.test.average() - e.test.average()).shift();
        if (!t) throw Error("Somehow there were no entries to optimise! This should be impossible by now");
        return new A1.default(t.url, this.options);
    }
    stop() {
        this.speedTests.forEach((t)=>t.test.stop()), this.speedTests = [];
    }
};
var N10 = {}, U1 = r3 && r3.__importDefault || function(t) {
    return t && t.__esModule ? t : {
        default: t
    };
};
Object.defineProperty(N10, "__esModule", {
    value: !0
});
const O2 = o4, R1 = U1(a3), P1 = s3;
N10.default = class {
    baseUrl;
    options;
    constructor(t, e = O2.defaultChainOptions){
        this.baseUrl = t, this.options = e;
    }
    async chains() {
        const t = await (0, P1.jsonOrError)(`${this.baseUrl}/chains`);
        if (!Array.isArray(t)) throw Error(`Expected an array from the chains endpoint but got: ${t}`);
        return t.map((t)=>new R1.default(`${this.baseUrl}/${t}`), this.options);
    }
    async health() {
        const t = await fetch(`${this.baseUrl}/health`);
        if (!t.ok) return {
            status: t.status,
            current: -1,
            expected: -1
        };
        const e = await t.json();
        return {
            status: t.status,
            current: e.current ?? -1,
            expected: e.expected ?? -1
        };
    }
};
var B1 = {}, S1 = "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, D1 = [], H1 = [], L1 = "undefined" != typeof Uint8Array ? Uint8Array : Array, F1 = !1;
function M1() {
    F1 = !0;
    for(var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", e = 0; e < 64; ++e)D1[e] = t[e], H1[t.charCodeAt(e)] = e;
    H1["-".charCodeAt(0)] = 62, H1["_".charCodeAt(0)] = 63;
}
function Y1(t, e, n) {
    for(var r, i, o = [], a = e; a < n; a += 3)r = (t[a] << 16) + (t[a + 1] << 8) + t[a + 2], o.push(D1[(i = r) >> 18 & 63] + D1[i >> 12 & 63] + D1[i >> 6 & 63] + D1[63 & i]);
    return o.join("");
}
function j1(t) {
    var e;
    F1 || M1();
    for(var n = t.length, r = n % 3, i = "", o = [], a = 16383, s = 0, u = n - r; s < u; s += a)o.push(Y1(t, s, s + a > u ? u : s + a));
    return 1 === r ? (e = t[n - 1], i += D1[e >> 2], i += D1[e << 4 & 63], i += "==") : 2 === r && (e = (t[n - 2] << 8) + t[n - 1], i += D1[e >> 10], i += D1[e >> 4 & 63], i += D1[e << 2 & 63], i += "="), o.push(i), o.join("");
}
function k1(t, e, n, r, i) {
    var o, a, s = 8 * i - r - 1, u = (1 << s) - 1, f = u >> 1, c = -7, h = n ? i - 1 : 0, l = n ? -1 : 1, d = t[e + h];
    for(h += l, o = d & (1 << -c) - 1, d >>= -c, c += s; c > 0; o = 256 * o + t[e + h], h += l, c -= 8);
    for(a = o & (1 << -c) - 1, o >>= -c, c += r; c > 0; a = 256 * a + t[e + h], h += l, c -= 8);
    if (0 === o) o = 1 - f;
    else {
        if (o === u) return a ? NaN : 1 / 0 * (d ? -1 : 1);
        a += Math.pow(2, r), o -= f;
    }
    return (d ? -1 : 1) * a * Math.pow(2, o - r);
}
function x1(t, e, n, r, i, o) {
    var a, s, u, f = 8 * o - i - 1, c = (1 << f) - 1, h = c >> 1, l = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0, d = r ? 0 : o - 1, p = r ? 1 : -1, b = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;
    for(e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (s = isNaN(e) ? 1 : 0, a = c) : (a = Math.floor(Math.log(e) / Math.LN2), e * (u = Math.pow(2, -a)) < 1 && (a--, u *= 2), (e += a + h >= 1 ? l / u : l * Math.pow(2, 1 - h)) * u >= 2 && (a++, u /= 2), a + h >= c ? (s = 0, a = c) : a + h >= 1 ? (s = (e * u - 1) * Math.pow(2, i), a += h) : (s = e * Math.pow(2, h - 1) * Math.pow(2, i), a = 0)); i >= 8; t[n + d] = 255 & s, d += p, s /= 256, i -= 8);
    for(a = a << i | s, f += i; f > 0; t[n + d] = 255 & a, d += p, a /= 256, f -= 8);
    t[n + d - p] |= 128 * b;
}
var G1 = {}.toString, K1 = Array.isArray || function(t) {
    return "[object Array]" == G1.call(t);
};
q1.TYPED_ARRAY_SUPPORT = void 0 === S1.TYPED_ARRAY_SUPPORT || S1.TYPED_ARRAY_SUPPORT;
var Q1 = $1();
function $1() {
    return q1.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function V1(t, e) {
    if ($1() < e) throw new RangeError("Invalid typed array length");
    return q1.TYPED_ARRAY_SUPPORT ? (t = new Uint8Array(e)).__proto__ = q1.prototype : (null === t && (t = new q1(e)), t.length = e), t;
}
function q1(t, e, n) {
    if (!(q1.TYPED_ARRAY_SUPPORT || this instanceof q1)) return new q1(t, e, n);
    if ("number" == typeof t) {
        if ("string" == typeof e) throw new Error("If encoding is specified then the first argument must be a string");
        return W1(this, t);
    }
    return z1(this, t, e, n);
}
function z1(t, e, n, r) {
    if ("number" == typeof e) throw new TypeError('"value" argument must not be a number');
    return "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer ? function(t, e, n, r) {
        if (e.byteLength, n < 0 || e.byteLength < n) throw new RangeError("'offset' is out of bounds");
        if (e.byteLength < n + (r || 0)) throw new RangeError("'length' is out of bounds");
        e = void 0 === n && void 0 === r ? new Uint8Array(e) : void 0 === r ? new Uint8Array(e, n) : new Uint8Array(e, n, r);
        q1.TYPED_ARRAY_SUPPORT ? (t = e).__proto__ = q1.prototype : t = J1(t, e);
        return t;
    }(t, e, n, r) : "string" == typeof e ? function(t, e, n) {
        "string" == typeof n && "" !== n || (n = "utf8");
        if (!q1.isEncoding(n)) throw new TypeError('"encoding" must be a valid string encoding');
        var r = 0 | nt1(e, n);
        t = V1(t, r);
        var i = t.write(e, n);
        i !== r && (t = t.slice(0, i));
        return t;
    }(t, e, n) : function(t, e) {
        if (et1(e)) {
            var n = 0 | Z1(e.length);
            return 0 === (t = V1(t, n)).length || e.copy(t, 0, 0, n), t;
        }
        if (e) {
            if ("undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e) return "number" != typeof e.length || (r = e.length) != r ? V1(t, 0) : J1(t, e);
            if ("Buffer" === e.type && K1(e.data)) return J1(t, e.data);
        }
        var r;
        throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
    }(t, e);
}
function X1(t) {
    if ("number" != typeof t) throw new TypeError('"size" argument must be a number');
    if (t < 0) throw new RangeError('"size" argument must not be negative');
}
function W1(t, e) {
    if (X1(e), t = V1(t, e < 0 ? 0 : 0 | Z1(e)), !q1.TYPED_ARRAY_SUPPORT) for(var n = 0; n < e; ++n)t[n] = 0;
    return t;
}
function J1(t, e) {
    var n = e.length < 0 ? 0 : 0 | Z1(e.length);
    t = V1(t, n);
    for(var r = 0; r < n; r += 1)t[r] = 255 & e[r];
    return t;
}
function Z1(t) {
    if (t >= $1()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + $1().toString(16) + " bytes");
    return 0 | t;
}
function tt1(t) {
    return +t != t && (t = 0), q1.alloc(+t);
}
function et1(t) {
    return !(null == t || !t._isBuffer);
}
function nt1(t, e) {
    if (et1(t)) return t.length;
    if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) return t.byteLength;
    "string" != typeof t && (t = "" + t);
    var n = t.length;
    if (0 === n) return 0;
    for(var r = !1;;)switch(e){
        case "ascii":
        case "latin1":
        case "binary":
            return n;
        case "utf8":
        case "utf-8":
        case void 0:
            return Ot(t).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return 2 * n;
        case "hex":
            return n >>> 1;
        case "base64":
            return Rt(t).length;
        default:
            if (r) return Ot(t).length;
            e = ("" + e).toLowerCase(), r = !0;
    }
}
function rt1(t, e, n) {
    var r = !1;
    if ((void 0 === e || e < 0) && (e = 0), e > this.length) return "";
    if ((void 0 === n || n > this.length) && (n = this.length), n <= 0) return "";
    if ((n >>>= 0) <= (e >>>= 0)) return "";
    for(t || (t = "utf8");;)switch(t){
        case "hex":
            return yt(this, e, n);
        case "utf8":
        case "utf-8":
            return pt(this, e, n);
        case "ascii":
            return gt(this, e, n);
        case "latin1":
        case "binary":
            return _t(this, e, n);
        case "base64":
            return dt1(this, e, n);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return wt(this, e, n);
        default:
            if (r) throw new TypeError("Unknown encoding: " + t);
            t = (t + "").toLowerCase(), r = !0;
    }
}
function it1(t, e, n) {
    var r = t[e];
    t[e] = t[n], t[n] = r;
}
function ot(t, e, n, r, i) {
    if (0 === t.length) return -1;
    if ("string" == typeof n ? (r = n, n = 0) : n > 2147483647 ? n = 2147483647 : n < -2147483648 && (n = -2147483648), n = +n, isNaN(n) && (n = i ? 0 : t.length - 1), n < 0 && (n = t.length + n), n >= t.length) {
        if (i) return -1;
        n = t.length - 1;
    } else if (n < 0) {
        if (!i) return -1;
        n = 0;
    }
    if ("string" == typeof e && (e = q1.from(e, r)), et1(e)) return 0 === e.length ? -1 : at1(t, e, n, r, i);
    if ("number" == typeof e) return e &= 255, q1.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? i ? Uint8Array.prototype.indexOf.call(t, e, n) : Uint8Array.prototype.lastIndexOf.call(t, e, n) : at1(t, [
        e
    ], n, r, i);
    throw new TypeError("val must be string, number or Buffer");
}
function at1(t, e, n, r, i) {
    var o, a = 1, s = t.length, u = e.length;
    if (void 0 !== r && ("ucs2" === (r = String(r).toLowerCase()) || "ucs-2" === r || "utf16le" === r || "utf-16le" === r)) {
        if (t.length < 2 || e.length < 2) return -1;
        a = 2, s /= 2, u /= 2, n /= 2;
    }
    function f(t, e) {
        return 1 === a ? t[e] : t.readUInt16BE(e * a);
    }
    if (i) {
        var c = -1;
        for(o = n; o < s; o++)if (f(t, o) === f(e, -1 === c ? 0 : o - c)) {
            if (-1 === c && (c = o), o - c + 1 === u) return c * a;
        } else -1 !== c && (o -= o - c), c = -1;
    } else for(n + u > s && (n = s - u), o = n; o >= 0; o--){
        for(var h = !0, l = 0; l < u; l++)if (f(t, o + l) !== f(e, l)) {
            h = !1;
            break;
        }
        if (h) return o;
    }
    return -1;
}
function st(t, e, n, r) {
    n = Number(n) || 0;
    var i = t.length - n;
    r ? (r = Number(r)) > i && (r = i) : r = i;
    var o = e.length;
    if (o % 2 != 0) throw new TypeError("Invalid hex string");
    r > o / 2 && (r = o / 2);
    for(var a = 0; a < r; ++a){
        var s = parseInt(e.substr(2 * a, 2), 16);
        if (isNaN(s)) return a;
        t[n + a] = s;
    }
    return a;
}
function ut(t, e, n, r) {
    return Pt(Ot(e, t.length - n), t, n, r);
}
function ft1(t, e, n, r) {
    return Pt(function(t) {
        for(var e = [], n = 0; n < t.length; ++n)e.push(255 & t.charCodeAt(n));
        return e;
    }(e), t, n, r);
}
function ct1(t, e, n, r) {
    return ft1(t, e, n, r);
}
function ht(t, e, n, r) {
    return Pt(Rt(e), t, n, r);
}
function lt(t, e, n, r) {
    return Pt(function(t, e) {
        for(var n, r, i, o = [], a = 0; a < t.length && !((e -= 2) < 0); ++a)r = (n = t.charCodeAt(a)) >> 8, i = n % 256, o.push(i), o.push(r);
        return o;
    }(e, t.length - n), t, n, r);
}
function dt1(t, e, n) {
    return 0 === e && n === t.length ? j1(t) : j1(t.slice(e, n));
}
function pt(t, e, n) {
    n = Math.min(t.length, n);
    for(var r = [], i = e; i < n;){
        var o, a, s, u, f = t[i], c = null, h = f > 239 ? 4 : f > 223 ? 3 : f > 191 ? 2 : 1;
        if (i + h <= n) switch(h){
            case 1:
                f < 128 && (c = f);
                break;
            case 2:
                128 == (192 & (o = t[i + 1])) && (u = (31 & f) << 6 | 63 & o) > 127 && (c = u);
                break;
            case 3:
                o = t[i + 1], a = t[i + 2], 128 == (192 & o) && 128 == (192 & a) && (u = (15 & f) << 12 | (63 & o) << 6 | 63 & a) > 2047 && (u < 55296 || u > 57343) && (c = u);
                break;
            case 4:
                o = t[i + 1], a = t[i + 2], s = t[i + 3], 128 == (192 & o) && 128 == (192 & a) && 128 == (192 & s) && (u = (15 & f) << 18 | (63 & o) << 12 | (63 & a) << 6 | 63 & s) > 65535 && u < 1114112 && (c = u);
        }
        null === c ? (c = 65533, h = 1) : c > 65535 && (c -= 65536, r.push(c >>> 10 & 1023 | 55296), c = 56320 | 1023 & c), r.push(c), i += h;
    }
    return function(t) {
        var e = t.length;
        if (e <= bt) return String.fromCharCode.apply(String, t);
        var n = "", r = 0;
        for(; r < e;)n += String.fromCharCode.apply(String, t.slice(r, r += bt));
        return n;
    }(r);
}
q1.poolSize = 8192, q1._augment = function(t) {
    return t.__proto__ = q1.prototype, t;
}, q1.from = function(t, e, n) {
    return z1(null, t, e, n);
}, q1.TYPED_ARRAY_SUPPORT && (q1.prototype.__proto__ = Uint8Array.prototype, q1.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && q1[Symbol.species]), q1.alloc = function(t, e, n) {
    return function(t, e, n, r) {
        return X1(e), e <= 0 ? V1(t, e) : void 0 !== n ? "string" == typeof r ? V1(t, e).fill(n, r) : V1(t, e).fill(n) : V1(t, e);
    }(null, t, e, n);
}, q1.allocUnsafe = function(t) {
    return W1(null, t);
}, q1.allocUnsafeSlow = function(t) {
    return W1(null, t);
}, q1.isBuffer = Bt, q1.compare = function(t, e) {
    if (!et1(t) || !et1(e)) throw new TypeError("Arguments must be Buffers");
    if (t === e) return 0;
    for(var n = t.length, r = e.length, i = 0, o = Math.min(n, r); i < o; ++i)if (t[i] !== e[i]) {
        n = t[i], r = e[i];
        break;
    }
    return n < r ? -1 : r < n ? 1 : 0;
}, q1.isEncoding = function(t) {
    switch(String(t).toLowerCase()){
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return !0;
        default:
            return !1;
    }
}, q1.concat = function(t, e) {
    if (!K1(t)) throw new TypeError('"list" argument must be an Array of Buffers');
    if (0 === t.length) return q1.alloc(0);
    var n;
    if (void 0 === e) for(e = 0, n = 0; n < t.length; ++n)e += t[n].length;
    var r = q1.allocUnsafe(e), i = 0;
    for(n = 0; n < t.length; ++n){
        var o = t[n];
        if (!et1(o)) throw new TypeError('"list" argument must be an Array of Buffers');
        o.copy(r, i), i += o.length;
    }
    return r;
}, q1.byteLength = nt1, q1.prototype._isBuffer = !0, q1.prototype.swap16 = function() {
    var t = this.length;
    if (t % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
    for(var e = 0; e < t; e += 2)it1(this, e, e + 1);
    return this;
}, q1.prototype.swap32 = function() {
    var t = this.length;
    if (t % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
    for(var e = 0; e < t; e += 4)it1(this, e, e + 3), it1(this, e + 1, e + 2);
    return this;
}, q1.prototype.swap64 = function() {
    var t = this.length;
    if (t % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
    for(var e = 0; e < t; e += 8)it1(this, e, e + 7), it1(this, e + 1, e + 6), it1(this, e + 2, e + 5), it1(this, e + 3, e + 4);
    return this;
}, q1.prototype.toString = function() {
    var t = 0 | this.length;
    return 0 === t ? "" : 0 === arguments.length ? pt(this, 0, t) : rt1.apply(this, arguments);
}, q1.prototype.equals = function(t) {
    if (!et1(t)) throw new TypeError("Argument must be a Buffer");
    return this === t || 0 === q1.compare(this, t);
}, q1.prototype.inspect = function() {
    var t = "";
    return this.length > 0 && (t = this.toString("hex", 0, 50).match(/.{2}/g).join(" "), this.length > 50 && (t += " ... ")), "<Buffer " + t + ">";
}, q1.prototype.compare = function(t, e, n, r, i) {
    if (!et1(t)) throw new TypeError("Argument must be a Buffer");
    if (void 0 === e && (e = 0), void 0 === n && (n = t ? t.length : 0), void 0 === r && (r = 0), void 0 === i && (i = this.length), e < 0 || n > t.length || r < 0 || i > this.length) throw new RangeError("out of range index");
    if (r >= i && e >= n) return 0;
    if (r >= i) return -1;
    if (e >= n) return 1;
    if (this === t) return 0;
    for(var o = (i >>>= 0) - (r >>>= 0), a = (n >>>= 0) - (e >>>= 0), s = Math.min(o, a), u = this.slice(r, i), f = t.slice(e, n), c = 0; c < s; ++c)if (u[c] !== f[c]) {
        o = u[c], a = f[c];
        break;
    }
    return o < a ? -1 : a < o ? 1 : 0;
}, q1.prototype.includes = function(t, e, n) {
    return -1 !== this.indexOf(t, e, n);
}, q1.prototype.indexOf = function(t, e, n) {
    return ot(this, t, e, n, !0);
}, q1.prototype.lastIndexOf = function(t, e, n) {
    return ot(this, t, e, n, !1);
}, q1.prototype.write = function(t, e, n, r) {
    if (void 0 === e) r = "utf8", n = this.length, e = 0;
    else if (void 0 === n && "string" == typeof e) r = e, n = this.length, e = 0;
    else {
        if (!isFinite(e)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
        e |= 0, isFinite(n) ? (n |= 0, void 0 === r && (r = "utf8")) : (r = n, n = void 0);
    }
    var i = this.length - e;
    if ((void 0 === n || n > i) && (n = i), t.length > 0 && (n < 0 || e < 0) || e > this.length) throw new RangeError("Attempt to write outside buffer bounds");
    r || (r = "utf8");
    for(var o = !1;;)switch(r){
        case "hex":
            return st(this, t, e, n);
        case "utf8":
        case "utf-8":
            return ut(this, t, e, n);
        case "ascii":
            return ft1(this, t, e, n);
        case "latin1":
        case "binary":
            return ct1(this, t, e, n);
        case "base64":
            return ht(this, t, e, n);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
            return lt(this, t, e, n);
        default:
            if (o) throw new TypeError("Unknown encoding: " + r);
            r = ("" + r).toLowerCase(), o = !0;
    }
}, q1.prototype.toJSON = function() {
    return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
    };
};
var bt = 4096;
function gt(t, e, n) {
    var r = "";
    n = Math.min(t.length, n);
    for(var i = e; i < n; ++i)r += String.fromCharCode(127 & t[i]);
    return r;
}
function _t(t, e, n) {
    var r = "";
    n = Math.min(t.length, n);
    for(var i = e; i < n; ++i)r += String.fromCharCode(t[i]);
    return r;
}
function yt(t, e, n) {
    var r = t.length;
    (!e || e < 0) && (e = 0), (!n || n < 0 || n > r) && (n = r);
    for(var i = "", o = e; o < n; ++o)i += Ut(t[o]);
    return i;
}
function wt(t, e, n) {
    for(var r = t.slice(e, n), i = "", o = 0; o < r.length; o += 2)i += String.fromCharCode(r[o] + 256 * r[o + 1]);
    return i;
}
function Et(t, e, n) {
    if (t % 1 != 0 || t < 0) throw new RangeError("offset is not uint");
    if (t + e > n) throw new RangeError("Trying to access beyond buffer length");
}
function vt(t, e, n, r, i, o) {
    if (!et1(t)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (e > i || e < o) throw new RangeError('"value" argument is out of bounds');
    if (n + r > t.length) throw new RangeError("Index out of range");
}
function Tt(t, e, n, r) {
    e < 0 && (e = 65535 + e + 1);
    for(var i = 0, o = Math.min(t.length - n, 2); i < o; ++i)t[n + i] = (e & 255 << 8 * (r ? i : 1 - i)) >>> 8 * (r ? i : 1 - i);
}
function mt(t, e, n, r) {
    e < 0 && (e = 4294967295 + e + 1);
    for(var i = 0, o = Math.min(t.length - n, 4); i < o; ++i)t[n + i] = e >>> 8 * (r ? i : 3 - i) & 255;
}
function At(t, e, n, r, i, o) {
    if (n + r > t.length) throw new RangeError("Index out of range");
    if (n < 0) throw new RangeError("Index out of range");
}
function Ct(t, e, n, r, i) {
    return i || At(t, 0, n, 4), x1(t, e, n, r, 23, 4), n + 4;
}
function It(t, e, n, r, i) {
    return i || At(t, 0, n, 8), x1(t, e, n, r, 52, 8), n + 8;
}
q1.prototype.slice = function(t, e) {
    var n, r = this.length;
    if ((t = ~~t) < 0 ? (t += r) < 0 && (t = 0) : t > r && (t = r), (e = void 0 === e ? r : ~~e) < 0 ? (e += r) < 0 && (e = 0) : e > r && (e = r), e < t && (e = t), q1.TYPED_ARRAY_SUPPORT) (n = this.subarray(t, e)).__proto__ = q1.prototype;
    else {
        var i = e - t;
        n = new q1(i, void 0);
        for(var o = 0; o < i; ++o)n[o] = this[o + t];
    }
    return n;
}, q1.prototype.readUIntLE = function(t, e, n) {
    t |= 0, e |= 0, n || Et(t, e, this.length);
    for(var r = this[t], i = 1, o = 0; ++o < e && (i *= 256);)r += this[t + o] * i;
    return r;
}, q1.prototype.readUIntBE = function(t, e, n) {
    t |= 0, e |= 0, n || Et(t, e, this.length);
    for(var r = this[t + --e], i = 1; e > 0 && (i *= 256);)r += this[t + --e] * i;
    return r;
}, q1.prototype.readUInt8 = function(t, e) {
    return e || Et(t, 1, this.length), this[t];
}, q1.prototype.readUInt16LE = function(t, e) {
    return e || Et(t, 2, this.length), this[t] | this[t + 1] << 8;
}, q1.prototype.readUInt16BE = function(t, e) {
    return e || Et(t, 2, this.length), this[t] << 8 | this[t + 1];
}, q1.prototype.readUInt32LE = function(t, e) {
    return e || Et(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3];
}, q1.prototype.readUInt32BE = function(t, e) {
    return e || Et(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
}, q1.prototype.readIntLE = function(t, e, n) {
    t |= 0, e |= 0, n || Et(t, e, this.length);
    for(var r = this[t], i = 1, o = 0; ++o < e && (i *= 256);)r += this[t + o] * i;
    return r >= (i *= 128) && (r -= Math.pow(2, 8 * e)), r;
}, q1.prototype.readIntBE = function(t, e, n) {
    t |= 0, e |= 0, n || Et(t, e, this.length);
    for(var r = e, i = 1, o = this[t + --r]; r > 0 && (i *= 256);)o += this[t + --r] * i;
    return o >= (i *= 128) && (o -= Math.pow(2, 8 * e)), o;
}, q1.prototype.readInt8 = function(t, e) {
    return e || Et(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t];
}, q1.prototype.readInt16LE = function(t, e) {
    e || Et(t, 2, this.length);
    var n = this[t] | this[t + 1] << 8;
    return 32768 & n ? 4294901760 | n : n;
}, q1.prototype.readInt16BE = function(t, e) {
    e || Et(t, 2, this.length);
    var n = this[t + 1] | this[t] << 8;
    return 32768 & n ? 4294901760 | n : n;
}, q1.prototype.readInt32LE = function(t, e) {
    return e || Et(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
}, q1.prototype.readInt32BE = function(t, e) {
    return e || Et(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
}, q1.prototype.readFloatLE = function(t, e) {
    return e || Et(t, 4, this.length), k1(this, t, !0, 23, 4);
}, q1.prototype.readFloatBE = function(t, e) {
    return e || Et(t, 4, this.length), k1(this, t, !1, 23, 4);
}, q1.prototype.readDoubleLE = function(t, e) {
    return e || Et(t, 8, this.length), k1(this, t, !0, 52, 8);
}, q1.prototype.readDoubleBE = function(t, e) {
    return e || Et(t, 8, this.length), k1(this, t, !1, 52, 8);
}, q1.prototype.writeUIntLE = function(t, e, n, r) {
    (t = +t, e |= 0, n |= 0, r) || vt(this, t, e, n, Math.pow(2, 8 * n) - 1, 0);
    var i = 1, o = 0;
    for(this[e] = 255 & t; ++o < n && (i *= 256);)this[e + o] = t / i & 255;
    return e + n;
}, q1.prototype.writeUIntBE = function(t, e, n, r) {
    (t = +t, e |= 0, n |= 0, r) || vt(this, t, e, n, Math.pow(2, 8 * n) - 1, 0);
    var i = n - 1, o = 1;
    for(this[e + i] = 255 & t; --i >= 0 && (o *= 256);)this[e + i] = t / o & 255;
    return e + n;
}, q1.prototype.writeUInt8 = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 1, 255, 0), q1.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = 255 & t, e + 1;
}, q1.prototype.writeUInt16LE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 2, 65535, 0), q1.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : Tt(this, t, e, !0), e + 2;
}, q1.prototype.writeUInt16BE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 2, 65535, 0), q1.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : Tt(this, t, e, !1), e + 2;
}, q1.prototype.writeUInt32LE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 4, 4294967295, 0), q1.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t) : mt(this, t, e, !0), e + 4;
}, q1.prototype.writeUInt32BE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 4, 4294967295, 0), q1.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : mt(this, t, e, !1), e + 4;
}, q1.prototype.writeIntLE = function(t, e, n, r) {
    if (t = +t, e |= 0, !r) {
        var i = Math.pow(2, 8 * n - 1);
        vt(this, t, e, n, i - 1, -i);
    }
    var o = 0, a = 1, s = 0;
    for(this[e] = 255 & t; ++o < n && (a *= 256);)t < 0 && 0 === s && 0 !== this[e + o - 1] && (s = 1), this[e + o] = (t / a >> 0) - s & 255;
    return e + n;
}, q1.prototype.writeIntBE = function(t, e, n, r) {
    if (t = +t, e |= 0, !r) {
        var i = Math.pow(2, 8 * n - 1);
        vt(this, t, e, n, i - 1, -i);
    }
    var o = n - 1, a = 1, s = 0;
    for(this[e + o] = 255 & t; --o >= 0 && (a *= 256);)t < 0 && 0 === s && 0 !== this[e + o + 1] && (s = 1), this[e + o] = (t / a >> 0) - s & 255;
    return e + n;
}, q1.prototype.writeInt8 = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 1, 127, -128), q1.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1;
}, q1.prototype.writeInt16LE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 2, 32767, -32768), q1.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : Tt(this, t, e, !0), e + 2;
}, q1.prototype.writeInt16BE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 2, 32767, -32768), q1.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : Tt(this, t, e, !1), e + 2;
}, q1.prototype.writeInt32LE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 4, 2147483647, -2147483648), q1.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : mt(this, t, e, !0), e + 4;
}, q1.prototype.writeInt32BE = function(t, e, n) {
    return t = +t, e |= 0, n || vt(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), q1.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : mt(this, t, e, !1), e + 4;
}, q1.prototype.writeFloatLE = function(t, e, n) {
    return Ct(this, t, e, !0, n);
}, q1.prototype.writeFloatBE = function(t, e, n) {
    return Ct(this, t, e, !1, n);
}, q1.prototype.writeDoubleLE = function(t, e, n) {
    return It(this, t, e, !0, n);
}, q1.prototype.writeDoubleBE = function(t, e, n) {
    return It(this, t, e, !1, n);
}, q1.prototype.copy = function(t, e, n, r) {
    if (n || (n = 0), r || 0 === r || (r = this.length), e >= t.length && (e = t.length), e || (e = 0), r > 0 && r < n && (r = n), r === n) return 0;
    if (0 === t.length || 0 === this.length) return 0;
    if (e < 0) throw new RangeError("targetStart out of bounds");
    if (n < 0 || n >= this.length) throw new RangeError("sourceStart out of bounds");
    if (r < 0) throw new RangeError("sourceEnd out of bounds");
    r > this.length && (r = this.length), t.length - e < r - n && (r = t.length - e + n);
    var i, o = r - n;
    if (this === t && n < e && e < r) for(i = o - 1; i >= 0; --i)t[i + e] = this[i + n];
    else if (o < 1e3 || !q1.TYPED_ARRAY_SUPPORT) for(i = 0; i < o; ++i)t[i + e] = this[i + n];
    else Uint8Array.prototype.set.call(t, this.subarray(n, n + o), e);
    return o;
}, q1.prototype.fill = function(t, e, n, r) {
    if ("string" == typeof t) {
        if ("string" == typeof e ? (r = e, e = 0, n = this.length) : "string" == typeof n && (r = n, n = this.length), 1 === t.length) {
            var i = t.charCodeAt(0);
            i < 256 && (t = i);
        }
        if (void 0 !== r && "string" != typeof r) throw new TypeError("encoding must be a string");
        if ("string" == typeof r && !q1.isEncoding(r)) throw new TypeError("Unknown encoding: " + r);
    } else "number" == typeof t && (t &= 255);
    if (e < 0 || this.length < e || this.length < n) throw new RangeError("Out of range index");
    if (n <= e) return this;
    var o;
    if (e >>>= 0, n = void 0 === n ? this.length : n >>> 0, t || (t = 0), "number" == typeof t) for(o = e; o < n; ++o)this[o] = t;
    else {
        var a = et1(t) ? t : Ot(new q1(t, r).toString()), s = a.length;
        for(o = 0; o < n - e; ++o)this[o + e] = a[o % s];
    }
    return this;
};
var Nt = /[^+\/0-9A-Za-z-_]/g;
function Ut(t) {
    return t < 16 ? "0" + t.toString(16) : t.toString(16);
}
function Ot(t, e) {
    var n;
    e = e || 1 / 0;
    for(var r = t.length, i = null, o = [], a = 0; a < r; ++a){
        if ((n = t.charCodeAt(a)) > 55295 && n < 57344) {
            if (!i) {
                if (n > 56319) {
                    (e -= 3) > -1 && o.push(239, 191, 189);
                    continue;
                }
                if (a + 1 === r) {
                    (e -= 3) > -1 && o.push(239, 191, 189);
                    continue;
                }
                i = n;
                continue;
            }
            if (n < 56320) {
                (e -= 3) > -1 && o.push(239, 191, 189), i = n;
                continue;
            }
            n = 65536 + (i - 55296 << 10 | n - 56320);
        } else i && (e -= 3) > -1 && o.push(239, 191, 189);
        if (i = null, n < 128) {
            if ((e -= 1) < 0) break;
            o.push(n);
        } else if (n < 2048) {
            if ((e -= 2) < 0) break;
            o.push(n >> 6 | 192, 63 & n | 128);
        } else if (n < 65536) {
            if ((e -= 3) < 0) break;
            o.push(n >> 12 | 224, n >> 6 & 63 | 128, 63 & n | 128);
        } else {
            if (!(n < 1114112)) throw new Error("Invalid code point");
            if ((e -= 4) < 0) break;
            o.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, 63 & n | 128);
        }
    }
    return o;
}
function Rt(t) {
    return function(t) {
        var e, n, r, i, o, a;
        F1 || M1();
        var s = t.length;
        if (s % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
        o = "=" === t[s - 2] ? 2 : "=" === t[s - 1] ? 1 : 0, a = new L1(3 * s / 4 - o), r = o > 0 ? s - 4 : s;
        var u = 0;
        for(e = 0, n = 0; e < r; e += 4, n += 3)i = H1[t.charCodeAt(e)] << 18 | H1[t.charCodeAt(e + 1)] << 12 | H1[t.charCodeAt(e + 2)] << 6 | H1[t.charCodeAt(e + 3)], a[u++] = i >> 16 & 255, a[u++] = i >> 8 & 255, a[u++] = 255 & i;
        return 2 === o ? (i = H1[t.charCodeAt(e)] << 2 | H1[t.charCodeAt(e + 1)] >> 4, a[u++] = 255 & i) : 1 === o && (i = H1[t.charCodeAt(e)] << 10 | H1[t.charCodeAt(e + 1)] << 4 | H1[t.charCodeAt(e + 2)] >> 2, a[u++] = i >> 8 & 255, a[u++] = 255 & i), a;
    }(function(t) {
        if ((t = (function(t) {
            return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
        })(t).replace(Nt, "")).length < 2) return "";
        for(; t.length % 4 != 0;)t += "=";
        return t;
    }(t));
}
function Pt(t, e, n, r) {
    for(var i = 0; i < r && !(i + n >= e.length || i >= t.length); ++i)e[i + n] = t[i];
    return i;
}
function Bt(t) {
    return null != t && (!!t._isBuffer || St(t) || function(t) {
        return "function" == typeof t.readFloatLE && "function" == typeof t.slice && St(t.slice(0, 0));
    }(t));
}
function St(t) {
    return !!t.constructor && "function" == typeof t.constructor.isBuffer && t.constructor.isBuffer(t);
}
var Dt = {
    Buffer: q1,
    INSPECT_MAX_BYTES: 50,
    SlowBuffer: tt1,
    isBuffer: Bt,
    kMaxLength: $1
}, Ht = i3(Object.freeze({
    __proto__: null,
    Buffer: q1,
    INSPECT_MAX_BYTES: 50,
    SlowBuffer: tt1,
    isBuffer: Bt,
    kMaxLength: Q1,
    default: Dt
}));
Object.defineProperty(B1, "__esModule", {
    value: !0
}), B1.roundBuffer = B1.verifyBeacon = B1.verifySigOnG1 = void 0;
const Lt = null, Ft = null, Yt = Ht, jt = o4;
async function kt(t, e, n, r = "BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_NUL_") {
    const i = (o = n) instanceof null.bls12_381.G2.ProjectivePoint ? o : null.bls12_381.G2.ProjectivePoint.fromHex(o);
    var o;
    const a = function(t, e) {
        return t instanceof null.bls12_381.G1.ProjectivePoint ? t : null.bls12_381.G1.hashToCurve((0, null.ensureBytes)("point", t), {
            DST: e
        });
    }(e, r), s = null.bls12_381.G2.ProjectivePoint.BASE, u = function(t) {
        return t instanceof null.bls12_381.G1.ProjectivePoint ? t : null.bls12_381.G1.ProjectivePoint.fromHex(t);
    }(t), f = null.bls12_381.pairing(a, i.negate(), !0), c = null.bls12_381.pairing(u, s, !0), h = null.bls12_381.fields.Fp12.mul(c, f);
    return null.bls12_381.fields.Fp12.eql(h, null.bls12_381.fields.Fp12.ONE);
}
async function xt(t) {
    return (0, null.sha256)(Kt(t.round));
}
function Gt(t) {
    return Yt.Buffer.from(t, "hex");
}
function Kt(t) {
    const e = Yt.Buffer.alloc(8);
    return e.writeBigUInt64BE(BigInt(t)), e;
}
B1.verifyBeacon = async function(t, e, n) {
    const r = t.public_key;
    return e.round !== n ? (console.error("round was not the expected round"), !1) : await async function(t) {
        const e = (0, Ft.sha256)(Yt.Buffer.from(t.signature, "hex"));
        return 0 == Yt.Buffer.from(t.randomness, "hex").compare(e);
    }(e) ? (0, jt.isChainedBeacon)(e, t) ? Lt.bls12_381.verify(e.signature, await async function(t) {
        const e = Yt.Buffer.concat([
            Gt(t.previous_signature),
            Kt(t.round)
        ]);
        return (0, Ft.sha256)(e);
    }(e), r) : (0, jt.isUnchainedBeacon)(e, t) ? Lt.bls12_381.verify(e.signature, await xt(e), r) : (0, jt.isG1G2SwappedBeacon)(e, t) ? kt(e.signature, await xt(e), r) : (0, jt.isG1Rfc9380)(e, t) ? kt(e.signature, await xt(e), r, "BLS_SIG_BLS12381G1_XMD:SHA-256_SSWU_RO_NUL_") : (console.error(`Beacon type ${t.schemeID} was not supported or the beacon was not of the purported type`), !1) : (console.error("randomness did not match the signature"), !1);
}, B1.verifySigOnG1 = kt, B1.roundBuffer = Kt;
var Qt = {};
!function(t) {
    var e = r3 && r3.__importDefault || function(t) {
        return t && t.__esModule ? t : {
            default: t
        };
    };
    Object.defineProperty(t, "__esModule", {
        value: !0
    }), t.testnetQuicknetClient = t.testnetDefaultClient = t.fastnetClient = t.quicknetClient = t.defaultClient = t.TESTNET_QUICKNET_CHAIN_INFO = t.TESTNET_QUICKNET_CHAIN_URL = t.TESTNET_DEFAULT_CHAIN_INFO = t.TESTNET_DEFAULT_CHAIN_URL = t.FASTNET_CHAIN_INFO = t.FASTNET_CHAIN_URL = t.QUICKNET_CHAIN_INFO = t.QUICKNET_CHAIN_URL = t.DEFAULT_CHAIN_INFO = t.DEFAULT_CHAIN_URL = void 0;
    const n = o4, i = e(l3), s = e(a3);
    t.DEFAULT_CHAIN_URL = "https://api.drand.sh", t.DEFAULT_CHAIN_INFO = {
        public_key: "868f005eb8e6e4ca0a47c8a77ceaa5309a47978a7c71bc5cce96366b5d7a569937c529eeda66c7293784a9402801af31",
        period: 30,
        genesis_time: 1595431050,
        hash: "8990e7a9aaed2ffed73dbd7092123d6f289930540d7651336225dc172e51b2ce",
        groupHash: "176f93498eac9ca337150b46d21dd58673ea4e3581185f869672e59fa4cb390a",
        schemeID: "pedersen-bls-chained",
        metadata: {
            beaconID: "default"
        }
    }, t.QUICKNET_CHAIN_URL = "https://api.drand.sh/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971", t.QUICKNET_CHAIN_INFO = {
        public_key: "83cf0f2896adee7eb8b5f01fcad3912212c437e0073e911fb90022d3e760183c8c4b450b6a0a6c3ac6a5776a2d1064510d1fec758c921cc22b0e17e63aaf4bcb5ed66304de9cf809bd274ca73bab4af5a6e9c76a4bc09e76eae8991ef5ece45a",
        period: 3,
        genesis_time: 1692803367,
        hash: "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971",
        groupHash: "f477d5c89f21a17c863a7f937c6a6d15859414d2be09cd448d4279af331c5d3e",
        schemeID: "bls-unchained-g1-rfc9380",
        metadata: {
            beaconID: "quicknet"
        }
    }, t.FASTNET_CHAIN_URL = "https://api.drand.sh/dbd506d6ef76e5f386f41c651dcb808c5bcbd75471cc4eafa3f4df7ad4e4c493", t.FASTNET_CHAIN_INFO = {
        hash: "dbd506d6ef76e5f386f41c651dcb808c5bcbd75471cc4eafa3f4df7ad4e4c493",
        public_key: "a0b862a7527fee3a731bcb59280ab6abd62d5c0b6ea03dc4ddf6612fdfc9d01f01c31542541771903475eb1ec6615f8d0df0b8b6dce385811d6dcf8cbefb8759e5e616a3dfd054c928940766d9a5b9db91e3b697e5d70a975181e007f87fca5e",
        period: 3,
        genesis_time: 1677685200,
        groupHash: "a81e9d63f614ccdb144b8ff79fbd4d5a2d22055c0bfe4ee9a8092003dab1c6c0",
        schemeID: "bls-unchained-on-g1",
        metadata: {
            beaconID: "fastnet"
        }
    }, t.TESTNET_DEFAULT_CHAIN_URL = "https://pl-us.testnet.drand.sh", t.TESTNET_DEFAULT_CHAIN_INFO = {
        public_key: "922a2e93828ff83345bae533f5172669a26c02dc76d6bf59c80892e12ab1455c229211886f35bb56af6d5bea981024df",
        period: 25,
        genesis_time: 1590445175,
        hash: "84b2234fb34e835dccd048255d7ad3194b81af7d978c3bf157e3469592ae4e02",
        groupHash: "4dd408e5fdff9323c76a9b6f087ba8fdc5a6da907bd9217d9d10f2287d081957",
        schemeID: "pedersen-bls-chained",
        metadata: {
            beaconID: "default"
        }
    }, t.TESTNET_QUICKNET_CHAIN_URL = "https://pl-us.testnet.drand.sh/cc9c398442737cbd141526600919edd69f1d6f9b4adb67e4d912fbc64341a9a5", t.TESTNET_QUICKNET_CHAIN_INFO = {
        public_key: "b15b65b46fb29104f6a4b5d1e11a8da6344463973d423661bb0804846a0ecd1ef93c25057f1c0baab2ac53e56c662b66072f6d84ee791a3382bfb055afab1e6a375538d8ffc451104ac971d2dc9b168e2d3246b0be2015969cbaac298f6502da",
        period: 3,
        genesis_time: 1689232296,
        hash: "cc9c398442737cbd141526600919edd69f1d6f9b4adb67e4d912fbc64341a9a5",
        groupHash: "40d49d910472d4adb1d67f65db8332f11b4284eecf05c05c5eacd5eef7d40e2d",
        schemeID: "bls-unchained-g1-rfc9380",
        metadata: {
            beaconID: "quicknet-t"
        }
    }, t.defaultClient = function() {
        const e = {
            ...n.defaultChainOptions,
            chainVerificationParams: {
                chainHash: t.DEFAULT_CHAIN_INFO.hash,
                publicKey: t.DEFAULT_CHAIN_INFO.public_key
            }
        }, r = new s.default(t.DEFAULT_CHAIN_URL, e);
        return new i.default(r, e);
    }, t.quicknetClient = function() {
        const e = {
            ...n.defaultChainOptions,
            chainVerificationParams: {
                chainHash: t.QUICKNET_CHAIN_INFO.hash,
                publicKey: t.QUICKNET_CHAIN_INFO.public_key
            }
        }, r = new s.default(t.QUICKNET_CHAIN_URL, e);
        return new i.default(r, e);
    }, t.fastnetClient = function() {
        const e = {
            ...n.defaultChainOptions,
            chainVerificationParams: {
                chainHash: t.FASTNET_CHAIN_INFO.hash,
                publicKey: t.FASTNET_CHAIN_INFO.public_key
            }
        }, r = new s.default(t.FASTNET_CHAIN_URL, e);
        return new i.default(r, e);
    }, t.testnetDefaultClient = function() {
        const e = {
            ...n.defaultChainOptions,
            chainVerificationParams: {
                chainHash: t.TESTNET_DEFAULT_CHAIN_INFO.hash,
                publicKey: t.TESTNET_DEFAULT_CHAIN_INFO.public_key
            }
        }, r = new s.default(t.TESTNET_DEFAULT_CHAIN_URL, e);
        return new i.default(r, e);
    }, t.testnetQuicknetClient = function() {
        const e = {
            ...n.defaultChainOptions,
            chainVerificationParams: {
                chainHash: t.TESTNET_QUICKNET_CHAIN_INFO.hash,
                publicKey: t.TESTNET_QUICKNET_CHAIN_INFO.public_key
            }
        }, r = new s.default(t.TESTNET_QUICKNET_CHAIN_URL, e);
        return new i.default(r, e);
    };
}(Qt), function(t) {
    var e = r3 && r3.__importDefault || function(t) {
        return t && t.__esModule ? t : {
            default: t
        };
    };
    Object.defineProperty(t, "__esModule", {
        value: !0
    }), t.testnetQuicknetClient = t.testnetDefaultClient = t.fastnetClient = t.quicknetClient = t.defaultClient = t.roundTime = t.roundAt = t.FastestNodeClient = t.MultiBeaconNode = t.HttpCachingChain = t.HttpChainClient = t.HttpChain = t.isG1Rfc9380 = t.isG1G2SwappedBeacon = t.isUnchainedBeacon = t.isChainedBeacon = t.watch = t.fetchBeaconByTime = t.fetchBeacon = t.defaultChainOptions = void 0;
    const n = e(a3);
    t.HttpCachingChain = n.default;
    const i = a3;
    Object.defineProperty(t, "HttpChain", {
        enumerable: !0,
        get: function() {
            return i.HttpChain;
        }
    });
    const o = e(l3);
    t.HttpChainClient = o.default;
    const u = e(g2);
    t.FastestNodeClient = u.default;
    const f = e(N10);
    t.MultiBeaconNode = f.default;
    const c = s3;
    Object.defineProperty(t, "roundAt", {
        enumerable: !0,
        get: function() {
            return c.roundAt;
        }
    }), Object.defineProperty(t, "roundTime", {
        enumerable: !0,
        get: function() {
            return c.roundTime;
        }
    });
    const h = B1, d = Qt;
    async function p(t, e) {
        if (e || (e = (0, c.roundAt)(Date.now(), await t.chain().info())), e < 1) throw Error("Cannot request lower than round number 1");
        const n = await t.get(e);
        return _(t, n, e);
    }
    Object.defineProperty(t, "defaultClient", {
        enumerable: !0,
        get: function() {
            return d.defaultClient;
        }
    }), Object.defineProperty(t, "fastnetClient", {
        enumerable: !0,
        get: function() {
            return d.fastnetClient;
        }
    }), Object.defineProperty(t, "quicknetClient", {
        enumerable: !0,
        get: function() {
            return d.quicknetClient;
        }
    }), Object.defineProperty(t, "testnetDefaultClient", {
        enumerable: !0,
        get: function() {
            return d.testnetDefaultClient;
        }
    }), Object.defineProperty(t, "testnetQuicknetClient", {
        enumerable: !0,
        get: function() {
            return d.testnetQuicknetClient;
        }
    }), t.defaultChainOptions = {
        disableBeaconVerification: !1,
        noCache: !1
    }, t.fetchBeacon = p, t.fetchBeaconByTime = async function(t, e) {
        const n = await t.chain().info();
        return p(t, (0, c.roundAt)(e, n));
    }, t.watch = async function*(t, e, n = b) {
        const r = await t.chain().info();
        let i = (0, c.roundAt)(Date.now(), r);
        for(; !e.signal.aborted;){
            const e = Date.now();
            await (0, c.sleep)((0, c.roundTime)(r, i) - e);
            const o = await (0, c.retryOnError)(async ()=>t.get(i), n.retriesOnFailure);
            yield _(t, o, i), i += 1;
        }
    };
    const b = {
        retriesOnFailure: 3
    };
    async function _(t, e, n) {
        if (t.options.disableBeaconVerification) return e;
        const r = await t.chain().info();
        if (!await (0, h.verifyBeacon)(r, e, n)) throw Error("The beacon retrieved was not valid!");
        return e;
    }
    t.isChainedBeacon = function(t, e) {
        return "pedersen-bls-chained" === e.schemeID && !!t.previous_signature && !!t.randomness && !!t.signature && t.round > 0;
    }, t.isUnchainedBeacon = function(t, e) {
        return "pedersen-bls-unchained" === e.schemeID && !!t.randomness && !!t.signature && void 0 === t.previous_signature && t.round > 0;
    }, t.isG1G2SwappedBeacon = function(t, e) {
        return "bls-unchained-on-g1" === e.schemeID && !!t.randomness && !!t.signature && void 0 === t.previous_signature && t.round > 0;
    }, t.isG1Rfc9380 = function(t, e) {
        return "bls-unchained-g1-rfc9380" === e.schemeID && !!t.randomness && !!t.signature && void 0 === t.previous_signature && t.round > 0;
    };
}(o4);
var $t = o4.FastestNodeClient, Vt = o4.HttpCachingChain, qt = o4.HttpChain, zt = o4.HttpChainClient, Xt = o4.MultiBeaconNode, Wt = o4.__esModule, Jt = o4.defaultChainOptions, Zt = o4.defaultClient, te1 = o4.fastnetClient, ee1 = o4.fetchBeacon, ne1 = o4.fetchBeaconByTime, re1 = o4.isChainedBeacon, ie1 = o4.isG1G2SwappedBeacon, oe1 = o4.isG1Rfc9380, ae1 = o4.isUnchainedBeacon, se1 = o4.quicknetClient, ue1 = o4.roundAt, fe1 = o4.roundTime, ce1 = o4.testnetDefaultClient, he1 = o4.testnetQuicknetClient, le1 = o4.watch;
export { encodeHex as encodeHex };
export { decodeBase64 as decodeBase64 };
export { decode as decodeVarint };
export { CarBlockIterator as CarBlockIterator };
export { UnsupportedHashError as UnsupportedHashError, HashMismatchError as HashMismatchError, validateBlock as validateBlock };
export { ne1 as fetchBeaconByTime, zt as HttpChainClient, Vt as HttpCachingChain };
