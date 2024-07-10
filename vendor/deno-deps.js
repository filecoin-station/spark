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
export { encodeHex as encodeHex };
export { decodeBase64 as decodeBase64 };
export { decode as decodeVarint };
export { CarBlockIterator as CarBlockIterator };
export { UnsupportedHashError as UnsupportedHashError, HashMismatchError as HashMismatchError, validateBlock as validateBlock };
