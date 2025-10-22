const lr = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(lr);
let He = !1, ir = !1;
function fr() {
  He = !0;
}
fr();
const Qe = 1, et = 2, Gt = 4, ur = 8, or = 16, cr = 2, I = Symbol(), Xt = !1;
var gt = Array.isArray, vr = Array.prototype.indexOf, Zt = Array.from, ct = Object.defineProperty, ft = Object.getOwnPropertyDescriptor, dr = Object.getOwnPropertyDescriptors, _r = Object.prototype, hr = Array.prototype, Jt = Object.getPrototypeOf;
function pr(e) {
  return e();
}
function vt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Qt() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const $ = 2, en = 4, wt = 8, be = 16, se = 32, Pe = 64, tn = 128, z = 256, We = 512, L = 1024, V = 2048, ve = 4096, Z = 8192, Re = 16384, bt = 32768, xt = 65536, qt = 1 << 17, mr = 1 << 18, tt = 1 << 19, nn = 1 << 20, dt = 1 << 21, kt = 1 << 22, me = 1 << 23, Ie = Symbol("$state"), Se = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function gr(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function wr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function br(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function xr() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function kr(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function yr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Er() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Tr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Sr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let Ar = !1;
function rn(e) {
  return e === this.v;
}
function Cr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function an(e) {
  return !Cr(e, this.v);
}
let N = null;
function ze(e) {
  N = e;
}
function Pr(e, t = !1, n) {
  N = {
    p: N,
    c: null,
    e: null,
    s: e,
    x: null,
    l: He && !t ? { s: null, u: null, $: [] } : null
  };
}
function Rr(e) {
  var t = (
    /** @type {ComponentContext} */
    N
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      mn(r);
  }
  return N = t.p, /** @type {T} */
  {};
}
function Ve() {
  return !He || N !== null && N.l === null;
}
let Ae = [];
function Dr() {
  var e = Ae;
  Ae = [], vt(e);
}
function yt(e) {
  if (Ae.length === 0) {
    var t = Ae;
    queueMicrotask(() => {
      t === Ae && Dr();
    });
  }
  Ae.push(e);
}
const Nr = /* @__PURE__ */ new WeakMap();
function Mr(e) {
  var t = k;
  if (t === null)
    return x.f |= me, e;
  if (t.f & bt)
    Ge(e, t);
  else {
    if (!(t.f & tn))
      throw !t.parent && e instanceof Error && sn(e), e;
    t.b.error(e);
  }
}
function Ge(e, t) {
  for (; t !== null; ) {
    if (t.f & tn)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e instanceof Error && sn(e), e;
}
function sn(e) {
  const t = Nr.get(e);
  t && (ct(e, "message", {
    value: t.message
  }), ct(e, "stack", {
    value: t.stack
  }));
}
const Ye = /* @__PURE__ */ new Set();
let D = null, X = null, $t = /* @__PURE__ */ new Set(), fe = [], Et = null, _t = !1;
class je {
  /**
   * The current values of any sources that are updated in this batch
   * They keys of this map are identical to `this.#previous`
   * @type {Map<Source, any>}
   */
  current = /* @__PURE__ */ new Map();
  /**
   * The values of any sources that are updated in this batch _before_ those updates took place.
   * They keys of this map are identical to `this.#current`
   * @type {Map<Source, any>}
   */
  #n = /* @__PURE__ */ new Map();
  /**
   * When the batch is committed (and the DOM is updated), we need to remove old branches
   * and append new ones by calling the functions added inside (if/each/key/etc) blocks
   * @type {Set<() => void>}
   */
  #t = /* @__PURE__ */ new Set();
  /**
   * The number of async effects that are currently in flight
   */
  #e = 0;
  /**
   * A deferred that resolves when the batch is committed, used with `settled()`
   * TODO replace with Promise.withResolvers once supported widely enough
   * @type {{ promise: Promise<void>, resolve: (value?: any) => void, reject: (reason: unknown) => void } | null}
   */
  #a = null;
  /**
   * Template effects and `$effect.pre` effects, which run when
   * a batch is committed
   * @type {Effect[]}
   */
  #r = [];
  /**
   * The same as `#render_effects`, but for `$effect` (which runs after)
   * @type {Effect[]}
   */
  #s = [];
  /**
   * Block effects, which may need to re-run on subsequent flushes
   * in order to update internal sources (e.g. each block items)
   * @type {Effect[]}
   */
  #l = [];
  /**
   * Deferred effects (which run after async work has completed) that are DIRTY
   * @type {Effect[]}
   */
  #f = [];
  /**
   * Deferred effects that are MAYBE_DIRTY
   * @type {Effect[]}
   */
  #u = [];
  /**
   * A set of branches that still exist, but will be destroyed when this batch
   * is committed — we skip over these during `process`
   * @type {Set<Effect>}
   */
  skipped_effects = /* @__PURE__ */ new Set();
  /**
   *
   * @param {Effect[]} root_effects
   */
  process(t) {
    fe = [], this.apply();
    for (const a of t)
      this.#o(a);
    if (this.#e === 0) {
      var n = X;
      this.#c();
      var r = this.#r, s = this.#s;
      this.#r = [], this.#s = [], this.#l = [], D = null, X = n, Ut(r), Ut(s), this.#a?.resolve();
    } else
      this.#i(this.#r), this.#i(this.#s), this.#i(this.#l);
    X = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   */
  #o(t) {
    t.f ^= L;
    for (var n = t.first; n !== null; ) {
      var r = n.f, s = (r & (se | Pe)) !== 0, a = s && (r & L) !== 0, l = a || (r & Z) !== 0 || this.skipped_effects.has(n);
      if (!l && n.fn !== null) {
        s ? n.f ^= L : r & en ? this.#s.push(n) : rt(n) && (n.f & be && this.#l.push(n), Je(n));
        var f = n.first;
        if (f !== null) {
          n = f;
          continue;
        }
      }
      var i = n.parent;
      for (n = n.next; n === null && i !== null; )
        n = i.next, i = i.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #i(t) {
    for (const n of t)
      (n.f & V ? this.#f : this.#u).push(n), q(n, L);
    t.length = 0;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    this.#n.has(t) || this.#n.set(t, n), this.current.set(t, t.v), X?.set(t, t.v);
  }
  activate() {
    D = this;
  }
  deactivate() {
    D = null, X = null;
  }
  flush() {
    if (fe.length > 0) {
      if (this.activate(), Or(), D !== null && D !== this)
        return;
    } else this.#e === 0 && this.#c();
    this.deactivate();
    for (const t of $t)
      if ($t.delete(t), t(), D !== null)
        break;
  }
  /**
   * Append and remove branches to/from the DOM
   */
  #c() {
    for (const t of this.#t)
      t();
    if (this.#t.clear(), Ye.size > 1) {
      this.#n.clear();
      let t = !0;
      for (const n of Ye) {
        if (n === this) {
          t = !1;
          continue;
        }
        const r = [];
        for (const [a, l] of this.current) {
          if (n.current.has(a))
            if (t && l !== n.current.get(a))
              n.current.set(a, l);
            else
              continue;
          r.push(a);
        }
        if (r.length === 0)
          continue;
        const s = [...n.current.keys()].filter((a) => !this.current.has(a));
        if (s.length > 0) {
          for (const a of r)
            ln(a, s);
          if (fe.length > 0) {
            D = n, n.apply();
            for (const a of fe)
              n.#o(a);
            fe = [], n.deactivate();
          }
        }
      }
      D = null;
    }
    Ye.delete(this);
  }
  increment() {
    this.#e += 1;
  }
  decrement() {
    this.#e -= 1;
    for (const t of this.#f)
      q(t, V), we(t);
    for (const t of this.#u)
      q(t, ve), we(t);
    this.flush();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#a ??= Qt()).promise;
  }
  static ensure() {
    if (D === null) {
      const t = D = new je();
      Ye.add(D), je.enqueue(() => {
        D === t && t.flush();
      });
    }
    return D;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    yt(t);
  }
  apply() {
  }
}
function Or() {
  var e = Ce;
  _t = !0;
  try {
    var t = 0;
    for (Ht(!0); fe.length > 0; ) {
      var n = je.ensure();
      if (t++ > 1e3) {
        var r, s;
        Fr();
      }
      n.process(fe), oe.clear();
    }
  } finally {
    _t = !1, Ht(e), Et = null;
  }
}
function Fr() {
  try {
    yr();
  } catch (e) {
    Ge(e, Et);
  }
}
let pe = null;
function Ut(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (!(r.f & (Re | Z)) && rt(r) && (pe = [], Je(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null && r.ac === null ? xn(r) : r.fn = null), pe?.length > 0)) {
        oe.clear();
        for (const s of pe)
          Je(s);
        pe = [];
      }
    }
    pe = null;
  }
}
function ln(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      r & $ ? ln(
        /** @type {Derived} */
        n,
        t
      ) : r & (kt | be) && fn(n, t) && (q(n, V), we(
        /** @type {Effect} */
        n
      ));
    }
}
function fn(e, t) {
  if (e.deps !== null) {
    for (const n of e.deps)
      if (t.includes(n) || n.f & $ && fn(
        /** @type {Derived} */
        n,
        t
      ))
        return !0;
  }
  return !1;
}
function we(e) {
  for (var t = Et = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (_t && t === k && n & be)
      return;
    if (n & (Pe | se)) {
      if (!(n & L)) return;
      t.f ^= L;
    }
  }
  fe.push(t);
}
function Ir(e, t, n) {
  const r = Ve() ? Tt : un;
  if (t.length === 0) {
    n(e.map(r));
    return;
  }
  var s = D, a = (
    /** @type {Effect} */
    k
  ), l = jr();
  Promise.all(t.map((f) => /* @__PURE__ */ Lr(f))).then((f) => {
    l();
    try {
      n([...e.map(r), ...f]);
    } catch (i) {
      a.f & Re || Ge(i, a);
    }
    s?.deactivate(), ht();
  }).catch((f) => {
    Ge(f, a);
  });
}
function jr() {
  var e = k, t = x, n = N, r = D;
  return function() {
    ce(e), te(t), ze(n), r?.activate();
  };
}
function ht() {
  ce(null), te(null), ze(null);
}
// @__NO_SIDE_EFFECTS__
function Tt(e) {
  var t = $ | V, n = x !== null && x.f & $ ? (
    /** @type {Derived} */
    x
  ) : null;
  return k === null || n !== null && n.f & z ? t |= z : k.f |= tt, {
    ctx: N,
    deps: null,
    effects: null,
    equals: rn,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      I
    ),
    wv: 0,
    parent: n ?? k,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Lr(e, t) {
  let n = (
    /** @type {Effect | null} */
    k
  );
  n === null && wr();
  var r = (
    /** @type {Boundary} */
    n.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), a = Le(
    /** @type {V} */
    I
  ), l = !x, f = /* @__PURE__ */ new Map();
  return Kr(() => {
    var i = Qt();
    s = i.promise;
    try {
      Promise.resolve(e()).then(i.resolve, i.reject).then(ht);
    } catch (h) {
      i.reject(h), ht();
    }
    var u = (
      /** @type {Batch} */
      D
    ), c = r.is_pending();
    l && (r.update_pending_count(1), c || (u.increment(), f.get(u)?.reject(Se), f.delete(u), f.set(u, i)));
    const _ = (h, p = void 0) => {
      if (c || u.activate(), p)
        p !== Se && (a.f |= me, qe(a, p));
      else {
        a.f & me && (a.f ^= me), qe(a, h);
        for (const [o, w] of f) {
          if (f.delete(o), o === u) break;
          w.reject(Se);
        }
      }
      l && (r.update_pending_count(-1), c || u.decrement());
    };
    i.promise.then(_, (h) => _(null, h || "unknown"));
  }), pn(() => {
    for (const i of f.values())
      i.reject(Se);
  }), new Promise((i) => {
    function u(c) {
      function _() {
        c === s ? i(a) : u(s);
      }
      c.then(_, _);
    }
    u(s);
  });
}
// @__NO_SIDE_EFFECTS__
function un(e) {
  const t = /* @__PURE__ */ Tt(e);
  return t.equals = an, t;
}
function on(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      ae(
        /** @type {Effect} */
        t[n]
      );
  }
}
function qr(e) {
  for (var t = e.parent; t !== null; ) {
    if (!(t.f & $))
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function St(e) {
  var t, n = k;
  ce(qr(e));
  try {
    on(e), t = Cn(e);
  } finally {
    ce(n);
  }
  return t;
}
function cn(e) {
  var t = St(e);
  if (e.equals(t) || (e.v = t, e.wv = Sn()), !De)
    if (X !== null)
      X.set(e, e.v);
    else {
      var n = (ue || e.f & z) && e.deps !== null ? ve : L;
      q(e, n);
    }
}
const oe = /* @__PURE__ */ new Map();
function Le(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: rn,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function le(e, t) {
  const n = Le(e);
  return Xr(n), n;
}
// @__NO_SIDE_EFFECTS__
function he(e, t = !1, n = !0) {
  const r = Le(e);
  return t || (r.equals = an), He && n && N !== null && N.l !== null && (N.l.s ??= []).push(r), r;
}
function P(e, t, n = !1) {
  x !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!ee || x.f & qt) && Ve() && x.f & ($ | be | kt | qt) && !re?.includes(e) && Sr();
  let r = n ? Fe(t) : t;
  return qe(e, r);
}
function qe(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    De ? oe.set(e, t) : oe.set(e, n), e.v = t;
    var r = je.ensure();
    r.capture(e, n), e.f & $ && (e.f & V && St(
      /** @type {Derived} */
      e
    ), q(e, e.f & z ? ve : L)), e.wv = Sn(), vn(e, V), Ve() && k !== null && k.f & L && !(k.f & (se | Pe)) && (W === null ? Zr([e]) : W.push(e));
  }
  return t;
}
function ut(e) {
  P(e, e.v + 1);
}
function vn(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Ve(), s = n.length, a = 0; a < s; a++) {
      var l = n[a], f = l.f;
      if (!(!r && l === k)) {
        var i = (f & V) === 0;
        i && q(l, t), f & $ ? vn(
          /** @type {Derived} */
          l,
          ve
        ) : i && (f & be && pe !== null && pe.push(
          /** @type {Effect} */
          l
        ), we(
          /** @type {Effect} */
          l
        ));
      }
    }
}
function Fe(e) {
  if (typeof e != "object" || e === null || Ie in e)
    return e;
  const t = Jt(e);
  if (t !== _r && t !== hr)
    return e;
  var n = /* @__PURE__ */ new Map(), r = gt(e), s = /* @__PURE__ */ le(0), a = ge, l = (f) => {
    if (ge === a)
      return f();
    var i = x, u = ge;
    te(null), Bt(a);
    var c = f();
    return te(i), Bt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ le(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, i, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Er();
        var c = n.get(i);
        return c === void 0 ? c = l(() => {
          var _ = /* @__PURE__ */ le(u.value);
          return n.set(i, _), _;
        }) : P(c, u.value, !0), !0;
      },
      deleteProperty(f, i) {
        var u = n.get(i);
        if (u === void 0) {
          if (i in f) {
            const c = l(() => /* @__PURE__ */ le(I));
            n.set(i, c), ut(s);
          }
        } else
          P(u, I), ut(s);
        return !0;
      },
      get(f, i, u) {
        if (i === Ie)
          return e;
        var c = n.get(i), _ = i in f;
        if (c === void 0 && (!_ || ft(f, i)?.writable) && (c = l(() => {
          var p = Fe(_ ? f[i] : I), o = /* @__PURE__ */ le(p);
          return o;
        }), n.set(i, c)), c !== void 0) {
          var h = v(c);
          return h === I ? void 0 : h;
        }
        return Reflect.get(f, i, u);
      },
      getOwnPropertyDescriptor(f, i) {
        var u = Reflect.getOwnPropertyDescriptor(f, i);
        if (u && "value" in u) {
          var c = n.get(i);
          c && (u.value = v(c));
        } else if (u === void 0) {
          var _ = n.get(i), h = _?.v;
          if (_ !== void 0 && h !== I)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return u;
      },
      has(f, i) {
        if (i === Ie)
          return !0;
        var u = n.get(i), c = u !== void 0 && u.v !== I || Reflect.has(f, i);
        if (u !== void 0 || k !== null && (!c || ft(f, i)?.writable)) {
          u === void 0 && (u = l(() => {
            var h = c ? Fe(f[i]) : I, p = /* @__PURE__ */ le(h);
            return p;
          }), n.set(i, u));
          var _ = v(u);
          if (_ === I)
            return !1;
        }
        return c;
      },
      set(f, i, u, c) {
        var _ = n.get(i), h = i in f;
        if (r && i === "length")
          for (var p = u; p < /** @type {Source<number>} */
          _.v; p += 1) {
            var o = n.get(p + "");
            o !== void 0 ? P(o, I) : p in f && (o = l(() => /* @__PURE__ */ le(I)), n.set(p + "", o));
          }
        if (_ === void 0)
          (!h || ft(f, i)?.writable) && (_ = l(() => /* @__PURE__ */ le(void 0)), P(_, Fe(u)), n.set(i, _));
        else {
          h = _.v !== I;
          var w = l(() => Fe(u));
          P(_, w);
        }
        var b = Reflect.getOwnPropertyDescriptor(f, i);
        if (b?.set && b.set.call(c, u), !h) {
          if (r && typeof i == "string") {
            var A = (
              /** @type {Source<number>} */
              n.get("length")
            ), T = Number(i);
            Number.isInteger(T) && T >= A.v && P(A, T + 1);
          }
          ut(s);
        }
        return !0;
      },
      ownKeys(f) {
        v(s);
        var i = Reflect.ownKeys(f).filter((_) => {
          var h = n.get(_);
          return h === void 0 || h.v !== I;
        });
        for (var [u, c] of n)
          c.v !== I && !(u in f) && i.push(u);
        return i;
      },
      setPrototypeOf() {
        Tr();
      }
    }
  );
}
var $r, Ur, Hr;
function $e(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function dn(e) {
  return Ur.call(e);
}
// @__NO_SIDE_EFFECTS__
function nt(e) {
  return Hr.call(e);
}
function g(e, t) {
  return /* @__PURE__ */ dn(e);
}
function S(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ nt(r);
  return r;
}
function Vr(e) {
  e.textContent = "";
}
function _n() {
  return !1;
}
function At(e) {
  var t = x, n = k;
  te(null), ce(null);
  try {
    return e();
  } finally {
    te(t), ce(n);
  }
}
function hn(e) {
  k === null && x === null && kr(), x !== null && x.f & z && k === null && xr(), De && br();
}
function Br(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function xe(e, t, n, r = !0) {
  var s = k;
  s !== null && s.f & Z && (e |= Z);
  var a = {
    ctx: N,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | V,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: s,
    b: s && s.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null
  };
  if (n)
    try {
      Je(a), a.f |= bt;
    } catch (i) {
      throw ae(a), i;
    }
  else t !== null && we(a);
  if (r) {
    var l = a;
    if (n && l.deps === null && l.teardown === null && l.nodes_start === null && l.first === l.last && // either `null`, or a singular child
    !(l.f & tt) && (l = l.first), l !== null && (l.parent = s, s !== null && Br(l, s), x !== null && x.f & $ && !(e & Pe))) {
      var f = (
        /** @type {Derived} */
        x
      );
      (f.effects ??= []).push(l);
    }
  }
  return a;
}
function pn(e) {
  const t = xe(wt, null, !1);
  return q(t, L), t.teardown = e, t;
}
function pt(e) {
  hn();
  var t = (
    /** @type {Effect} */
    k.f
  ), n = !x && (t & se) !== 0 && (t & bt) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      N
    );
    (r.e ??= []).push(e);
  } else
    return mn(e);
}
function mn(e) {
  return xe(en | nn, e, !1);
}
function Yr(e) {
  return hn(), xe(wt | nn, e, !0);
}
function Kr(e) {
  return xe(kt | tt, e, !0);
}
function ie(e, t = [], n = []) {
  Ir(t, n, (r) => {
    xe(wt, () => e(...r.map(v)), !0);
  });
}
function gn(e, t = 0) {
  var n = xe(be | t, e, !0);
  return n;
}
function Xe(e, t = !0) {
  return xe(se | tt, e, !0, t);
}
function wn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = De, r = x;
    Vt(!0), te(null);
    try {
      t.call(null);
    } finally {
      Vt(n), te(r);
    }
  }
}
function bn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && At(() => {
      s.abort(Se);
    });
    var r = n.next;
    n.f & Pe ? n.parent = null : ae(n, t), n = r;
  }
}
function Wr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    t.f & se || ae(t), t = n;
  }
}
function ae(e, t = !0) {
  var n = !1;
  (t || e.f & mr) && e.nodes_start !== null && e.nodes_end !== null && (zr(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), n = !0), bn(e, t && !n), Ze(e, 0), q(e, Re);
  var r = e.transitions;
  if (r !== null)
    for (const a of r)
      a.stop();
  wn(e);
  var s = e.parent;
  s !== null && s.first !== null && xn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function zr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ nt(e)
    );
    e.remove(), e = n;
  }
}
function xn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function kn(e, t, n = !0) {
  var r = [];
  Ct(e, r, !0), yn(r, () => {
    n && ae(e), t && t();
  });
}
function yn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e)
      s.out(r);
  } else
    t();
}
function Ct(e, t, n) {
  if (!(e.f & Z)) {
    if (e.f ^= Z, e.transitions !== null)
      for (const l of e.transitions)
        (l.is_global || n) && t.push(l);
    for (var r = e.first; r !== null; ) {
      var s = r.next, a = (r.f & xt) !== 0 || (r.f & se) !== 0;
      Ct(r, t, a ? n : !1), r = s;
    }
  }
}
function Pt(e) {
  En(e, !0);
}
function En(e, t) {
  if (e.f & Z) {
    e.f ^= Z, e.f & L || (q(e, V), we(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & xt) !== 0 || (n.f & se) !== 0;
      En(n, s ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || t) && a.in();
  }
}
function Gr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ nt(n)
    );
    t.append(n), n = s;
  }
}
let Ce = !1;
function Ht(e) {
  Ce = e;
}
let De = !1;
function Vt(e) {
  De = e;
}
let x = null, ee = !1;
function te(e) {
  x = e;
}
let k = null;
function ce(e) {
  k = e;
}
let re = null;
function Xr(e) {
  x !== null && (re === null ? re = [e] : re.push(e));
}
let j = null, H = 0, W = null;
function Zr(e) {
  W = e;
}
let Tn = 1, Ue = 0, ge = Ue;
function Bt(e) {
  ge = e;
}
let ue = !1;
function Sn() {
  return ++Tn;
}
function rt(e) {
  var t = e.f;
  if (t & V)
    return !0;
  if (t & ve) {
    var n = e.deps, r = (t & z) !== 0;
    if (n !== null) {
      var s, a, l = (t & We) !== 0, f = r && k !== null && !ue, i = n.length;
      if ((l || f) && (k === null || !(k.f & Re))) {
        var u = (
          /** @type {Derived} */
          e
        ), c = u.parent;
        for (s = 0; s < i; s++)
          a = n[s], (l || !a?.reactions?.includes(u)) && (a.reactions ??= []).push(u);
        l && (u.f ^= We), f && c !== null && !(c.f & z) && (u.f ^= z);
      }
      for (s = 0; s < i; s++)
        if (a = n[s], rt(
          /** @type {Derived} */
          a
        ) && cn(
          /** @type {Derived} */
          a
        ), a.wv > e.wv)
          return !0;
    }
    (!r || k !== null && !ue) && q(e, L);
  }
  return !1;
}
function An(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !re?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var a = r[s];
      a.f & $ ? An(
        /** @type {Derived} */
        a,
        t,
        !1
      ) : t === a && (n ? q(a, V) : a.f & L && q(a, ve), we(
        /** @type {Effect} */
        a
      ));
    }
}
function Cn(e) {
  var t = j, n = H, r = W, s = x, a = ue, l = re, f = N, i = ee, u = ge, c = e.f;
  j = /** @type {null | Value[]} */
  null, H = 0, W = null, ue = (c & z) !== 0 && (ee || !Ce || x === null), x = c & (se | Pe) ? null : e, re = null, ze(e.ctx), ee = !1, ge = ++Ue, e.ac !== null && (At(() => {
    e.ac.abort(Se);
  }), e.ac = null);
  try {
    e.f |= dt;
    var _ = (
      /** @type {Function} */
      e.fn
    ), h = _(), p = e.deps;
    if (j !== null) {
      var o;
      if (Ze(e, H), p !== null && H > 0)
        for (p.length = H + j.length, o = 0; o < j.length; o++)
          p[H + o] = j[o];
      else
        e.deps = p = j;
      if (!ue || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      c & $ && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (o = H; o < p.length; o++)
          (p[o].reactions ??= []).push(e);
    } else p !== null && H < p.length && (Ze(e, H), p.length = H);
    if (Ve() && W !== null && !ee && p !== null && !(e.f & ($ | ve | V)))
      for (o = 0; o < /** @type {Source[]} */
      W.length; o++)
        An(
          W[o],
          /** @type {Effect} */
          e
        );
    return s !== null && s !== e && (Ue++, W !== null && (r === null ? r = W : r.push(.../** @type {Source[]} */
    W))), e.f & me && (e.f ^= me), h;
  } catch (w) {
    return Mr(w);
  } finally {
    e.f ^= dt, j = t, H = n, W = r, x = s, ue = a, re = l, ze(f), ee = i, ge = u;
  }
}
function Jr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = vr.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  n === null && t.f & $ && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (j === null || !j.includes(t)) && (q(t, ve), t.f & (z | We) || (t.f ^= We), on(
    /** @type {Derived} **/
    t
  ), Ze(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Ze(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Jr(e, n[r]);
}
function Je(e) {
  var t = e.f;
  if (!(t & Re)) {
    q(e, L);
    var n = k, r = Ce;
    k = e, Ce = !0;
    try {
      t & be ? Wr(e) : bn(e), wn(e);
      var s = Cn(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = Tn;
      var a;
      Xt && ir && e.f & V && e.deps;
    } finally {
      Ce = r, k = n;
    }
  }
}
function v(e) {
  var t = e.f, n = (t & $) !== 0;
  if (x !== null && !ee) {
    var r = k !== null && (k.f & Re) !== 0;
    if (!r && !re?.includes(e)) {
      var s = x.deps;
      if (x.f & dt)
        e.rv < Ue && (e.rv = Ue, j === null && s !== null && s[H] === e ? H++ : j === null ? j = [e] : (!ue || !j.includes(e)) && j.push(e));
      else {
        (x.deps ??= []).push(e);
        var a = e.reactions;
        a === null ? e.reactions = [x] : a.includes(x) || a.push(x);
      }
    }
  } else if (n && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var l = (
      /** @type {Derived} */
      e
    ), f = l.parent;
    f !== null && !(f.f & z) && (l.f ^= z);
  }
  if (De) {
    if (oe.has(e))
      return oe.get(e);
    if (n) {
      l = /** @type {Derived} */
      e;
      var i = l.v;
      return (!(l.f & L) && l.reactions !== null || Pn(l)) && (i = St(l)), oe.set(l, i), i;
    }
  } else if (n) {
    if (l = /** @type {Derived} */
    e, X?.has(l))
      return X.get(l);
    rt(l) && cn(l);
  }
  if (X?.has(e))
    return X.get(e);
  if (e.f & me)
    throw e.v;
  return e.v;
}
function Pn(e) {
  if (e.v === I) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (oe.has(t) || t.f & $ && Pn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function Rn(e) {
  var t = ee;
  try {
    return ee = !0, e();
  } finally {
    ee = t;
  }
}
const Qr = -7169;
function q(e, t) {
  e.f = e.f & Qr | t;
}
function ea(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (Ie in e)
      mt(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && Ie in n && mt(n);
      }
  }
}
function mt(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        mt(e[r], t);
      } catch {
      }
    const n = Jt(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = dr(n);
      for (let s in r) {
        const a = r[s].get;
        if (a)
          try {
            a.call(e);
          } catch {
          }
      }
    }
  }
}
function ta(e, t, n, r = {}) {
  function s(a) {
    if (r.capture || ra.call(t, a), !a.cancelBubble)
      return At(() => n?.call(this, a));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? yt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function na(e, t, n, r, s) {
  var a = { capture: r, passive: s }, l = ta(e, t, n, a);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && pn(() => {
    t.removeEventListener(e, l, a);
  });
}
let Yt = null;
function ra(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], a = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  Yt = e;
  var l = 0, f = Yt === e && e.__root;
  if (f) {
    var i = s.indexOf(f);
    if (i !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = s.indexOf(t);
    if (u === -1)
      return;
    i <= u && (l = i);
  }
  if (a = /** @type {Element} */
  s[l] || e.target, a !== t) {
    ct(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var c = x, _ = k;
    te(null), ce(null);
    try {
      for (var h, p = []; a !== null; ) {
        var o = a.assignedSlot || a.parentNode || /** @type {any} */
        a.host || null;
        try {
          var w = a["__" + r];
          if (w != null && (!/** @type {any} */
          a.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === a))
            if (gt(w)) {
              var [b, ...A] = w;
              b.apply(a, [e, ...A]);
            } else
              w.call(a, e);
        } catch (T) {
          h ? p.push(T) : h = T;
        }
        if (e.cancelBubble || o === t || o === null)
          break;
        a = o;
      }
      if (h) {
        for (let T of p)
          queueMicrotask(() => {
            throw T;
          });
        throw h;
      }
    } finally {
      e.__root = t, delete e.currentTarget, te(c), ce(_);
    }
  }
}
function aa(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Dn(e, t) {
  var n = (
    /** @type {Effect} */
    k
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function ne(e, t) {
  var n = (t & cr) !== 0, r, s = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = aa(s ? e : "<!>" + e), r = /** @type {Node} */
    /* @__PURE__ */ dn(r));
    var a = (
      /** @type {TemplateNode} */
      n || $r ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Dn(a, a), a;
  };
}
function sa(e = "") {
  {
    var t = $e(e + "");
    return Dn(t, t), t;
  }
}
function G(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function O(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = n + "");
}
class la {
  /** @type {TemplateNode} */
  anchor;
  /** @type {Map<Batch, Key>} */
  #n = /* @__PURE__ */ new Map();
  /** @type {Map<Key, Effect>} */
  #t = /* @__PURE__ */ new Map();
  /** @type {Map<Key, Branch>} */
  #e = /* @__PURE__ */ new Map();
  /**
   * Whether to pause (i.e. outro) on change, or destroy immediately.
   * This is necessary for `<svelte:element>`
   */
  #a = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#a = n;
  }
  #r = () => {
    var t = (
      /** @type {Batch} */
      D
    );
    if (this.#n.has(t)) {
      var n = (
        /** @type {Key} */
        this.#n.get(t)
      ), r = this.#t.get(n);
      if (r)
        Pt(r);
      else {
        var s = this.#e.get(n);
        s && (this.#t.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [a, l] of this.#n) {
        if (this.#n.delete(a), a === t)
          break;
        const f = this.#e.get(l);
        f && (ae(f.effect), this.#e.delete(l));
      }
      for (const [a, l] of this.#t) {
        if (a === n) continue;
        const f = () => {
          if (Array.from(this.#n.values()).includes(a)) {
            var u = document.createDocumentFragment();
            Gr(l, u), u.append($e()), this.#e.set(a, { effect: l, fragment: u });
          } else
            ae(l);
          this.#t.delete(a);
        };
        this.#a || !r ? kn(l, f, !1) : f();
      }
    }
  };
  /**
   *
   * @param {any} key
   * @param {null | ((target: TemplateNode) => void)} fn
   */
  ensure(t, n) {
    var r = (
      /** @type {Batch} */
      D
    ), s = _n();
    if (n && !this.#t.has(t) && !this.#e.has(t))
      if (s) {
        var a = document.createDocumentFragment(), l = $e();
        a.append(l), this.#e.set(t, {
          effect: Xe(() => n(l)),
          fragment: a
        });
      } else
        this.#t.set(
          t,
          Xe(() => n(this.anchor))
        );
    if (this.#n.set(r, t), s) {
      for (const [f, i] of this.#t)
        f === t ? r.skipped_effects.delete(i) : r.skipped_effects.add(i);
      for (const [f, i] of this.#e)
        f === t ? r.skipped_effects.delete(i.effect) : r.skipped_effects.add(i.effect);
      r.add_callback(this.#r);
    } else
      this.#r();
  }
}
function ia(e) {
  N === null && gr(), He && N.l !== null ? fa(N).m.push(e) : pt(() => {
    const t = Rn(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function fa(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ??= { a: [], b: [], m: [] };
}
function _e(e, t, n = !1) {
  var r = new la(e), s = n ? xt : 0;
  function a(l, f) {
    r.ensure(l, f);
  }
  gn(() => {
    var l = !1;
    t((f, i = !0) => {
      l = !0, a(i, f);
    }), l || a(!1, null);
  }, s);
}
function Kt(e, t) {
  return t;
}
function ua(e, t, n) {
  for (var r = e.items, s = [], a = t.length, l = 0; l < a; l++)
    Ct(t[l].e, s, !0);
  var f = a > 0 && s.length === 0 && n !== null;
  if (f) {
    var i = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    Vr(i), i.append(
      /** @type {Element} */
      n
    ), r.clear(), Q(e, t[0].prev, t[a - 1].next);
  }
  yn(s, () => {
    for (var u = 0; u < a; u++) {
      var c = t[u];
      f || (r.delete(c.k), Q(e, c.prev, c.next)), ae(c.e, !f);
    }
  });
}
function Wt(e, t, n, r, s, a = null) {
  var l = e, f = { flags: t, items: /* @__PURE__ */ new Map(), first: null }, i = (t & Gt) !== 0;
  if (i) {
    var u = (
      /** @type {Element} */
      e
    );
    l = u.appendChild($e());
  }
  var c = null, _ = !1, h = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ un(() => {
    var A = n();
    return gt(A) ? A : A == null ? [] : Zt(A);
  }), o, w;
  function b() {
    oa(
      w,
      o,
      f,
      h,
      l,
      s,
      t,
      r,
      n
    ), a !== null && (o.length === 0 ? c ? Pt(c) : c = Xe(() => a(l)) : c !== null && kn(c, () => {
      c = null;
    }));
  }
  gn(() => {
    w ??= /** @type {Effect} */
    k, o = /** @type {V[]} */
    v(p);
    var A = o.length;
    if (!(_ && A === 0)) {
      _ = A === 0;
      var T, M, U, C;
      if (_n()) {
        var y = /* @__PURE__ */ new Set(), E = (
          /** @type {Batch} */
          D
        );
        for (M = 0; M < A; M += 1) {
          U = o[M], C = r(U, M);
          var B = f.items.get(C) ?? h.get(C);
          B ? t & (Qe | et) && Nn(B, U, M, t) : (T = Mn(
            null,
            f,
            null,
            null,
            U,
            C,
            M,
            s,
            t,
            n,
            !0
          ), h.set(C, T)), y.add(C);
        }
        for (const [ke, ye] of f.items)
          y.has(ke) || E.skipped_effects.add(ye.e);
        E.add_callback(b);
      } else
        b();
      v(p);
    }
  });
}
function oa(e, t, n, r, s, a, l, f, i) {
  var u = (l & ur) !== 0, c = (l & (Qe | et)) !== 0, _ = t.length, h = n.items, p = n.first, o = p, w, b = null, A, T = [], M = [], U, C, y, E;
  if (u)
    for (E = 0; E < _; E += 1)
      U = t[E], C = f(U, E), y = h.get(C), y !== void 0 && (y.a?.measure(), (A ??= /* @__PURE__ */ new Set()).add(y));
  for (E = 0; E < _; E += 1) {
    if (U = t[E], C = f(U, E), y = h.get(C), y === void 0) {
      var B = r.get(C);
      if (B !== void 0) {
        r.delete(C), h.set(C, B);
        var ke = b ? b.next : o;
        Q(n, b, B), Q(n, B, ke), ot(B, ke, s), b = B;
      } else {
        var ye = o ? (
          /** @type {TemplateNode} */
          o.e.nodes_start
        ) : s;
        b = Mn(
          ye,
          n,
          b,
          b === null ? n.first : b.next,
          U,
          C,
          E,
          a,
          l,
          i
        );
      }
      h.set(C, b), T = [], M = [], o = b.next;
      continue;
    }
    if (c && Nn(y, U, E, l), y.e.f & Z && (Pt(y.e), u && (y.a?.unfix(), (A ??= /* @__PURE__ */ new Set()).delete(y))), y !== o) {
      if (w !== void 0 && w.has(y)) {
        if (T.length < M.length) {
          var Ee = M[0], J;
          b = Ee.prev;
          var Ne = T[0], Me = T[T.length - 1];
          for (J = 0; J < T.length; J += 1)
            ot(T[J], Ee, s);
          for (J = 0; J < M.length; J += 1)
            w.delete(M[J]);
          Q(n, Ne.prev, Me.next), Q(n, b, Ne), Q(n, Me, Ee), o = Ee, b = Me, E -= 1, T = [], M = [];
        } else
          w.delete(y), ot(y, o, s), Q(n, y.prev, y.next), Q(n, y, b === null ? n.first : b.next), Q(n, b, y), b = y;
        continue;
      }
      for (T = [], M = []; o !== null && o.k !== C; )
        o.e.f & Z || (w ??= /* @__PURE__ */ new Set()).add(o), M.push(o), o = o.next;
      if (o === null)
        continue;
      y = o;
    }
    T.push(y), b = y, o = y.next;
  }
  if (o !== null || w !== void 0) {
    for (var de = w === void 0 ? [] : Zt(w); o !== null; )
      o.e.f & Z || de.push(o), o = o.next;
    var Oe = de.length;
    if (Oe > 0) {
      var at = l & Gt && _ === 0 ? s : null;
      if (u) {
        for (E = 0; E < Oe; E += 1)
          de[E].a?.measure();
        for (E = 0; E < Oe; E += 1)
          de[E].a?.fix();
      }
      ua(n, de, at);
    }
  }
  u && yt(() => {
    if (A !== void 0)
      for (y of A)
        y.a?.apply();
  }), e.first = n.first && n.first.e, e.last = b && b.e;
  for (var st of r.values())
    ae(st.e);
  r.clear();
}
function Nn(e, t, n, r) {
  r & Qe && qe(e.v, t), r & et ? qe(
    /** @type {Value<number>} */
    e.i,
    n
  ) : e.i = n;
}
function Mn(e, t, n, r, s, a, l, f, i, u, c) {
  var _ = (i & Qe) !== 0, h = (i & or) === 0, p = _ ? h ? /* @__PURE__ */ he(s, !1, !1) : Le(s) : s, o = i & et ? Le(l) : l, w = {
    i: o,
    v: p,
    k: a,
    a: null,
    // @ts-expect-error
    e: null,
    prev: n,
    next: r
  };
  try {
    if (e === null) {
      var b = document.createDocumentFragment();
      b.append(e = $e());
    }
    return w.e = Xe(() => f(
      /** @type {Node} */
      e,
      p,
      o,
      u
    ), Ar), w.e.prev = n && n.e, w.e.next = r && r.e, n === null ? c || (t.first = w) : (n.next = w, n.e.next = w.e), r !== null && (r.prev = w, r.e.prev = w.e), w;
  } finally {
  }
}
function ot(e, t, n) {
  for (var r = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : n, s = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : n, a = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); a !== null && a !== r; ) {
    var l = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ nt(a)
    );
    s.before(a), a = l;
  }
}
function Q(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function ca(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r = r ? r + " " + t : t, r === "" ? null : r;
}
function Ke(e, t, n, r, s, a) {
  var l = e.__className;
  if (l !== n || l === void 0) {
    var f = ca(n, r);
    f == null ? e.removeAttribute("class") : e.className = f, e.__className = n;
  }
  return a;
}
function va(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    N
  ), n = t.l.u;
  if (!n) return;
  let r = () => ea(t.s);
  if (e) {
    let s = 0, a = (
      /** @type {Record<string, any>} */
      {}
    );
    const l = /* @__PURE__ */ Tt(() => {
      let f = !1;
      const i = t.s;
      for (const u in i)
        i[u] !== a[u] && (a[u] = i[u], f = !0);
      return f && s++, s;
    });
    r = () => v(l);
  }
  n.b.length && Yr(() => {
    zt(t, r), vt(n.b);
  }), pt(() => {
    const s = Rn(() => n.m.map(pr));
    return () => {
      for (const a of s)
        typeof a == "function" && a();
    };
  }), n.a.length && pt(() => {
    zt(t, r), vt(n.a);
  });
}
function zt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) v(n);
  t();
}
var da = /* @__PURE__ */ ne('<div class="notice notice-warning svelte-1klxta8"><div>⚠️</div> <div><h3 class="svelte-1klxta8">Server-Neustart erforderlich</h3> <p class="svelte-1klxta8">Plugin-Änderungen werden nach einem Server-Neustart wirksam.</p></div></div>'), _a = /* @__PURE__ */ ne('<div class="notice notice-info svelte-1klxta8"><p class="svelte-1klxta8"> </p></div>'), ha = /* @__PURE__ */ ne('<div class="notice notice-error svelte-1klxta8"><span>❌</span> <p class="svelte-1klxta8"> </p></div>'), pa = /* @__PURE__ */ ne('<p class="route svelte-1klxta8"> </p>'), ma = /* @__PURE__ */ ne('<span class="loading-spinner svelte-1klxta8">...</span>'), ga = /* @__PURE__ */ ne('<div class="route-item svelte-1klxta8"><span class="method svelte-1klxta8"> </span> <span class="path svelte-1klxta8"> </span> <span class="description svelte-1klxta8"> </span></div>'), wa = /* @__PURE__ */ ne('<details class="plugin-routes svelte-1klxta8"><summary class="svelte-1klxta8"> </summary> <div class="routes-list svelte-1klxta8"></div></details>'), ba = /* @__PURE__ */ ne('<div><div class="plugin-header svelte-1klxta8"><div class="plugin-info svelte-1klxta8"><div class="icon svelte-1klxta8"> </div> <div class="svelte-1klxta8"><h3 class="svelte-1klxta8"> </h3> <p class="description svelte-1klxta8"> </p> <!></div></div> <div class="plugin-actions svelte-1klxta8"><span> </span> <button><!></button></div></div> <!></div>'), xa = /* @__PURE__ */ ne('<div class="empty-state svelte-1klxta8"><div class="svelte-1klxta8">🔌</div> <p>Keine Plugins gefunden</p></div>'), ka = /* @__PURE__ */ ne('<div class="dashboard svelte-1klxta8"><!> <!> <!> <div class="grid svelte-1klxta8"><div class="card health-card svelte-1klxta8"><h2 class="svelte-1klxta8"><span>🏥</span> System Health</h2> <div class="health-stats svelte-1klxta8"><div class="stat svelte-1klxta8"><span class="svelte-1klxta8">Status:</span> <span> </span></div> <div class="stat svelte-1klxta8"><span class="svelte-1klxta8">Uptime:</span> <span class="mono svelte-1klxta8"> </span></div> <div class="stat svelte-1klxta8"><span class="svelte-1klxta8">Plugins:</span> <span class="svelte-1klxta8"> </span></div> <div class="timestamp svelte-1klxta8"> </div></div></div> <div class="card plugins-card svelte-1klxta8"><div class="card-header svelte-1klxta8"><h2 class="svelte-1klxta8"><span>🔌</span> Aktive Plugins <span class="subtitle svelte-1klxta8"> </span></h2></div> <div class="plugins-list svelte-1klxta8"><!> <!></div></div></div></div>');
function Ea(e, t) {
  Pr(t, !1);
  let n = /* @__PURE__ */ he([]), r = /* @__PURE__ */ he({
    status: "unknown",
    uptime: 0,
    activeConnections: 0,
    timestamp: ""
  }), s = /* @__PURE__ */ he(null), a = /* @__PURE__ */ he(""), l = /* @__PURE__ */ he(!1), f = /* @__PURE__ */ he(null);
  ia(async () => {
    await i();
  });
  async function i() {
    try {
      const [d, m] = await Promise.all([fetch("/api/plugins"), fetch("/api/plugins/system/health")]);
      if (d.ok) {
        const R = await d.json();
        P(n, R.data || []);
      }
      if (m.ok) {
        const R = await m.json();
        P(r, R.health || v(r));
      }
    } catch (d) {
      P(f, d.message);
    }
  }
  async function u(d) {
    if (!v(s)) {
      P(s, d), P(a, "");
      try {
        const R = await (await fetch(`/api/plugins/${d}/toggle`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        })).json();
        R.success && R.data ? (P(a, R.data.message || "Plugin-Status geändert"), P(l, !0), P(n, v(n).map((Y) => Y.name === d ? { ...Y, enabled: R.data.newState } : Y)), setTimeout(
          () => {
            i();
          },
          1e3
        ), setTimeout(
          () => {
            P(l, !1), P(a, "");
          },
          8e3
        )) : P(a, R.error || "Fehler beim Ändern des Plugin-Status");
      } catch {
        P(a, "Unerwarteter Fehler beim Plugin-Toggle");
      } finally {
        P(s, null);
      }
    }
  }
  function c(d) {
    return d.enabled ? d.status === "loaded" ? "bg-green-50 border-green-200" : d.status === "disabled" ? "bg-gray-50 border-gray-200" : "bg-yellow-50 border-yellow-200" : "bg-gray-100 border-gray-300";
  }
  function _(d) {
    return d.enabled ? d.status === "loaded" ? "✅" : d.status === "disabled" ? "🔴" : d.status === "not_loaded" ? "⚠️" : "❓" : "⭕";
  }
  function h(d) {
    return d.enabled ? d.status === "loaded" ? "geladen" : d.status === "disabled" ? "deaktiviert" : d.status === "not_loaded" ? "nicht geladen" : d.status : "deaktiviert";
  }
  va();
  var p = ka(), o = g(p);
  {
    var w = (d) => {
      var m = da();
      G(d, m);
    };
    _e(o, (d) => {
      v(l) && d(w);
    });
  }
  var b = S(o, 2);
  {
    var A = (d) => {
      var m = _a(), R = g(m), Y = g(R);
      ie(() => O(Y, v(a))), G(d, m);
    };
    _e(b, (d) => {
      v(a) && d(A);
    });
  }
  var T = S(b, 2);
  {
    var M = (d) => {
      var m = ha(), R = S(g(m), 2), Y = g(R);
      ie(() => O(Y, `Fehler: ${v(f) ?? ""}`)), G(d, m);
    };
    _e(T, (d) => {
      v(f) && d(M);
    });
  }
  var U = S(T, 2), C = g(U), y = S(g(C), 2), E = g(y), B = S(g(E), 2), ke = g(B), ye = S(E, 2), Ee = S(g(ye), 2), J = g(Ee), Ne = S(ye, 2), Me = S(g(Ne), 2), de = g(Me), Oe = S(Ne, 2), at = g(Oe), st = S(C, 2), Rt = g(st), On = g(Rt), Fn = S(g(On), 2), In = g(Fn), jn = S(Rt, 2), Dt = g(jn);
  Wt(Dt, 1, () => v(n), Kt, (d, m) => {
    var R = ba(), Y = g(R), Nt = g(Y), Mt = g(Nt), $n = g(Mt), Un = S(Mt, 2), Ot = g(Un), Hn = g(Ot), Ft = S(Ot, 2), Vn = g(Ft), Bn = S(Ft, 2);
    {
      var Yn = (F) => {
        var K = pa(), Te = g(K);
        ie(() => O(Te, v(m).route)), G(F, K);
      };
      _e(Bn, (F) => {
        v(m).route && F(Yn);
      });
    }
    var Kn = S(Nt, 2), lt = g(Kn), Wn = g(lt), Be = S(lt, 2), zn = g(Be);
    {
      var Gn = (F) => {
        var K = ma();
        G(F, K);
      }, Xn = (F) => {
        var K = sa();
        ie(() => O(K, v(m).enabled ? "Deaktivieren" : "Aktivieren")), G(F, K);
      };
      _e(zn, (F) => {
        v(s) === v(m).name ? F(Gn) : F(Xn, !1);
      });
    }
    var Zn = S(Y, 2);
    {
      var Jn = (F) => {
        var K = wa(), Te = g(K), Qn = g(Te), er = S(Te, 2);
        Wt(er, 5, () => v(m).routes, Kt, (tr, it) => {
          var It = ga(), jt = g(It), nr = g(jt), Lt = S(jt, 2), rr = g(Lt), ar = S(Lt, 2), sr = g(ar);
          ie(() => {
            O(nr, v(it).method), O(rr, `${v(m).route ?? ""}${v(it).path ?? ""}`), O(sr, `- ${v(it).description ?? ""}`);
          }), G(tr, It);
        }), ie(() => O(Qn, `Verfügbare Endpunkte (${v(m).routes.length ?? ""})`)), G(F, K);
      };
      _e(Zn, (F) => {
        v(m).enabled && v(m).routes && v(m).routes.length > 0 && F(Jn);
      });
    }
    ie(
      (F, K, Te) => {
        Ke(R, 1, `plugin-item ${F ?? ""}`, "svelte-1klxta8"), O($n, K), O(Hn, v(m).name), O(Vn, v(m).description), Ke(
          lt,
          1,
          `badge badge-${v(m).enabled && v(m).status === "loaded" ? "success" : v(m).enabled ? "warning" : "default"}`,
          "svelte-1klxta8"
        ), O(Wn, Te), Be.disabled = v(s) === v(m).name, Ke(Be, 1, `btn btn-${v(m).enabled ? "danger" : "success"}`, "svelte-1klxta8");
      },
      [
        () => c(v(m)),
        () => _(v(m)),
        () => h(v(m))
      ]
    ), na("click", Be, () => u(v(m).name)), G(d, R);
  });
  var Ln = S(Dt, 2);
  {
    var qn = (d) => {
      var m = xa();
      G(d, m);
    };
    _e(Ln, (d) => {
      v(n).length === 0 && d(qn);
    });
  }
  ie(
    (d, m, R, Y) => {
      Ke(B, 1, `badge badge-${v(r).status ?? ""}`, "svelte-1klxta8"), O(ke, v(r).status), O(J, `${d ?? ""}h ${m ?? ""}m`), O(de, v(r).activeConnections), O(at, `Letzte Aktualisierung: ${R ?? ""}`), O(In, `${Y ?? ""} von ${v(n).length ?? ""} Plugins`);
    },
    [
      () => Math.floor(v(r).uptime / 3600),
      () => Math.floor(v(r).uptime % 3600 / 60),
      () => new Date(v(r).timestamp).toLocaleTimeString("de-DE"),
      () => v(n).filter((d) => d.enabled).length
    ]
  ), G(e, p), Rr();
}
export {
  Ea as default
};
