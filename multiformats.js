// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

(function (root, factory) {
  typeof module === 'object' && module.exports ? module.exports = factory() : root.MultiformatsMultiaddr = factory()
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict'
  const MultiformatsMultiaddr = (() => {
    const xe = Object.defineProperty
    const Gt = Object.getOwnPropertyDescriptor
    const Xt = Object.getOwnPropertyNames
    const Jt = Object.prototype.hasOwnProperty
    const b = (r, e) => {
      for (const t in e) {
        xe(r, t, {
          get: e[t],
          enumerable: !0
        })
      }
    }; const Ht = (r, e, t, n) => {
      if (e && typeof e === 'object' || typeof e === 'function') {
        for (const o of Xt(e)) {
          !Jt.call(r, o) && o !== t && xe(r, o, {
            get: () => e[o],
            enumerable: !(n = Gt(e, o)) || n.enumerable
          })
        }
      }
      return r
    }
    const Qt = (r) => Ht(xe({}, '__esModule', {
      value: !0
    }), r)
    const Rn = {}
    b(Rn, {
      MultiaddrFilter: () => ge,
      fromNodeAddress: () => Dn,
      isMultiaddr: () => me,
      isName: () => Mn,
      multiaddr: () => Z,
      protocols: () => p,
      resolvers: () => nt
    })
    const ae = class extends Error {
      code
      props
      constructor (e, t, n) {
        super(e), this.code = t, this.name = n?.name ?? 'CodeError', this.props = n ?? {}
      }
    }
    const Ee = {}
    b(Ee, {
      base58btc: () => x,
      base58flickr: () => tr
    })
    new Uint8Array(0)
    function ot (r, e) {
      if (r === e) return !0
      if (r.byteLength !== e.byteLength) return !1
      for (let t = 0; t < r.byteLength; t++) if (r[t] !== e[t]) return !1
      return !0
    }
    function N (r) {
      if (r instanceof Uint8Array && r.constructor.name === 'Uint8Array') return r
      if (r instanceof ArrayBuffer) return new Uint8Array(r)
      if (ArrayBuffer.isView(r)) return new Uint8Array(r.buffer, r.byteOffset, r.byteLength)
      throw new Error('Unknown type, must be binary type')
    }
    function it (r) {
      return new TextEncoder().encode(r)
    }
    function st (r) {
      return new TextDecoder().decode(r)
    }
    function Wt (r, e) {
      if (r.length >= 255) throw new TypeError('Alphabet too long')
      for (var t = new Uint8Array(256), n = 0; n < t.length; n++)t[n] = 255
      for (let o = 0; o < r.length; o++) {
        const i = r.charAt(o); const s = i.charCodeAt(0)
        if (t[s] !== 255) throw new TypeError(i + ' is ambiguous')
        t[s] = o
      }
      const a = r.length; const u = r.charAt(0); const m = Math.log(a) / Math.log(256); const l = Math.log(256) / Math.log(a)
      function E (c) {
        if (c instanceof Uint8Array || (ArrayBuffer.isView(c) ? c = new Uint8Array(c.buffer, c.byteOffset, c.byteLength) : Array.isArray(c) && (c = Uint8Array.from(c))), !(c instanceof Uint8Array)) throw new TypeError('Expected Uint8Array')
        if (c.length === 0) return ''
        for (var g = 0, L = 0, A = 0, S = c.length; A !== S && c[A] === 0;)A++, g++
        for (var C = (S - A) * l + 1 >>> 0, v = new Uint8Array(C); A !== S;) {
          for (var P = c[A], R = 0, I = C - 1; (P !== 0 || R < L) && I !== -1; I--, R++)P += 256 * v[I] >>> 0, v[I] = P % a >>> 0, P = P / a >>> 0
          if (P !== 0) throw new Error('Non-zero carry')
          L = R, A++
        }
        for (var T = C - L; T !== C && v[T] === 0;)T++
        for (var se = u.repeat(g); T < C; ++T)se += r.charAt(v[T])
        return se
      }
      function M (c) {
        if (typeof c !== 'string') throw new TypeError('Expected String')
        if (c.length === 0) return new Uint8Array()
        let g = 0
        if (c[g] !== ' ') {
          for (var L = 0, A = 0; c[g] === u;)L++, g++
          for (var S = (c.length - g) * m + 1 >>> 0, C = new Uint8Array(S); c[g];) {
            let v = t[c.charCodeAt(g)]
            if (v === 255) return
            for (var P = 0, R = S - 1; (v !== 0 || P < A) && R !== -1; R--, P++)v += a * C[R] >>> 0, C[R] = v % 256 >>> 0, v = v / 256 >>> 0
            if (v !== 0) throw new Error('Non-zero carry')
            A = P, g++
          }
          if (c[g] !== ' ') {
            for (var I = S - A; I !== S && C[I] === 0;)I++
            for (var T = new Uint8Array(L + (S - I)), se = L; I !== S;)T[se++] = C[I++]
            return T
          }
        }
      }
      function y (c) {
        const g = M(c)
        if (g) return g
        throw new Error(`Non-${e} character`)
      }
      return {
        encode: E,
        decodeUnsafe: M,
        decode: y
      }
    }
    const Kt = Wt; const Yt = Kt; const ct = Yt
    const we = class {
      name
      prefix
      baseEncode
      constructor (e, t, n) {
        this.name = e, this.prefix = t, this.baseEncode = n
      }

      encode (e) {
        if (e instanceof Uint8Array) return `${this.prefix}${this.baseEncode(e)}`
        throw Error('Unknown type, must be binary type')
      }
    }; const be = class {
      name
      prefix
      baseDecode
      prefixCodePoint
      constructor (e, t, n) {
        if (this.name = e, this.prefix = t, t.codePointAt(0) === void 0) throw new Error('Invalid prefix character')
        this.prefixCodePoint = t.codePointAt(0), this.baseDecode = n
      }

      decode (e) {
        if (typeof e === 'string') {
          if (e.codePointAt(0) !== this.prefixCodePoint) throw Error(`Unable to decode multibase string ${JSON.stringify(e)}, ${this.name} decoder only supports inputs prefixed with ${this.prefix}`)
          return this.baseDecode(e.slice(this.prefix.length))
        } else throw Error('Can only multibase decode strings')
      }

      or (e) {
        return dt(this, e)
      }
    }; const ye = class {
      decoders
      constructor (e) {
        this.decoders = e
      }

      or (e) {
        return dt(this, e)
      }

      decode (e) {
        const t = e[0]; const n = this.decoders[t]
        if (n != null) return n.decode(e)
        throw RangeError(`Unable to decode multibase string ${JSON.stringify(e)}, only inputs prefixed with ${Object.keys(this.decoders)} are supported`)
      }
    }
    function dt (r, e) {
      return new ye({
        ...r.decoders ?? {
          [r.prefix]: r
        },
        ...e.decoders ?? {
          [e.prefix]: e
        }
      })
    }
    const ve = class {
      name
      prefix
      baseEncode
      baseDecode
      encoder
      decoder
      constructor (e, t, n, o) {
        this.name = e, this.prefix = t, this.baseEncode = n, this.baseDecode = o, this.encoder = new we(e, t, n), this.decoder = new be(e, t, o)
      }

      encode (e) {
        return this.encoder.encode(e)
      }

      decode (e) {
        return this.decoder.decode(e)
      }
    }
    function q ({ name: r, prefix: e, encode: t, decode: n }) {
      return new ve(r, e, t, n)
    }
    function z ({ name: r, prefix: e, alphabet: t }) {
      const { encode: n, decode: o } = ct(t, r)
      return q({
        prefix: e,
        name: r,
        encode: n,
        decode: (i) => N(o(i))
      })
    }
    function Zt (r, e, t, n) {
      const o = {}
      for (let l = 0; l < e.length; ++l)o[e[l]] = l
      let i = r.length
      for (; r[i - 1] === '=';)--i
      const s = new Uint8Array(i * t / 8 | 0); let a = 0; let u = 0; let m = 0
      for (let l = 0; l < i; ++l) {
        const E = o[r[l]]
        if (E === void 0) throw new SyntaxError(`Non-${n} character`)
        u = u << t | E, a += t, a >= 8 && (a -= 8, s[m++] = 255 & u >> a)
      }
      if (a >= t || 255 & u << 8 - a) throw new SyntaxError('Unexpected end of data')
      return s
    }
    function er (r, e, t) {
      const n = e[e.length - 1] === '='; const o = (1 << t) - 1; let i = ''; let s = 0; let a = 0
      for (let u = 0; u < r.length; ++u) for (a = a << 8 | r[u], s += 8; s > t;)s -= t, i += e[o & a >> s]
      if (s !== 0 && (i += e[o & a << t - s]), n) for (; i.length * t & 7;)i += '='
      return i
    }
    function f ({ name: r, prefix: e, bitsPerChar: t, alphabet: n }) {
      return q({
        prefix: e,
        name: r,
        encode (o) {
          return er(o, n, t)
        },
        decode (o) {
          return Zt(o, n, t, r)
        }
      })
    }
    var x = z({
      name: 'base58btc',
      prefix: 'z',
      alphabet: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    }); var tr = z({
      name: 'base58flickr',
      prefix: 'Z',
      alphabet: '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
    })
    const Ae = {}
    b(Ae, {
      base32: () => F,
      base32hex: () => ir,
      base32hexpad: () => ar,
      base32hexpadupper: () => cr,
      base32hexupper: () => sr,
      base32pad: () => nr,
      base32padupper: () => or,
      base32upper: () => rr,
      base32z: () => dr
    })
    var F = f({
      prefix: 'b',
      name: 'base32',
      alphabet: 'abcdefghijklmnopqrstuvwxyz234567',
      bitsPerChar: 5
    }); var rr = f({
      prefix: 'B',
      name: 'base32upper',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',
      bitsPerChar: 5
    }); var nr = f({
      prefix: 'c',
      name: 'base32pad',
      alphabet: 'abcdefghijklmnopqrstuvwxyz234567=',
      bitsPerChar: 5
    }); var or = f({
      prefix: 'C',
      name: 'base32padupper',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567=',
      bitsPerChar: 5
    }); var ir = f({
      prefix: 'v',
      name: 'base32hex',
      alphabet: '0123456789abcdefghijklmnopqrstuv',
      bitsPerChar: 5
    }); var sr = f({
      prefix: 'V',
      name: 'base32hexupper',
      alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV',
      bitsPerChar: 5
    }); var ar = f({
      prefix: 't',
      name: 'base32hexpad',
      alphabet: '0123456789abcdefghijklmnopqrstuv=',
      bitsPerChar: 5
    }); var cr = f({
      prefix: 'T',
      name: 'base32hexpadupper',
      alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUV=',
      bitsPerChar: 5
    }); var dr = f({
      prefix: 'h',
      name: 'base32z',
      alphabet: 'ybndrfg8ejkmcpqxot1uwisza345h769',
      bitsPerChar: 5
    })
    const pr = ft; const pt = 128; const ur = 127; const fr = ~ur; const lr = Math.pow(2, 31)
    function ft (r, e, t) {
      e = e || [], t = t || 0
      for (var n = t; r >= lr;)e[t++] = r & 255 | pt, r /= 128
      for (; r & fr;)e[t++] = r & 255 | pt, r >>>= 7
      return e[t] = r | 0, ft.bytes = t - n + 1, e
    }
    const hr = Ie; const mr = 128; const ut = 127
    function Ie (r, n) {
      let t = 0; var n = n || 0; let o = 0; let i = n; let s; const a = r.length
      do {
        if (i >= a) throw Ie.bytes = 0, new RangeError('Could not decode varint')
        s = r[i++], t += o < 28 ? (s & ut) << o : (s & ut) * Math.pow(2, o), o += 7
      } while (s >= mr)
      return Ie.bytes = i - n, t
    }
    const gr = Math.pow(2, 7); const xr = Math.pow(2, 14); const wr = Math.pow(2, 21); const br = Math.pow(2, 28); const yr = Math.pow(2, 35); const vr = Math.pow(2, 42); const Er = Math.pow(2, 49); const Ar = Math.pow(2, 56); const Ir = Math.pow(2, 63); const Sr = function (r) {
      return r < gr ? 1 : r < xr ? 2 : r < wr ? 3 : r < br ? 4 : r < yr ? 5 : r < vr ? 6 : r < Er ? 7 : r < Ar ? 8 : r < Ir ? 9 : 10
    }; const Cr = {
      encode: pr,
      decode: hr,
      encodingLength: Sr
    }; const Pr = Cr; const ee = Pr
    function te (r, e = 0) {
      return [
        ee.decode(r, e),
        ee.decode.bytes
      ]
    }
    function _ (r, e, t = 0) {
      return ee.encode(r, e, t), e
    }
    function G (r) {
      return ee.encodingLength(r)
    }
    function V (r, e) {
      const t = e.byteLength; const n = G(r); const o = n + G(t); const i = new Uint8Array(o + t)
      return _(r, i, 0), _(t, i, n), i.set(e, o), new X(r, t, e, i)
    }
    function de (r) {
      const e = N(r); const [t, n] = te(e); const [o, i] = te(e.subarray(n)); const s = e.subarray(n + i)
      if (s.byteLength !== o) throw new Error('Incorrect length')
      return new X(t, o, s, e)
    }
    function lt (r, e) {
      if (r === e) return !0
      {
        const t = e
        return r.code === t.code && r.size === t.size && t.bytes instanceof Uint8Array && ot(r.bytes, t.bytes)
      }
    }
    var X = class {
      code
      size
      digest
      bytes
      constructor (e, t, n, o) {
        this.code = e, this.size = t, this.digest = n, this.bytes = o
      }
    }
    function ht (r, e) {
      const { bytes: t, version: n } = r
      switch (n) {
        case 0:
          return Tr(t, Se(r), e ?? x.encoder)
        default:
          return Nr(t, Se(r), e ?? F.encoder)
      }
    }
    const mt = new WeakMap()
    function Se (r) {
      const e = mt.get(r)
      if (e == null) {
        const t = new Map()
        return mt.set(r, t), t
      }
      return e
    }
    const k = class r {
      code
      version
      multihash
      bytes
      '/'
      constructor (e, t, n, o) {
        this.code = t, this.version = e, this.multihash = n, this.bytes = o, this['/'] = o
      }

      get asCID () {
        return this
      }

      get byteOffset () {
        return this.bytes.byteOffset
      }

      get byteLength () {
        return this.bytes.byteLength
      }

      toV0 () {
        switch (this.version) {
          case 0:
            return this
          case 1:
          {
            const { code: e, multihash: t } = this
            if (e !== re) throw new Error('Cannot convert a non dag-pb CID to CIDv0')
            if (t.code !== Fr) throw new Error('Cannot convert non sha2-256 multihash CID to CIDv0')
            return r.createV0(t)
          }
          default:
            throw Error(`Can not convert CID version ${this.version} to version 0. This is a bug please report`)
        }
      }

      toV1 () {
        switch (this.version) {
          case 0:
          {
            const { code: e, digest: t } = this.multihash; const n = V(e, t)
            return r.createV1(this.code, n)
          }
          case 1:
            return this
          default:
            throw Error(`Can not convert CID version ${this.version} to version 1. This is a bug please report`)
        }
      }

      equals (e) {
        return r.equals(this, e)
      }

      static equals (e, t) {
        const n = t
        return n != null && e.code === n.code && e.version === n.version && lt(e.multihash, n.multihash)
      }

      toString (e) {
        return ht(this, e)
      }

      toJSON () {
        return {
          '/': ht(this)
        }
      }

      link () {
        return this
      }

      [Symbol.toStringTag] = 'CID';
      [Symbol.for('nodejs.util.inspect.custom')] () {
        return `CID(${this.toString()})`
      }

      static asCID (e) {
        if (e == null) return null
        const t = e
        if (t instanceof r) return t
        if (t['/'] != null && t['/'] === t.bytes || t.asCID === t) {
          const { version: n, code: o, multihash: i, bytes: s } = t
          return new r(n, o, i, s ?? gt(n, o, i.bytes))
        } else if (t[Dr] === !0) {
          const { version: n, multihash: o, code: i } = t; const s = de(o)
          return r.create(n, i, s)
        } else return null
      }

      static create (e, t, n) {
        if (typeof t !== 'number') throw new Error('String codecs are no longer supported')
        if (!(n.bytes instanceof Uint8Array)) throw new Error('Invalid digest')
        switch (e) {
          case 0:
          {
            if (t !== re) throw new Error(`Version 0 CID must use dag-pb (code: ${re}) block encoding`)
            return new r(e, t, n, n.bytes)
          }
          case 1:
          {
            const o = gt(e, t, n.bytes)
            return new r(e, t, n, o)
          }
          default:
            throw new Error('Invalid version')
        }
      }

      static createV0 (e) {
        return r.create(0, re, e)
      }

      static createV1 (e, t) {
        return r.create(1, e, t)
      }

      static decode (e) {
        const [t, n] = r.decodeFirst(e)
        if (n.length !== 0) throw new Error('Incorrect length')
        return t
      }

      static decodeFirst (e) {
        const t = r.inspectBytes(e); const n = t.size - t.multihashSize; const o = N(e.subarray(n, n + t.multihashSize))
        if (o.byteLength !== t.multihashSize) throw new Error('Incorrect length')
        const i = o.subarray(t.multihashSize - t.digestSize); const s = new X(t.multihashCode, t.digestSize, i, o)
        return [
          t.version === 0 ? r.createV0(s) : r.createV1(t.codec, s),
          e.subarray(t.size)
        ]
      }

      static inspectBytes (e) {
        let t = 0; const n = () => {
          const [E, M] = te(e.subarray(t))
          return t += M, E
        }; let o = n(); let i = re
        if (o === 18 ? (o = 0, t = 0) : i = n(), o !== 0 && o !== 1) throw new RangeError(`Invalid CID version ${o}`)
        const s = t; const a = n(); const u = n(); const m = t + u; const l = m - s
        return {
          version: o,
          codec: i,
          multihashCode: a,
          digestSize: u,
          multihashSize: l,
          size: m
        }
      }

      static parse (e, t) {
        const [n, o] = Ur(e, t); const i = r.decode(o)
        if (i.version === 0 && e[0] !== 'Q') throw Error('Version 0 CID string must not include multibase prefix')
        return Se(i).set(n, e), i
      }
    }
    function Ur (r, e) {
      switch (r[0]) {
        case 'Q':
        {
          const t = e ?? x
          return [
            x.prefix,
            t.decode(`${x.prefix}${r}`)
          ]
        }
        case x.prefix:
        {
          const t = e ?? x
          return [
            x.prefix,
            t.decode(r)
          ]
        }
        case F.prefix:
        {
          const t = e ?? F
          return [
            F.prefix,
            t.decode(r)
          ]
        }
        default:
        {
          if (e == null) throw Error('To parse non base32 or base58btc encoded CID multibase decoder must be provided')
          return [
            r[0],
            e.decode(r)
          ]
        }
      }
    }
    function Tr (r, e, t) {
      const { prefix: n } = t
      if (n !== x.prefix) throw Error(`Cannot string encode V0 in ${t.name} encoding`)
      const o = e.get(n)
      if (o == null) {
        const i = t.encode(r).slice(1)
        return e.set(n, i), i
      } else return o
    }
    function Nr (r, e, t) {
      const { prefix: n } = t; const o = e.get(n)
      if (o == null) {
        const i = t.encode(r)
        return e.set(n, i), i
      } else return o
    }
    var re = 112; var Fr = 18
    function gt (r, e, t) {
      const n = G(r); const o = n + G(e); const i = new Uint8Array(o + t.byteLength)
      return _(r, i, 0), _(e, i, n), i.set(t, o), i
    }
    var Dr = Symbol.for('@ipld/js-cid/CID')
    function xt (r, e) {
      if (r === e) return !0
      if (r.byteLength !== e.byteLength) return !1
      for (let t = 0; t < r.byteLength; t++) if (r[t] !== e[t]) return !1
      return !0
    }
    const Ce = {}
    b(Ce, {
      base10: () => Mr
    })
    var Mr = z({
      prefix: '9',
      name: 'base10',
      alphabet: '0123456789'
    })
    const Pe = {}
    b(Pe, {
      base16: () => Rr,
      base16upper: () => zr
    })
    var Rr = f({
      prefix: 'f',
      name: 'base16',
      alphabet: '0123456789abcdef',
      bitsPerChar: 4
    }); var zr = f({
      prefix: 'F',
      name: 'base16upper',
      alphabet: '0123456789ABCDEF',
      bitsPerChar: 4
    })
    const Ue = {}
    b(Ue, {
      base2: () => kr
    })
    var kr = f({
      prefix: '0',
      name: 'base2',
      alphabet: '01',
      bitsPerChar: 1
    })
    const Te = {}
    b(Te, {
      base256emoji: () => $r
    })
    const wt = Array.from('\u{1F680}\u{1FA90}\u2604\u{1F6F0}\u{1F30C}\u{1F311}\u{1F312}\u{1F313}\u{1F314}\u{1F315}\u{1F316}\u{1F317}\u{1F318}\u{1F30D}\u{1F30F}\u{1F30E}\u{1F409}\u2600\u{1F4BB}\u{1F5A5}\u{1F4BE}\u{1F4BF}\u{1F602}\u2764\u{1F60D}\u{1F923}\u{1F60A}\u{1F64F}\u{1F495}\u{1F62D}\u{1F618}\u{1F44D}\u{1F605}\u{1F44F}\u{1F601}\u{1F525}\u{1F970}\u{1F494}\u{1F496}\u{1F499}\u{1F622}\u{1F914}\u{1F606}\u{1F644}\u{1F4AA}\u{1F609}\u263A\u{1F44C}\u{1F917}\u{1F49C}\u{1F614}\u{1F60E}\u{1F607}\u{1F339}\u{1F926}\u{1F389}\u{1F49E}\u270C\u2728\u{1F937}\u{1F631}\u{1F60C}\u{1F338}\u{1F64C}\u{1F60B}\u{1F497}\u{1F49A}\u{1F60F}\u{1F49B}\u{1F642}\u{1F493}\u{1F929}\u{1F604}\u{1F600}\u{1F5A4}\u{1F603}\u{1F4AF}\u{1F648}\u{1F447}\u{1F3B6}\u{1F612}\u{1F92D}\u2763\u{1F61C}\u{1F48B}\u{1F440}\u{1F62A}\u{1F611}\u{1F4A5}\u{1F64B}\u{1F61E}\u{1F629}\u{1F621}\u{1F92A}\u{1F44A}\u{1F973}\u{1F625}\u{1F924}\u{1F449}\u{1F483}\u{1F633}\u270B\u{1F61A}\u{1F61D}\u{1F634}\u{1F31F}\u{1F62C}\u{1F643}\u{1F340}\u{1F337}\u{1F63B}\u{1F613}\u2B50\u2705\u{1F97A}\u{1F308}\u{1F608}\u{1F918}\u{1F4A6}\u2714\u{1F623}\u{1F3C3}\u{1F490}\u2639\u{1F38A}\u{1F498}\u{1F620}\u261D\u{1F615}\u{1F33A}\u{1F382}\u{1F33B}\u{1F610}\u{1F595}\u{1F49D}\u{1F64A}\u{1F639}\u{1F5E3}\u{1F4AB}\u{1F480}\u{1F451}\u{1F3B5}\u{1F91E}\u{1F61B}\u{1F534}\u{1F624}\u{1F33C}\u{1F62B}\u26BD\u{1F919}\u2615\u{1F3C6}\u{1F92B}\u{1F448}\u{1F62E}\u{1F646}\u{1F37B}\u{1F343}\u{1F436}\u{1F481}\u{1F632}\u{1F33F}\u{1F9E1}\u{1F381}\u26A1\u{1F31E}\u{1F388}\u274C\u270A\u{1F44B}\u{1F630}\u{1F928}\u{1F636}\u{1F91D}\u{1F6B6}\u{1F4B0}\u{1F353}\u{1F4A2}\u{1F91F}\u{1F641}\u{1F6A8}\u{1F4A8}\u{1F92C}\u2708\u{1F380}\u{1F37A}\u{1F913}\u{1F619}\u{1F49F}\u{1F331}\u{1F616}\u{1F476}\u{1F974}\u25B6\u27A1\u2753\u{1F48E}\u{1F4B8}\u2B07\u{1F628}\u{1F31A}\u{1F98B}\u{1F637}\u{1F57A}\u26A0\u{1F645}\u{1F61F}\u{1F635}\u{1F44E}\u{1F932}\u{1F920}\u{1F927}\u{1F4CC}\u{1F535}\u{1F485}\u{1F9D0}\u{1F43E}\u{1F352}\u{1F617}\u{1F911}\u{1F30A}\u{1F92F}\u{1F437}\u260E\u{1F4A7}\u{1F62F}\u{1F486}\u{1F446}\u{1F3A4}\u{1F647}\u{1F351}\u2744\u{1F334}\u{1F4A3}\u{1F438}\u{1F48C}\u{1F4CD}\u{1F940}\u{1F922}\u{1F445}\u{1F4A1}\u{1F4A9}\u{1F450}\u{1F4F8}\u{1F47B}\u{1F910}\u{1F92E}\u{1F3BC}\u{1F975}\u{1F6A9}\u{1F34E}\u{1F34A}\u{1F47C}\u{1F48D}\u{1F4E3}\u{1F942}'); const Lr = wt.reduce((r, e, t) => (r[t] = e, r), []); const Vr = wt.reduce((r, e, t) => (r[e.codePointAt(0)] = t, r), [])
    function Br (r) {
      return r.reduce((e, t) => (e += Lr[t], e), '')
    }
    function Or (r) {
      const e = []
      for (const t of r) {
        const n = Vr[t.codePointAt(0)]
        if (n === void 0) throw new Error(`Non-base256emoji character: ${t}`)
        e.push(n)
      }
      return new Uint8Array(e)
    }
    var $r = q({
      prefix: '\u{1F680}',
      name: 'base256emoji',
      encode: Br,
      decode: Or
    })
    const Ne = {}
    b(Ne, {
      base36: () => jr,
      base36upper: () => qr
    })
    var jr = z({
      prefix: 'k',
      name: 'base36',
      alphabet: '0123456789abcdefghijklmnopqrstuvwxyz'
    }); var qr = z({
      prefix: 'K',
      name: 'base36upper',
      alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    })
    const Fe = {}
    b(Fe, {
      base64: () => _r,
      base64pad: () => Gr,
      base64url: () => Xr,
      base64urlpad: () => Jr
    })
    var _r = f({
      prefix: 'm',
      name: 'base64',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      bitsPerChar: 6
    }); var Gr = f({
      prefix: 'M',
      name: 'base64pad',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      bitsPerChar: 6
    }); var Xr = f({
      prefix: 'u',
      name: 'base64url',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
      bitsPerChar: 6
    }); var Jr = f({
      prefix: 'U',
      name: 'base64urlpad',
      alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=',
      bitsPerChar: 6
    })
    const De = {}
    b(De, {
      base8: () => Hr
    })
    var Hr = f({
      prefix: '7',
      name: 'base8',
      alphabet: '01234567',
      bitsPerChar: 3
    })
    const Me = {}
    b(Me, {
      identity: () => Qr
    })
    var Qr = q({
      prefix: '\0',
      name: 'identity',
      encode: (r) => st(r),
      decode: (r) => it(r)
    })
    new TextEncoder(), new TextDecoder()
    const Re = {}
    b(Re, {
      identity: () => en
    })
    const bt = 0; const Yr = 'identity'; const yt = N
    function Zr (r) {
      return V(bt, yt(r))
    }
    var en = {
      code: bt,
      name: Yr,
      encode: yt,
      digest: Zr
    }
    const Le = {}
    b(Le, {
      sha256: () => tn,
      sha512: () => rn
    })
    function ke ({ name: r, code: e, encode: t }) {
      return new ze(r, e, t)
    }
    var ze = class {
      name
      code
      encode
      constructor (e, t, n) {
        this.name = e, this.code = t, this.encode = n
      }

      digest (e) {
        if (e instanceof Uint8Array) {
          const t = this.encode(e)
          return t instanceof Uint8Array ? V(this.code, t) : t.then((n) => V(this.code, n))
        } else throw Error('Unknown type, must be binary type')
      }
    }
    function Et (r) {
      return async (e) => new Uint8Array(await crypto.subtle.digest(r, e))
    }
    var tn = ke({
      name: 'sha2-256',
      code: 18,
      encode: Et('SHA-256')
    }); var rn = ke({
      name: 'sha2-512',
      code: 19,
      encode: Et('SHA-512')
    })
    const ne = {
      ...Me,
      ...Ue,
      ...De,
      ...Ce,
      ...Pe,
      ...Ae,
      ...Ne,
      ...Ee,
      ...Fe,
      ...Te
    }; const Ao = {
      ...Le,
      ...Re
    }
    function H (r = 0) {
      return new Uint8Array(r)
    }
    function It (r, e, t, n) {
      return {
        name: r,
        prefix: e,
        encoder: {
          name: r,
          prefix: e,
          encode: t
        },
        decoder: {
          decode: n
        }
      }
    }
    const At = It('utf8', 'u', (r) => 'u' + new TextDecoder('utf8').decode(r), (r) => new TextEncoder().encode(r.substring(1))); const Ve = It('ascii', 'a', (r) => {
      let e = 'a'
      for (let t = 0; t < r.length; t++)e += String.fromCharCode(r[t])
      return e
    }, (r) => {
      r = r.substring(1)
      const e = H(r.length)
      for (let t = 0; t < r.length; t++)e[t] = r.charCodeAt(t)
      return e
    }); const nn = {
      utf8: At,
      'utf-8': At,
      hex: ne.base16,
      latin1: Ve,
      ascii: Ve,
      binary: Ve,
      ...ne
    }; const pe = nn
    function w (r, e = 'utf8') {
      const t = pe[e]
      if (t == null) throw new Error(`Unsupported encoding "${e}"`)
      return t.encoder.encode(r).substring(1)
    }
    const on = Math.pow(2, 7); const sn = Math.pow(2, 14); const an = Math.pow(2, 21); const Be = Math.pow(2, 28); const Oe = Math.pow(2, 35); const $e = Math.pow(2, 42); const je = Math.pow(2, 49); const d = 128; const h = 127
    function U (r) {
      if (r < on) return 1
      if (r < sn) return 2
      if (r < an) return 3
      if (r < Be) return 4
      if (r < Oe) return 5
      if (r < $e) return 6
      if (r < je) return 7
      if (Number.MAX_SAFE_INTEGER != null && r > Number.MAX_SAFE_INTEGER) throw new RangeError('Could not encode varint')
      return 8
    }
    function cn (r, e, t = 0) {
      switch (U(r)) {
        case 8:
          e[t++] = r & 255 | d, r /= 128
        case 7:
          e[t++] = r & 255 | d, r /= 128
        case 6:
          e[t++] = r & 255 | d, r /= 128
        case 5:
          e[t++] = r & 255 | d, r /= 128
        case 4:
          e[t++] = r & 255 | d, r >>>= 7
        case 3:
          e[t++] = r & 255 | d, r >>>= 7
        case 2:
          e[t++] = r & 255 | d, r >>>= 7
        case 1:
        {
          e[t++] = r & 255, r >>>= 7
          break
        }
        default:
          throw new Error('unreachable')
      }
      return e
    }
    function dn (r, e, t = 0) {
      switch (U(r)) {
        case 8:
          e.set(t++, r & 255 | d), r /= 128
        case 7:
          e.set(t++, r & 255 | d), r /= 128
        case 6:
          e.set(t++, r & 255 | d), r /= 128
        case 5:
          e.set(t++, r & 255 | d), r /= 128
        case 4:
          e.set(t++, r & 255 | d), r >>>= 7
        case 3:
          e.set(t++, r & 255 | d), r >>>= 7
        case 2:
          e.set(t++, r & 255 | d), r >>>= 7
        case 1:
        {
          e.set(t++, r & 255), r >>>= 7
          break
        }
        default:
          throw new Error('unreachable')
      }
      return e
    }
    function pn (r, e) {
      let t = r[e]; let n = 0
      if (n += t & h, t < d || (t = r[e + 1], n += (t & h) << 7, t < d) || (t = r[e + 2], n += (t & h) << 14, t < d) || (t = r[e + 3], n += (t & h) << 21, t < d) || (t = r[e + 4], n += (t & h) * Be, t < d) || (t = r[e + 5], n += (t & h) * Oe, t < d) || (t = r[e + 6], n += (t & h) * $e, t < d) || (t = r[e + 7], n += (t & h) * je, t < d)) return n
      throw new RangeError('Could not decode varint')
    }
    function un (r, e) {
      let t = r.get(e); let n = 0
      if (n += t & h, t < d || (t = r.get(e + 1), n += (t & h) << 7, t < d) || (t = r.get(e + 2), n += (t & h) << 14, t < d) || (t = r.get(e + 3), n += (t & h) << 21, t < d) || (t = r.get(e + 4), n += (t & h) * Be, t < d) || (t = r.get(e + 5), n += (t & h) * Oe, t < d) || (t = r.get(e + 6), n += (t & h) * $e, t < d) || (t = r.get(e + 7), n += (t & h) * je, t < d)) return n
      throw new RangeError('Could not decode varint')
    }
    function Q (r, e, t = 0) {
      return e == null && (e = H(U(r))), e instanceof Uint8Array ? cn(r, e, t) : dn(r, e, t)
    }
    function B (r, e = 0) {
      return r instanceof Uint8Array ? pn(r, e) : un(r, e)
    }
    function D (r, e) {
      e == null && (e = r.reduce((o, i) => o + i.length, 0))
      const t = H(e); let n = 0
      for (const o of r)t.set(o, n), n += o.length
      return t
    }
    const ue = class {
      index = 0
      input = ''
      new (e) {
        return this.index = 0, this.input = e, this
      }

      readAtomically (e) {
        const t = this.index; const n = e()
        return n === void 0 && (this.index = t), n
      }

      parseWith (e) {
        const t = e()
        if (this.index === this.input.length) return t
      }

      peekChar () {
        if (!(this.index >= this.input.length)) return this.input[this.index]
      }

      readChar () {
        if (!(this.index >= this.input.length)) return this.input[this.index++]
      }

      readGivenChar (e) {
        return this.readAtomically(() => {
          const t = this.readChar()
          if (t === e) return t
        })
      }

      readSeparator (e, t, n) {
        return this.readAtomically(() => {
          if (!(t > 0 && this.readGivenChar(e) === void 0)) return n()
        })
      }

      readNumber (e, t, n, o) {
        return this.readAtomically(() => {
          let i = 0; let s = 0; const a = this.peekChar()
          if (a === void 0) return
          const u = a === '0'; const m = 2 ** (8 * o) - 1
          for (;;) {
            const l = this.readAtomically(() => {
              const E = this.readChar()
              if (E === void 0) return
              const M = Number.parseInt(E, e)
              if (!Number.isNaN(M)) return M
            })
            if (l === void 0) break
            if (i *= e, i += l, i > m || (s += 1, t !== void 0 && s > t)) return
          }
          if (s !== 0) return !n && u && s > 1 ? void 0 : i
        })
      }

      readIPv4Addr () {
        return this.readAtomically(() => {
          const e = new Uint8Array(4)
          for (let t = 0; t < e.length; t++) {
            const n = this.readSeparator('.', t, () => this.readNumber(10, 3, !1, 1))
            if (n === void 0) return
            e[t] = n
          }
          return e
        })
      }

      readIPv6Addr () {
        const e = (t) => {
          for (let n = 0; n < t.length / 2; n++) {
            const o = n * 2
            if (n < t.length - 3) {
              const s = this.readSeparator(':', n, () => this.readIPv4Addr())
              if (s !== void 0) {
                return t[o] = s[0], t[o + 1] = s[1], t[o + 2] = s[2], t[o + 3] = s[3], [
                  o + 4,
                  !0
                ]
              }
            }
            const i = this.readSeparator(':', n, () => this.readNumber(16, 4, !0, 2))
            if (i === void 0) {
              return [
                o,
                !1
              ]
            }
            t[o] = i >> 8, t[o + 1] = i & 255
          }
          return [
            t.length,
            !1
          ]
        }
        return this.readAtomically(() => {
          const t = new Uint8Array(16); const [n, o] = e(t)
          if (n === 16) return t
          if (o || this.readGivenChar(':') === void 0 || this.readGivenChar(':') === void 0) return
          const i = new Uint8Array(14); const s = 16 - (n + 2); const [a] = e(i.subarray(0, s))
          return t.set(i.subarray(0, a), 16 - a), t
        })
      }

      readIPAddr () {
        return this.readIPv4Addr() ?? this.readIPv6Addr()
      }
    }
    const Ct = 45; const fn = 15; const W = new ue()
    function fe (r) {
      if (!(r.length > fn)) return W.new(r).parseWith(() => W.readIPv4Addr())
    }
    function le (r) {
      if (r.includes('%') && (r = r.split('%')[0]), !(r.length > Ct)) return W.new(r).parseWith(() => W.readIPv6Addr())
    }
    function O (r) {
      if (r.includes('%') && (r = r.split('%')[0]), !(r.length > Ct)) return W.new(r).parseWith(() => W.readIPAddr())
    }
    function Pt (r, e, t) {
      let n = 0
      for (const o of r) {
        if (!(n < e)) {
          if (n > t) break
          if (o !== 255) return !1
          n++
        }
      }
      return !0
    }
    function Ut (r, e, t, n) {
      let o = 0
      for (const i of r) {
        if (!(o < t)) {
          if (o > n) break
          if (i !== e[o]) return !1
          o++
        }
      }
      return !0
    }
    function qe (r) {
      switch (r.length) {
        case $:
          return r.join('.')
        case j:
        {
          const e = []
          for (let t = 0; t < r.length; t++)t % 2 === 0 && e.push(r[t].toString(16).padStart(2, '0') + r[t + 1].toString(16).padStart(2, '0'))
          return e.join(':')
        }
        default:
          throw new Error('Invalid ip length')
      }
    }
    function Tt (r) {
      let e = 0
      for (let [t, n] of r.entries()) {
        if (n === 255) {
          e += 8
          continue
        }
        for (; n & 128;)e++, n = n << 1
        if (n & 128) return -1
        for (let o = t + 1; o < r.length; o++) if (r[o] != 0) return -1
        break
      }
      return e
    }
    function Nt (r) {
      let e = '0x'
      for (const t of r)e += (t >> 4).toString(16) + (t & 15).toString(16)
      return e
    }
    var $ = 4; var j = 16; const _o = parseInt('0xFFFF', 16); const ln = new Uint8Array([
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
    ])
    function oe (r, e) {
      e.length === j && r.length === $ && Pt(e, 0, 11) && (e = e.slice(12)), e.length === $ && r.length === j && Ut(r, ln, 0, 11) && (r = r.slice(12))
      const t = r.length
      if (t != e.length) throw new Error('Failed to mask ip')
      const n = new Uint8Array(t)
      for (let o = 0; o < t; o++)n[o] = r[o] & e[o]
      return n
    }
    function Ft (r, e) {
      if (typeof e === 'string' && (e = O(e)), e == null) throw new Error('Invalid ip')
      if (e.length !== r.network.length) return !1
      for (let t = 0; t < e.length; t++) if ((r.network[t] & r.mask[t]) !== (e[t] & r.mask[t])) return !1
      return !0
    }
    function _e (r) {
      const [e, t] = r.split('/')
      if (!e || !t) throw new Error('Failed to parse given CIDR: ' + r)
      let n = $; let o = fe(e)
      if (o == null && (n = j, o = le(e), o == null)) throw new Error('Failed to parse given CIDR: ' + r)
      const i = parseInt(t, 10)
      if (Number.isNaN(i) || String(i).length !== t.length || i < 0 || i > n * 8) throw new Error('Failed to parse given CIDR: ' + r)
      const s = Ge(i, 8 * n)
      return {
        network: oe(o, s),
        mask: s
      }
    }
    function Ge (r, e) {
      if (e !== 8 * $ && e !== 8 * j) throw new Error('Invalid CIDR mask')
      if (r < 0 || r > e) throw new Error('Invalid CIDR mask')
      const t = e / 8; const n = new Uint8Array(t)
      for (let o = 0; o < t; o++) {
        if (r >= 8) {
          n[o] = 255, r -= 8
          continue
        }
        n[o] = 255 - (255 >> r), r = 0
      }
      return n
    }
    const K = class {
      constructor (e, t) {
        if (t == null) ({ network: this.network, mask: this.mask } = _e(e))
        else {
          const n = O(e)
          if (n == null) throw new Error('Failed to parse network')
          t = String(t)
          const o = parseInt(t, 10)
          if (Number.isNaN(o) || String(o).length !== t.length || o < 0 || o > n.length * 8) {
            const i = O(t)
            if (i == null) throw new Error('Failed to parse mask')
            this.mask = i
          } else this.mask = Ge(o, 8 * n.length)
          this.network = oe(n, this.mask)
        }
      }

      contains (e) {
        return Ft({
          network: this.network,
          mask: this.mask
        }, e)
      }

      toString () {
        const e = Tt(this.mask); const t = e !== -1 ? String(e) : Nt(this.mask)
        return qe(this.network) + '/' + t
      }
    }
    function Xe (r, e = 'utf8') {
      const t = pe[e]
      if (t == null) throw new Error(`Unsupported encoding "${e}"`)
      return t.decoder.decode(`${t.prefix}${r}`)
    }
    function Dt (r) {
      return !!fe(r)
    }
    function Mt (r) {
      return !!le(r)
    }
    function he (r) {
      return !!O(r)
    }
    const Rt = Dt; const hn = Mt; const Je = function (r) {
      let e = 0
      if (r = r.toString().trim(), Rt(r)) {
        const t = new Uint8Array(e + 4)
        return r.split(/\./g).forEach((n) => {
          t[e++] = parseInt(n, 10) & 255
        }), t
      }
      if (hn(r)) {
        const t = r.split(':', 8); let n
        for (n = 0; n < t.length; n++) {
          const i = Rt(t[n]); let s
          i && (s = Je(t[n]), t[n] = w(s.slice(0, 2), 'base16')), s != null && ++n < 8 && t.splice(n, 0, w(s.slice(2, 4), 'base16'))
        }
        if (t[0] === '') for (; t.length < 8;)t.unshift('0')
        else if (t[t.length - 1] === '') for (; t.length < 8;)t.push('0')
        else if (t.length < 8) {
          for (n = 0; n < t.length && t[n] !== ''; n++);
          const i = [
            n,
            1
          ]
          for (n = 9 - t.length; n > 0; n--)i.push('0')
          t.splice.apply(t, i)
        }
        const o = new Uint8Array(e + 16)
        for (n = 0; n < t.length; n++) {
          const i = parseInt(t[n], 16)
          o[e++] = i >> 8 & 255, o[e++] = i & 255
        }
        return o
      }
      throw new Error('invalid ip address')
    }; const zt = function (r, e = 0, t) {
      e = ~~e, t = t ?? r.length - e
      const n = new DataView(r.buffer)
      if (t === 4) {
        const o = []
        for (let i = 0; i < t; i++)o.push(r[e + i])
        return o.join('.')
      }
      if (t === 16) {
        const o = []
        for (let i = 0; i < t; i += 2)o.push(n.getUint16(e + i).toString(16))
        return o.join(':').replace(/(^|:)0(:0)*:0(:|$)/, '$1::$3').replace(/:{3,4}/, '::')
      }
      return ''
    }
    const Y = {}; const He = {}; const gn = [
      [
        4,
        32,
        'ip4'
      ],
      [
        6,
        16,
        'tcp'
      ],
      [
        33,
        16,
        'dccp'
      ],
      [
        41,
        128,
        'ip6'
      ],
      [
        42,
        -1,
        'ip6zone'
      ],
      [
        43,
        8,
        'ipcidr'
      ],
      [
        53,
        -1,
        'dns',
        !0
      ],
      [
        54,
        -1,
        'dns4',
        !0
      ],
      [
        55,
        -1,
        'dns6',
        !0
      ],
      [
        56,
        -1,
        'dnsaddr',
        !0
      ],
      [
        132,
        16,
        'sctp'
      ],
      [
        273,
        16,
        'udp'
      ],
      [
        275,
        0,
        'p2p-webrtc-star'
      ],
      [
        276,
        0,
        'p2p-webrtc-direct'
      ],
      [
        277,
        0,
        'p2p-stardust'
      ],
      [
        280,
        0,
        'webrtc-direct'
      ],
      [
        281,
        0,
        'webrtc'
      ],
      [
        290,
        0,
        'p2p-circuit'
      ],
      [
        301,
        0,
        'udt'
      ],
      [
        302,
        0,
        'utp'
      ],
      [
        400,
        -1,
        'unix',
        !1,
        !0
      ],
      [
        421,
        -1,
        'ipfs'
      ],
      [
        421,
        -1,
        'p2p'
      ],
      [
        443,
        0,
        'https'
      ],
      [
        444,
        96,
        'onion'
      ],
      [
        445,
        296,
        'onion3'
      ],
      [
        446,
        -1,
        'garlic64'
      ],
      [
        448,
        0,
        'tls'
      ],
      [
        449,
        -1,
        'sni'
      ],
      [
        460,
        0,
        'quic'
      ],
      [
        461,
        0,
        'quic-v1'
      ],
      [
        465,
        0,
        'webtransport'
      ],
      [
        466,
        -1,
        'certhash'
      ],
      [
        477,
        0,
        'ws'
      ],
      [
        478,
        0,
        'wss'
      ],
      [
        479,
        0,
        'p2p-websocket-star'
      ],
      [
        480,
        0,
        'http'
      ],
      [
        777,
        -1,
        'memory'
      ]
    ]
    gn.forEach((r) => {
      const e = xn(...r)
      He[e.code] = e, Y[e.name] = e
    })
    function xn (r, e, t, n, o) {
      return {
        code: r,
        size: e,
        name: t,
        resolvable: !!n,
        path: !!o
      }
    }
    function p (r) {
      if (typeof r === 'number') {
        if (He[r] != null) return He[r]
        throw new Error(`no protocol with code: ${r}`)
      } else if (typeof r === 'string') {
        if (Y[r] != null) return Y[r]
        throw new Error(`no protocol with name: ${r}`)
      }
      throw new Error(`invalid protocol id type: ${typeof r}`)
    }
    const wn = p('ip4'); const bn = p('ip6'); const yn = p('ipcidr')
    function We (r, e) {
      switch (p(r).code) {
        case 4:
        case 41:
          return En(e)
        case 42:
          return Vt(e)
        case 6:
        case 273:
        case 33:
        case 132:
          return $t(e).toString()
        case 53:
        case 54:
        case 55:
        case 56:
        case 400:
        case 449:
        case 777:
          return Vt(e)
        case 421:
          return Cn(e)
        case 444:
          return Bt(e)
        case 445:
          return Bt(e)
        case 466:
          return Sn(e)
        default:
          return w(e, 'base16')
      }
    }
    function Ke (r, e) {
      switch (p(r).code) {
        case 4:
          return kt(e)
        case 41:
          return kt(e)
        case 42:
          return Lt(e)
        case 6:
        case 273:
        case 33:
        case 132:
          return Ye(parseInt(e, 10))
        case 53:
        case 54:
        case 55:
        case 56:
        case 400:
        case 449:
        case 777:
          return Lt(e)
        case 421:
          return An(e)
        case 444:
          return Pn(e)
        case 445:
          return Un(e)
        case 466:
          return In(e)
        default:
          return Xe(e, 'base16')
      }
    }
    function Ot (r) {
      let e, t
      if (r.stringTuples().forEach(([n, o]) => {
        (n === wn.code || n === bn.code) && (t = o), n === yn.code && (e = o)
      }), e == null || t == null) throw new Error('Invalid multiaddr')
      return new K(t, e)
    }
    const Qe = Object.values(ne).map((r) => r.decoder); const vn = (function () {
      let r = Qe[0].or(Qe[1])
      return Qe.slice(2).forEach((e) => r = r.or(e)), r
    }())
    function kt (r) {
      if (!he(r)) throw new Error('invalid ip address')
      return Je(r)
    }
    function En (r) {
      const e = zt(r, 0, r.length)
      if (e == null) throw new Error('ipBuff is required')
      if (!he(e)) throw new Error('invalid ip address')
      return e
    }
    function Ye (r) {
      const e = new ArrayBuffer(2)
      return new DataView(e).setUint16(0, r), new Uint8Array(e)
    }
    function $t (r) {
      return new DataView(r.buffer).getUint16(r.byteOffset)
    }
    function Lt (r) {
      const e = Xe(r); const t = Uint8Array.from(Q(e.length))
      return D([
        t,
        e
      ], t.length + e.length)
    }
    function Vt (r) {
      const e = B(r)
      if (r = r.slice(U(e)), r.length !== e) throw new Error('inconsistent lengths')
      return w(r)
    }
    function An (r) {
      let e
      r[0] === 'Q' || r[0] === '1' ? e = de(x.decode(`z${r}`)).bytes : e = k.parse(r).multihash.bytes
      const t = Uint8Array.from(Q(e.length))
      return D([
        t,
        e
      ], t.length + e.length)
    }
    function In (r) {
      const e = vn.decode(r); const t = Uint8Array.from(Q(e.length))
      return D([
        t,
        e
      ], t.length + e.length)
    }
    function Sn (r) {
      const e = B(r); const t = r.slice(U(e))
      if (t.length !== e) throw new Error('inconsistent lengths')
      return 'u' + w(t, 'base64url')
    }
    function Cn (r) {
      const e = B(r); const t = r.slice(U(e))
      if (t.length !== e) throw new Error('inconsistent lengths')
      return w(t, 'base58btc')
    }
    function Pn (r) {
      const e = r.split(':')
      if (e.length !== 2) throw new Error(`failed to parse onion addr: ["'${e.join('", "')}'"]' does not contain a port number`)
      if (e[0].length !== 16) throw new Error(`failed to parse onion addr: ${e[0]} not a Tor onion address.`)
      const t = F.decode('b' + e[0]); const n = parseInt(e[1], 10)
      if (n < 1 || n > 65536) throw new Error('Port number is not in range(1, 65536)')
      const o = Ye(n)
      return D([
        t,
        o
      ], t.length + o.length)
    }
    function Un (r) {
      const e = r.split(':')
      if (e.length !== 2) throw new Error(`failed to parse onion addr: ["'${e.join('", "')}'"]' does not contain a port number`)
      if (e[0].length !== 56) throw new Error(`failed to parse onion addr: ${e[0]} not a Tor onion3 address.`)
      const t = F.decode(`b${e[0]}`); const n = parseInt(e[1], 10)
      if (n < 1 || n > 65536) throw new Error('Port number is not in range(1, 65536)')
      const o = Ye(n)
      return D([
        t,
        o
      ], t.length + o.length)
    }
    function Bt (r) {
      const e = r.slice(0, r.length - 2); const t = r.slice(r.length - 2); const n = w(e, 'base32'); const o = $t(t)
      return `${n}:${o}`
    }
    function jt (r) {
      r = Ze(r)
      const e = []; const t = []; let n = null; const o = r.split('/').slice(1)
      if (o.length === 1 && o[0] === '') {
        return {
          bytes: new Uint8Array(),
          string: '/',
          tuples: [],
          stringTuples: [],
          path: null
        }
      }
      for (let i = 0; i < o.length; i++) {
        const s = o[i]; const a = p(s)
        if (a.size === 0) {
          e.push([
            a.code
          ]), t.push([
            a.code
          ])
          continue
        }
        if (i++, i >= o.length) throw _t('invalid address: ' + r)
        if (a.path === !0) {
          n = Ze(o.slice(i).join('/')), e.push([
            a.code,
            Ke(a.code, n)
          ]), t.push([
            a.code,
            n
          ])
          break
        }
        const u = Ke(a.code, o[i])
        e.push([
          a.code,
          u
        ]), t.push([
          a.code,
          We(a.code, u)
        ])
      }
      return {
        string: qt(t),
        bytes: tt(e),
        tuples: e,
        stringTuples: t,
        path: n
      }
    }
    function et (r) {
      const e = []; const t = []; let n = null; let o = 0
      for (; o < r.length;) {
        const i = B(r, o); const s = U(i); const a = p(i); const u = Tn(a, r.slice(o + s))
        if (u === 0) {
          e.push([
            i
          ]), t.push([
            i
          ]), o += s
          continue
        }
        const m = r.slice(o + s, o + s + u)
        if (o += u + s, o > r.length) throw _t('Invalid address Uint8Array: ' + w(r, 'base16'))
        e.push([
          i,
          m
        ])
        const l = We(i, m)
        if (t.push([
          i,
          l
        ]), a.path === !0) {
          n = l
          break
        }
      }
      return {
        bytes: Uint8Array.from(r),
        string: qt(t),
        tuples: e,
        stringTuples: t,
        path: n
      }
    }
    function qt (r) {
      const e = []
      return r.map((t) => {
        const n = p(t[0])
        return e.push(n.name), t.length > 1 && t[1] != null && e.push(t[1]), null
      }), Ze(e.join('/'))
    }
    function tt (r) {
      return D(r.map((e) => {
        const t = p(e[0]); let n = Uint8Array.from(Q(t.code))
        return e.length > 1 && e[1] != null && (n = D([
          n,
          e[1]
        ])), n
      }))
    }
    function Tn (r, e) {
      if (r.size > 0) return r.size / 8
      if (r.size === 0) return 0
      {
        const t = B(e instanceof Uint8Array ? e : Uint8Array.from(e))
        return t + U(t)
      }
    }
    function Ze (r) {
      return '/' + r.trim().split('/').filter((e) => e).join('/')
    }
    function _t (r) {
      return new Error('Error parsing address: ' + r)
    }
    const Nn = Symbol.for('nodejs.util.inspect.custom'); const rt = Symbol.for('@multiformats/js-multiaddr/multiaddr'); const Fn = [
      p('dns').code,
      p('dns4').code,
      p('dns6').code,
      p('dnsaddr').code
    ]; const ie = class r {
      bytes
      #t
      #e
      #r
      #n;
      [rt] = !0
      constructor (e) {
        e == null && (e = '')
        let t
        if (e instanceof Uint8Array) t = et(e)
        else if (typeof e === 'string') {
          if (e.length > 0 && e.charAt(0) !== '/') throw new Error(`multiaddr "${e}" must start with a "/"`)
          t = jt(e)
        } else if (me(e)) t = et(e.bytes)
        else throw new Error('addr must be a string, Buffer, or another Multiaddr')
        this.bytes = t.bytes, this.#t = t.string, this.#e = t.tuples, this.#r = t.stringTuples, this.#n = t.path
      }

      toString () {
        return this.#t
      }

      toJSON () {
        return this.toString()
      }

      toOptions () {
        let e; let t; let n; let o; let i = ''; const s = p('tcp'); const a = p('udp'); const u = p('ip4'); const m = p('ip6'); const l = p('dns6'); const E = p('ip6zone')
        for (const [y, c] of this.stringTuples())y === E.code && (i = `%${c ?? ''}`), Fn.includes(y) && (t = s.name, o = 443, n = `${c ?? ''}${i}`, e = y === l.code ? 6 : 4), (y === s.code || y === a.code) && (t = p(y).name, o = parseInt(c ?? '')), (y === u.code || y === m.code) && (t = p(y).name, n = `${c ?? ''}${i}`, e = y === m.code ? 6 : 4)
        if (e == null || t == null || n == null || o == null) throw new Error('multiaddr must have a valid format: "/{ip4, ip6, dns4, dns6, dnsaddr}/{address}/{tcp, udp}/{port}".')
        return {
          family: e,
          host: n,
          transport: t,
          port: o
        }
      }

      protos () {
        return this.#e.map(([e]) => Object.assign({}, p(e)))
      }

      protoCodes () {
        return this.#e.map(([e]) => e)
      }

      protoNames () {
        return this.#e.map(([e]) => p(e).name)
      }

      tuples () {
        return this.#e
      }

      stringTuples () {
        return this.#r
      }

      encapsulate (e) {
        return e = new r(e), new r(this.toString() + e.toString())
      }

      decapsulate (e) {
        const t = e.toString(); const n = this.toString(); const o = n.lastIndexOf(t)
        if (o < 0) throw new Error(`Address ${this.toString()} does not contain subaddress: ${e.toString()}`)
        return new r(n.slice(0, o))
      }

      decapsulateCode (e) {
        const t = this.tuples()
        for (let n = t.length - 1; n >= 0; n--) if (t[n][0] === e) return new r(tt(t.slice(0, n)))
        return this
      }

      getPeerId () {
        try {
          let e = []
          this.stringTuples().forEach(([n, o]) => {
            n === Y.p2p.code && e.push([
              n,
              o
            ]), n === Y['p2p-circuit'].code && (e = [])
          })
          const t = e.pop()
          if (t?.[1] != null) {
            const n = t[1]
            return n[0] === 'Q' || n[0] === '1' ? w(x.decode(`z${n}`), 'base58btc') : w(k.parse(n).multihash.bytes, 'base58btc')
          }
          return null
        } catch {
          return null
        }
      }

      getPath () {
        return this.#n
      }

      equals (e) {
        return xt(this.bytes, e.bytes)
      }

      async resolve (e) {
        const t = this.protos().find((i) => i.resolvable)
        if (t == null) {
          return [
            this
          ]
        }
        const n = nt.get(t.name)
        if (n == null) throw new ae(`no available resolver for ${t.name}`, 'ERR_NO_AVAILABLE_RESOLVER')
        return (await n(this, e)).map((i) => Z(i))
      }

      nodeAddress () {
        const e = this.toOptions()
        if (e.transport !== 'tcp' && e.transport !== 'udp') throw new Error(`multiaddr must have a valid format - no protocol with name: "${e.transport}". Must have a valid transport protocol: "{tcp, udp}"`)
        return {
          family: e.family,
          address: e.host,
          port: e.port
        }
      }

      isThinWaistAddress (e) {
        const t = (e ?? this).protos()
        return !(t.length !== 2 || t[0].code !== 4 && t[0].code !== 41 || t[1].code !== 6 && t[1].code !== 273)
      }

      [Nn] () {
        return `Multiaddr(${this.#t})`
      }
    }
    var ge = class {
      multiaddr
      netmask
      constructor (e) {
        this.multiaddr = Z(e), this.netmask = Ot(this.multiaddr)
      }

      contains (e) {
        if (e == null) return !1
        const t = Z(e); let n
        for (const [o, i] of t.stringTuples()) {
          if (o === 4 || o === 41) {
            n = i
            break
          }
        }
        return n === void 0 ? !1 : this.netmask.contains(n)
      }
    }
    var nt = new Map()
    function Dn (r, e) {
      if (r == null) throw new Error('requires node address object')
      if (e == null) throw new Error('requires transport protocol')
      let t; let n = r.address
      switch (r.family) {
        case 4:
          t = 'ip4'
          break
        case 6:
          if (t = 'ip6', n.includes('%')) {
            const o = n.split('%')
            if (o.length !== 2) throw Error('Multiple ip6 zones in multiaddr')
            n = o[0], t = `/ip6zone/${o[1]}/ip6`
          }
          break
        default:
          throw Error('Invalid addr family, should be 4 or 6.')
      }
      return new ie('/' + [
        t,
        n,
        e,
        r.port
      ].join('/'))
    }
    function Mn (r) {
      return me(r) ? r.protos().some((e) => e.resolvable) : !1
    }
    function me (r) {
      return !!r?.[rt]
    }
    function Z (r) {
      return new ie(r)
    }
    return Qt(Rn)
  })()
  return MultiformatsMultiaddr
})
