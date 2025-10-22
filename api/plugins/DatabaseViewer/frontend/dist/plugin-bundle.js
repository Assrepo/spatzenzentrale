const hn = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(hn);
let Ce = !1, pn = !1;
function wn() {
  Ce = !0;
}
wn();
const gn = 1, bn = 2, mn = 16, yn = 2, A = Symbol(), Ft = !1;
var Ke = Array.isArray, En = Array.prototype.indexOf, Mt = Array.from, tt = Object.defineProperty, Je = Object.getOwnPropertyDescriptor, kn = Object.getOwnPropertyDescriptors, xn = Object.prototype, Tn = Array.prototype, Nt = Object.getPrototypeOf;
function An(e) {
  return e();
}
function nt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Pt() {
  var e, t, n = new Promise((r, a) => {
    e = r, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
const C = 2, ft = 4, ut = 8, ve = 16, G = 32, ge = 64, It = 128, j = 256, Ue = 512, D = 1024, N = 2048, te = 4096, L = 8192, be = 16384, ot = 32768, ct = 65536, yt = 1 << 17, Sn = 1 << 18, ze = 1 << 19, jt = 1 << 20, rt = 1 << 21, vt = 1 << 22, fe = 1 << 23, ue = Symbol("$state"), he = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Dn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function On() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Cn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Rn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Fn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Mn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Nn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Pn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function In() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function jn() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
let qn = !1;
function qt(e) {
  return e === this.v;
}
function Ln(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Lt(e) {
  return !Ln(e, this.v);
}
let T = null;
function Ve(e) {
  T = e;
}
function Un(e, t = !1, n) {
  T = {
    p: T,
    c: null,
    e: null,
    s: e,
    x: null,
    l: Ce && !t ? { s: null, u: null, $: [] } : null
  };
}
function Vn(e) {
  var t = (
    /** @type {ComponentContext} */
    T
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Zt(r);
  }
  return T = t.p, /** @type {T} */
  {};
}
function Re() {
  return !Ce || T !== null && T.l === null;
}
let pe = [];
function Bn() {
  var e = pe;
  pe = [], nt(e);
}
function Ut(e) {
  if (pe.length === 0) {
    var t = pe;
    queueMicrotask(() => {
      t === pe && Bn();
    });
  }
  pe.push(e);
}
const Hn = /* @__PURE__ */ new WeakMap();
function Yn(e) {
  var t = g;
  if (t === null)
    return w.f |= fe, e;
  if (t.f & ot)
    Be(e, t);
  else {
    if (!(t.f & It))
      throw !t.parent && e instanceof Error && Vt(e), e;
    t.b.error(e);
  }
}
function Be(e, t) {
  for (; t !== null; ) {
    if (t.f & It)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e instanceof Error && Vt(e), e;
}
function Vt(e) {
  const t = Hn.get(e);
  t && (tt(e, "message", {
    value: t.message
  }), tt(e, "stack", {
    value: t.stack
  }));
}
const Ne = /* @__PURE__ */ new Set();
let k = null, Le = null, q = null, Et = /* @__PURE__ */ new Set(), J = [], _t = null, lt = !1;
class Te {
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
  #l = null;
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
  #a = [];
  /**
   * Block effects, which may need to re-run on subsequent flushes
   * in order to update internal sources (e.g. each block items)
   * @type {Effect[]}
   */
  #i = [];
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
    J = [], Le = null, this.apply();
    for (const l of t)
      this.#o(l);
    if (this.#e === 0) {
      var n = q;
      this.#c();
      var r = this.#r, a = this.#a;
      this.#r = [], this.#a = [], this.#i = [], Le = this, k = null, q = n, kt(r), kt(a), Le = null, this.#l?.resolve();
    } else
      this.#s(this.#r), this.#s(this.#a), this.#s(this.#i);
    q = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   */
  #o(t) {
    t.f ^= D;
    for (var n = t.first; n !== null; ) {
      var r = n.f, a = (r & (G | ge)) !== 0, l = a && (r & D) !== 0, i = l || (r & L) !== 0 || this.skipped_effects.has(n);
      if (!i && n.fn !== null) {
        a ? n.f ^= D : r & ft ? this.#a.push(n) : Xe(n) && (n.f & ve && this.#i.push(n), We(n));
        var f = n.first;
        if (f !== null) {
          n = f;
          continue;
        }
      }
      var s = n.parent;
      for (n = n.next; n === null && s !== null; )
        n = s.next, s = s.parent;
    }
  }
  /**
   * @param {Effect[]} effects
   */
  #s(t) {
    for (const n of t)
      (n.f & N ? this.#f : this.#u).push(n), O(n, D);
    t.length = 0;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    this.#n.has(t) || this.#n.set(t, n), this.current.set(t, t.v), q?.set(t, t.v);
  }
  activate() {
    k = this;
  }
  deactivate() {
    k = null, q = null;
  }
  flush() {
    if (J.length > 0) {
      if (this.activate(), Wn(), k !== null && k !== this)
        return;
    } else this.#e === 0 && this.#c();
    this.deactivate();
    for (const t of Et)
      if (Et.delete(t), t(), k !== null)
        break;
  }
  /**
   * Append and remove branches to/from the DOM
   */
  #c() {
    for (const t of this.#t)
      t();
    if (this.#t.clear(), Ne.size > 1) {
      this.#n.clear();
      let t = !0;
      for (const n of Ne) {
        if (n === this) {
          t = !1;
          continue;
        }
        const r = [];
        for (const [l, i] of this.current) {
          if (n.current.has(l))
            if (t && i !== n.current.get(l))
              n.current.set(l, i);
            else
              continue;
          r.push(l);
        }
        if (r.length === 0)
          continue;
        const a = [...n.current.keys()].filter((l) => !this.current.has(l));
        if (a.length > 0) {
          for (const l of r)
            Bt(l, a);
          if (J.length > 0) {
            k = n, n.apply();
            for (const l of J)
              n.#o(l);
            J = [], n.deactivate();
          }
        }
      }
      k = null;
    }
    Ne.delete(this);
  }
  increment() {
    this.#e += 1;
  }
  decrement() {
    this.#e -= 1;
    for (const t of this.#f)
      O(t, N), ce(t);
    for (const t of this.#u)
      O(t, te), ce(t);
    this.flush();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#l ??= Pt()).promise;
  }
  static ensure() {
    if (k === null) {
      const t = k = new Te();
      Ne.add(k), Te.enqueue(() => {
        k === t && t.flush();
      });
    }
    return k;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Ut(t);
  }
  apply() {
  }
}
function Wn() {
  var e = we;
  lt = !0;
  try {
    var t = 0;
    for (At(!0); J.length > 0; ) {
      var n = Te.ensure();
      if (t++ > 1e3) {
        var r, a;
        Kn();
      }
      n.process(J), $.clear();
    }
  } finally {
    lt = !1, At(e), _t = null;
  }
}
function Kn() {
  try {
    Mn();
  } catch (e) {
    Be(e, _t);
  }
}
let se = null;
function kt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (!(r.f & (be | L)) && Xe(r) && (se = [], We(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null && r.ac === null ? en(r) : r.fn = null), se?.length > 0)) {
        $.clear();
        for (const a of se)
          We(a);
        se = [];
      }
    }
    se = null;
  }
}
function Bt(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      r & C ? Bt(
        /** @type {Derived} */
        n,
        t
      ) : r & (vt | ve) && Ht(n, t) && (O(n, N), ce(
        /** @type {Effect} */
        n
      ));
    }
}
function Ht(e, t) {
  if (e.deps !== null) {
    for (const n of e.deps)
      if (t.includes(n) || n.f & C && Ht(
        /** @type {Derived} */
        n,
        t
      ))
        return !0;
  }
  return !1;
}
function ce(e) {
  for (var t = _t = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (lt && t === g && n & ve)
      return;
    if (n & (ge | G)) {
      if (!(n & D)) return;
      t.f ^= D;
    }
  }
  J.push(t);
}
function zn(e, t, n) {
  const r = Re() ? dt : Yt;
  if (t.length === 0) {
    n(e.map(r));
    return;
  }
  var a = k, l = (
    /** @type {Effect} */
    g
  ), i = Gn();
  Promise.all(t.map((f) => /* @__PURE__ */ Xn(f))).then((f) => {
    i();
    try {
      n([...e.map(r), ...f]);
    } catch (s) {
      l.f & be || Be(s, l);
    }
    a?.deactivate(), at();
  }).catch((f) => {
    Be(f, l);
  });
}
function Gn() {
  var e = g, t = w, n = T, r = k;
  return function() {
    ee(e), B(t), Ve(n), r?.activate();
  };
}
function at() {
  ee(null), B(null), Ve(null);
}
// @__NO_SIDE_EFFECTS__
function dt(e) {
  var t = C | N, n = w !== null && w.f & C ? (
    /** @type {Derived} */
    w
  ) : null;
  return g === null || n !== null && n.f & j ? t |= j : g.f |= ze, {
    ctx: T,
    deps: null,
    effects: null,
    equals: qt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      A
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Xn(e, t) {
  let n = (
    /** @type {Effect | null} */
    g
  );
  n === null && On();
  var r = (
    /** @type {Boundary} */
    n.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Ae(
    /** @type {V} */
    A
  ), i = !w, f = /* @__PURE__ */ new Map();
  return fr(() => {
    var s = Pt();
    a = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).then(at);
    } catch (o) {
      s.reject(o), at();
    }
    var u = (
      /** @type {Batch} */
      k
    ), c = r.is_pending();
    i && (r.update_pending_count(1), c || (u.increment(), f.get(u)?.reject(he), f.delete(u), f.set(u, s)));
    const h = (o, d = void 0) => {
      if (c || u.activate(), d)
        d !== he && (l.f |= fe, Se(l, d));
      else {
        l.f & fe && (l.f ^= fe), Se(l, o);
        for (const [v, _] of f) {
          if (f.delete(v), v === u) break;
          _.reject(he);
        }
      }
      i && (r.update_pending_count(-1), c || u.decrement());
    };
    s.promise.then(h, (o) => h(null, o || "unknown"));
  }), wt(() => {
    for (const s of f.values())
      s.reject(he);
  }), new Promise((s) => {
    function u(c) {
      function h() {
        c === a ? s(l) : u(a);
      }
      c.then(h, h);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function Yt(e) {
  const t = /* @__PURE__ */ dt(e);
  return t.equals = Lt, t;
}
function Wt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      z(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Zn(e) {
  for (var t = e.parent; t !== null; ) {
    if (!(t.f & C))
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function ht(e) {
  var t, n = g;
  ee(Zn(e));
  try {
    Wt(e), t = fn(e);
  } finally {
    ee(n);
  }
  return t;
}
function Kt(e) {
  var t = ht(e);
  if (e.equals(t) || (e.v = t, e.wv = an()), !me)
    if (q !== null)
      q.set(e, e.v);
    else {
      var n = (Q || e.f & j) && e.deps !== null ? te : D;
      O(e, n);
    }
}
const $ = /* @__PURE__ */ new Map();
function Ae(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: qt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Z(e, t) {
  const n = Ae(e);
  return dr(n), n;
}
// @__NO_SIDE_EFFECTS__
function Ee(e, t = !1, n = !0) {
  const r = Ae(e);
  return t || (r.equals = Lt), Ce && n && T !== null && T.l !== null && (T.l.s ??= []).push(r), r;
}
function M(e, t, n = !1) {
  w !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!V || w.f & yt) && Re() && w.f & (C | ve | vt | yt) && !K?.includes(e) && In();
  let r = n ? ke(t) : t;
  return Se(e, r);
}
function Se(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    me ? $.set(e, t) : $.set(e, n), e.v = t;
    var r = Te.ensure();
    r.capture(e, n), e.f & C && (e.f & N && ht(
      /** @type {Derived} */
      e
    ), O(e, e.f & j ? te : D)), e.wv = an(), zt(e, N), Re() && g !== null && g.f & D && !(g.f & (G | ge)) && (I === null ? hr([e]) : I.push(e));
  }
  return t;
}
function Qe(e) {
  M(e, e.v + 1);
}
function zt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Re(), a = n.length, l = 0; l < a; l++) {
      var i = n[l], f = i.f;
      if (!(!r && i === g)) {
        var s = (f & N) === 0;
        s && O(i, t), f & C ? zt(
          /** @type {Derived} */
          i,
          te
        ) : s && (f & ve && se !== null && se.push(
          /** @type {Effect} */
          i
        ), ce(
          /** @type {Effect} */
          i
        ));
      }
    }
}
function ke(e) {
  if (typeof e != "object" || e === null || ue in e)
    return e;
  const t = Nt(e);
  if (t !== xn && t !== Tn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ke(e), a = /* @__PURE__ */ Z(0), l = oe, i = (f) => {
    if (oe === l)
      return f();
    var s = w, u = oe;
    B(null), Dt(l);
    var c = f();
    return B(s), Dt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ Z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Nn();
        var c = n.get(s);
        return c === void 0 ? c = i(() => {
          var h = /* @__PURE__ */ Z(u.value);
          return n.set(s, h), h;
        }) : M(c, u.value, !0), !0;
      },
      deleteProperty(f, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in f) {
            const c = i(() => /* @__PURE__ */ Z(A));
            n.set(s, c), Qe(a);
          }
        } else
          M(u, A), Qe(a);
        return !0;
      },
      get(f, s, u) {
        if (s === ue)
          return e;
        var c = n.get(s), h = s in f;
        if (c === void 0 && (!h || Je(f, s)?.writable) && (c = i(() => {
          var d = ke(h ? f[s] : A), v = /* @__PURE__ */ Z(d);
          return v;
        }), n.set(s, c)), c !== void 0) {
          var o = y(c);
          return o === A ? void 0 : o;
        }
        return Reflect.get(f, s, u);
      },
      getOwnPropertyDescriptor(f, s) {
        var u = Reflect.getOwnPropertyDescriptor(f, s);
        if (u && "value" in u) {
          var c = n.get(s);
          c && (u.value = y(c));
        } else if (u === void 0) {
          var h = n.get(s), o = h?.v;
          if (h !== void 0 && o !== A)
            return {
              enumerable: !0,
              configurable: !0,
              value: o,
              writable: !0
            };
        }
        return u;
      },
      has(f, s) {
        if (s === ue)
          return !0;
        var u = n.get(s), c = u !== void 0 && u.v !== A || Reflect.has(f, s);
        if (u !== void 0 || g !== null && (!c || Je(f, s)?.writable)) {
          u === void 0 && (u = i(() => {
            var o = c ? ke(f[s]) : A, d = /* @__PURE__ */ Z(o);
            return d;
          }), n.set(s, u));
          var h = y(u);
          if (h === A)
            return !1;
        }
        return c;
      },
      set(f, s, u, c) {
        var h = n.get(s), o = s in f;
        if (r && s === "length")
          for (var d = u; d < /** @type {Source<number>} */
          h.v; d += 1) {
            var v = n.get(d + "");
            v !== void 0 ? M(v, A) : d in f && (v = i(() => /* @__PURE__ */ Z(A)), n.set(d + "", v));
          }
        if (h === void 0)
          (!o || Je(f, s)?.writable) && (h = i(() => /* @__PURE__ */ Z(void 0)), M(h, ke(u)), n.set(s, h));
        else {
          o = h.v !== A;
          var _ = i(() => ke(u));
          M(h, _);
        }
        var p = Reflect.getOwnPropertyDescriptor(f, s);
        if (p?.set && p.set.call(c, u), !o) {
          if (r && typeof s == "string") {
            var x = (
              /** @type {Source<number>} */
              n.get("length")
            ), b = Number(s);
            Number.isInteger(b) && b >= x.v && M(x, b + 1);
          }
          Qe(a);
        }
        return !0;
      },
      ownKeys(f) {
        y(a);
        var s = Reflect.ownKeys(f).filter((h) => {
          var o = n.get(h);
          return o === void 0 || o.v !== A;
        });
        for (var [u, c] of n)
          c.v !== A && !(u in f) && s.push(u);
        return s;
      },
      setPrototypeOf() {
        Pn();
      }
    }
  );
}
function xt(e) {
  try {
    if (e !== null && typeof e == "object" && ue in e)
      return e[ue];
  } catch {
  }
  return e;
}
function Jn(e, t) {
  return Object.is(xt(e), xt(t));
}
var Qn, $n, er;
function De(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function pt(e) {
  return $n.call(e);
}
// @__NO_SIDE_EFFECTS__
function Fe(e) {
  return er.call(e);
}
function Y(e, t) {
  return /* @__PURE__ */ pt(e);
}
function tr(e, t = !1) {
  {
    var n = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ pt(
        /** @type {Node} */
        e
      )
    );
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Fe(n) : n;
  }
}
function Pe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Fe(r);
  return r;
}
function nr(e) {
  e.textContent = "";
}
function Gt() {
  return !1;
}
let Tt = !1;
function rr() {
  Tt || (Tt = !0, document.addEventListener(
    "reset",
    (e) => {
      Promise.resolve().then(() => {
        if (!e.defaultPrevented)
          for (
            const t of
            /**@type {HTMLFormElement} */
            e.target.elements
          )
            t.__on_r?.();
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
    { capture: !0 }
  ));
}
function Ge(e) {
  var t = w, n = g;
  B(null), ee(null);
  try {
    return e();
  } finally {
    B(t), ee(n);
  }
}
function lr(e, t, n, r = n) {
  e.addEventListener(t, () => Ge(n));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), r(!0);
  } : e.__on_r = () => r(!0), rr();
}
function Xt(e) {
  g === null && w === null && Fn(), w !== null && w.f & j && g === null && Rn(), me && Cn();
}
function ar(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ne(e, t, n, r = !0) {
  var a = g;
  a !== null && a.f & L && (e |= L);
  var l = {
    ctx: T,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | N,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: a,
    b: a && a.b,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0,
    ac: null
  };
  if (n)
    try {
      We(l), l.f |= ot;
    } catch (s) {
      throw z(l), s;
    }
  else t !== null && ce(l);
  if (r) {
    var i = l;
    if (n && i.deps === null && i.teardown === null && i.nodes_start === null && i.first === i.last && // either `null`, or a singular child
    !(i.f & ze) && (i = i.first), i !== null && (i.parent = a, a !== null && ar(i, a), w !== null && w.f & C && !(e & ge))) {
      var f = (
        /** @type {Derived} */
        w
      );
      (f.effects ??= []).push(i);
    }
  }
  return l;
}
function wt(e) {
  const t = ne(ut, null, !1);
  return O(t, D), t.teardown = e, t;
}
function it(e) {
  Xt();
  var t = (
    /** @type {Effect} */
    g.f
  ), n = !w && (t & G) !== 0 && (t & ot) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      T
    );
    (r.e ??= []).push(e);
  } else
    return Zt(e);
}
function Zt(e) {
  return ne(ft | jt, e, !1);
}
function ir(e) {
  return Xt(), ne(ut | jt, e, !0);
}
function sr(e) {
  return ne(ft, e, !1);
}
function fr(e) {
  return ne(vt | ze, e, !0);
}
function Ie(e, t = [], n = []) {
  zn(t, n, (r) => {
    ne(ut, () => e(...r.map(y)), !0);
  });
}
function Jt(e, t = 0) {
  var n = ne(ve | t, e, !0);
  return n;
}
function He(e, t = !0) {
  return ne(G | ze, e, !0, t);
}
function Qt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = me, r = w;
    St(!0), B(null);
    try {
      t.call(null);
    } finally {
      St(n), B(r);
    }
  }
}
function $t(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && Ge(() => {
      a.abort(he);
    });
    var r = n.next;
    n.f & ge ? n.parent = null : z(n, t), n = r;
  }
}
function ur(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    t.f & G || z(t), t = n;
  }
}
function z(e, t = !0) {
  var n = !1;
  (t || e.f & Sn) && e.nodes_start !== null && e.nodes_end !== null && (or(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), n = !0), $t(e, t && !n), Ye(e, 0), O(e, be);
  var r = e.transitions;
  if (r !== null)
    for (const l of r)
      l.stop();
  Qt(e);
  var a = e.parent;
  a !== null && a.first !== null && en(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function or(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(e)
    );
    e.remove(), e = n;
  }
}
function en(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function tn(e, t, n = !0) {
  var r = [];
  gt(e, r, !0), nn(r, () => {
    n && z(e), t && t();
  });
}
function nn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var a of e)
      a.out(r);
  } else
    t();
}
function gt(e, t, n) {
  if (!(e.f & L)) {
    if (e.f ^= L, e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || n) && t.push(i);
    for (var r = e.first; r !== null; ) {
      var a = r.next, l = (r.f & ct) !== 0 || (r.f & G) !== 0;
      gt(r, t, l ? n : !1), r = a;
    }
  }
}
function bt(e) {
  rn(e, !0);
}
function rn(e, t) {
  if (e.f & L) {
    e.f ^= L, e.f & D || (O(e, N), ce(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, a = (n.f & ct) !== 0 || (n.f & G) !== 0;
      rn(n, a ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const l of e.transitions)
        (l.is_global || t) && l.in();
  }
}
function cr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var a = n === r ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(n)
    );
    t.append(n), n = a;
  }
}
let de = null;
function vr(e) {
  var t = de;
  try {
    if (de = /* @__PURE__ */ new Set(), mt(e), t !== null)
      for (var n of de)
        t.add(n);
    return de;
  } finally {
    de = t;
  }
}
function _r(e) {
  for (var t of vr(e))
    Se(t, t.v);
}
let we = !1;
function At(e) {
  we = e;
}
let me = !1;
function St(e) {
  me = e;
}
let w = null, V = !1;
function B(e) {
  w = e;
}
let g = null;
function ee(e) {
  g = e;
}
let K = null;
function dr(e) {
  w !== null && (K === null ? K = [e] : K.push(e));
}
let S = null, F = 0, I = null;
function hr(e) {
  I = e;
}
let ln = 1, Oe = 0, oe = Oe;
function Dt(e) {
  oe = e;
}
let Q = !1;
function an() {
  return ++ln;
}
function Xe(e) {
  var t = e.f;
  if (t & N)
    return !0;
  if (t & te) {
    var n = e.deps, r = (t & j) !== 0;
    if (n !== null) {
      var a, l, i = (t & Ue) !== 0, f = r && g !== null && !Q, s = n.length;
      if ((i || f) && (g === null || !(g.f & be))) {
        var u = (
          /** @type {Derived} */
          e
        ), c = u.parent;
        for (a = 0; a < s; a++)
          l = n[a], (i || !l?.reactions?.includes(u)) && (l.reactions ??= []).push(u);
        i && (u.f ^= Ue), f && c !== null && !(c.f & j) && (u.f ^= j);
      }
      for (a = 0; a < s; a++)
        if (l = n[a], Xe(
          /** @type {Derived} */
          l
        ) && Kt(
          /** @type {Derived} */
          l
        ), l.wv > e.wv)
          return !0;
    }
    (!r || g !== null && !Q) && O(e, D);
  }
  return !1;
}
function sn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !K?.includes(e))
    for (var a = 0; a < r.length; a++) {
      var l = r[a];
      l.f & C ? sn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? O(l, N) : l.f & D && O(l, te), ce(
        /** @type {Effect} */
        l
      ));
    }
}
function fn(e) {
  var t = S, n = F, r = I, a = w, l = Q, i = K, f = T, s = V, u = oe, c = e.f;
  S = /** @type {null | Value[]} */
  null, F = 0, I = null, Q = (c & j) !== 0 && (V || !we || w === null), w = c & (G | ge) ? null : e, K = null, Ve(e.ctx), V = !1, oe = ++Oe, e.ac !== null && (Ge(() => {
    e.ac.abort(he);
  }), e.ac = null);
  try {
    e.f |= rt;
    var h = (
      /** @type {Function} */
      e.fn
    ), o = h(), d = e.deps;
    if (S !== null) {
      var v;
      if (Ye(e, F), d !== null && F > 0)
        for (d.length = F + S.length, v = 0; v < S.length; v++)
          d[F + v] = S[v];
      else
        e.deps = d = S;
      if (!Q || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      c & C && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (v = F; v < d.length; v++)
          (d[v].reactions ??= []).push(e);
    } else d !== null && F < d.length && (Ye(e, F), d.length = F);
    if (Re() && I !== null && !V && d !== null && !(e.f & (C | te | N)))
      for (v = 0; v < /** @type {Source[]} */
      I.length; v++)
        sn(
          I[v],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Oe++, I !== null && (r === null ? r = I : r.push(.../** @type {Source[]} */
    I))), e.f & fe && (e.f ^= fe), o;
  } catch (_) {
    return Yn(_);
  } finally {
    e.f ^= rt, S = t, F = n, I = r, w = a, Q = l, K = i, Ve(f), V = s, oe = u;
  }
}
function pr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = En.call(n, e);
    if (r !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[r] = n[a], n.pop());
    }
  }
  n === null && t.f & C && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (S === null || !S.includes(t)) && (O(t, te), t.f & (j | Ue) || (t.f ^= Ue), Wt(
    /** @type {Derived} **/
    t
  ), Ye(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Ye(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      pr(e, n[r]);
}
function We(e) {
  var t = e.f;
  if (!(t & be)) {
    O(e, D);
    var n = g, r = we;
    g = e, we = !0;
    try {
      t & ve ? ur(e) : $t(e), Qt(e);
      var a = fn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = ln;
      var l;
      Ft && pn && e.f & N && e.deps;
    } finally {
      we = r, g = n;
    }
  }
}
function y(e) {
  var t = e.f, n = (t & C) !== 0;
  if (de?.add(e), w !== null && !V) {
    var r = g !== null && (g.f & be) !== 0;
    if (!r && !K?.includes(e)) {
      var a = w.deps;
      if (w.f & rt)
        e.rv < Oe && (e.rv = Oe, S === null && a !== null && a[F] === e ? F++ : S === null ? S = [e] : (!Q || !S.includes(e)) && S.push(e));
      else {
        (w.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [w] : l.includes(w) || l.push(w);
      }
    }
  } else if (n && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var i = (
      /** @type {Derived} */
      e
    ), f = i.parent;
    f !== null && !(f.f & j) && (i.f ^= j);
  }
  if (me) {
    if ($.has(e))
      return $.get(e);
    if (n) {
      i = /** @type {Derived} */
      e;
      var s = i.v;
      return (!(i.f & D) && i.reactions !== null || un(i)) && (s = ht(i)), $.set(i, s), s;
    }
  } else if (n) {
    if (i = /** @type {Derived} */
    e, q?.has(i))
      return q.get(i);
    Xe(i) && Kt(i);
  }
  if (q?.has(e))
    return q.get(e);
  if (e.f & fe)
    throw e.v;
  return e.v;
}
function un(e) {
  if (e.v === A) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if ($.has(t) || t.f & C && un(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function mt(e) {
  var t = V;
  try {
    return V = !0, e();
  } finally {
    V = t;
  }
}
const wr = -7169;
function O(e, t) {
  e.f = e.f & wr | t;
}
function gr(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (ue in e)
      st(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && ue in n && st(n);
      }
  }
}
function st(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        st(e[r], t);
      } catch {
      }
    const n = Nt(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = kn(n);
      for (let a in r) {
        const l = r[a].get;
        if (l)
          try {
            l.call(e);
          } catch {
          }
      }
    }
  }
}
function br(e, t, n, r = {}) {
  function a(l) {
    if (r.capture || yr.call(t, l), !l.cancelBubble)
      return Ge(() => n?.call(this, l));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ut(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function mr(e, t, n, r, a) {
  var l = { capture: r, passive: a }, i = br(e, t, n, l);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && wt(() => {
    t.removeEventListener(e, i, l);
  });
}
let Ot = null;
function yr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Ot = e;
  var i = 0, f = Ot === e && e.__root;
  if (f) {
    var s = a.indexOf(f);
    if (s !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1)
      return;
    s <= u && (i = s);
  }
  if (l = /** @type {Element} */
  a[i] || e.target, l !== t) {
    tt(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = w, h = g;
    B(null), ee(null);
    try {
      for (var o, d = []; l !== null; ) {
        var v = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var _ = l["__" + r];
          if (_ != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l))
            if (Ke(_)) {
              var [p, ...x] = _;
              p.apply(l, [e, ...x]);
            } else
              _.call(l, e);
        } catch (b) {
          o ? d.push(b) : o = b;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        l = v;
      }
      if (o) {
        for (let b of d)
          queueMicrotask(() => {
            throw b;
          });
        throw o;
      }
    } finally {
      e.__root = t, delete e.currentTarget, B(c), ee(h);
    }
  }
}
function Er(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function on(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function re(e, t) {
  var n = (t & yn) !== 0, r, a = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Er(a ? e : "<!>" + e), r = /** @type {Node} */
    /* @__PURE__ */ pt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Qn ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return on(l, l), l;
  };
}
function kr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = De();
  return e.append(t, n), on(t, n), e;
}
function W(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function $e(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = n + "");
}
class xr {
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
  #l = !0;
  /**
   * @param {TemplateNode} anchor
   * @param {boolean} transition
   */
  constructor(t, n = !0) {
    this.anchor = t, this.#l = n;
  }
  #r = () => {
    var t = (
      /** @type {Batch} */
      k
    );
    if (this.#n.has(t)) {
      var n = (
        /** @type {Key} */
        this.#n.get(t)
      ), r = this.#t.get(n);
      if (r)
        bt(r);
      else {
        var a = this.#e.get(n);
        a && (this.#t.set(n, a.effect), this.#e.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), r = a.effect);
      }
      for (const [l, i] of this.#n) {
        if (this.#n.delete(l), l === t)
          break;
        const f = this.#e.get(i);
        f && (z(f.effect), this.#e.delete(i));
      }
      for (const [l, i] of this.#t) {
        if (l === n) continue;
        const f = () => {
          if (Array.from(this.#n.values()).includes(l)) {
            var u = document.createDocumentFragment();
            cr(i, u), u.append(De()), this.#e.set(l, { effect: i, fragment: u });
          } else
            z(i);
          this.#t.delete(l);
        };
        this.#l || !r ? tn(i, f, !1) : f();
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
      k
    ), a = Gt();
    if (n && !this.#t.has(t) && !this.#e.has(t))
      if (a) {
        var l = document.createDocumentFragment(), i = De();
        l.append(i), this.#e.set(t, {
          effect: He(() => n(i)),
          fragment: l
        });
      } else
        this.#t.set(
          t,
          He(() => n(this.anchor))
        );
    if (this.#n.set(r, t), a) {
      for (const [f, s] of this.#t)
        f === t ? r.skipped_effects.delete(s) : r.skipped_effects.add(s);
      for (const [f, s] of this.#e)
        f === t ? r.skipped_effects.delete(s.effect) : r.skipped_effects.add(s.effect);
      r.add_callback(this.#r);
    } else
      this.#r();
  }
}
function Tr(e) {
  T === null && Dn(), Ce && T.l !== null ? Ar(T).m.push(e) : it(() => {
    const t = mt(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Ar(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ??= { a: [], b: [], m: [] };
}
function Ct(e, t, n = !1) {
  var r = new xr(e), a = n ? ct : 0;
  function l(i, f) {
    r.ensure(i, f);
  }
  Jt(() => {
    var i = !1;
    t((f, s = !0) => {
      i = !0, l(s, f);
    }), i || l(!1, null);
  }, a);
}
function je(e, t) {
  return t;
}
function Sr(e, t, n) {
  for (var r = e.items, a = [], l = t.length, i = 0; i < l; i++)
    gt(t[i].e, a, !0);
  var f = l > 0 && a.length === 0 && n !== null;
  if (f) {
    var s = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    nr(s), s.append(
      /** @type {Element} */
      n
    ), r.clear(), U(e, t[0].prev, t[l - 1].next);
  }
  nn(a, () => {
    for (var u = 0; u < l; u++) {
      var c = t[u];
      f || (r.delete(c.k), U(e, c.prev, c.next)), z(c.e, !f);
    }
  });
}
function qe(e, t, n, r, a, l = null) {
  var i = e, f = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var s = (
      /** @type {Element} */
      e
    );
    i = s.appendChild(De());
  }
  var u = null, c = !1, h = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ Yt(() => {
    var p = n();
    return Ke(p) ? p : p == null ? [] : Mt(p);
  }), d, v;
  function _() {
    Dr(
      v,
      d,
      f,
      h,
      i,
      a,
      t,
      r,
      n
    ), l !== null && (d.length === 0 ? u ? bt(u) : u = He(() => l(i)) : u !== null && tn(u, () => {
      u = null;
    }));
  }
  Jt(() => {
    v ??= /** @type {Effect} */
    g, d = /** @type {V[]} */
    y(o);
    var p = d.length;
    if (!(c && p === 0)) {
      c = p === 0;
      var x, b, m, E;
      if (Gt()) {
        var R = /* @__PURE__ */ new Set(), le = (
          /** @type {Batch} */
          k
        );
        for (b = 0; b < p; b += 1) {
          m = d[b], E = r(m, b);
          var ae = f.items.get(E) ?? h.get(E);
          ae ? cn(ae, m, b) : (x = vn(
            null,
            f,
            null,
            null,
            m,
            E,
            b,
            a,
            t,
            n,
            !0
          ), h.set(E, x)), R.add(E);
        }
        for (const [X, P] of f.items)
          R.has(X) || le.skipped_effects.add(P.e);
        le.add_callback(_);
      } else
        _();
      y(o);
    }
  });
}
function Dr(e, t, n, r, a, l, i, f, s) {
  var u = t.length, c = n.items, h = n.first, o = h, d, v = null, _ = [], p = [], x, b, m, E;
  for (E = 0; E < u; E += 1) {
    if (x = t[E], b = f(x, E), m = c.get(b), m === void 0) {
      var R = r.get(b);
      if (R !== void 0) {
        r.delete(b), c.set(b, R);
        var le = v ? v.next : o;
        U(n, v, R), U(n, R, le), et(R, le, a), v = R;
      } else {
        var ae = o ? (
          /** @type {TemplateNode} */
          o.e.nodes_start
        ) : a;
        v = vn(
          ae,
          n,
          v,
          v === null ? n.first : v.next,
          x,
          b,
          E,
          l,
          i,
          s
        );
      }
      c.set(b, v), _ = [], p = [], o = v.next;
      continue;
    }
    if (cn(m, x, E), m.e.f & L && bt(m.e), m !== o) {
      if (d !== void 0 && d.has(m)) {
        if (_.length < p.length) {
          var X = p[0], P;
          v = X.prev;
          var _e = _[0], ie = _[_.length - 1];
          for (P = 0; P < _.length; P += 1)
            et(_[P], X, a);
          for (P = 0; P < p.length; P += 1)
            d.delete(p[P]);
          U(n, _e.prev, ie.next), U(n, v, _e), U(n, ie, X), o = X, v = ie, E -= 1, _ = [], p = [];
        } else
          d.delete(m), et(m, o, a), U(n, m.prev, m.next), U(n, m, v === null ? n.first : v.next), U(n, v, m), v = m;
        continue;
      }
      for (_ = [], p = []; o !== null && o.k !== b; )
        o.e.f & L || (d ??= /* @__PURE__ */ new Set()).add(o), p.push(o), o = o.next;
      if (o === null)
        continue;
      m = o;
    }
    _.push(m), v = m, o = m.next;
  }
  if (o !== null || d !== void 0) {
    for (var H = d === void 0 ? [] : Mt(d); o !== null; )
      o.e.f & L || H.push(o), o = o.next;
    var ye = H.length;
    if (ye > 0) {
      var Ze = u === 0 ? a : null;
      Sr(n, H, Ze);
    }
  }
  e.first = n.first && n.first.e, e.last = v && v.e;
  for (var Me of r.values())
    z(Me.e);
  r.clear();
}
function cn(e, t, n, r) {
  Se(e.v, t), e.i = n;
}
function vn(e, t, n, r, a, l, i, f, s, u, c) {
  var h = (s & gn) !== 0, o = (s & mn) === 0, d = h ? o ? /* @__PURE__ */ Ee(a, !1, !1) : Ae(a) : a, v = s & bn ? Ae(i) : i, _ = {
    i: v,
    v: d,
    k: l,
    a: null,
    // @ts-expect-error
    e: null,
    prev: n,
    next: r
  };
  try {
    if (e === null) {
      var p = document.createDocumentFragment();
      p.append(e = De());
    }
    return _.e = He(() => f(
      /** @type {Node} */
      e,
      d,
      v,
      u
    ), qn), _.e.prev = n && n.e, _.e.next = r && r.e, n === null ? c || (t.first = _) : (n.next = _, n.e.next = _.e), r !== null && (r.prev = _, r.e.prev = _.e), _;
  } finally {
  }
}
function et(e, t, n) {
  for (var r = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : n, a = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : n, l = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); l !== null && l !== r; ) {
    var i = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Fe(l)
    );
    a.before(l), l = i;
  }
}
function U(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function _n(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Ke(t))
      return jn();
    for (var r of e.options)
      r.selected = t.includes(xe(r));
    return;
  }
  for (r of e.options) {
    var a = xe(r);
    if (Jn(a, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function Or(e) {
  var t = new MutationObserver(() => {
    _n(e, e.__value);
  });
  t.observe(e, {
    // Listen to option element changes
    childList: !0,
    subtree: !0,
    // because of <optgroup>
    // Listen to option element value attribute changes
    // (doesn't get notified of select value changes,
    // because that property is not reflected as an attribute)
    attributes: !0,
    attributeFilter: ["value"]
  }), wt(() => {
    t.disconnect();
  });
}
function Cr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), a = !0;
  lr(e, "change", (l) => {
    var i = l ? "[selected]" : ":checked", f;
    if (e.multiple)
      f = [].map.call(e.querySelectorAll(i), xe);
    else {
      var s = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      f = s && xe(s);
    }
    n(f), k !== null && r.add(k);
  }), sr(() => {
    var l = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Le ?? k
      );
      if (r.has(i))
        return;
    }
    if (_n(e, l, a), a && l === void 0) {
      var f = e.querySelector(":checked");
      f !== null && (l = xe(f), n(l));
    }
    e.__value = l, a = !1;
  }), Or(e);
}
function xe(e) {
  return "__value" in e ? e.__value : e.value;
}
function Rr(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    T
  ), n = t.l.u;
  if (!n) return;
  let r = () => gr(t.s);
  if (e) {
    let a = 0, l = (
      /** @type {Record<string, any>} */
      {}
    );
    const i = /* @__PURE__ */ dt(() => {
      let f = !1;
      const s = t.s;
      for (const u in s)
        s[u] !== l[u] && (l[u] = s[u], f = !0);
      return f && a++, a;
    });
    r = () => y(i);
  }
  n.b.length && ir(() => {
    Rt(t, r), nt(n.b);
  }), it(() => {
    const a = mt(() => n.m.map(An));
    return () => {
      for (const l of a)
        typeof l == "function" && l();
    };
  }), n.a.length && it(() => {
    Rt(t, r), nt(n.a);
  });
}
function Rt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) y(n);
  t();
}
var Fr = /* @__PURE__ */ re("<option> </option>"), Mr = /* @__PURE__ */ re('<div class="loading svelte-1klxta8">Lade Daten...</div>'), Nr = /* @__PURE__ */ re('<div class="empty svelte-1klxta8">Keine Daten in dieser Tabelle</div>'), Pr = /* @__PURE__ */ re('<th class="svelte-1klxta8"> </th>'), Ir = /* @__PURE__ */ re('<td class="svelte-1klxta8"> </td>'), jr = /* @__PURE__ */ re('<tr class="svelte-1klxta8"></tr>'), qr = /* @__PURE__ */ re('<div class="table-container svelte-1klxta8"><table class="svelte-1klxta8"><thead><tr class="svelte-1klxta8"></tr></thead><tbody></tbody></table></div>'), Lr = /* @__PURE__ */ re('<div class="db-viewer svelte-1klxta8"><header class="svelte-1klxta8"><h1 class="svelte-1klxta8">🗄️ Database Admin</h1> <p class="svelte-1klxta8">Datenbank-Verwaltung und -ansicht</p></header> <div class="controls svelte-1klxta8"><label class="svelte-1klxta8">Tabelle wählen: <select class="svelte-1klxta8"></select></label></div> <!></div>');
function Vr(e, t) {
  Un(t, !1);
  let n = /* @__PURE__ */ Ee([]), r = /* @__PURE__ */ Ee(""), a = /* @__PURE__ */ Ee([]), l = /* @__PURE__ */ Ee(!1);
  Tr(async () => {
    await i();
  });
  async function i() {
    try {
      const p = await (await fetch("/api/db-admin/tables")).json();
      M(n, p.data || []), y(n).length > 0 && (M(r, y(n)[0]), await f());
    } catch (_) {
      console.error("Failed to load tables", _);
    }
  }
  async function f() {
    if (y(r)) {
      M(l, !0);
      try {
        const p = await (await fetch(`/api/db-admin/table/${y(r)}`)).json();
        M(a, p.data || []);
      } catch (_) {
        console.error("Failed to load table data", _);
      } finally {
        M(l, !1);
      }
    }
  }
  Rr();
  var s = Lr(), u = Pe(Y(s), 2), c = Y(u), h = Pe(Y(c));
  Ie(() => {
    y(r), _r(() => {
      y(n);
    });
  }), qe(h, 5, () => y(n), je, (_, p) => {
    var x = Fr(), b = Y(x), m = {};
    Ie(() => {
      $e(b, y(p)), m !== (m = y(p)) && (x.value = (x.__value = y(p)) ?? "");
    }), W(_, x);
  });
  var o = Pe(u, 2);
  {
    var d = (_) => {
      var p = Mr();
      W(_, p);
    }, v = (_) => {
      var p = kr(), x = tr(p);
      {
        var b = (E) => {
          var R = Nr();
          W(E, R);
        }, m = (E) => {
          var R = qr(), le = Y(R), ae = Y(le), X = Y(ae);
          qe(X, 5, () => Object.keys(y(a)[0] || {}), je, (_e, ie) => {
            var H = Pr(), ye = Y(H);
            Ie(() => $e(ye, y(ie))), W(_e, H);
          });
          var P = Pe(ae);
          qe(P, 5, () => y(a), je, (_e, ie) => {
            var H = jr();
            qe(H, 5, () => Object.values(y(ie)), je, (ye, Ze) => {
              var Me = Ir(), dn = Y(Me);
              Ie(() => $e(dn, y(Ze))), W(ye, Me);
            }), W(_e, H);
          }), W(E, R);
        };
        Ct(
          x,
          (E) => {
            y(a).length === 0 ? E(b) : E(m, !1);
          },
          !0
        );
      }
      W(_, p);
    };
    Ct(o, (_) => {
      y(l) ? _(d) : _(v, !1);
    });
  }
  Cr(h, () => y(r), (_) => M(r, _)), mr("change", h, f), W(e, s), Vn();
}
export {
  Vr as default
};
