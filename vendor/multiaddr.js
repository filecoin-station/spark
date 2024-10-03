// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var e = function(e, r) {
    if (e.length >= 255) throw new TypeError("Alphabet too long");
    for(var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255;
    for(var o = 0; o < e.length; o++){
        var i = e.charAt(o), a = i.charCodeAt(0);
        if (255 !== t[a]) throw new TypeError(i + " is ambiguous");
        t[a] = o;
    }
    var s = e.length, c = e.charAt(0), f = Math.log(s) / Math.log(256), d = Math.log(256) / Math.log(s);
    function h(e) {
        if ("string" != typeof e) throw new TypeError("Expected String");
        if (0 === e.length) return new Uint8Array;
        var r = 0;
        if (" " !== e[r]) {
            for(var n = 0, o = 0; e[r] === c;)n++, r++;
            for(var i = (e.length - r) * f + 1 >>> 0, a = new Uint8Array(i); e[r];){
                var d = t[e.charCodeAt(r)];
                if (255 === d) return;
                for(var h = 0, u = i - 1; (0 !== d || h < o) && -1 !== u; u--, h++)d += s * a[u] >>> 0, a[u] = d % 256 >>> 0, d = d / 256 >>> 0;
                if (0 !== d) throw new Error("Non-zero carry");
                o = h, r++;
            }
            if (" " !== e[r]) {
                for(var p = i - o; p !== i && 0 === a[p];)p++;
                for(var y = new Uint8Array(n + (i - p)), w = n; p !== i;)y[w++] = a[p++];
                return y;
            }
        }
    }
    return {
        encode: function(r) {
            if (r instanceof Uint8Array || (ArrayBuffer.isView(r) ? r = new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : Array.isArray(r) && (r = Uint8Array.from(r))), !(r instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
            if (0 === r.length) return "";
            for(var t = 0, n = 0, o = 0, i = r.length; o !== i && 0 === r[o];)o++, t++;
            for(var a = (i - o) * d + 1 >>> 0, f = new Uint8Array(a); o !== i;){
                for(var h = r[o], u = 0, p = a - 1; (0 !== h || u < n) && -1 !== p; p--, u++)h += 256 * f[p] >>> 0, f[p] = h % s >>> 0, h = h / s >>> 0;
                if (0 !== h) throw new Error("Non-zero carry");
                n = u, o++;
            }
            for(var y = a - n; y !== a && 0 === f[y];)y++;
            for(var w = c.repeat(t); y < a; ++y)w += e.charAt(f[y]);
            return w;
        },
        decodeUnsafe: h,
        decode: function(e) {
            var t = h(e);
            if (t) return t;
            throw new Error(`Non-${r} character`);
        }
    };
};
class r {
    name;
    prefix;
    baseEncode;
    constructor(e, r, t){
        this.name = e, this.prefix = r, this.baseEncode = t;
    }
    encode(e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
        throw Error("Unknown type, must be binary type");
    }
}
class t {
    name;
    prefix;
    baseDecode;
    prefixCodePoint;
    constructor(e, r, t){
        if (this.name = e, this.prefix = r, void 0 === r.codePointAt(0)) throw new Error("Invalid prefix character");
        this.prefixCodePoint = r.codePointAt(0), this.baseDecode = t;
    }
    decode(e) {
        if ("string" == typeof e) {
            if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            return this.baseDecode(e.slice(this.prefix.length));
        }
        throw Error("Can only multibase decode strings");
    }
    or(e) {
        return o(this, e);
    }
}
class n {
    decoders;
    constructor(e){
        this.decoders = e;
    }
    or(e) {
        return o(this, e);
    }
    decode(e) {
        const r = e[0], t = this.decoders[r];
        if (null != t) return t.decode(e);
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
}
function o(e, r) {
    return new n({
        ...e.decoders ?? {
            [e.prefix]: e
        },
        ...r.decoders ?? {
            [r.prefix]: r
        }
    });
}
class i {
    name;
    prefix;
    baseEncode;
    baseDecode;
    encoder;
    decoder;
    constructor(e, n, o, i){
        this.name = e, this.prefix = n, this.baseEncode = o, this.baseDecode = i, this.encoder = new r(e, n, o), this.decoder = new t(e, n, i);
    }
    encode(e) {
        return this.encoder.encode(e);
    }
    decode(e) {
        return this.decoder.decode(e);
    }
}
function a({ name: r, prefix: t, alphabet: n }) {
    const { encode: o, decode: a } = e(n, r);
    return function({ name: e, prefix: r, encode: t, decode: n }) {
        return new i(e, r, t, n);
    }({
        prefix: t,
        name: r,
        encode: o,
        decode: (e)=>(function(e) {
                if (e instanceof Uint8Array && "Uint8Array" === e.constructor.name) return e;
                if (e instanceof ArrayBuffer) return new Uint8Array(e);
                if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
                throw new Error("Unknown type, must be binary type");
            })(a(e))
    });
}
const s = a({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
}), c = a({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
function e1(e) {
    if (e instanceof Uint8Array && "Uint8Array" === e.constructor.name) return e;
    if (e instanceof ArrayBuffer) return new Uint8Array(e);
    if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
    throw new Error("Unknown type, must be binary type");
}
var r1 = function(e, r) {
    if (e.length >= 255) throw new TypeError("Alphabet too long");
    for(var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255;
    for(var o = 0; o < e.length; o++){
        var i = e.charAt(o), s = i.charCodeAt(0);
        if (255 !== t[s]) throw new TypeError(i + " is ambiguous");
        t[s] = o;
    }
    var a = e.length, c = e.charAt(0), h = Math.log(a) / Math.log(256), u = Math.log(256) / Math.log(a);
    function f(e) {
        if ("string" != typeof e) throw new TypeError("Expected String");
        if (0 === e.length) return new Uint8Array;
        var r = 0;
        if (" " !== e[r]) {
            for(var n = 0, o = 0; e[r] === c;)n++, r++;
            for(var i = (e.length - r) * h + 1 >>> 0, s = new Uint8Array(i); e[r];){
                var u = t[e.charCodeAt(r)];
                if (255 === u) return;
                for(var f = 0, d = i - 1; (0 !== u || f < o) && -1 !== d; d--, f++)u += a * s[d] >>> 0, s[d] = u % 256 >>> 0, u = u / 256 >>> 0;
                if (0 !== u) throw new Error("Non-zero carry");
                o = f, r++;
            }
            if (" " !== e[r]) {
                for(var l = i - o; l !== i && 0 === s[l];)l++;
                for(var p = new Uint8Array(n + (i - l)), b = n; l !== i;)p[b++] = s[l++];
                return p;
            }
        }
    }
    return {
        encode: function(r) {
            if (r instanceof Uint8Array || (ArrayBuffer.isView(r) ? r = new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : Array.isArray(r) && (r = Uint8Array.from(r))), !(r instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
            if (0 === r.length) return "";
            for(var t = 0, n = 0, o = 0, i = r.length; o !== i && 0 === r[o];)o++, t++;
            for(var s = (i - o) * u + 1 >>> 0, h = new Uint8Array(s); o !== i;){
                for(var f = r[o], d = 0, l = s - 1; (0 !== f || d < n) && -1 !== l; l--, d++)f += 256 * h[l] >>> 0, h[l] = f % a >>> 0, f = f / a >>> 0;
                if (0 !== f) throw new Error("Non-zero carry");
                n = d, o++;
            }
            for(var p = s - n; p !== s && 0 === h[p];)p++;
            for(var b = c.repeat(t); p < s; ++p)b += e.charAt(h[p]);
            return b;
        },
        decodeUnsafe: f,
        decode: function(e) {
            var t = f(e);
            if (t) return t;
            throw new Error(`Non-${r} character`);
        }
    };
}, t1 = r1;
class n1 {
    name;
    prefix;
    baseEncode;
    constructor(e, r, t){
        this.name = e, this.prefix = r, this.baseEncode = t;
    }
    encode(e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
        throw Error("Unknown type, must be binary type");
    }
}
class o1 {
    name;
    prefix;
    baseDecode;
    prefixCodePoint;
    constructor(e, r, t){
        if (this.name = e, this.prefix = r, void 0 === r.codePointAt(0)) throw new Error("Invalid prefix character");
        this.prefixCodePoint = r.codePointAt(0), this.baseDecode = t;
    }
    decode(e) {
        if ("string" == typeof e) {
            if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            return this.baseDecode(e.slice(this.prefix.length));
        }
        throw Error("Can only multibase decode strings");
    }
    or(e) {
        return s1(this, e);
    }
}
class i1 {
    decoders;
    constructor(e){
        this.decoders = e;
    }
    or(e) {
        return s1(this, e);
    }
    decode(e) {
        const r = e[0], t = this.decoders[r];
        if (null != t) return t.decode(e);
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
}
function s1(e, r) {
    return new i1({
        ...e.decoders ?? {
            [e.prefix]: e
        },
        ...r.decoders ?? {
            [r.prefix]: r
        }
    });
}
class a1 {
    name;
    prefix;
    baseEncode;
    baseDecode;
    encoder;
    decoder;
    constructor(e, r, t, i){
        this.name = e, this.prefix = r, this.baseEncode = t, this.baseDecode = i, this.encoder = new n1(e, r, t), this.decoder = new o1(e, r, i);
    }
    encode(e) {
        return this.encoder.encode(e);
    }
    decode(e) {
        return this.decoder.decode(e);
    }
}
function c1({ name: e, prefix: r, encode: t, decode: n }) {
    return new a1(e, r, t, n);
}
function h({ name: r, prefix: n, alphabet: o }) {
    const { encode: i, decode: s } = t1(o, r);
    return c1({
        prefix: n,
        name: r,
        encode: i,
        decode: (r)=>e1(s(r))
    });
}
function u({ name: e, prefix: r, bitsPerChar: t, alphabet: n }) {
    return c1({
        prefix: r,
        name: e,
        encode: (e)=>(function(e, r, t) {
                const n = "=" === r[r.length - 1], o = (1 << t) - 1;
                let i = "", s = 0, a = 0;
                for(let n = 0; n < e.length; ++n)for(a = a << 8 | e[n], s += 8; s > t;)s -= t, i += r[o & a >> s];
                if (0 !== s && (i += r[o & a << t - s]), n) for(; 0 != (i.length * t & 7);)i += "=";
                return i;
            })(e, n, t),
        decode: (r)=>(function(e, r, t, n) {
                const o = {};
                for(let e = 0; e < r.length; ++e)o[r[e]] = e;
                let i = e.length;
                for(; "=" === e[i - 1];)--i;
                const s = new Uint8Array(i * t / 8 | 0);
                let a = 0, c = 0, h = 0;
                for(let r = 0; r < i; ++r){
                    const i = o[e[r]];
                    if (void 0 === i) throw new SyntaxError(`Non-${n} character`);
                    c = c << t | i, a += t, a >= 8 && (a -= 8, s[h++] = 255 & c >> a);
                }
                if (a >= t || 0 != (255 & c << 8 - a)) throw new SyntaxError("Unexpected end of data");
                return s;
            })(r, n, t, e)
    });
}
const f = u({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
});
u({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
}), u({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
}), u({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
}), u({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
}), u({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
}), u({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
}), u({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
}), u({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
const d = h({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
});
h({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
var l = function e(r, t, n) {
    t = t || [];
    var o = n = n || 0;
    for(; r >= w;)t[n++] = 255 & r | p, r /= 128;
    for(; r & b;)t[n++] = 255 & r | p, r >>>= 7;
    return t[n] = 0 | r, e.bytes = n - o + 1, t;
}, p = 128, b = -128, w = Math.pow(2, 31);
var y = function e(r, t) {
    var n, o = 0, i = 0, s = t = t || 0, a = r.length;
    do {
        if (s >= a) throw e.bytes = 0, new RangeError("Could not decode varint");
        n = r[s++], o += i < 28 ? (n & m) << i : (n & m) * Math.pow(2, i), i += 7;
    }while (n >= g)
    return e.bytes = s - t, o;
}, g = 128, m = 127;
var v = Math.pow(2, 7), x = Math.pow(2, 14), C = Math.pow(2, 21), E = Math.pow(2, 28), A = Math.pow(2, 35), U = Math.pow(2, 42), D = Math.pow(2, 49), I = Math.pow(2, 56), S = Math.pow(2, 63), z = {
    encode: l,
    decode: y,
    encodingLength: function(e) {
        return e < v ? 1 : e < x ? 2 : e < C ? 3 : e < E ? 4 : e < A ? 5 : e < U ? 6 : e < D ? 7 : e < I ? 8 : e < S ? 9 : 10;
    }
};
function M(e, r = 0) {
    return [
        z.decode(e, r),
        z.decode.bytes
    ];
}
function P(e, r, t = 0) {
    return z.encode(e, r, t), r;
}
function V(e) {
    return z.encodingLength(e);
}
class L {
    code;
    size;
    digest;
    bytes;
    constructor(e, r, t, n){
        this.code = e, this.size = r, this.digest = t, this.bytes = n;
    }
}
function $(e, r) {
    const { bytes: t, version: n } = e;
    return 0 === n ? function(e, r, t) {
        const { prefix: n } = t;
        if (n !== d.prefix) throw Error(`Cannot string encode V0 in ${t.name} encoding`);
        const o = r.get(n);
        if (null == o) {
            const o = t.encode(e).slice(1);
            return r.set(n, o), o;
        }
        return o;
    }(t, B(e), r ?? d.encoder) : function(e, r, t) {
        const { prefix: n } = t, o = r.get(n);
        if (null == o) {
            const o = t.encode(e);
            return r.set(n, o), o;
        }
        return o;
    }(t, B(e), r ?? f.encoder);
}
const N = new WeakMap;
function B(e) {
    const r = N.get(e);
    if (null == r) {
        const r = new Map;
        return N.set(e, r), r;
    }
    return r;
}
class O {
    code;
    version;
    multihash;
    bytes;
    "/";
    constructor(e, r, t, n){
        this.code = r, this.version = e, this.multihash = t, this.bytes = n, this["/"] = n;
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
                return this;
            case 1:
                {
                    const { code: e, multihash: r } = this;
                    if (e !== j) throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                    if (r.code !== q) throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
                    return O.createV0(r);
                }
            default:
                throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
        }
    }
    toV1() {
        switch(this.version){
            case 0:
                {
                    const { code: e, digest: r } = this.multihash, t = function(e, r) {
                        const t = r.byteLength, n = V(e), o = n + V(t), i = new Uint8Array(o + t);
                        return P(e, i, 0), P(t, i, n), i.set(r, o), new L(e, t, r, i);
                    }(e, r);
                    return O.createV1(this.code, t);
                }
            case 1:
                return this;
            default:
                throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
        }
    }
    equals(e) {
        return O.equals(this, e);
    }
    static equals(e, r) {
        const t = r;
        return null != t && e.code === t.code && e.version === t.version && function(e, r) {
            if (e === r) return !0;
            {
                const t = r;
                return e.code === t.code && e.size === t.size && t.bytes instanceof Uint8Array && function(e, r) {
                    if (e === r) return !0;
                    if (e.byteLength !== r.byteLength) return !1;
                    for(let t = 0; t < e.byteLength; t++)if (e[t] !== r[t]) return !1;
                    return !0;
                }(e.bytes, t.bytes);
            }
        }(e.multihash, t.multihash);
    }
    toString(e) {
        return $(this, e);
    }
    toJSON() {
        return {
            "/": $(this)
        };
    }
    link() {
        return this;
    }
    [Symbol.toStringTag] = "CID";
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return `CID(${this.toString()})`;
    }
    static asCID(r) {
        if (null == r) return null;
        const t = r;
        if (t instanceof O) return t;
        if (null != t["/"] && t["/"] === t.bytes || t.asCID === t) {
            const { version: e, code: r, multihash: n, bytes: o } = t;
            return new O(e, r, n, o ?? J(e, r, n.bytes));
        }
        if (!0 === t[R]) {
            const { version: r, multihash: n, code: o } = t, i = function(r) {
                const t = e1(r), [n, o] = M(t), [i, s] = M(t.subarray(o)), a = t.subarray(o + s);
                if (a.byteLength !== i) throw new Error("Incorrect length");
                return new L(n, i, a, t);
            }(n);
            return O.create(r, o, i);
        }
        return null;
    }
    static create(e, r, t) {
        if ("number" != typeof r) throw new Error("String codecs are no longer supported");
        if (!(t.bytes instanceof Uint8Array)) throw new Error("Invalid digest");
        switch(e){
            case 0:
                if (r !== j) throw new Error(`Version 0 CID must use dag-pb (code: ${j}) block encoding`);
                return new O(e, r, t, t.bytes);
            case 1:
                {
                    const n = J(e, r, t.bytes);
                    return new O(e, r, t, n);
                }
            default:
                throw new Error("Invalid version");
        }
    }
    static createV0(e) {
        return O.create(0, j, e);
    }
    static createV1(e, r) {
        return O.create(1, e, r);
    }
    static decode(e) {
        const [r, t] = O.decodeFirst(e);
        if (0 !== t.length) throw new Error("Incorrect length");
        return r;
    }
    static decodeFirst(r) {
        const t = O.inspectBytes(r), n = t.size - t.multihashSize, o = e1(r.subarray(n, n + t.multihashSize));
        if (o.byteLength !== t.multihashSize) throw new Error("Incorrect length");
        const i = o.subarray(t.multihashSize - t.digestSize), s = new L(t.multihashCode, t.digestSize, i, o);
        return [
            0 === t.version ? O.createV0(s) : O.createV1(t.codec, s),
            r.subarray(t.size)
        ];
    }
    static inspectBytes(e) {
        let r = 0;
        const t = ()=>{
            const [t, n] = M(e.subarray(r));
            return r += n, t;
        };
        let n = t(), o = j;
        if (18 === n ? (n = 0, r = 0) : o = t(), 0 !== n && 1 !== n) throw new RangeError(`Invalid CID version ${n}`);
        const i = r, s = t(), a = t(), c = r + a;
        return {
            version: n,
            codec: o,
            multihashCode: s,
            digestSize: a,
            multihashSize: c - i,
            size: c
        };
    }
    static parse(e, r) {
        const [t, n] = function(e, r) {
            switch(e[0]){
                case "Q":
                    {
                        const t = r ?? d;
                        return [
                            d.prefix,
                            t.decode(`${d.prefix}${e}`)
                        ];
                    }
                case d.prefix:
                    {
                        const t = r ?? d;
                        return [
                            d.prefix,
                            t.decode(e)
                        ];
                    }
                case f.prefix:
                    {
                        const t = r ?? f;
                        return [
                            f.prefix,
                            t.decode(e)
                        ];
                    }
                default:
                    if (null == r) throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
                    return [
                        e[0],
                        r.decode(e)
                    ];
            }
        }(e, r), o = O.decode(n);
        if (0 === o.version && "Q" !== e[0]) throw Error("Version 0 CID string must not include multibase prefix");
        return B(o).set(t, e), o;
    }
}
const j = 112, q = 18;
function J(e, r, t) {
    const n = V(e), o = n + V(r), i = new Uint8Array(o + t.byteLength);
    return P(e, i, 0), P(r, i, n), i.set(t, o), i;
}
const R = Symbol.for("@ipld/js-cid/CID");
function t2(t, e) {
    if (t === e) return !0;
    if (t.byteLength !== e.byteLength) return !1;
    for(let r = 0; r < t.byteLength; r++)if (t[r] !== e[r]) return !1;
    return !0;
}
const e2 = new Uint8Array(0);
function r2(e, r) {
    if (e === r) return !0;
    if (e.byteLength !== r.byteLength) return !1;
    for(let t = 0; t < e.byteLength; t++)if (e[t] !== r[t]) return !1;
    return !0;
}
function t3(e) {
    if (e instanceof Uint8Array && "Uint8Array" === e.constructor.name) return e;
    if (e instanceof ArrayBuffer) return new Uint8Array(e);
    if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
    throw new Error("Unknown type, must be binary type");
}
function n2(e) {
    return (new TextEncoder).encode(e);
}
function o2(e) {
    return (new TextDecoder).decode(e);
}
Object.freeze({
    __proto__: null,
    empty: e2,
    toHex: function(e) {
        return e.reduce((e, r)=>e + r.toString(16).padStart(2, "0"), "");
    },
    fromHex: function(r) {
        const t = r.match(/../g);
        return null != t ? new Uint8Array(t.map((e)=>parseInt(e, 16))) : e2;
    },
    equals: r2,
    coerce: t3,
    isBinary: function(e) {
        return e instanceof ArrayBuffer || ArrayBuffer.isView(e);
    },
    fromString: n2,
    toString: o2
});
var i2 = function(e, r) {
    if (e.length >= 255) throw new TypeError("Alphabet too long");
    for(var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255;
    for(var o = 0; o < e.length; o++){
        var a = e.charAt(o), i = a.charCodeAt(0);
        if (255 !== t[i]) throw new TypeError(a + " is ambiguous");
        t[i] = o;
    }
    var s = e.length, c = e.charAt(0), u = Math.log(s) / Math.log(256), h = Math.log(256) / Math.log(s);
    function d(e) {
        if ("string" != typeof e) throw new TypeError("Expected String");
        if (0 === e.length) return new Uint8Array;
        var r = 0;
        if (" " !== e[r]) {
            for(var n = 0, o = 0; e[r] === c;)n++, r++;
            for(var a = (e.length - r) * u + 1 >>> 0, i = new Uint8Array(a); e[r];){
                var h = t[e.charCodeAt(r)];
                if (255 === h) return;
                for(var d = 0, f = a - 1; (0 !== h || d < o) && -1 !== f; f--, d++)h += s * i[f] >>> 0, i[f] = h % 256 >>> 0, h = h / 256 >>> 0;
                if (0 !== h) throw new Error("Non-zero carry");
                o = d, r++;
            }
            if (" " !== e[r]) {
                for(var p = a - o; p !== a && 0 === i[p];)p++;
                for(var b = new Uint8Array(n + (a - p)), l = n; p !== a;)b[l++] = i[p++];
                return b;
            }
        }
    }
    return {
        encode: function(r) {
            if (r instanceof Uint8Array || (ArrayBuffer.isView(r) ? r = new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : Array.isArray(r) && (r = Uint8Array.from(r))), !(r instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
            if (0 === r.length) return "";
            for(var t = 0, n = 0, o = 0, a = r.length; o !== a && 0 === r[o];)o++, t++;
            for(var i = (a - o) * h + 1 >>> 0, u = new Uint8Array(i); o !== a;){
                for(var d = r[o], f = 0, p = i - 1; (0 !== d || f < n) && -1 !== p; p--, f++)d += 256 * u[p] >>> 0, u[p] = d % s >>> 0, d = d / s >>> 0;
                if (0 !== d) throw new Error("Non-zero carry");
                n = f, o++;
            }
            for(var b = i - n; b !== i && 0 === u[b];)b++;
            for(var l = c.repeat(t); b < i; ++b)l += e.charAt(u[b]);
            return l;
        },
        decodeUnsafe: d,
        decode: function(e) {
            var t = d(e);
            if (t) return t;
            throw new Error(`Non-${r} character`);
        }
    };
}, s2 = i2;
class c2 {
    name;
    prefix;
    baseEncode;
    constructor(e, r, t){
        this.name = e, this.prefix = r, this.baseEncode = t;
    }
    encode(e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
        throw Error("Unknown type, must be binary type");
    }
}
class u1 {
    name;
    prefix;
    baseDecode;
    prefixCodePoint;
    constructor(e, r, t){
        if (this.name = e, this.prefix = r, void 0 === r.codePointAt(0)) throw new Error("Invalid prefix character");
        this.prefixCodePoint = r.codePointAt(0), this.baseDecode = t;
    }
    decode(e) {
        if ("string" == typeof e) {
            if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            return this.baseDecode(e.slice(this.prefix.length));
        }
        throw Error("Can only multibase decode strings");
    }
    or(e) {
        return d1(this, e);
    }
}
class h1 {
    decoders;
    constructor(e){
        this.decoders = e;
    }
    or(e) {
        return d1(this, e);
    }
    decode(e) {
        const r = e[0], t = this.decoders[r];
        if (null != t) return t.decode(e);
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
}
function d1(e, r) {
    return new h1({
        ...e.decoders ?? {
            [e.prefix]: e
        },
        ...r.decoders ?? {
            [r.prefix]: r
        }
    });
}
class f1 {
    name;
    prefix;
    baseEncode;
    baseDecode;
    encoder;
    decoder;
    constructor(e, r, t, n){
        this.name = e, this.prefix = r, this.baseEncode = t, this.baseDecode = n, this.encoder = new c2(e, r, t), this.decoder = new u1(e, r, n);
    }
    encode(e) {
        return this.encoder.encode(e);
    }
    decode(e) {
        return this.decoder.decode(e);
    }
}
function p1({ name: e, prefix: r, encode: t, decode: n }) {
    return new f1(e, r, t, n);
}
function b1({ name: e, prefix: r, alphabet: n }) {
    const { encode: o, decode: a } = s2(n, e);
    return p1({
        prefix: r,
        name: e,
        encode: o,
        decode: (e)=>t3(a(e))
    });
}
function l1({ name: e, prefix: r, bitsPerChar: t, alphabet: n }) {
    return p1({
        prefix: r,
        name: e,
        encode: (e)=>(function(e, r, t) {
                const n = "=" === r[r.length - 1], o = (1 << t) - 1;
                let a = "", i = 0, s = 0;
                for(let n = 0; n < e.length; ++n)for(s = s << 8 | e[n], i += 8; i > t;)i -= t, a += r[o & s >> i];
                if (0 !== i && (a += r[o & s << t - i]), n) for(; 0 != (a.length * t & 7);)a += "=";
                return a;
            })(e, n, t),
        decode: (r)=>(function(e, r, t, n) {
                const o = {};
                for(let e = 0; e < r.length; ++e)o[r[e]] = e;
                let a = e.length;
                for(; "=" === e[a - 1];)--a;
                const i = new Uint8Array(a * t / 8 | 0);
                let s = 0, c = 0, u = 0;
                for(let r = 0; r < a; ++r){
                    const a = o[e[r]];
                    if (void 0 === a) throw new SyntaxError(`Non-${n} character`);
                    c = c << t | a, s += t, s >= 8 && (s -= 8, i[u++] = 255 & c >> s);
                }
                if (s >= t || 0 != (255 & c << 8 - s)) throw new SyntaxError("Unexpected end of data");
                return i;
            })(r, n, t, e)
    });
}
const w1 = b1({
    prefix: "9",
    name: "base10",
    alphabet: "0123456789"
});
var y1 = Object.freeze({
    __proto__: null,
    base10: w1
});
const m1 = l1({
    prefix: "f",
    name: "base16",
    alphabet: "0123456789abcdef",
    bitsPerChar: 4
}), g1 = l1({
    prefix: "F",
    name: "base16upper",
    alphabet: "0123456789ABCDEF",
    bitsPerChar: 4
});
var v1 = Object.freeze({
    __proto__: null,
    base16: m1,
    base16upper: g1
});
const x1 = l1({
    prefix: "0",
    name: "base2",
    alphabet: "01",
    bitsPerChar: 1
});
var _ = Object.freeze({
    __proto__: null,
    base2: x1
});
const C1 = Array.from("🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂"), A1 = C1.reduce((e, r, t)=>(e[t] = r, e), []), E1 = C1.reduce((e, r, t)=>(e[r.codePointAt(0)] = t, e), []);
const z1 = p1({
    prefix: "🚀",
    name: "base256emoji",
    encode: function(e) {
        return e.reduce((e, r)=>e += A1[r], "");
    },
    decode: function(e) {
        const r = [];
        for (const t of e){
            const e = E1[t.codePointAt(0)];
            if (void 0 === e) throw new Error(`Non-base256emoji character: ${t}`);
            r.push(e);
        }
        return new Uint8Array(r);
    }
});
var U1 = Object.freeze({
    __proto__: null,
    base256emoji: z1
});
const S1 = l1({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
}), j1 = l1({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
}), O1 = l1({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
}), P1 = l1({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
}), D1 = l1({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
}), I1 = l1({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
}), M1 = l1({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
}), V1 = l1({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
}), L1 = l1({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
var T = Object.freeze({
    __proto__: null,
    base32: S1,
    base32upper: j1,
    base32pad: O1,
    base32padupper: P1,
    base32hex: D1,
    base32hexupper: I1,
    base32hexpad: M1,
    base32hexpadupper: V1,
    base32z: L1
});
const k = b1({
    prefix: "k",
    name: "base36",
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
}), B1 = b1({
    prefix: "K",
    name: "base36upper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
var N1 = Object.freeze({
    __proto__: null,
    base36: k,
    base36upper: B1
});
const $1 = b1({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
}), q1 = b1({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
var H = Object.freeze({
    __proto__: null,
    base58btc: $1,
    base58flickr: q1
});
const J1 = l1({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6
}), F = l1({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6
}), R1 = l1({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6
}), Q = l1({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6
});
var K = Object.freeze({
    __proto__: null,
    base64: J1,
    base64pad: F,
    base64url: R1,
    base64urlpad: Q
});
const G = l1({
    prefix: "7",
    name: "base8",
    alphabet: "01234567",
    bitsPerChar: 3
});
var W = Object.freeze({
    __proto__: null,
    base8: G
});
const Z = p1({
    prefix: "\0",
    name: "identity",
    encode: (e)=>o2(e),
    decode: (e)=>n2(e)
});
var X = Object.freeze({
    __proto__: null,
    identity: Z
});
const Y = new TextEncoder, ee = new TextDecoder;
Object.freeze({
    __proto__: null,
    name: "json",
    code: 512,
    encode: function(e) {
        return Y.encode(JSON.stringify(e));
    },
    decode: function(e) {
        return JSON.parse(ee.decode(e));
    }
});
var te = Object.freeze({
    __proto__: null,
    name: "raw",
    code: 85,
    encode: function(e) {
        return t3(e);
    },
    decode: function(e) {
        return t3(e);
    }
}), ne = function e(r, t, n) {
    t = t || [];
    var o = n = n || 0;
    for(; r >= ie;)t[n++] = 255 & r | oe, r /= 128;
    for(; r & ae;)t[n++] = 255 & r | oe, r >>>= 7;
    return t[n] = 0 | r, e.bytes = n - o + 1, t;
}, oe = 128, ae = -128, ie = Math.pow(2, 31);
var se = function e(r, t) {
    var n, o = 0, a = 0, i = t = t || 0, s = r.length;
    do {
        if (i >= s) throw e.bytes = 0, new RangeError("Could not decode varint");
        n = r[i++], o += a < 28 ? (n & ue) << a : (n & ue) * Math.pow(2, a), a += 7;
    }while (n >= ce)
    return e.bytes = i - t, o;
}, ce = 128, ue = 127;
var he = Math.pow(2, 7), de = Math.pow(2, 14), fe = Math.pow(2, 21), pe = Math.pow(2, 28), be = Math.pow(2, 35), le = Math.pow(2, 42), we = Math.pow(2, 49), ye = Math.pow(2, 56), me = Math.pow(2, 63), ge = {
    encode: ne,
    decode: se,
    encodingLength: function(e) {
        return e < he ? 1 : e < de ? 2 : e < fe ? 3 : e < pe ? 4 : e < be ? 5 : e < le ? 6 : e < we ? 7 : e < ye ? 8 : e < me ? 9 : 10;
    }
};
function ve(e, r = 0) {
    return [
        ge.decode(e, r),
        ge.decode.bytes
    ];
}
function xe(e, r, t = 0) {
    return ge.encode(e, r, t), r;
}
function _e(e) {
    return ge.encodingLength(e);
}
Object.freeze({
    __proto__: null,
    decode: ve,
    encodeTo: xe,
    encodingLength: _e
});
function Ae(e, r) {
    const t = r.byteLength, n = _e(e), o = n + _e(t), a = new Uint8Array(o + t);
    return xe(e, a, 0), xe(t, a, n), a.set(r, o), new Ue(e, t, r, a);
}
function Ee(e) {
    const r = t3(e), [n, o] = ve(r), [a, i] = ve(r.subarray(o)), s = r.subarray(o + i);
    if (s.byteLength !== a) throw new Error("Incorrect length");
    return new Ue(n, a, s, r);
}
function ze(e, t) {
    if (e === t) return !0;
    {
        const n = t;
        return e.code === n.code && e.size === n.size && n.bytes instanceof Uint8Array && r2(e.bytes, n.bytes);
    }
}
class Ue {
    code;
    size;
    digest;
    bytes;
    constructor(e, r, t, n){
        this.code = e, this.size = r, this.digest = t, this.bytes = n;
    }
}
Object.freeze({
    __proto__: null,
    create: Ae,
    decode: Ee,
    equals: ze,
    Digest: Ue
});
const je = t3;
const Oe = {
    code: 0,
    name: "identity",
    encode: je,
    digest: function(e) {
        return Ae(0, je(e));
    }
};
var Pe = Object.freeze({
    __proto__: null,
    identity: Oe
});
function De({ name: e, code: r, encode: t }) {
    return new Ie(e, r, t);
}
class Ie {
    name;
    code;
    encode;
    constructor(e, r, t){
        this.name = e, this.code = r, this.encode = t;
    }
    digest(e) {
        if (e instanceof Uint8Array) {
            const r = this.encode(e);
            return r instanceof Uint8Array ? Ae(this.code, r) : r.then((e)=>Ae(this.code, e));
        }
        throw Error("Unknown type, must be binary type");
    }
}
Object.freeze({
    __proto__: null,
    from: De,
    Hasher: Ie
});
function Ve(e) {
    return async (r)=>new Uint8Array(await crypto.subtle.digest(e, r));
}
const Le = De({
    name: "sha2-256",
    code: 18,
    encode: Ve("SHA-256")
}), Te = De({
    name: "sha2-512",
    code: 19,
    encode: Ve("SHA-512")
});
var ke = Object.freeze({
    __proto__: null,
    sha256: Le,
    sha512: Te
});
function Be(e, r) {
    const { bytes: t, version: n } = e;
    return 0 === n ? function(e, r, t) {
        const { prefix: n } = t;
        if (n !== $1.prefix) throw Error(`Cannot string encode V0 in ${t.name} encoding`);
        const o = r.get(n);
        if (null == o) {
            const o = t.encode(e).slice(1);
            return r.set(n, o), o;
        }
        return o;
    }(t, $e(e), r ?? $1.encoder) : function(e, r, t) {
        const { prefix: n } = t, o = r.get(n);
        if (null == o) {
            const o = t.encode(e);
            return r.set(n, o), o;
        }
        return o;
    }(t, $e(e), r ?? S1.encoder);
}
const Ne = new WeakMap;
function $e(e) {
    const r = Ne.get(e);
    if (null == r) {
        const r = new Map;
        return Ne.set(e, r), r;
    }
    return r;
}
class qe {
    code;
    version;
    multihash;
    bytes;
    "/";
    constructor(e, r, t, n){
        this.code = r, this.version = e, this.multihash = t, this.bytes = n, this["/"] = n;
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
                return this;
            case 1:
                {
                    const { code: e, multihash: r } = this;
                    if (e !== He) throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                    if (r.code !== Je) throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
                    return qe.createV0(r);
                }
            default:
                throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
        }
    }
    toV1() {
        switch(this.version){
            case 0:
                {
                    const { code: e, digest: r } = this.multihash, t = Ae(e, r);
                    return qe.createV1(this.code, t);
                }
            case 1:
                return this;
            default:
                throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
        }
    }
    equals(e) {
        return qe.equals(this, e);
    }
    static equals(e, r) {
        const t = r;
        return null != t && e.code === t.code && e.version === t.version && ze(e.multihash, t.multihash);
    }
    toString(e) {
        return Be(this, e);
    }
    toJSON() {
        return {
            "/": Be(this)
        };
    }
    link() {
        return this;
    }
    [Symbol.toStringTag] = "CID";
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return `CID(${this.toString()})`;
    }
    static asCID(e) {
        if (null == e) return null;
        const r = e;
        if (r instanceof qe) return r;
        if (null != r["/"] && r["/"] === r.bytes || r.asCID === r) {
            const { version: e, code: t, multihash: n, bytes: o } = r;
            return new qe(e, t, n, o ?? Fe(e, t, n.bytes));
        }
        if (!0 === r[Re]) {
            const { version: e, multihash: t, code: n } = r, o = Ee(t);
            return qe.create(e, n, o);
        }
        return null;
    }
    static create(e, r, t) {
        if ("number" != typeof r) throw new Error("String codecs are no longer supported");
        if (!(t.bytes instanceof Uint8Array)) throw new Error("Invalid digest");
        switch(e){
            case 0:
                if (r !== He) throw new Error(`Version 0 CID must use dag-pb (code: ${He}) block encoding`);
                return new qe(e, r, t, t.bytes);
            case 1:
                {
                    const n = Fe(e, r, t.bytes);
                    return new qe(e, r, t, n);
                }
            default:
                throw new Error("Invalid version");
        }
    }
    static createV0(e) {
        return qe.create(0, He, e);
    }
    static createV1(e, r) {
        return qe.create(1, e, r);
    }
    static decode(e) {
        const [r, t] = qe.decodeFirst(e);
        if (0 !== t.length) throw new Error("Incorrect length");
        return r;
    }
    static decodeFirst(e) {
        const r = qe.inspectBytes(e), n = r.size - r.multihashSize, o = t3(e.subarray(n, n + r.multihashSize));
        if (o.byteLength !== r.multihashSize) throw new Error("Incorrect length");
        const a = o.subarray(r.multihashSize - r.digestSize), i = new Ue(r.multihashCode, r.digestSize, a, o);
        return [
            0 === r.version ? qe.createV0(i) : qe.createV1(r.codec, i),
            e.subarray(r.size)
        ];
    }
    static inspectBytes(e) {
        let r = 0;
        const t = ()=>{
            const [t, n] = ve(e.subarray(r));
            return r += n, t;
        };
        let n = t(), o = He;
        if (18 === n ? (n = 0, r = 0) : o = t(), 0 !== n && 1 !== n) throw new RangeError(`Invalid CID version ${n}`);
        const a = r, i = t(), s = t(), c = r + s;
        return {
            version: n,
            codec: o,
            multihashCode: i,
            digestSize: s,
            multihashSize: c - a,
            size: c
        };
    }
    static parse(e, r) {
        const [t, n] = function(e, r) {
            switch(e[0]){
                case "Q":
                    {
                        const t = r ?? $1;
                        return [
                            $1.prefix,
                            t.decode(`${$1.prefix}${e}`)
                        ];
                    }
                case $1.prefix:
                    {
                        const t = r ?? $1;
                        return [
                            $1.prefix,
                            t.decode(e)
                        ];
                    }
                case S1.prefix:
                    {
                        const t = r ?? S1;
                        return [
                            S1.prefix,
                            t.decode(e)
                        ];
                    }
                default:
                    if (null == r) throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
                    return [
                        e[0],
                        r.decode(e)
                    ];
            }
        }(e, r), o = qe.decode(n);
        if (0 === o.version && "Q" !== e[0]) throw Error("Version 0 CID string must not include multibase prefix");
        return $e(o).set(t, e), o;
    }
}
const He = 112, Je = 18;
function Fe(e, r, t) {
    const n = _e(e), o = n + _e(r), a = new Uint8Array(o + t.byteLength);
    return xe(e, a, 0), xe(r, a, n), a.set(t, o), a;
}
const Re = Symbol.for("@ipld/js-cid/CID"), Qe = {
    ...X,
    ..._,
    ...W,
    ...y1,
    ...v1,
    ...T,
    ...N1,
    ...H,
    ...K,
    ...U1
}, Ke = {
    ...ke,
    ...Pe
};
function n3(e, n, r, t) {
    return {
        name: e,
        prefix: n,
        encoder: {
            name: e,
            prefix: n,
            encode: r
        },
        decoder: {
            decode: t
        }
    };
}
const r3 = n3("utf8", "u", (e)=>"u" + new TextDecoder("utf8").decode(e), (e)=>(new TextEncoder).encode(e.substring(1))), t4 = n3("ascii", "a", (e)=>{
    let n = "a";
    for(let r = 0; r < e.length; r++)n += String.fromCharCode(e[r]);
    return n;
}, (e)=>{
    const n = function(e = 0) {
        return new Uint8Array(e);
    }((e = e.substring(1)).length);
    for(let r = 0; r < e.length; r++)n[r] = e.charCodeAt(r);
    return n;
}), o3 = {
    utf8: r3,
    "utf-8": r3,
    hex: Qe.base16,
    latin1: t4,
    ascii: t4,
    binary: t4,
    ...Qe
};
function u2(e, n = "utf8") {
    const r = o3[n];
    if (null == r) throw new Error(`Unsupported encoding "${n}"`);
    return r.encoder.encode(e).substring(1);
}
function l2(l) {
    return null != globalThis.Buffer ? new Uint8Array(l.buffer, l.byteOffset, l.byteLength) : l;
}
function e3(n = 0) {
    return null != globalThis.Buffer?.allocUnsafe ? l2(globalThis.Buffer.allocUnsafe(n)) : new Uint8Array(n);
}
const e4 = Math.pow(2, 7), t5 = Math.pow(2, 14), n4 = Math.pow(2, 21), u3 = Math.pow(2, 28), a2 = Math.pow(2, 35), i3 = Math.pow(2, 42), o4 = Math.pow(2, 49), f2 = 128, c3 = 127;
function s3(r) {
    if (r < e4) return 1;
    if (r < t5) return 2;
    if (r < n4) return 3;
    if (r < u3) return 4;
    if (r < a2) return 5;
    if (r < i3) return 6;
    if (r < o4) return 7;
    if (null != Number.MAX_SAFE_INTEGER && r > Number.MAX_SAFE_INTEGER) throw new RangeError("Could not encode varint");
    return 8;
}
function w2(r, e, t = 0) {
    switch(s3(r)){
        case 8:
            e[t++] = 255 & r | f2, r /= 128;
        case 7:
            e[t++] = 255 & r | f2, r /= 128;
        case 6:
            e[t++] = 255 & r | f2, r /= 128;
        case 5:
            e[t++] = 255 & r | f2, r /= 128;
        case 4:
            e[t++] = 255 & r | f2, r >>>= 7;
        case 3:
            e[t++] = 255 & r | f2, r >>>= 7;
        case 2:
            e[t++] = 255 & r | f2, r >>>= 7;
        case 1:
            e[t++] = 255 & r, r >>>= 7;
            break;
        default:
            throw new Error("unreachable");
    }
    return e;
}
function l3(r, e, t = 0) {
    switch(s3(r)){
        case 8:
            e.set(t++, 255 & r | 128), r /= 128;
        case 7:
            e.set(t++, 255 & r | 128), r /= 128;
        case 6:
            e.set(t++, 255 & r | 128), r /= 128;
        case 5:
            e.set(t++, 255 & r | 128), r /= 128;
        case 4:
            e.set(t++, 255 & r | 128), r >>>= 7;
        case 3:
            e.set(t++, 255 & r | 128), r >>>= 7;
        case 2:
            e.set(t++, 255 & r | 128), r >>>= 7;
        case 1:
            e.set(t++, 255 & r), r >>>= 7;
            break;
        default:
            throw new Error("unreachable");
    }
    return e;
}
function h2(r, e) {
    let t = r[e], n = 0;
    if (n += t & c3, t < 128) return n;
    if (t = r[e + 1], n += (t & c3) << 7, t < 128) return n;
    if (t = r[e + 2], n += (t & c3) << 14, t < 128) return n;
    if (t = r[e + 3], n += (t & c3) << 21, t < 128) return n;
    if (t = r[e + 4], n += (t & c3) * u3, t < 128) return n;
    if (t = r[e + 5], n += (t & c3) * a2, t < 128) return n;
    if (t = r[e + 6], n += (t & c3) * i3, t < 128) return n;
    if (t = r[e + 7], n += (t & c3) * o4, t < 128) return n;
    throw new RangeError("Could not decode varint");
}
function d2(r, e) {
    let t = r.get(e), n = 0;
    if (n += t & c3, t < 128) return n;
    if (t = r.get(e + 1), n += (t & c3) << 7, t < 128) return n;
    if (t = r.get(e + 2), n += (t & c3) << 14, t < 128) return n;
    if (t = r.get(e + 3), n += (t & c3) << 21, t < 128) return n;
    if (t = r.get(e + 4), n += (t & c3) * u3, t < 128) return n;
    if (t = r.get(e + 5), n += (t & c3) * a2, t < 128) return n;
    if (t = r.get(e + 6), n += (t & c3) * i3, t < 128) return n;
    if (t = r.get(e + 7), n += (t & c3) * o4, t < 128) return n;
    throw new RangeError("Could not decode varint");
}
function g2(e, t, n = 0) {
    return null == t && (t = e3(s3(e))), t instanceof Uint8Array ? w2(e, t, n) : l3(e, t, n);
}
function p2(r, e = 0) {
    return r instanceof Uint8Array ? h2(r, e) : d2(r, e);
}
function n5(n, t) {
    null == t && (t = n.reduce((n, t)=>n + t.length, 0));
    const e = function(n = 0) {
        return new Uint8Array(n);
    }(t);
    let r = 0;
    for (const t of n)e.set(t, r), r += t.length;
    return e;
}
const r4 = new class {
    index = 0;
    input = "";
    new(r) {
        return this.index = 0, this.input = r, this;
    }
    readAtomically(r) {
        const t = this.index, e = r();
        return void 0 === e && (this.index = t), e;
    }
    parseWith(r) {
        const t = r();
        if (this.index === this.input.length) return t;
    }
    peekChar() {
        if (!(this.index >= this.input.length)) return this.input[this.index];
    }
    readChar() {
        if (!(this.index >= this.input.length)) return this.input[this.index++];
    }
    readGivenChar(r) {
        return this.readAtomically(()=>{
            const t = this.readChar();
            if (t === r) return t;
        });
    }
    readSeparator(r, t, e) {
        return this.readAtomically(()=>{
            if (!(t > 0 && void 0 === this.readGivenChar(r))) return e();
        });
    }
    readNumber(r, t, e, i) {
        return this.readAtomically(()=>{
            let n = 0, d = 0;
            const a = this.peekChar();
            if (void 0 === a) return;
            const s = "0" === a, h = 2 ** (8 * i) - 1;
            for(;;){
                const e = this.readAtomically(()=>{
                    const t = this.readChar();
                    if (void 0 === t) return;
                    const e = Number.parseInt(t, r);
                    return Number.isNaN(e) ? void 0 : e;
                });
                if (void 0 === e) break;
                if (n *= r, n += e, n > h) return;
                if (d += 1, void 0 !== t && d > t) return;
            }
            return 0 === d || !e && s && d > 1 ? void 0 : n;
        });
    }
    readIPv4Addr() {
        return this.readAtomically(()=>{
            const r = new Uint8Array(4);
            for(let t = 0; t < r.length; t++){
                const e = this.readSeparator(".", t, ()=>this.readNumber(10, 3, !1, 1));
                if (void 0 === e) return;
                r[t] = e;
            }
            return r;
        });
    }
    readIPv6Addr() {
        const r = (r)=>{
            for(let t = 0; t < r.length / 2; t++){
                const e = 2 * t;
                if (t < r.length - 3) {
                    const i = this.readSeparator(":", t, ()=>this.readIPv4Addr());
                    if (void 0 !== i) return r[e] = i[0], r[e + 1] = i[1], r[e + 2] = i[2], r[e + 3] = i[3], [
                        e + 4,
                        !0
                    ];
                }
                const i = this.readSeparator(":", t, ()=>this.readNumber(16, 4, !0, 2));
                if (void 0 === i) return [
                    e,
                    !1
                ];
                r[e] = i >> 8, r[e + 1] = 255 & i;
            }
            return [
                r.length,
                !1
            ];
        };
        return this.readAtomically(()=>{
            const t = new Uint8Array(16), [e, i] = r(t);
            if (16 === e) return t;
            if (i) return;
            if (void 0 === this.readGivenChar(":")) return;
            if (void 0 === this.readGivenChar(":")) return;
            const n = new Uint8Array(14), d = 16 - (e + 2), [a] = r(n.subarray(0, d));
            return t.set(n.subarray(0, a), 16 - a), t;
        });
    }
    readIPAddr() {
        return this.readIPv4Addr() ?? this.readIPv6Addr();
    }
};
function t6(t) {
    if (!(t.length > 15)) return r4.new(t).parseWith(()=>r4.readIPv4Addr());
}
function e5(t) {
    if (t.includes("%") && (t = t.split("%")[0]), !(t.length > 45)) return r4.new(t).parseWith(()=>r4.readIPv6Addr());
}
function i4(t) {
    if (t.includes("%") && (t = t.split("%")[0]), !(t.length > 45)) return r4.new(t).parseWith(()=>r4.readIPAddr());
}
function e6(t, r, n, e) {
    let o = 0;
    for (const i of t)if (!(o < n)) {
        if (o > e) break;
        if (i !== r[o]) return !1;
        o++;
    }
    return !0;
}
function o5(t) {
    switch(t.length){
        case i5:
            return t.join(".");
        case s4:
            {
                const r = [];
                for(let n = 0; n < t.length; n++)n % 2 == 0 && r.push(t[n].toString(16).padStart(2, "0") + t[n + 1].toString(16).padStart(2, "0"));
                return r.join(":");
            }
        default:
            throw new Error("Invalid ip length");
    }
}
const i5 = 4, s4 = 16, l4 = new Uint8Array([
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
    255,
    255
]);
function f3(t, r) {
    r.length === 16 && t.length === 4 && function(t, r, n) {
        let e = 0;
        for (const o of t)if (!(e < r)) {
            if (e > n) break;
            if (255 !== o) return !1;
            e++;
        }
        return !0;
    }(r, 0, 11) && (r = r.slice(12)), r.length === 4 && t.length === 16 && e6(t, l4, 0, 11) && (t = t.slice(12));
    const n = t.length;
    if (n != r.length) throw new Error("Failed to mask ip");
    const o = new Uint8Array(n);
    for(let e = 0; e < n; e++)o[e] = t[e] & r[e];
    return o;
}
function h3(t) {
    const [e, o] = t.split("/");
    if (!e || !o) throw new Error("Failed to parse given CIDR: " + t);
    let l = 4, a = t6(e);
    if (null == a && (l = s4, a = e5(e), null == a)) throw new Error("Failed to parse given CIDR: " + t);
    const u = parseInt(o, 10);
    if (Number.isNaN(u) || String(u).length !== o.length || u < 0 || u > 8 * l) throw new Error("Failed to parse given CIDR: " + t);
    const h = c4(u, 8 * l);
    return {
        network: f3(a, h),
        mask: h
    };
}
function c4(t, r) {
    if (r !== 8 * 4 && r !== 8 * 16) throw new Error("Invalid CIDR mask");
    if (t < 0 || t > r) throw new Error("Invalid CIDR mask");
    const n = r / 8, e = new Uint8Array(n);
    for(let r = 0; r < n; r++)t >= 8 ? (e[r] = 255, t -= 8) : (e[r] = 255 - (255 >> t), t = 0);
    return e;
}
class w3 {
    constructor(r, n){
        if (null == n) ({ network: this.network, mask: this.mask } = h3(r));
        else {
            const e = i4(r);
            if (null == e) throw new Error("Failed to parse network");
            n = String(n);
            const o = parseInt(n, 10);
            if (Number.isNaN(o) || String(o).length !== n.length || o < 0 || o > 8 * e.length) {
                const r = i4(n);
                if (null == r) throw new Error("Failed to parse mask");
                this.mask = r;
            } else this.mask = c4(o, 8 * e.length);
            this.network = f3(e, this.mask);
        }
    }
    contains(r) {
        return function(r, n) {
            if ("string" == typeof n && (n = i4(n)), null == n) throw new Error("Invalid ip");
            if (n.length !== r.network.length) return !1;
            for(let t = 0; t < n.length; t++)if ((r.network[t] & r.mask[t]) != (n[t] & r.mask[t])) return !1;
            return !0;
        }({
            network: this.network,
            mask: this.mask
        }, r);
    }
    toString() {
        const t = function(t) {
            let r = 0;
            for (let [n, e] of t.entries()){
                if (255 !== e) {
                    for(; 0 != (128 & e);)r++, e <<= 1;
                    if (0 != (128 & e)) return -1;
                    for(let r = n + 1; r < t.length; r++)if (0 != t[r]) return -1;
                    break;
                }
                r += 8;
            }
            return r;
        }(this.mask), r = -1 !== t ? String(t) : function(t) {
            let r = "0x";
            for (const n of t)r += (n >> 4).toString(16) + (15 & n).toString(16);
            return r;
        }(this.mask);
        return o5(this.network) + "/" + r;
    }
}
class e7 {
    name;
    prefix;
    baseEncode;
    constructor(e, r, t){
        this.name = e, this.prefix = r, this.baseEncode = t;
    }
    encode(e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
        throw Error("Unknown type, must be binary type");
    }
}
class r5 {
    name;
    prefix;
    baseDecode;
    prefixCodePoint;
    constructor(e, r, t){
        if (this.name = e, this.prefix = r, void 0 === r.codePointAt(0)) throw new Error("Invalid prefix character");
        this.prefixCodePoint = r.codePointAt(0), this.baseDecode = t;
    }
    decode(e) {
        if ("string" == typeof e) {
            if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            return this.baseDecode(e.slice(this.prefix.length));
        }
        throw Error("Can only multibase decode strings");
    }
    or(e) {
        return n6(this, e);
    }
}
class t7 {
    decoders;
    constructor(e){
        this.decoders = e;
    }
    or(e) {
        return n6(this, e);
    }
    decode(e) {
        const r = e[0], t = this.decoders[r];
        if (null != t) return t.decode(e);
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
}
function n6(e, r) {
    return new t7({
        ...e.decoders ?? {
            [e.prefix]: e
        },
        ...r.decoders ?? {
            [r.prefix]: r
        }
    });
}
class i6 {
    name;
    prefix;
    baseEncode;
    baseDecode;
    encoder;
    decoder;
    constructor(t, n, i, o){
        this.name = t, this.prefix = n, this.baseEncode = i, this.baseDecode = o, this.encoder = new e7(t, n, i), this.decoder = new r5(t, n, o);
    }
    encode(e) {
        return this.encoder.encode(e);
    }
    decode(e) {
        return this.decoder.decode(e);
    }
}
function o6({ name: e, prefix: r, bitsPerChar: t, alphabet: n }) {
    return function({ name: e, prefix: r, encode: t, decode: n }) {
        return new i6(e, r, t, n);
    }({
        prefix: r,
        name: e,
        encode: (e)=>(function(e, r, t) {
                const n = "=" === r[r.length - 1], i = (1 << t) - 1;
                let o = "", s = 0, a = 0;
                for(let n = 0; n < e.length; ++n)for(a = a << 8 | e[n], s += 8; s > t;)s -= t, o += r[i & a >> s];
                if (0 !== s && (o += r[i & a << t - s]), n) for(; 0 != (o.length * t & 7);)o += "=";
                return o;
            })(e, n, t),
        decode: (r)=>(function(e, r, t, n) {
                const i = {};
                for(let e = 0; e < r.length; ++e)i[r[e]] = e;
                let o = e.length;
                for(; "=" === e[o - 1];)--o;
                const s = new Uint8Array(o * t / 8 | 0);
                let a = 0, d = 0, c = 0;
                for(let r = 0; r < o; ++r){
                    const o = i[e[r]];
                    if (void 0 === o) throw new SyntaxError(`Non-${n} character`);
                    d = d << t | o, a += t, a >= 8 && (a -= 8, s[c++] = 255 & d >> a);
                }
                if (a >= t || 0 != (255 & d << 8 - a)) throw new SyntaxError("Unexpected end of data");
                return s;
            })(r, n, t, e)
    });
}
const s5 = o6({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
}), a3 = o6({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
}), d3 = o6({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
}), c5 = o6({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
}), h4 = o6({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
}), p3 = o6({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
}), f4 = o6({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
}), b2 = o6({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
}), l5 = o6({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
const e8 = new Uint8Array(0);
function r6(e, r) {
    if (e === r) return !0;
    if (e.byteLength !== r.byteLength) return !1;
    for(let t = 0; t < e.byteLength; t++)if (e[t] !== r[t]) return !1;
    return !0;
}
function t8(e) {
    if (e instanceof Uint8Array && "Uint8Array" === e.constructor.name) return e;
    if (e instanceof ArrayBuffer) return new Uint8Array(e);
    if (ArrayBuffer.isView(e)) return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
    throw new Error("Unknown type, must be binary type");
}
function n7(e) {
    return (new TextEncoder).encode(e);
}
function o7(e) {
    return (new TextDecoder).decode(e);
}
Object.freeze({
    __proto__: null,
    empty: e8,
    toHex: function(e) {
        return e.reduce((e, r)=>e + r.toString(16).padStart(2, "0"), "");
    },
    fromHex: function(r) {
        const t = r.match(/../g);
        return null != t ? new Uint8Array(t.map((e)=>parseInt(e, 16))) : e8;
    },
    equals: r6,
    coerce: t8,
    isBinary: function(e) {
        return e instanceof ArrayBuffer || ArrayBuffer.isView(e);
    },
    fromString: n7,
    toString: o7
});
var i7 = function(e, r) {
    if (e.length >= 255) throw new TypeError("Alphabet too long");
    for(var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255;
    for(var o = 0; o < e.length; o++){
        var a = e.charAt(o), i = a.charCodeAt(0);
        if (255 !== t[i]) throw new TypeError(a + " is ambiguous");
        t[i] = o;
    }
    var s = e.length, c = e.charAt(0), u = Math.log(s) / Math.log(256), h = Math.log(256) / Math.log(s);
    function d(e) {
        if ("string" != typeof e) throw new TypeError("Expected String");
        if (0 === e.length) return new Uint8Array;
        var r = 0;
        if (" " !== e[r]) {
            for(var n = 0, o = 0; e[r] === c;)n++, r++;
            for(var a = (e.length - r) * u + 1 >>> 0, i = new Uint8Array(a); e[r];){
                var h = t[e.charCodeAt(r)];
                if (255 === h) return;
                for(var d = 0, f = a - 1; (0 !== h || d < o) && -1 !== f; f--, d++)h += s * i[f] >>> 0, i[f] = h % 256 >>> 0, h = h / 256 >>> 0;
                if (0 !== h) throw new Error("Non-zero carry");
                o = d, r++;
            }
            if (" " !== e[r]) {
                for(var p = a - o; p !== a && 0 === i[p];)p++;
                for(var b = new Uint8Array(n + (a - p)), l = n; p !== a;)b[l++] = i[p++];
                return b;
            }
        }
    }
    return {
        encode: function(r) {
            if (r instanceof Uint8Array || (ArrayBuffer.isView(r) ? r = new Uint8Array(r.buffer, r.byteOffset, r.byteLength) : Array.isArray(r) && (r = Uint8Array.from(r))), !(r instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
            if (0 === r.length) return "";
            for(var t = 0, n = 0, o = 0, a = r.length; o !== a && 0 === r[o];)o++, t++;
            for(var i = (a - o) * h + 1 >>> 0, u = new Uint8Array(i); o !== a;){
                for(var d = r[o], f = 0, p = i - 1; (0 !== d || f < n) && -1 !== p; p--, f++)d += 256 * u[p] >>> 0, u[p] = d % s >>> 0, d = d / s >>> 0;
                if (0 !== d) throw new Error("Non-zero carry");
                n = f, o++;
            }
            for(var b = i - n; b !== i && 0 === u[b];)b++;
            for(var l = c.repeat(t); b < i; ++b)l += e.charAt(u[b]);
            return l;
        },
        decodeUnsafe: d,
        decode: function(e) {
            var t = d(e);
            if (t) return t;
            throw new Error(`Non-${r} character`);
        }
    };
}, s6 = i7;
class c6 {
    name;
    prefix;
    baseEncode;
    constructor(e, r, t){
        this.name = e, this.prefix = r, this.baseEncode = t;
    }
    encode(e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`;
        throw Error("Unknown type, must be binary type");
    }
}
class u4 {
    name;
    prefix;
    baseDecode;
    prefixCodePoint;
    constructor(e, r, t){
        if (this.name = e, this.prefix = r, void 0 === r.codePointAt(0)) throw new Error("Invalid prefix character");
        this.prefixCodePoint = r.codePointAt(0), this.baseDecode = t;
    }
    decode(e) {
        if ("string" == typeof e) {
            if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`);
            return this.baseDecode(e.slice(this.prefix.length));
        }
        throw Error("Can only multibase decode strings");
    }
    or(e) {
        return d4(this, e);
    }
}
class h5 {
    decoders;
    constructor(e){
        this.decoders = e;
    }
    or(e) {
        return d4(this, e);
    }
    decode(e) {
        const r = e[0], t = this.decoders[r];
        if (null != t) return t.decode(e);
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`);
    }
}
function d4(e, r) {
    return new h5({
        ...e.decoders ?? {
            [e.prefix]: e
        },
        ...r.decoders ?? {
            [r.prefix]: r
        }
    });
}
class f5 {
    name;
    prefix;
    baseEncode;
    baseDecode;
    encoder;
    decoder;
    constructor(e, r, t, n){
        this.name = e, this.prefix = r, this.baseEncode = t, this.baseDecode = n, this.encoder = new c6(e, r, t), this.decoder = new u4(e, r, n);
    }
    encode(e) {
        return this.encoder.encode(e);
    }
    decode(e) {
        return this.decoder.decode(e);
    }
}
function p4({ name: e, prefix: r, encode: t, decode: n }) {
    return new f5(e, r, t, n);
}
function b3({ name: e, prefix: r, alphabet: n }) {
    const { encode: o, decode: a } = s6(n, e);
    return p4({
        prefix: r,
        name: e,
        encode: o,
        decode: (e)=>t8(a(e))
    });
}
function l6({ name: e, prefix: r, bitsPerChar: t, alphabet: n }) {
    return p4({
        prefix: r,
        name: e,
        encode: (e)=>(function(e, r, t) {
                const n = "=" === r[r.length - 1], o = (1 << t) - 1;
                let a = "", i = 0, s = 0;
                for(let n = 0; n < e.length; ++n)for(s = s << 8 | e[n], i += 8; i > t;)i -= t, a += r[o & s >> i];
                if (0 !== i && (a += r[o & s << t - i]), n) for(; 0 != (a.length * t & 7);)a += "=";
                return a;
            })(e, n, t),
        decode: (r)=>(function(e, r, t, n) {
                const o = {};
                for(let e = 0; e < r.length; ++e)o[r[e]] = e;
                let a = e.length;
                for(; "=" === e[a - 1];)--a;
                const i = new Uint8Array(a * t / 8 | 0);
                let s = 0, c = 0, u = 0;
                for(let r = 0; r < a; ++r){
                    const a = o[e[r]];
                    if (void 0 === a) throw new SyntaxError(`Non-${n} character`);
                    c = c << t | a, s += t, s >= 8 && (s -= 8, i[u++] = 255 & c >> s);
                }
                if (s >= t || 0 != (255 & c << 8 - s)) throw new SyntaxError("Unexpected end of data");
                return i;
            })(r, n, t, e)
    });
}
const w4 = b3({
    prefix: "9",
    name: "base10",
    alphabet: "0123456789"
});
var y2 = Object.freeze({
    __proto__: null,
    base10: w4
});
const m2 = l6({
    prefix: "f",
    name: "base16",
    alphabet: "0123456789abcdef",
    bitsPerChar: 4
}), g3 = l6({
    prefix: "F",
    name: "base16upper",
    alphabet: "0123456789ABCDEF",
    bitsPerChar: 4
});
var v2 = Object.freeze({
    __proto__: null,
    base16: m2,
    base16upper: g3
});
const x2 = l6({
    prefix: "0",
    name: "base2",
    alphabet: "01",
    bitsPerChar: 1
});
var _1 = Object.freeze({
    __proto__: null,
    base2: x2
});
const C2 = Array.from("🚀🪐☄🛰🌌🌑🌒🌓🌔🌕🌖🌗🌘🌍🌏🌎🐉☀💻🖥💾💿😂❤😍🤣😊🙏💕😭😘👍😅👏😁🔥🥰💔💖💙😢🤔😆🙄💪😉☺👌🤗💜😔😎😇🌹🤦🎉💞✌✨🤷😱😌🌸🙌😋💗💚😏💛🙂💓🤩😄😀🖤😃💯🙈👇🎶😒🤭❣😜💋👀😪😑💥🙋😞😩😡🤪👊🥳😥🤤👉💃😳✋😚😝😴🌟😬🙃🍀🌷😻😓⭐✅🥺🌈😈🤘💦✔😣🏃💐☹🎊💘😠☝😕🌺🎂🌻😐🖕💝🙊😹🗣💫💀👑🎵🤞😛🔴😤🌼😫⚽🤙☕🏆🤫👈😮🙆🍻🍃🐶💁😲🌿🧡🎁⚡🌞🎈❌✊👋😰🤨😶🤝🚶💰🍓💢🤟🙁🚨💨🤬✈🎀🍺🤓😙💟🌱😖👶🥴▶➡❓💎💸⬇😨🌚🦋😷🕺⚠🙅😟😵👎🤲🤠🤧📌🔵💅🧐🐾🍒😗🤑🌊🤯🐷☎💧😯💆👆🎤🙇🍑❄🌴💣🐸💌📍🥀🤢👅💡💩👐📸👻🤐🤮🎼🥵🚩🍎🍊👼💍📣🥂"), A2 = C2.reduce((e, r, t)=>(e[t] = r, e), []), E2 = C2.reduce((e, r, t)=>(e[r.codePointAt(0)] = t, e), []);
const z2 = p4({
    prefix: "🚀",
    name: "base256emoji",
    encode: function(e) {
        return e.reduce((e, r)=>e += A2[r], "");
    },
    decode: function(e) {
        const r = [];
        for (const t of e){
            const e = E2[t.codePointAt(0)];
            if (void 0 === e) throw new Error(`Non-base256emoji character: ${t}`);
            r.push(e);
        }
        return new Uint8Array(r);
    }
});
var U2 = Object.freeze({
    __proto__: null,
    base256emoji: z2
});
const S2 = l6({
    prefix: "b",
    name: "base32",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567",
    bitsPerChar: 5
}), j2 = l6({
    prefix: "B",
    name: "base32upper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
    bitsPerChar: 5
}), O2 = l6({
    prefix: "c",
    name: "base32pad",
    alphabet: "abcdefghijklmnopqrstuvwxyz234567=",
    bitsPerChar: 5
}), P2 = l6({
    prefix: "C",
    name: "base32padupper",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=",
    bitsPerChar: 5
}), D2 = l6({
    prefix: "v",
    name: "base32hex",
    alphabet: "0123456789abcdefghijklmnopqrstuv",
    bitsPerChar: 5
}), I2 = l6({
    prefix: "V",
    name: "base32hexupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV",
    bitsPerChar: 5
}), M2 = l6({
    prefix: "t",
    name: "base32hexpad",
    alphabet: "0123456789abcdefghijklmnopqrstuv=",
    bitsPerChar: 5
}), V2 = l6({
    prefix: "T",
    name: "base32hexpadupper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUV=",
    bitsPerChar: 5
}), L2 = l6({
    prefix: "h",
    name: "base32z",
    alphabet: "ybndrfg8ejkmcpqxot1uwisza345h769",
    bitsPerChar: 5
});
var T1 = Object.freeze({
    __proto__: null,
    base32: S2,
    base32upper: j2,
    base32pad: O2,
    base32padupper: P2,
    base32hex: D2,
    base32hexupper: I2,
    base32hexpad: M2,
    base32hexpadupper: V2,
    base32z: L2
});
const k1 = b3({
    prefix: "k",
    name: "base36",
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyz"
}), B2 = b3({
    prefix: "K",
    name: "base36upper",
    alphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
});
var N2 = Object.freeze({
    __proto__: null,
    base36: k1,
    base36upper: B2
});
const $2 = b3({
    name: "base58btc",
    prefix: "z",
    alphabet: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
}), q2 = b3({
    name: "base58flickr",
    prefix: "Z",
    alphabet: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"
});
var H1 = Object.freeze({
    __proto__: null,
    base58btc: $2,
    base58flickr: q2
});
const J2 = l6({
    prefix: "m",
    name: "base64",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    bitsPerChar: 6
}), F1 = l6({
    prefix: "M",
    name: "base64pad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    bitsPerChar: 6
}), R2 = l6({
    prefix: "u",
    name: "base64url",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
    bitsPerChar: 6
}), Q1 = l6({
    prefix: "U",
    name: "base64urlpad",
    alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
    bitsPerChar: 6
});
var K1 = Object.freeze({
    __proto__: null,
    base64: J2,
    base64pad: F1,
    base64url: R2,
    base64urlpad: Q1
});
const G1 = l6({
    prefix: "7",
    name: "base8",
    alphabet: "01234567",
    bitsPerChar: 3
});
var W1 = Object.freeze({
    __proto__: null,
    base8: G1
});
const Z1 = p4({
    prefix: "\0",
    name: "identity",
    encode: (e)=>o7(e),
    decode: (e)=>n7(e)
});
var X1 = Object.freeze({
    __proto__: null,
    identity: Z1
});
const Y1 = new TextEncoder, ee1 = new TextDecoder;
Object.freeze({
    __proto__: null,
    name: "json",
    code: 512,
    encode: function(e) {
        return Y1.encode(JSON.stringify(e));
    },
    decode: function(e) {
        return JSON.parse(ee1.decode(e));
    }
});
var te1 = Object.freeze({
    __proto__: null,
    name: "raw",
    code: 85,
    encode: function(e) {
        return t8(e);
    },
    decode: function(e) {
        return t8(e);
    }
}), ne1 = function e(r, t, n) {
    t = t || [];
    var o = n = n || 0;
    for(; r >= ie1;)t[n++] = 255 & r | oe1, r /= 128;
    for(; r & ae1;)t[n++] = 255 & r | oe1, r >>>= 7;
    return t[n] = 0 | r, e.bytes = n - o + 1, t;
}, oe1 = 128, ae1 = -128, ie1 = Math.pow(2, 31);
var se1 = function e(r, t) {
    var n, o = 0, a = 0, i = t = t || 0, s = r.length;
    do {
        if (i >= s) throw e.bytes = 0, new RangeError("Could not decode varint");
        n = r[i++], o += a < 28 ? (n & ue1) << a : (n & ue1) * Math.pow(2, a), a += 7;
    }while (n >= ce1)
    return e.bytes = i - t, o;
}, ce1 = 128, ue1 = 127;
var he1 = Math.pow(2, 7), de1 = Math.pow(2, 14), fe1 = Math.pow(2, 21), pe1 = Math.pow(2, 28), be1 = Math.pow(2, 35), le1 = Math.pow(2, 42), we1 = Math.pow(2, 49), ye1 = Math.pow(2, 56), me1 = Math.pow(2, 63), ge1 = {
    encode: ne1,
    decode: se1,
    encodingLength: function(e) {
        return e < he1 ? 1 : e < de1 ? 2 : e < fe1 ? 3 : e < pe1 ? 4 : e < be1 ? 5 : e < le1 ? 6 : e < we1 ? 7 : e < ye1 ? 8 : e < me1 ? 9 : 10;
    }
};
function ve1(e, r = 0) {
    return [
        ge1.decode(e, r),
        ge1.decode.bytes
    ];
}
function xe1(e, r, t = 0) {
    return ge1.encode(e, r, t), r;
}
function _e1(e) {
    return ge1.encodingLength(e);
}
Object.freeze({
    __proto__: null,
    decode: ve1,
    encodeTo: xe1,
    encodingLength: _e1
});
function Ae1(e, r) {
    const t = r.byteLength, n = _e1(e), o = n + _e1(t), a = new Uint8Array(o + t);
    return xe1(e, a, 0), xe1(t, a, n), a.set(r, o), new Ue1(e, t, r, a);
}
function Ee1(e) {
    const r = t8(e), [n, o] = ve1(r), [a, i] = ve1(r.subarray(o)), s = r.subarray(o + i);
    if (s.byteLength !== a) throw new Error("Incorrect length");
    return new Ue1(n, a, s, r);
}
function ze1(e, t) {
    if (e === t) return !0;
    {
        const n = t;
        return e.code === n.code && e.size === n.size && n.bytes instanceof Uint8Array && r6(e.bytes, n.bytes);
    }
}
class Ue1 {
    code;
    size;
    digest;
    bytes;
    constructor(e, r, t, n){
        this.code = e, this.size = r, this.digest = t, this.bytes = n;
    }
}
Object.freeze({
    __proto__: null,
    create: Ae1,
    decode: Ee1,
    equals: ze1,
    Digest: Ue1
});
const je1 = t8;
const Oe1 = {
    code: 0,
    name: "identity",
    encode: je1,
    digest: function(e) {
        return Ae1(0, je1(e));
    }
};
var Pe1 = Object.freeze({
    __proto__: null,
    identity: Oe1
});
function De1({ name: e, code: r, encode: t }) {
    return new Ie1(e, r, t);
}
class Ie1 {
    name;
    code;
    encode;
    constructor(e, r, t){
        this.name = e, this.code = r, this.encode = t;
    }
    digest(e) {
        if (e instanceof Uint8Array) {
            const r = this.encode(e);
            return r instanceof Uint8Array ? Ae1(this.code, r) : r.then((e)=>Ae1(this.code, e));
        }
        throw Error("Unknown type, must be binary type");
    }
}
Object.freeze({
    __proto__: null,
    from: De1,
    Hasher: Ie1
});
function Ve1(e) {
    return async (r)=>new Uint8Array(await crypto.subtle.digest(e, r));
}
const Le1 = De1({
    name: "sha2-256",
    code: 18,
    encode: Ve1("SHA-256")
}), Te1 = De1({
    name: "sha2-512",
    code: 19,
    encode: Ve1("SHA-512")
});
var ke1 = Object.freeze({
    __proto__: null,
    sha256: Le1,
    sha512: Te1
});
function Be1(e, r) {
    const { bytes: t, version: n } = e;
    return 0 === n ? function(e, r, t) {
        const { prefix: n } = t;
        if (n !== $2.prefix) throw Error(`Cannot string encode V0 in ${t.name} encoding`);
        const o = r.get(n);
        if (null == o) {
            const o = t.encode(e).slice(1);
            return r.set(n, o), o;
        }
        return o;
    }(t, $e1(e), r ?? $2.encoder) : function(e, r, t) {
        const { prefix: n } = t, o = r.get(n);
        if (null == o) {
            const o = t.encode(e);
            return r.set(n, o), o;
        }
        return o;
    }(t, $e1(e), r ?? S2.encoder);
}
const Ne1 = new WeakMap;
function $e1(e) {
    const r = Ne1.get(e);
    if (null == r) {
        const r = new Map;
        return Ne1.set(e, r), r;
    }
    return r;
}
class qe1 {
    code;
    version;
    multihash;
    bytes;
    "/";
    constructor(e, r, t, n){
        this.code = r, this.version = e, this.multihash = t, this.bytes = n, this["/"] = n;
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
                return this;
            case 1:
                {
                    const { code: e, multihash: r } = this;
                    if (e !== He1) throw new Error("Cannot convert a non dag-pb CID to CIDv0");
                    if (r.code !== Je1) throw new Error("Cannot convert non sha2-256 multihash CID to CIDv0");
                    return qe1.createV0(r);
                }
            default:
                throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`);
        }
    }
    toV1() {
        switch(this.version){
            case 0:
                {
                    const { code: e, digest: r } = this.multihash, t = Ae1(e, r);
                    return qe1.createV1(this.code, t);
                }
            case 1:
                return this;
            default:
                throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`);
        }
    }
    equals(e) {
        return qe1.equals(this, e);
    }
    static equals(e, r) {
        const t = r;
        return null != t && e.code === t.code && e.version === t.version && ze1(e.multihash, t.multihash);
    }
    toString(e) {
        return Be1(this, e);
    }
    toJSON() {
        return {
            "/": Be1(this)
        };
    }
    link() {
        return this;
    }
    [Symbol.toStringTag] = "CID";
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return `CID(${this.toString()})`;
    }
    static asCID(e) {
        if (null == e) return null;
        const r = e;
        if (r instanceof qe1) return r;
        if (null != r["/"] && r["/"] === r.bytes || r.asCID === r) {
            const { version: e, code: t, multihash: n, bytes: o } = r;
            return new qe1(e, t, n, o ?? Fe1(e, t, n.bytes));
        }
        if (!0 === r[Re1]) {
            const { version: e, multihash: t, code: n } = r, o = Ee1(t);
            return qe1.create(e, n, o);
        }
        return null;
    }
    static create(e, r, t) {
        if ("number" != typeof r) throw new Error("String codecs are no longer supported");
        if (!(t.bytes instanceof Uint8Array)) throw new Error("Invalid digest");
        switch(e){
            case 0:
                if (r !== He1) throw new Error(`Version 0 CID must use dag-pb (code: ${He1}) block encoding`);
                return new qe1(e, r, t, t.bytes);
            case 1:
                {
                    const n = Fe1(e, r, t.bytes);
                    return new qe1(e, r, t, n);
                }
            default:
                throw new Error("Invalid version");
        }
    }
    static createV0(e) {
        return qe1.create(0, He1, e);
    }
    static createV1(e, r) {
        return qe1.create(1, e, r);
    }
    static decode(e) {
        const [r, t] = qe1.decodeFirst(e);
        if (0 !== t.length) throw new Error("Incorrect length");
        return r;
    }
    static decodeFirst(e) {
        const r = qe1.inspectBytes(e), n = r.size - r.multihashSize, o = t8(e.subarray(n, n + r.multihashSize));
        if (o.byteLength !== r.multihashSize) throw new Error("Incorrect length");
        const a = o.subarray(r.multihashSize - r.digestSize), i = new Ue1(r.multihashCode, r.digestSize, a, o);
        return [
            0 === r.version ? qe1.createV0(i) : qe1.createV1(r.codec, i),
            e.subarray(r.size)
        ];
    }
    static inspectBytes(e) {
        let r = 0;
        const t = ()=>{
            const [t, n] = ve1(e.subarray(r));
            return r += n, t;
        };
        let n = t(), o = He1;
        if (18 === n ? (n = 0, r = 0) : o = t(), 0 !== n && 1 !== n) throw new RangeError(`Invalid CID version ${n}`);
        const a = r, i = t(), s = t(), c = r + s;
        return {
            version: n,
            codec: o,
            multihashCode: i,
            digestSize: s,
            multihashSize: c - a,
            size: c
        };
    }
    static parse(e, r) {
        const [t, n] = function(e, r) {
            switch(e[0]){
                case "Q":
                    {
                        const t = r ?? $2;
                        return [
                            $2.prefix,
                            t.decode(`${$2.prefix}${e}`)
                        ];
                    }
                case $2.prefix:
                    {
                        const t = r ?? $2;
                        return [
                            $2.prefix,
                            t.decode(e)
                        ];
                    }
                case S2.prefix:
                    {
                        const t = r ?? S2;
                        return [
                            S2.prefix,
                            t.decode(e)
                        ];
                    }
                default:
                    if (null == r) throw Error("To parse non base32 or base58btc encoded CID multibase decoder must be provided");
                    return [
                        e[0],
                        r.decode(e)
                    ];
            }
        }(e, r), o = qe1.decode(n);
        if (0 === o.version && "Q" !== e[0]) throw Error("Version 0 CID string must not include multibase prefix");
        return $e1(o).set(t, e), o;
    }
}
const He1 = 112, Je1 = 18;
function Fe1(e, r, t) {
    const n = _e1(e), o = n + _e1(r), a = new Uint8Array(o + t.byteLength);
    return xe1(e, a, 0), xe1(r, a, n), a.set(t, o), a;
}
const Re1 = Symbol.for("@ipld/js-cid/CID"), Qe1 = {
    ...X1,
    ..._1,
    ...W1,
    ...y2,
    ...v2,
    ...T1,
    ...N2,
    ...H1,
    ...K1,
    ...U2
}, Ke1 = {
    ...ke1,
    ...Pe1
};
var t9 = function t(o, i, u) {
    i = i || [];
    var a = u = u || 0;
    for(; o >= r7;)i[u++] = 255 & o | e9, o /= 128;
    for(; o & n8;)i[u++] = 255 & o | e9, o >>>= 7;
    return i[u] = 0 | o, t.bytes = u - a + 1, i;
}, e9 = 128, n8 = -128, r7 = Math.pow(2, 31);
var o8 = function t(e, n) {
    var r, o = 0, a = 0, c = n = n || 0, f = e.length;
    do {
        if (c >= f) throw t.bytes = 0, new RangeError("Could not decode varint");
        r = e[c++], o += a < 28 ? (r & u5) << a : (r & u5) * Math.pow(2, a), a += 7;
    }while (r >= i8)
    return t.bytes = c - n, o;
}, i8 = 128, u5 = 127;
var a4 = Math.pow(2, 7), c7 = Math.pow(2, 14), f6 = Math.pow(2, 21), s7 = Math.pow(2, 28), h6 = Math.pow(2, 35), y3 = Math.pow(2, 42), w5 = Math.pow(2, 49), b4 = Math.pow(2, 56), d5 = Math.pow(2, 63), g4 = {
    encode: t9,
    decode: o8,
    encodingLength: function(t) {
        return t < a4 ? 1 : t < c7 ? 2 : t < f6 ? 3 : t < s7 ? 4 : t < h6 ? 5 : t < y3 ? 6 : t < w5 ? 7 : t < b4 ? 8 : t < d5 ? 9 : 10;
    }
};
function p5(t, e = 0) {
    return [
        g4.decode(t, e),
        g4.decode.bytes
    ];
}
function L3(t) {
    const e = function(t) {
        if (t instanceof Uint8Array && "Uint8Array" === t.constructor.name) return t;
        if (t instanceof ArrayBuffer) return new Uint8Array(t);
        if (ArrayBuffer.isView(t)) return new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
        throw new Error("Unknown type, must be binary type");
    }(t), [n, r] = p5(e), [o, i] = p5(e.subarray(r)), u = e.subarray(r + i);
    if (u.byteLength !== o) throw new Error("Incorrect length");
    return new v3(n, o, u, e);
}
class v3 {
    code;
    size;
    digest;
    bytes;
    constructor(t, e, n, r){
        this.code = t, this.size = e, this.digest = n, this.bytes = r;
    }
}
function n9(e, n, r, t) {
    return {
        name: e,
        prefix: n,
        encoder: {
            name: e,
            prefix: n,
            encode: r
        },
        decoder: {
            decode: t
        }
    };
}
const r8 = n9("utf8", "u", (e)=>"u" + new TextDecoder("utf8").decode(e), (e)=>(new TextEncoder).encode(e.substring(1))), t10 = n9("ascii", "a", (e)=>{
    let n = "a";
    for(let r = 0; r < e.length; r++)n += String.fromCharCode(e[r]);
    return n;
}, (e)=>{
    const n = function(e = 0) {
        return new Uint8Array(e);
    }((e = e.substring(1)).length);
    for(let r = 0; r < e.length; r++)n[r] = e.charCodeAt(r);
    return n;
}), o9 = {
    utf8: r8,
    "utf-8": r8,
    hex: Qe.base16,
    latin1: t10,
    ascii: t10,
    binary: t10,
    ...Qe
};
function u6(e, n = "utf8") {
    const r = o9[n];
    if (null == r) throw new Error(`Unsupported encoding "${n}"`);
    return r.decoder.decode(`${r.prefix}${e}`);
}
const e10 = new class {
    index = 0;
    input = "";
    new(r) {
        return this.index = 0, this.input = r, this;
    }
    readAtomically(r) {
        const t = this.index, e = r();
        return void 0 === e && (this.index = t), e;
    }
    parseWith(r) {
        const t = r();
        if (this.index === this.input.length) return t;
    }
    peekChar() {
        if (!(this.index >= this.input.length)) return this.input[this.index];
    }
    readChar() {
        if (!(this.index >= this.input.length)) return this.input[this.index++];
    }
    readGivenChar(r) {
        return this.readAtomically(()=>{
            const t = this.readChar();
            if (t === r) return t;
        });
    }
    readSeparator(r, t, e) {
        return this.readAtomically(()=>{
            if (!(t > 0 && void 0 === this.readGivenChar(r))) return e();
        });
    }
    readNumber(r, t, e, i) {
        return this.readAtomically(()=>{
            let n = 0, d = 0;
            const a = this.peekChar();
            if (void 0 === a) return;
            const s = "0" === a, u = 2 ** (8 * i) - 1;
            for(;;){
                const e = this.readAtomically(()=>{
                    const t = this.readChar();
                    if (void 0 === t) return;
                    const e = Number.parseInt(t, r);
                    return Number.isNaN(e) ? void 0 : e;
                });
                if (void 0 === e) break;
                if (n *= r, n += e, n > u) return;
                if (d += 1, void 0 !== t && d > t) return;
            }
            return 0 === d || !e && s && d > 1 ? void 0 : n;
        });
    }
    readIPv4Addr() {
        return this.readAtomically(()=>{
            const r = new Uint8Array(4);
            for(let t = 0; t < r.length; t++){
                const e = this.readSeparator(".", t, ()=>this.readNumber(10, 3, !1, 1));
                if (void 0 === e) return;
                r[t] = e;
            }
            return r;
        });
    }
    readIPv6Addr() {
        const r = (r)=>{
            for(let t = 0; t < r.length / 2; t++){
                const e = 2 * t;
                if (t < r.length - 3) {
                    const i = this.readSeparator(":", t, ()=>this.readIPv4Addr());
                    if (void 0 !== i) return r[e] = i[0], r[e + 1] = i[1], r[e + 2] = i[2], r[e + 3] = i[3], [
                        e + 4,
                        !0
                    ];
                }
                const i = this.readSeparator(":", t, ()=>this.readNumber(16, 4, !0, 2));
                if (void 0 === i) return [
                    e,
                    !1
                ];
                r[e] = i >> 8, r[e + 1] = 255 & i;
            }
            return [
                r.length,
                !1
            ];
        };
        return this.readAtomically(()=>{
            const t = new Uint8Array(16), [e, i] = r(t);
            if (16 === e) return t;
            if (i) return;
            if (void 0 === this.readGivenChar(":")) return;
            if (void 0 === this.readGivenChar(":")) return;
            const n = new Uint8Array(14), d = 16 - (e + 2), [a] = r(n.subarray(0, d));
            return t.set(n.subarray(0, a), 16 - a), t;
        });
    }
    readIPAddr() {
        return this.readIPv4Addr() ?? this.readIPv6Addr();
    }
};
function i9(r) {
    return Boolean(function(r) {
        if (!(r.length > 15)) return e10.new(r).parseWith(()=>e10.readIPv4Addr());
    }(r));
}
function n10(t) {
    return Boolean(function(t) {
        if (t.includes("%") && (t = t.split("%")[0]), !(t.length > 45)) return e10.new(t).parseWith(()=>e10.readIPv6Addr());
    }(t));
}
function d6(t) {
    return Boolean(function(t) {
        if (t.includes("%") && (t = t.split("%")[0]), !(t.length > 45)) return e10.new(t).parseWith(()=>e10.readIPAddr());
    }(t));
}
const f7 = i9, m3 = n10, g5 = function(t) {
    let e = 0;
    if (t = t.toString().trim(), f7(t)) {
        const r = new Uint8Array(e + 4);
        return t.split(/\./g).forEach((t)=>{
            r[e++] = 255 & parseInt(t, 10);
        }), r;
    }
    if (m3(t)) {
        const r = t.split(":", 8);
        let s;
        for(s = 0; s < r.length; s++){
            let t;
            f7(r[s]) && (t = g5(r[s]), r[s] = u2(t.slice(0, 2), "base16")), null != t && ++s < 8 && r.splice(s, 0, u2(t.slice(2, 4), "base16"));
        }
        if ("" === r[0]) for(; r.length < 8;)r.unshift("0");
        else if ("" === r[r.length - 1]) for(; r.length < 8;)r.push("0");
        else if (r.length < 8) {
            for(s = 0; s < r.length && "" !== r[s]; s++);
            const t = [
                s,
                1
            ];
            for(s = 9 - r.length; s > 0; s--)t.push("0");
            r.splice.apply(r, t);
        }
        const o = new Uint8Array(e + 16);
        for(s = 0; s < r.length; s++){
            const t = parseInt(r[s], 16);
            o[e++] = t >> 8 & 255, o[e++] = 255 & t;
        }
        return o;
    }
    throw new Error("invalid ip address");
}, w6 = function(t, e = 0, r) {
    e = ~~e, r = r ?? t.length - e;
    const n = new DataView(t.buffer);
    if (4 === r) {
        const n = [];
        for(let s = 0; s < r; s++)n.push(t[e + s]);
        return n.join(".");
    }
    if (16 === r) {
        const t = [];
        for(let s = 0; s < r; s += 2)t.push(n.getUint16(e + s).toString(16));
        return t.join(":").replace(/(^|:)0(:0)*:0(:|$)/, "$1::$3").replace(/:{3,4}/, "::");
    }
    return "";
}, b5 = -1, y4 = {}, E3 = {};
function v4(t) {
    if ("number" == typeof t) {
        if (null != E3[t]) return E3[t];
        throw new Error(`no protocol with code: ${t}`);
    }
    if ("string" == typeof t) {
        if (null != y4[t]) return y4[t];
        throw new Error(`no protocol with name: ${t}`);
    }
    throw new Error("invalid protocol id type: " + typeof t);
}
[
    [
        4,
        32,
        "ip4"
    ],
    [
        6,
        16,
        "tcp"
    ],
    [
        33,
        16,
        "dccp"
    ],
    [
        41,
        128,
        "ip6"
    ],
    [
        42,
        b5,
        "ip6zone"
    ],
    [
        43,
        8,
        "ipcidr"
    ],
    [
        53,
        b5,
        "dns",
        !0
    ],
    [
        54,
        b5,
        "dns4",
        !0
    ],
    [
        55,
        b5,
        "dns6",
        !0
    ],
    [
        56,
        b5,
        "dnsaddr",
        !0
    ],
    [
        132,
        16,
        "sctp"
    ],
    [
        273,
        16,
        "udp"
    ],
    [
        275,
        0,
        "p2p-webrtc-star"
    ],
    [
        276,
        0,
        "p2p-webrtc-direct"
    ],
    [
        277,
        0,
        "p2p-stardust"
    ],
    [
        280,
        0,
        "webrtc-direct"
    ],
    [
        281,
        0,
        "webrtc"
    ],
    [
        290,
        0,
        "p2p-circuit"
    ],
    [
        301,
        0,
        "udt"
    ],
    [
        302,
        0,
        "utp"
    ],
    [
        400,
        b5,
        "unix",
        !1,
        !0
    ],
    [
        421,
        b5,
        "ipfs"
    ],
    [
        421,
        b5,
        "p2p"
    ],
    [
        443,
        0,
        "https"
    ],
    [
        444,
        96,
        "onion"
    ],
    [
        445,
        296,
        "onion3"
    ],
    [
        446,
        b5,
        "garlic64"
    ],
    [
        448,
        0,
        "tls"
    ],
    [
        449,
        b5,
        "sni"
    ],
    [
        460,
        0,
        "quic"
    ],
    [
        461,
        0,
        "quic-v1"
    ],
    [
        465,
        0,
        "webtransport"
    ],
    [
        466,
        b5,
        "certhash"
    ],
    [
        477,
        0,
        "ws"
    ],
    [
        478,
        0,
        "wss"
    ],
    [
        479,
        0,
        "p2p-websocket-star"
    ],
    [
        480,
        0,
        "http"
    ],
    [
        481,
        b5,
        "http-path"
    ],
    [
        777,
        b5,
        "memory"
    ]
].forEach((t)=>{
    const e = function(t, e, r, n, s) {
        return {
            code: t,
            size: e,
            name: r,
            resolvable: Boolean(n),
            path: Boolean(s)
        };
    }(...t);
    E3[e.code] = e, y4[e.name] = e;
});
const $3 = v4("ip4"), A3 = v4("ip6"), U3 = v4("ipcidr");
function T2(t, e) {
    switch(v4(t).code){
        case 4:
        case 41:
            return function(t) {
                const e = w6(t, 0, t.length);
                if (null == e) throw new Error("ipBuff is required");
                if (!d6(e)) throw new Error("invalid ip address");
                return e;
            }(e);
        case 42:
        case 53:
        case 54:
        case 55:
        case 56:
        case 400:
        case 449:
        case 777:
            return B3(e);
        case 6:
        case 273:
        case 33:
        case 132:
            return q3(e).toString();
        case 421:
            return function(t) {
                const e = p2(t), r = t.slice(s3(e));
                if (r.length !== e) throw new Error("inconsistent lengths");
                return u2(r, "base58btc");
            }(e);
        case 444:
        case 445:
            return x3(e);
        case 466:
            return function(t) {
                const e = p2(t), r = t.slice(s3(e));
                if (r.length !== e) throw new Error("inconsistent lengths");
                return "u" + u2(r, "base64url");
            }(e);
        case 481:
            return globalThis.encodeURIComponent(B3(e));
        default:
            return u2(e, "base16");
    }
}
function S3(r, n) {
    switch(v4(r).code){
        case 4:
        case 41:
            return z3(n);
        case 42:
        case 53:
        case 54:
        case 55:
        case 56:
        case 400:
        case 449:
        case 777:
            return O3(n);
        case 6:
        case 273:
        case 33:
        case 132:
            return k2(parseInt(n, 10));
        case 421:
            return function(r) {
                let n;
                n = "Q" === r[0] || "1" === r[0] ? L3(s.decode(`z${r}`)).bytes : O.parse(r).multihash.bytes;
                const i = Uint8Array.from(g2(n.length));
                return n5([
                    i,
                    n
                ], i.length + n.length);
            }(n);
        case 444:
            return function(t) {
                const e = t.split(":");
                if (2 !== e.length) throw new Error(`failed to parse onion addr: ["'${e.join('", "')}'"]' does not contain a port number`);
                if (16 !== e[0].length) throw new Error(`failed to parse onion addr: ${e[0]} not a Tor onion address.`);
                const r = s5.decode("b" + e[0]), n = parseInt(e[1], 10);
                if (n < 1 || n > 65536) throw new Error("Port number is not in range(1, 65536)");
                const s = k2(n);
                return n5([
                    r,
                    s
                ], r.length + s.length);
            }(n);
        case 445:
            return function(t) {
                const e = t.split(":");
                if (2 !== e.length) throw new Error(`failed to parse onion addr: ["'${e.join('", "')}'"]' does not contain a port number`);
                if (56 !== e[0].length) throw new Error(`failed to parse onion addr: ${e[0]} not a Tor onion3 address.`);
                const r = s5.decode(`b${e[0]}`), n = parseInt(e[1], 10);
                if (n < 1 || n > 65536) throw new Error("Port number is not in range(1, 65536)");
                const s = k2(n);
                return n5([
                    r,
                    s
                ], r.length + s.length);
            }(n);
        case 466:
            return function(t) {
                const e = I3.decode(t), r = Uint8Array.from(g2(e.length));
                return n5([
                    r,
                    e
                ], r.length + e.length);
            }(n);
        case 481:
            return O3(globalThis.decodeURIComponent(n));
        default:
            return u6(n, "base16");
    }
}
const j3 = Object.values(Qe1).map((t)=>t.decoder), I3 = function() {
    let t = j3[0].or(j3[1]);
    return j3.slice(2).forEach((e)=>t = t.or(e)), t;
}();
function z3(t) {
    if (!d6(t)) throw new Error("invalid ip address");
    return g5(t);
}
function k2(t) {
    const e = new ArrayBuffer(2);
    return new DataView(e).setUint16(0, t), new Uint8Array(e);
}
function q3(t) {
    return new DataView(t.buffer).getUint16(t.byteOffset);
}
function O3(t) {
    const e = u6(t), r = Uint8Array.from(g2(e.length));
    return n5([
        r,
        e
    ], r.length + e.length);
}
function B3(t) {
    const e = p2(t);
    if ((t = t.slice(s3(e))).length !== e) throw new Error("inconsistent lengths");
    return u2(t);
}
function x3(t) {
    const e = t.slice(0, t.length - 2), r = t.slice(t.length - 2);
    return `${u2(e, "base32")}:${q3(r)}`;
}
function L4(t) {
    const e = [], r = [];
    let o = null, i = 0;
    for(; i < t.length;){
        const a = p2(t, i), c = s3(a), l = v4(a), u = N3(l, t.slice(i + c));
        if (0 === u) {
            e.push([
                a
            ]), r.push([
                a
            ]), i += c;
            continue;
        }
        const p = t.slice(i + c, i + c + u);
        if (i += u + c, i > t.length) throw D3("Invalid address Uint8Array: " + u2(t, "base16"));
        e.push([
            a,
            p
        ]);
        const d = T2(a, p);
        if (r.push([
            a,
            d
        ]), !0 === l.path) {
            o = d;
            break;
        }
    }
    return {
        bytes: Uint8Array.from(t),
        string: M3(r),
        tuples: e,
        stringTuples: r,
        path: o
    };
}
function M3(t) {
    const e = [];
    return t.map((t)=>{
        const r = v4(t[0]);
        return e.push(r.name), t.length > 1 && null != t[1] && e.push(t[1]), null;
    }), P3(e.join("/"));
}
function C3(t) {
    return n5(t.map((t)=>{
        const e = v4(t[0]);
        let r = Uint8Array.from(g2(e.code));
        return t.length > 1 && null != t[1] && (r = n5([
            r,
            t[1]
        ])), r;
    }));
}
function N3(t, e) {
    if (t.size > 0) return t.size / 8;
    if (0 === t.size) return 0;
    {
        const t = p2(e instanceof Uint8Array ? e : Uint8Array.from(e));
        return t + s3(t);
    }
}
function P3(t) {
    return "/" + t.trim().split("/").filter((t)=>t).join("/");
}
function D3(t) {
    return new Error("Error parsing address: " + t);
}
const R3 = Symbol.for("nodejs.util.inspect.custom"), V3 = Symbol.for("@multiformats/js-multiaddr/multiaddr"), Q2 = [
    v4("dns").code,
    v4("dns4").code,
    v4("dns6").code,
    v4("dnsaddr").code
];
class J3 extends Error {
    constructor(t = "No available resolver"){
        super(t), this.name = "NoAvailableResolverError";
    }
}
class W2 {
    bytes;
    #t;
    #e;
    #r;
    #n;
    [V3] = !0;
    constructor(t){
        let e;
        if (null == t && (t = ""), t instanceof Uint8Array) e = L4(t);
        else if ("string" == typeof t) {
            if (t.length > 0 && "/" !== t.charAt(0)) throw new Error(`multiaddr "${t}" must start with a "/"`);
            e = function(t) {
                const e = [], r = [];
                let n = null;
                const s = (t = P3(t)).split("/").slice(1);
                if (1 === s.length && "" === s[0]) return {
                    bytes: new Uint8Array,
                    string: "/",
                    tuples: [],
                    stringTuples: [],
                    path: null
                };
                for(let o = 0; o < s.length; o++){
                    const i = v4(s[o]);
                    if (0 === i.size) {
                        e.push([
                            i.code
                        ]), r.push([
                            i.code
                        ]);
                        continue;
                    }
                    if (o++, o >= s.length) throw D3("invalid address: " + t);
                    if (!0 === i.path) {
                        n = P3(s.slice(o).join("/")), e.push([
                            i.code,
                            S3(i.code, n)
                        ]), r.push([
                            i.code,
                            n
                        ]);
                        break;
                    }
                    const a = S3(i.code, s[o]);
                    e.push([
                        i.code,
                        a
                    ]), r.push([
                        i.code,
                        T2(i.code, a)
                    ]);
                }
                return {
                    string: M3(r),
                    bytes: C3(e),
                    tuples: e,
                    stringTuples: r,
                    path: n
                };
            }(t);
        } else {
            if (!X2(t)) throw new Error("addr must be a string, Buffer, or another Multiaddr");
            e = L4(t.bytes);
        }
        this.bytes = e.bytes, this.#t = e.string, this.#e = e.tuples, this.#r = e.stringTuples, this.#n = e.path;
    }
    toString() {
        return this.#t;
    }
    toJSON() {
        return this.toString();
    }
    toOptions() {
        let t, e, r, n, s = "";
        const o = v4("tcp"), i = v4("udp"), a = v4("ip4"), c = v4("ip6"), l = v4("dns6"), u = v4("ip6zone");
        for (const [p, d] of this.stringTuples())p === u.code && (s = `%${d ?? ""}`), Q2.includes(p) && (e = o.name, n = 443, r = `${d ?? ""}${s}`, t = p === l.code ? 6 : 4), p !== o.code && p !== i.code || (e = v4(p).name, n = parseInt(d ?? "")), p !== a.code && p !== c.code || (e = v4(p).name, r = `${d ?? ""}${s}`, t = p === c.code ? 6 : 4);
        if (null == t || null == e || null == r || null == n) throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6, dnsaddr}/{address}/{tcp, udp}/{port}".');
        return {
            family: t,
            host: r,
            transport: e,
            port: n
        };
    }
    protos() {
        return this.#e.map(([t])=>Object.assign({}, v4(t)));
    }
    protoCodes() {
        return this.#e.map(([t])=>t);
    }
    protoNames() {
        return this.#e.map(([t])=>v4(t).name);
    }
    tuples() {
        return this.#e;
    }
    stringTuples() {
        return this.#r;
    }
    encapsulate(t) {
        return t = new W2(t), new W2(this.toString() + t.toString());
    }
    decapsulate(t) {
        const e = t.toString(), r = this.toString(), n = r.lastIndexOf(e);
        if (n < 0) throw new Error(`Address ${this.toString()} does not contain subaddress: ${t.toString()}`);
        return new W2(r.slice(0, n));
    }
    decapsulateCode(t) {
        const e = this.tuples();
        for(let r = e.length - 1; r >= 0; r--)if (e[r][0] === t) return new W2(C3(e.slice(0, r)));
        return this;
    }
    getPeerId() {
        try {
            let r = [];
            this.stringTuples().forEach(([t, e])=>{
                t === y4.p2p.code && r.push([
                    t,
                    e
                ]), t === y4["p2p-circuit"].code && (r = []);
            });
            const s1 = r.pop();
            if (null != s1?.[1]) {
                const r = s1[1];
                return "Q" === r[0] || "1" === r[0] ? u2(s.decode(`z${r}`), "base58btc") : u2(O.parse(r).multihash.bytes, "base58btc");
            }
            return null;
        } catch (t) {
            return null;
        }
    }
    getPath() {
        return this.#n;
    }
    equals(t) {
        return t2(this.bytes, t.bytes);
    }
    async resolve(t) {
        const e = this.protos().find((t)=>t.resolvable);
        if (null == e) return [
            this
        ];
        const r = G2.get(e.name);
        if (null == r) throw new J3(`no available resolver for ${e.name}`);
        return (await r(this, t)).map((t)=>Y2(t));
    }
    nodeAddress() {
        const t = this.toOptions();
        if ("tcp" !== t.transport && "udp" !== t.transport) throw new Error(`multiaddr must have a valid format - no protocol with name: "${t.transport}". Must have a valid transport protocol: "{tcp, udp}"`);
        return {
            family: t.family,
            address: t.host,
            port: t.port
        };
    }
    isThinWaistAddress(t) {
        const e = (t ?? this).protos();
        return 2 === e.length && (4 === e[0].code || 41 === e[0].code) && (6 === e[1].code || 273 === e[1].code);
    }
    [R3]() {
        return `Multiaddr(${this.#t})`;
    }
}
class F2 {
    multiaddr;
    netmask;
    constructor(t){
        this.multiaddr = Y2(t), this.netmask = function(t) {
            let e, r;
            if (t.stringTuples().forEach(([t, n])=>{
                t !== $3.code && t !== A3.code || (r = n), t === U3.code && (e = n);
            }), null == e || null == r) throw new Error("Invalid multiaddr");
            return new w3(r, e);
        }(this.multiaddr);
    }
    contains(t) {
        if (null == t) return !1;
        const e = Y2(t);
        let r;
        for (const [t, n] of e.stringTuples())if (4 === t || 41 === t) {
            r = n;
            break;
        }
        return void 0 !== r && this.netmask.contains(r);
    }
}
const G2 = new Map;
function H2(t, e) {
    if (null == t) throw new Error("requires node address object");
    if (null == e) throw new Error("requires transport protocol");
    let r, n = t.address;
    switch(t.family){
        case 4:
            r = "ip4";
            break;
        case 6:
            if (r = "ip6", n.includes("%")) {
                const t = n.split("%");
                if (2 !== t.length) throw Error("Multiple ip6 zones in multiaddr");
                n = t[0];
                r = `/ip6zone/${t[1]}/ip6`;
            }
            break;
        default:
            throw Error("Invalid addr family, should be 4 or 6.");
    }
    return new W2("/" + [
        r,
        n,
        e,
        t.port
    ].join("/"));
}
function K2(t) {
    return !!X2(t) && t.protos().some((t)=>t.resolvable);
}
function X2(t) {
    return Boolean(t?.[V3]);
}
function Y2(t) {
    return new W2(t);
}
export { F2 as MultiaddrFilter, H2 as fromNodeAddress, X2 as isMultiaddr, K2 as isName, Y2 as multiaddr, v4 as protocols, G2 as resolvers };
const __default = null;
export { __default as default };
