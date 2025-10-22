const jn = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(jn);
let je = !1, Bn = !1;
function qn() {
  je = !0;
}
qn();
const Ln = 1, Vn = 2, Un = 16, Hn = 2, P = Symbol(), Yt = !1;
var Ge = Array.isArray, Wn = Array.prototype.indexOf, Kt = Array.from, vt = Object.defineProperty, st = Object.getOwnPropertyDescriptor, Yn = Object.getOwnPropertyDescriptors, Kn = Object.prototype, $n = Array.prototype, $t = Object.getPrototypeOf;
function Jn(e) {
  return e();
}
function _t(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Jt() {
  var e, t, n = new Promise((r, a) => {
    e = r, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
const R = 2, wt = 4, Xe = 8, he = 16, G = 32, xe = 64, Qt = 128, V = 256, We = 512, D = 1024, j = 2048, se = 4096, H = 8192, Se = 16384, yt = 32768, mt = 65536, Ct = 1 << 17, Qn = 1 << 18, Ze = 1 << 19, zt = 1 << 20, dt = 1 << 21, kt = 1 << 22, ce = 1 << 23, ve = Symbol("$state"), ke = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function zn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Gn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Xn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Zn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function er(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function tr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function nr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function rr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function lr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function ar() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
let sr = !1;
function Gt(e) {
  return e === this.v;
}
function ir(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Xt(e) {
  return !ir(e, this.v);
}
let T = null;
function Ye(e) {
  T = e;
}
function fr(e, t = !1, n) {
  T = {
    p: T,
    c: null,
    e: null,
    s: e,
    x: null,
    l: je && !t ? { s: null, u: null, $: [] } : null
  };
}
function ur(e) {
  var t = (
    /** @type {ComponentContext} */
    T
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      _n(r);
  }
  return T = t.p, /** @type {T} */
  {};
}
function Be() {
  return !je || T !== null && T.l === null;
}
let oe = [];
function Zt() {
  var e = oe;
  oe = [], _t(e);
}
function en(e) {
  if (oe.length === 0 && !Ce) {
    var t = oe;
    queueMicrotask(() => {
      t === oe && Zt();
    });
  }
  oe.push(e);
}
function or() {
  for (; oe.length > 0; )
    Zt();
}
const cr = /* @__PURE__ */ new WeakMap();
function vr(e) {
  var t = g;
  if (t === null)
    return b.f |= ce, e;
  if (t.f & yt)
    Ke(e, t);
  else {
    if (!(t.f & Qt))
      throw !t.parent && e instanceof Error && tn(e), e;
    t.b.error(e);
  }
}
function Ke(e, t) {
  for (; t !== null; ) {
    if (t.f & Qt)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e instanceof Error && tn(e), e;
}
function tn(e) {
  const t = cr.get(e);
  t && (vt(e, "message", {
    value: t.message
  }), vt(e, "stack", {
    value: t.stack
  }));
}
const He = /* @__PURE__ */ new Set();
let y = null, Pe = null, U = null, Dt = /* @__PURE__ */ new Set(), Y = [], et = null, ht = !1, Ce = !1;
class Me {
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
  #s = [];
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
    Y = [], Pe = null, this.apply();
    for (const l of t)
      this.#o(l);
    if (this.#e === 0) {
      var n = U;
      this.#c();
      var r = this.#r, a = this.#a;
      this.#r = [], this.#a = [], this.#s = [], Pe = this, y = null, U = n, Mt(r), Mt(a), Pe = null, this.#l?.resolve();
    } else
      this.#i(this.#r), this.#i(this.#a), this.#i(this.#s);
    U = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   */
  #o(t) {
    t.f ^= D;
    for (var n = t.first; n !== null; ) {
      var r = n.f, a = (r & (G | xe)) !== 0, l = a && (r & D) !== 0, i = l || (r & H) !== 0 || this.skipped_effects.has(n);
      if (!i && n.fn !== null) {
        a ? n.f ^= D : r & wt ? this.#a.push(n) : rt(n) && (n.f & he && this.#s.push(n), ze(n));
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
  #i(t) {
    for (const n of t)
      (n.f & j ? this.#f : this.#u).push(n), M(n, D);
    t.length = 0;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    this.#n.has(t) || this.#n.set(t, n), this.current.set(t, t.v), U?.set(t, t.v);
  }
  activate() {
    y = this;
  }
  deactivate() {
    y = null, U = null;
  }
  flush() {
    if (Y.length > 0) {
      if (this.activate(), nn(), y !== null && y !== this)
        return;
    } else this.#e === 0 && this.#c();
    this.deactivate();
    for (const t of Dt)
      if (Dt.delete(t), t(), y !== null)
        break;
  }
  /**
   * Append and remove branches to/from the DOM
   */
  #c() {
    for (const t of this.#t)
      t();
    if (this.#t.clear(), He.size > 1) {
      this.#n.clear();
      let t = !0;
      for (const n of He) {
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
            rn(l, a);
          if (Y.length > 0) {
            y = n, n.apply();
            for (const l of Y)
              n.#o(l);
            Y = [], n.deactivate();
          }
        }
      }
      y = null;
    }
    He.delete(this);
  }
  increment() {
    this.#e += 1;
  }
  decrement() {
    this.#e -= 1;
    for (const t of this.#f)
      M(t, j), de(t);
    for (const t of this.#u)
      M(t, se), de(t);
    this.flush();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#l ??= Jt()).promise;
  }
  static ensure() {
    if (y === null) {
      const t = y = new Me();
      He.add(y), Ce || Me.enqueue(() => {
        y === t && t.flush();
      });
    }
    return y;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    en(t);
  }
  apply() {
  }
}
function _r(e) {
  var t = Ce;
  Ce = !0;
  try {
    for (var n; ; ) {
      if (or(), Y.length === 0 && (y?.flush(), Y.length === 0))
        return et = null, /** @type {T} */
        n;
      nn();
    }
  } finally {
    Ce = t;
  }
}
function nn() {
  var e = Ee;
  ht = !0;
  try {
    var t = 0;
    for (It(!0); Y.length > 0; ) {
      var n = Me.ensure();
      if (t++ > 1e3) {
        var r, a;
        dr();
      }
      n.process(Y), le.clear();
    }
  } finally {
    ht = !1, It(e), et = null;
  }
}
function dr() {
  try {
    tr();
  } catch (e) {
    Ke(e, et);
  }
}
let ue = null;
function Mt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (!(r.f & (Se | H)) && rt(r) && (ue = [], ze(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null && r.ac === null ? gn(r) : r.fn = null), ue?.length > 0)) {
        le.clear();
        for (const a of ue)
          ze(a);
        ue = [];
      }
    }
    ue = null;
  }
}
function rn(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      r & R ? rn(
        /** @type {Derived} */
        n,
        t
      ) : r & (kt | he) && ln(n, t) && (M(n, j), de(
        /** @type {Effect} */
        n
      ));
    }
}
function ln(e, t) {
  if (e.deps !== null) {
    for (const n of e.deps)
      if (t.includes(n) || n.f & R && ln(
        /** @type {Derived} */
        n,
        t
      ))
        return !0;
  }
  return !1;
}
function de(e) {
  for (var t = et = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (ht && t === g && n & he)
      return;
    if (n & (xe | G)) {
      if (!(n & D)) return;
      t.f ^= D;
    }
  }
  Y.push(t);
}
function hr(e, t, n) {
  const r = Be() ? Et : an;
  if (t.length === 0) {
    n(e.map(r));
    return;
  }
  var a = y, l = (
    /** @type {Effect} */
    g
  ), i = pr();
  Promise.all(t.map((f) => /* @__PURE__ */ br(f))).then((f) => {
    i();
    try {
      n([...e.map(r), ...f]);
    } catch (s) {
      l.f & Se || Ke(s, l);
    }
    a?.deactivate(), pt();
  }).catch((f) => {
    Ke(f, l);
  });
}
function pr() {
  var e = g, t = b, n = T, r = y;
  return function() {
    ae(e), $(t), Ye(n), r?.activate();
  };
}
function pt() {
  ae(null), $(null), Ye(null);
}
// @__NO_SIDE_EFFECTS__
function Et(e) {
  var t = R | j, n = b !== null && b.f & R ? (
    /** @type {Derived} */
    b
  ) : null;
  return g === null || n !== null && n.f & V ? t |= V : g.f |= Ze, {
    ctx: T,
    deps: null,
    effects: null,
    equals: Gt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      P
    ),
    wv: 0,
    parent: n ?? g,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function br(e, t) {
  let n = (
    /** @type {Effect | null} */
    g
  );
  n === null && Gn();
  var r = (
    /** @type {Boundary} */
    n.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Re(
    /** @type {V} */
    P
  ), i = !b, f = /* @__PURE__ */ new Map();
  return Nr(() => {
    var s = Jt();
    a = s.promise;
    try {
      Promise.resolve(e()).then(s.resolve, s.reject).then(pt);
    } catch (c) {
      s.reject(c), pt();
    }
    var u = (
      /** @type {Batch} */
      y
    ), o = r.is_pending();
    i && (r.update_pending_count(1), o || (u.increment(), f.get(u)?.reject(ke), f.delete(u), f.set(u, s)));
    const d = (c, _ = void 0) => {
      if (o || u.activate(), _)
        _ !== ke && (l.f |= ce, Fe(l, _));
      else {
        l.f & ce && (l.f ^= ce), Fe(l, c);
        for (const [v, h] of f) {
          if (f.delete(v), v === u) break;
          h.reject(ke);
        }
      }
      i && (r.update_pending_count(-1), o || u.decrement());
    };
    s.promise.then(d, (c) => d(null, c || "unknown"));
  }), Tt(() => {
    for (const s of f.values())
      s.reject(ke);
  }), new Promise((s) => {
    function u(o) {
      function d() {
        o === a ? s(l) : u(a);
      }
      o.then(d, d);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function an(e) {
  const t = /* @__PURE__ */ Et(e);
  return t.equals = Xt, t;
}
function sn(e) {
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
function gr(e) {
  for (var t = e.parent; t !== null; ) {
    if (!(t.f & R))
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function xt(e) {
  var t, n = g;
  ae(gr(e));
  try {
    sn(e), t = Sn(e);
  } finally {
    ae(n);
  }
  return t;
}
function fn(e) {
  var t = xt(e);
  if (e.equals(t) || (e.v = t, e.wv = En()), !Te)
    if (U !== null)
      U.set(e, e.v);
    else {
      var n = (re || e.f & V) && e.deps !== null ? se : D;
      M(e, n);
    }
}
const le = /* @__PURE__ */ new Map();
function Re(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Gt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function te(e, t) {
  const n = Re(e);
  return Rr(n), n;
}
// @__NO_SIDE_EFFECTS__
function ne(e, t = !1, n = !0) {
  const r = Re(e);
  return t || (r.equals = Xt), je && n && T !== null && T.l !== null && (T.l.s ??= []).push(r), r;
}
function k(e, t, n = !1) {
  b !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!K || b.f & Ct) && Be() && b.f & (R | he | kt | Ct) && !Q?.includes(e) && lr();
  let r = n ? Oe(t) : t;
  return Fe(e, r);
}
function Fe(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    Te ? le.set(e, t) : le.set(e, n), e.v = t;
    var r = Me.ensure();
    r.capture(e, n), e.f & R && (e.f & j && xt(
      /** @type {Derived} */
      e
    ), M(e, e.f & V ? se : D)), e.wv = En(), un(e, j), Be() && g !== null && g.f & D && !(g.f & (G | xe)) && (L === null ? Fr([e]) : L.push(e));
  }
  return t;
}
function it(e) {
  k(e, e.v + 1);
}
function un(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Be(), a = n.length, l = 0; l < a; l++) {
      var i = n[l], f = i.f;
      if (!(!r && i === g)) {
        var s = (f & j) === 0;
        s && M(i, t), f & R ? un(
          /** @type {Derived} */
          i,
          se
        ) : s && (f & he && ue !== null && ue.push(
          /** @type {Effect} */
          i
        ), de(
          /** @type {Effect} */
          i
        ));
      }
    }
}
function Oe(e) {
  if (typeof e != "object" || e === null || ve in e)
    return e;
  const t = $t(e);
  if (t !== Kn && t !== $n)
    return e;
  var n = /* @__PURE__ */ new Map(), r = Ge(e), a = /* @__PURE__ */ te(0), l = _e, i = (f) => {
    if (_e === l)
      return f();
    var s = b, u = _e;
    $(null), Bt(l);
    var o = f();
    return $(s), Bt(u), o;
  };
  return r && n.set("length", /* @__PURE__ */ te(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, s, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && nr();
        var o = n.get(s);
        return o === void 0 ? o = i(() => {
          var d = /* @__PURE__ */ te(u.value);
          return n.set(s, d), d;
        }) : k(o, u.value, !0), !0;
      },
      deleteProperty(f, s) {
        var u = n.get(s);
        if (u === void 0) {
          if (s in f) {
            const o = i(() => /* @__PURE__ */ te(P));
            n.set(s, o), it(a);
          }
        } else
          k(u, P), it(a);
        return !0;
      },
      get(f, s, u) {
        if (s === ve)
          return e;
        var o = n.get(s), d = s in f;
        if (o === void 0 && (!d || st(f, s)?.writable) && (o = i(() => {
          var _ = Oe(d ? f[s] : P), v = /* @__PURE__ */ te(_);
          return v;
        }), n.set(s, o)), o !== void 0) {
          var c = p(o);
          return c === P ? void 0 : c;
        }
        return Reflect.get(f, s, u);
      },
      getOwnPropertyDescriptor(f, s) {
        var u = Reflect.getOwnPropertyDescriptor(f, s);
        if (u && "value" in u) {
          var o = n.get(s);
          o && (u.value = p(o));
        } else if (u === void 0) {
          var d = n.get(s), c = d?.v;
          if (d !== void 0 && c !== P)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return u;
      },
      has(f, s) {
        if (s === ve)
          return !0;
        var u = n.get(s), o = u !== void 0 && u.v !== P || Reflect.has(f, s);
        if (u !== void 0 || g !== null && (!o || st(f, s)?.writable)) {
          u === void 0 && (u = i(() => {
            var c = o ? Oe(f[s]) : P, _ = /* @__PURE__ */ te(c);
            return _;
          }), n.set(s, u));
          var d = p(u);
          if (d === P)
            return !1;
        }
        return o;
      },
      set(f, s, u, o) {
        var d = n.get(s), c = s in f;
        if (r && s === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var v = n.get(_ + "");
            v !== void 0 ? k(v, P) : _ in f && (v = i(() => /* @__PURE__ */ te(P)), n.set(_ + "", v));
          }
        if (d === void 0)
          (!c || st(f, s)?.writable) && (d = i(() => /* @__PURE__ */ te(void 0)), k(d, Oe(u)), n.set(s, d));
        else {
          c = d.v !== P;
          var h = i(() => Oe(u));
          k(d, h);
        }
        var E = Reflect.getOwnPropertyDescriptor(f, s);
        if (E?.set && E.set.call(o, u), !c) {
          if (r && typeof s == "string") {
            var F = (
              /** @type {Source<number>} */
              n.get("length")
            ), w = Number(s);
            Number.isInteger(w) && w >= F.v && k(F, w + 1);
          }
          it(a);
        }
        return !0;
      },
      ownKeys(f) {
        p(a);
        var s = Reflect.ownKeys(f).filter((d) => {
          var c = n.get(d);
          return c === void 0 || c.v !== P;
        });
        for (var [u, o] of n)
          o.v !== P && !(u in f) && s.push(u);
        return s;
      },
      setPrototypeOf() {
        rr();
      }
    }
  );
}
function Rt(e) {
  try {
    if (e !== null && typeof e == "object" && ve in e)
      return e[ve];
  } catch {
  }
  return e;
}
function wr(e, t) {
  return Object.is(Rt(e), Rt(t));
}
var yr, mr, kr;
function $e(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function on(e) {
  return mr.call(e);
}
// @__NO_SIDE_EFFECTS__
function tt(e) {
  return kr.call(e);
}
function N(e, t) {
  return /* @__PURE__ */ on(e);
}
function O(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ tt(r);
  return r;
}
function Er(e) {
  e.textContent = "";
}
function cn() {
  return !1;
}
let Ft = !1;
function xr() {
  Ft || (Ft = !0, document.addEventListener(
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
function nt(e) {
  var t = b, n = g;
  $(null), ae(null);
  try {
    return e();
  } finally {
    $(t), ae(n);
  }
}
function St(e, t, n, r = n) {
  e.addEventListener(t, () => nt(n));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), r(!0);
  } : e.__on_r = () => r(!0), xr();
}
function vn(e) {
  g === null && b === null && er(), b !== null && b.f & V && g === null && Zn(), Te && Xn();
}
function Sr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function X(e, t, n, r = !0) {
  var a = g;
  a !== null && a.f & H && (e |= H);
  var l = {
    ctx: T,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | j,
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
      ze(l), l.f |= yt;
    } catch (s) {
      throw z(l), s;
    }
  else t !== null && de(l);
  if (r) {
    var i = l;
    if (n && i.deps === null && i.teardown === null && i.nodes_start === null && i.first === i.last && // either `null`, or a singular child
    !(i.f & Ze) && (i = i.first), i !== null && (i.parent = a, a !== null && Sr(i, a), b !== null && b.f & R && !(e & xe))) {
      var f = (
        /** @type {Derived} */
        b
      );
      (f.effects ??= []).push(i);
    }
  }
  return l;
}
function Tt(e) {
  const t = X(Xe, null, !1);
  return M(t, D), t.teardown = e, t;
}
function bt(e) {
  vn();
  var t = (
    /** @type {Effect} */
    g.f
  ), n = !b && (t & G) !== 0 && (t & yt) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      T
    );
    (r.e ??= []).push(e);
  } else
    return _n(e);
}
function _n(e) {
  return X(wt | zt, e, !1);
}
function Tr(e) {
  return vn(), X(Xe | zt, e, !0);
}
function Ar(e) {
  return X(wt, e, !1);
}
function Nr(e) {
  return X(kt | Ze, e, !0);
}
function dn(e, t = 0) {
  return X(Xe | t, e, !0);
}
function we(e, t = [], n = []) {
  hr(t, n, (r) => {
    X(Xe, () => e(...r.map(p)), !0);
  });
}
function hn(e, t = 0) {
  var n = X(he | t, e, !0);
  return n;
}
function Je(e, t = !0) {
  return X(G | Ze, e, !0, t);
}
function pn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Te, r = b;
    jt(!0), $(null);
    try {
      t.call(null);
    } finally {
      jt(n), $(r);
    }
  }
}
function bn(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && nt(() => {
      a.abort(ke);
    });
    var r = n.next;
    n.f & xe ? n.parent = null : z(n, t), n = r;
  }
}
function Or(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    t.f & G || z(t), t = n;
  }
}
function z(e, t = !0) {
  var n = !1;
  (t || e.f & Qn) && e.nodes_start !== null && e.nodes_end !== null && (Pr(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), n = !0), bn(e, t && !n), Qe(e, 0), M(e, Se);
  var r = e.transitions;
  if (r !== null)
    for (const l of r)
      l.stop();
  pn(e);
  var a = e.parent;
  a !== null && a.first !== null && gn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function Pr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ tt(e)
    );
    e.remove(), e = n;
  }
}
function gn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function wn(e, t, n = !0) {
  var r = [];
  At(e, r, !0), yn(r, () => {
    n && z(e), t && t();
  });
}
function yn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var a of e)
      a.out(r);
  } else
    t();
}
function At(e, t, n) {
  if (!(e.f & H)) {
    if (e.f ^= H, e.transitions !== null)
      for (const i of e.transitions)
        (i.is_global || n) && t.push(i);
    for (var r = e.first; r !== null; ) {
      var a = r.next, l = (r.f & mt) !== 0 || (r.f & G) !== 0;
      At(r, t, l ? n : !1), r = a;
    }
  }
}
function Nt(e) {
  mn(e, !0);
}
function mn(e, t) {
  if (e.f & H) {
    e.f ^= H, e.f & D || (M(e, j), de(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, a = (n.f & mt) !== 0 || (n.f & G) !== 0;
      mn(n, a ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const l of e.transitions)
        (l.is_global || t) && l.in();
  }
}
function Cr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var a = n === r ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ tt(n)
    );
    t.append(n), n = a;
  }
}
let me = null;
function Dr(e) {
  var t = me;
  try {
    if (me = /* @__PURE__ */ new Set(), qe(e), t !== null)
      for (var n of me)
        t.add(n);
    return me;
  } finally {
    me = t;
  }
}
function Mr(e) {
  for (var t of Dr(e))
    Fe(t, t.v);
}
let Ee = !1;
function It(e) {
  Ee = e;
}
let Te = !1;
function jt(e) {
  Te = e;
}
let b = null, K = !1;
function $(e) {
  b = e;
}
let g = null;
function ae(e) {
  g = e;
}
let Q = null;
function Rr(e) {
  b !== null && (Q === null ? Q = [e] : Q.push(e));
}
let C = null, I = 0, L = null;
function Fr(e) {
  L = e;
}
let kn = 1, Ie = 0, _e = Ie;
function Bt(e) {
  _e = e;
}
let re = !1;
function En() {
  return ++kn;
}
function rt(e) {
  var t = e.f;
  if (t & j)
    return !0;
  if (t & se) {
    var n = e.deps, r = (t & V) !== 0;
    if (n !== null) {
      var a, l, i = (t & We) !== 0, f = r && g !== null && !re, s = n.length;
      if ((i || f) && (g === null || !(g.f & Se))) {
        var u = (
          /** @type {Derived} */
          e
        ), o = u.parent;
        for (a = 0; a < s; a++)
          l = n[a], (i || !l?.reactions?.includes(u)) && (l.reactions ??= []).push(u);
        i && (u.f ^= We), f && o !== null && !(o.f & V) && (u.f ^= V);
      }
      for (a = 0; a < s; a++)
        if (l = n[a], rt(
          /** @type {Derived} */
          l
        ) && fn(
          /** @type {Derived} */
          l
        ), l.wv > e.wv)
          return !0;
    }
    (!r || g !== null && !re) && M(e, D);
  }
  return !1;
}
function xn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !Q?.includes(e))
    for (var a = 0; a < r.length; a++) {
      var l = r[a];
      l.f & R ? xn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? M(l, j) : l.f & D && M(l, se), de(
        /** @type {Effect} */
        l
      ));
    }
}
function Sn(e) {
  var t = C, n = I, r = L, a = b, l = re, i = Q, f = T, s = K, u = _e, o = e.f;
  C = /** @type {null | Value[]} */
  null, I = 0, L = null, re = (o & V) !== 0 && (K || !Ee || b === null), b = o & (G | xe) ? null : e, Q = null, Ye(e.ctx), K = !1, _e = ++Ie, e.ac !== null && (nt(() => {
    e.ac.abort(ke);
  }), e.ac = null);
  try {
    e.f |= dt;
    var d = (
      /** @type {Function} */
      e.fn
    ), c = d(), _ = e.deps;
    if (C !== null) {
      var v;
      if (Qe(e, I), _ !== null && I > 0)
        for (_.length = I + C.length, v = 0; v < C.length; v++)
          _[I + v] = C[v];
      else
        e.deps = _ = C;
      if (!re || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      o & R && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (v = I; v < _.length; v++)
          (_[v].reactions ??= []).push(e);
    } else _ !== null && I < _.length && (Qe(e, I), _.length = I);
    if (Be() && L !== null && !K && _ !== null && !(e.f & (R | se | j)))
      for (v = 0; v < /** @type {Source[]} */
      L.length; v++)
        xn(
          L[v],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Ie++, L !== null && (r === null ? r = L : r.push(.../** @type {Source[]} */
    L))), e.f & ce && (e.f ^= ce), c;
  } catch (h) {
    return vr(h);
  } finally {
    e.f ^= dt, C = t, I = n, L = r, b = a, re = l, Q = i, Ye(f), K = s, _e = u;
  }
}
function Ir(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Wn.call(n, e);
    if (r !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[r] = n[a], n.pop());
    }
  }
  n === null && t.f & R && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (C === null || !C.includes(t)) && (M(t, se), t.f & (V | We) || (t.f ^= We), sn(
    /** @type {Derived} **/
    t
  ), Qe(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Qe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Ir(e, n[r]);
}
function ze(e) {
  var t = e.f;
  if (!(t & Se)) {
    M(e, D);
    var n = g, r = Ee;
    g = e, Ee = !0;
    try {
      t & he ? Or(e) : bn(e), pn(e);
      var a = Sn(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = kn;
      var l;
      Yt && Bn && e.f & j && e.deps;
    } finally {
      Ee = r, g = n;
    }
  }
}
async function jr() {
  await Promise.resolve(), _r();
}
function p(e) {
  var t = e.f, n = (t & R) !== 0;
  if (me?.add(e), b !== null && !K) {
    var r = g !== null && (g.f & Se) !== 0;
    if (!r && !Q?.includes(e)) {
      var a = b.deps;
      if (b.f & dt)
        e.rv < Ie && (e.rv = Ie, C === null && a !== null && a[I] === e ? I++ : C === null ? C = [e] : (!re || !C.includes(e)) && C.push(e));
      else {
        (b.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [b] : l.includes(b) || l.push(b);
      }
    }
  } else if (n && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var i = (
      /** @type {Derived} */
      e
    ), f = i.parent;
    f !== null && !(f.f & V) && (i.f ^= V);
  }
  if (Te) {
    if (le.has(e))
      return le.get(e);
    if (n) {
      i = /** @type {Derived} */
      e;
      var s = i.v;
      return (!(i.f & D) && i.reactions !== null || Tn(i)) && (s = xt(i)), le.set(i, s), s;
    }
  } else if (n) {
    if (i = /** @type {Derived} */
    e, U?.has(i))
      return U.get(i);
    rt(i) && fn(i);
  }
  if (U?.has(e))
    return U.get(e);
  if (e.f & ce)
    throw e.v;
  return e.v;
}
function Tn(e) {
  if (e.v === P) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (le.has(t) || t.f & R && Tn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function qe(e) {
  var t = K;
  try {
    return K = !0, e();
  } finally {
    K = t;
  }
}
const Br = -7169;
function M(e, t) {
  e.f = e.f & Br | t;
}
function qr(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (ve in e)
      gt(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && ve in n && gt(n);
      }
  }
}
function gt(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        gt(e[r], t);
      } catch {
      }
    const n = $t(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = Yn(n);
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
function Lr(e, t, n, r = {}) {
  function a(l) {
    if (r.capture || Vr.call(t, l), !l.cancelBubble)
      return nt(() => n?.call(this, l));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? en(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function ft(e, t, n, r, a) {
  var l = { capture: r, passive: a }, i = Lr(e, t, n, l);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Tt(() => {
    t.removeEventListener(e, i, l);
  });
}
let qt = null;
function Vr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  qt = e;
  var i = 0, f = qt === e && e.__root;
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
    vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var o = b, d = g;
    $(null), ae(null);
    try {
      for (var c, _ = []; l !== null; ) {
        var v = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var h = l["__" + r];
          if (h != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l))
            if (Ge(h)) {
              var [E, ...F] = h;
              E.apply(l, [e, ...F]);
            } else
              h.call(l, e);
        } catch (w) {
          c ? _.push(w) : c = w;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        l = v;
      }
      if (c) {
        for (let w of _)
          queueMicrotask(() => {
            throw w;
          });
        throw c;
      }
    } finally {
      e.__root = t, delete e.currentTarget, $(o), ae(d);
    }
  }
}
function Ur(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function Hr(e, t) {
  var n = (
    /** @type {Effect} */
    g
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function Le(e, t) {
  var n = (t & Hn) !== 0, r, a = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Ur(a ? e : "<!>" + e), r = /** @type {Node} */
    /* @__PURE__ */ on(r));
    var l = (
      /** @type {TemplateNode} */
      n || yr ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Hr(l, l), l;
  };
}
function Ne(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function ye(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = n + "");
}
class Wr {
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
      y
    );
    if (this.#n.has(t)) {
      var n = (
        /** @type {Key} */
        this.#n.get(t)
      ), r = this.#t.get(n);
      if (r)
        Nt(r);
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
            Cr(i, u), u.append($e()), this.#e.set(l, { effect: i, fragment: u });
          } else
            z(i);
          this.#t.delete(l);
        };
        this.#l || !r ? wn(i, f, !1) : f();
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
      y
    ), a = cn();
    if (n && !this.#t.has(t) && !this.#e.has(t))
      if (a) {
        var l = document.createDocumentFragment(), i = $e();
        l.append(i), this.#e.set(t, {
          effect: Je(() => n(i)),
          fragment: l
        });
      } else
        this.#t.set(
          t,
          Je(() => n(this.anchor))
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
function Yr(e) {
  T === null && zn(), je && T.l !== null ? Kr(T).m.push(e) : bt(() => {
    const t = qe(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function Kr(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ??= { a: [], b: [], m: [] };
}
function Lt(e, t, n = !1) {
  var r = new Wr(e), a = n ? mt : 0;
  function l(i, f) {
    r.ensure(i, f);
  }
  hn(() => {
    var i = !1;
    t((f, s = !0) => {
      i = !0, l(s, f);
    }), i || l(!1, null);
  }, a);
}
function Vt(e, t) {
  return t;
}
function $r(e, t, n) {
  for (var r = e.items, a = [], l = t.length, i = 0; i < l; i++)
    At(t[i].e, a, !0);
  var f = l > 0 && a.length === 0 && n !== null;
  if (f) {
    var s = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    Er(s), s.append(
      /** @type {Element} */
      n
    ), r.clear(), W(e, t[0].prev, t[l - 1].next);
  }
  yn(a, () => {
    for (var u = 0; u < l; u++) {
      var o = t[u];
      f || (r.delete(o.k), W(e, o.prev, o.next)), z(o.e, !f);
    }
  });
}
function Ut(e, t, n, r, a, l = null) {
  var i = e, f = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var s = (
      /** @type {Element} */
      e
    );
    i = s.appendChild($e());
  }
  var u = null, o = !1, d = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ an(() => {
    var E = n();
    return Ge(E) ? E : E == null ? [] : Kt(E);
  }), _, v;
  function h() {
    Jr(
      v,
      _,
      f,
      d,
      i,
      a,
      t,
      r,
      n
    ), l !== null && (_.length === 0 ? u ? Nt(u) : u = Je(() => l(i)) : u !== null && wn(u, () => {
      u = null;
    }));
  }
  hn(() => {
    v ??= /** @type {Effect} */
    g, _ = /** @type {V[]} */
    p(c);
    var E = _.length;
    if (!(o && E === 0)) {
      o = E === 0;
      var F, w, x, A;
      if (cn()) {
        var B = /* @__PURE__ */ new Set(), Z = (
          /** @type {Batch} */
          y
        );
        for (w = 0; w < E; w += 1) {
          x = _[w], A = r(x, w);
          var ie = f.items.get(A) ?? d.get(A);
          ie ? An(ie, x, w) : (F = Nn(
            null,
            f,
            null,
            null,
            x,
            A,
            w,
            a,
            t,
            n,
            !0
          ), d.set(A, F)), B.add(A);
        }
        for (const [ee, q] of f.items)
          B.has(ee) || Z.skipped_effects.add(q.e);
        Z.add_callback(h);
      } else
        h();
      p(c);
    }
  });
}
function Jr(e, t, n, r, a, l, i, f, s) {
  var u = t.length, o = n.items, d = n.first, c = d, _, v = null, h = [], E = [], F, w, x, A;
  for (A = 0; A < u; A += 1) {
    if (F = t[A], w = f(F, A), x = o.get(w), x === void 0) {
      var B = r.get(w);
      if (B !== void 0) {
        r.delete(w), o.set(w, B);
        var Z = v ? v.next : c;
        W(n, v, B), W(n, B, Z), ut(B, Z, a), v = B;
      } else {
        var ie = c ? (
          /** @type {TemplateNode} */
          c.e.nodes_start
        ) : a;
        v = Nn(
          ie,
          n,
          v,
          v === null ? n.first : v.next,
          F,
          w,
          A,
          l,
          i,
          s
        );
      }
      o.set(w, v), h = [], E = [], c = v.next;
      continue;
    }
    if (An(x, F, A), x.e.f & H && Nt(x.e), x !== c) {
      if (_ !== void 0 && _.has(x)) {
        if (h.length < E.length) {
          var ee = E[0], q;
          v = ee.prev;
          var Ve = h[0], pe = h[h.length - 1];
          for (q = 0; q < h.length; q += 1)
            ut(h[q], ee, a);
          for (q = 0; q < E.length; q += 1)
            _.delete(E[q]);
          W(n, Ve.prev, pe.next), W(n, v, Ve), W(n, pe, ee), c = ee, v = pe, A -= 1, h = [], E = [];
        } else
          _.delete(x), ut(x, c, a), W(n, x.prev, x.next), W(n, x, v === null ? n.first : v.next), W(n, v, x), v = x;
        continue;
      }
      for (h = [], E = []; c !== null && c.k !== w; )
        c.e.f & H || (_ ??= /* @__PURE__ */ new Set()).add(c), E.push(c), c = c.next;
      if (c === null)
        continue;
      x = c;
    }
    h.push(x), v = x, c = x.next;
  }
  if (c !== null || _ !== void 0) {
    for (var fe = _ === void 0 ? [] : Kt(_); c !== null; )
      c.e.f & H || fe.push(c), c = c.next;
    var Ue = fe.length;
    if (Ue > 0) {
      var lt = u === 0 ? a : null;
      $r(n, fe, lt);
    }
  }
  e.first = n.first && n.first.e, e.last = v && v.e;
  for (var at of r.values())
    z(at.e);
  r.clear();
}
function An(e, t, n, r) {
  Fe(e.v, t), e.i = n;
}
function Nn(e, t, n, r, a, l, i, f, s, u, o) {
  var d = (s & Ln) !== 0, c = (s & Un) === 0, _ = d ? c ? /* @__PURE__ */ ne(a, !1, !1) : Re(a) : a, v = s & Vn ? Re(i) : i, h = {
    i: v,
    v: _,
    k: l,
    a: null,
    // @ts-expect-error
    e: null,
    prev: n,
    next: r
  };
  try {
    if (e === null) {
      var E = document.createDocumentFragment();
      E.append(e = $e());
    }
    return h.e = Je(() => f(
      /** @type {Node} */
      e,
      _,
      v,
      u
    ), sr), h.e.prev = n && n.e, h.e.next = r && r.e, n === null ? o || (t.first = h) : (n.next = h, n.e.next = h.e), r !== null && (r.prev = h, r.e.prev = h.e), h;
  } finally {
  }
}
function ut(e, t, n) {
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
      /* @__PURE__ */ tt(l)
    );
    a.before(l), l = i;
  }
}
function W(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function Qr(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r = r ? r + " " + t : t, r === "" ? null : r;
}
function Ht(e, t, n, r, a, l) {
  var i = e.__className;
  if (i !== n || i === void 0) {
    var f = Qr(n, r);
    f == null ? e.removeAttribute("class") : e.className = f, e.__className = n;
  }
  return l;
}
function On(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!Ge(t))
      return ar();
    for (var r of e.options)
      r.selected = t.includes(De(r));
    return;
  }
  for (r of e.options) {
    var a = De(r);
    if (wr(a, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function zr(e) {
  var t = new MutationObserver(() => {
    On(e, e.__value);
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
  }), Tt(() => {
    t.disconnect();
  });
}
function Gr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet(), a = !0;
  St(e, "change", (l) => {
    var i = l ? "[selected]" : ":checked", f;
    if (e.multiple)
      f = [].map.call(e.querySelectorAll(i), De);
    else {
      var s = e.querySelector(i) ?? // will fall back to first non-disabled option if no option is selected
      e.querySelector("option:not([disabled])");
      f = s && De(s);
    }
    n(f), y !== null && r.add(y);
  }), Ar(() => {
    var l = t();
    if (e === document.activeElement) {
      var i = (
        /** @type {Batch} */
        Pe ?? y
      );
      if (r.has(i))
        return;
    }
    if (On(e, l, a), a && l === void 0) {
      var f = e.querySelector(":checked");
      f !== null && (l = De(f), n(l));
    }
    e.__value = l, a = !1;
  }), zr(e);
}
function De(e) {
  return "__value" in e ? e.__value : e.value;
}
function Xr(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  St(e, "input", async (a) => {
    var l = a ? e.defaultValue : e.value;
    if (l = ot(e) ? ct(l) : l, n(l), y !== null && r.add(y), await jr(), l !== (l = t())) {
      var i = e.selectionStart, f = e.selectionEnd, s = e.value.length;
      if (e.value = l ?? "", f !== null) {
        var u = e.value.length;
        i === f && f === s && u > s ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = i, e.selectionEnd = Math.min(f, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  qe(t) == null && e.value && (n(ot(e) ? ct(e.value) : e.value), y !== null && r.add(y)), dn(() => {
    var a = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        Pe ?? y
      );
      if (r.has(l))
        return;
    }
    ot(e) && a === ct(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Zr(e, t, n = t) {
  St(e, "change", (r) => {
    var a = r ? e.defaultChecked : e.checked;
    n(a);
  }), // If we are hydrating and the value has since changed,
  // then use the update value from the input instead.
  // If defaultChecked is set, then checked == defaultChecked
  qe(t) == null && n(e.checked), dn(() => {
    var r = t();
    e.checked = !!r;
  });
}
function ot(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function ct(e) {
  return e === "" ? null : +e;
}
function el(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    T
  ), n = t.l.u;
  if (!n) return;
  let r = () => qr(t.s);
  if (e) {
    let a = 0, l = (
      /** @type {Record<string, any>} */
      {}
    );
    const i = /* @__PURE__ */ Et(() => {
      let f = !1;
      const s = t.s;
      for (const u in s)
        s[u] !== l[u] && (l[u] = s[u], f = !0);
      return f && a++, a;
    });
    r = () => p(i);
  }
  n.b.length && Tr(() => {
    Wt(t, r), _t(n.b);
  }), bt(() => {
    const a = qe(() => n.m.map(Jn));
    return () => {
      for (const l of a)
        typeof l == "function" && l();
    };
  }), n.a.length && bt(() => {
    Wt(t, r), _t(n.a);
  });
}
function Wt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) p(n);
  t();
}
var tl = /* @__PURE__ */ Le("<div> </div>"), nl = /* @__PURE__ */ Le("<option> </option>"), rl = /* @__PURE__ */ Le('<div class="error svelte-1klxta8"> </div>'), ll = /* @__PURE__ */ Le('<div class="history-item svelte-1klxta8"><div class="history-header svelte-1klxta8"><span> </span> <span class="method svelte-1klxta8"> </span> <span class="time svelte-1klxta8"> </span></div> <!></div>'), al = /* @__PURE__ */ Le('<div class="bot-management svelte-1klxta8"><header class="svelte-1klxta8"><h1 class="svelte-1klxta8">🤖 Bot Management</h1> <p class="svelte-1klxta8">Multi-Bot News-Scraping verwalten, Bots testen und konfigurieren</p></header> <!> <div class="grid svelte-1klxta8"><div class="card svelte-1klxta8"><h2 class="svelte-1klxta8">🎯 Bot-Auswahl</h2> <label class="svelte-1klxta8">Verfügbare ChatBots <select class="select select-bordered w-full"></select></label> <button class="btn btn-primary w-full svelte-1klxta8">🧪 Bot-Verbindung testen</button></div> <div class="card svelte-1klxta8"><h2 class="svelte-1klxta8">⚙️ Scraping-Konfiguration</h2> <label class="svelte-1klxta8">Eigene Frage (optional) <textarea placeholder="Berichte über die neuesten News..." rows="3" class="textarea textarea-bordered w-full"></textarea> <span class="hint svelte-1klxta8">Leer lassen für Standard-Frage</span></label> <label class="cursor-pointer flex items-center gap-2 svelte-1klxta8"><input type="checkbox" class="checkbox"/> <span>News automatisch in Datenbank speichern</span></label></div> <div class="card svelte-1klxta8"><h2 class="svelte-1klxta8">🚀 Scraping-Aktionen</h2> <button class="btn btn-success w-full svelte-1klxta8">🌐 Scraping via API starten</button> <button class="btn btn-secondary w-full svelte-1klxta8">🎭 Scraping via Puppeteer starten</button></div> <div class="card history svelte-1klxta8"><h2 class="svelte-1klxta8">📜 Scraping History</h2> <div class="history-list svelte-1klxta8"></div></div></div></div>');
function il(e, t) {
  fr(t, !1);
  let n = /* @__PURE__ */ ne([]), r = /* @__PURE__ */ ne("a43b3038-423e-47ab-8226-a8714418c88f"), a = /* @__PURE__ */ ne(""), l = /* @__PURE__ */ ne(!0), i = /* @__PURE__ */ ne([]), f = /* @__PURE__ */ ne(!1), s = /* @__PURE__ */ ne("");
  Yr(async () => {
    await u(), await o();
  });
  async function u() {
    const m = await (await fetch("/botbucket/bots")).json();
    k(n, m.data || []);
  }
  async function o() {
    const m = await (await fetch("/botbucket/history")).json();
    k(i, m.data || []);
  }
  async function d() {
    k(f, !0), k(s, "");
    try {
      const m = await (await fetch("/botbucket/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedBot: p(r) })
      })).json();
      k(s, m.success ? "✅ Bot-Verbindung erfolgreich!" : "❌ " + m.error);
    } catch {
      k(s, "❌ Bot-Test fehlgeschlagen");
    } finally {
      k(f, !1);
    }
  }
  async function c() {
    k(f, !0), k(s, "");
    try {
      const m = await (await fetch("/botbucket/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedBot: p(r),
          customQuestion: p(a),
          saveToDatabase: p(l)
        })
      })).json();
      k(s, m.success ? "✅ API-Scraping erfolgreich!" : "❌ " + m.error), await o();
    } catch {
      k(s, "❌ API-Scraping fehlgeschlagen");
    } finally {
      k(f, !1);
    }
  }
  async function _() {
    k(f, !0), k(s, "");
    try {
      const m = await (await fetch("/botbucket/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customQuestion: p(a),
          saveToDatabase: p(l)
        })
      })).json();
      k(s, m.success ? "✅ Puppeteer-Scraping erfolgreich!" : "❌ " + m.error), await o();
    } catch {
      k(s, "❌ Puppeteer-Scraping fehlgeschlagen");
    } finally {
      k(f, !1);
    }
  }
  el();
  var v = al(), h = O(N(v), 2);
  {
    var E = (S) => {
      var m = tl(), J = N(m);
      we(
        (be) => {
          Ht(m, 1, `alert ${be ?? ""}`, "svelte-1klxta8"), ye(J, p(s));
        },
        [
          () => p(s).includes("✅") ? "alert-success" : "alert-error"
        ]
      ), Ne(S, m);
    };
    Lt(h, (S) => {
      p(s) && S(E);
    });
  }
  var F = O(h, 2), w = N(F), x = O(N(w), 2), A = O(N(x));
  we(() => {
    p(r), Mr(() => {
      p(n);
    });
  }), Ut(A, 5, () => p(n), Vt, (S, m) => {
    var J = nl(), be = N(J), ge = {};
    we(() => {
      ye(be, p(m).name), ge !== (ge = p(m).id) && (J.value = (J.__value = p(m).id) ?? "");
    }), Ne(S, J);
  });
  var B = O(x, 2), Z = O(w, 2), ie = O(N(Z), 2), ee = O(N(ie)), q = O(ie, 2), Ve = N(q), pe = O(Z, 2), fe = O(N(pe), 2), Ue = O(fe, 2), lt = O(pe, 2), at = O(N(lt), 2);
  Ut(at, 5, () => p(i), Vt, (S, m) => {
    var J = ll(), be = N(J), ge = N(be), Pn = N(ge), Ot = O(ge, 2), Cn = N(Ot), Dn = O(Ot, 2), Mn = N(Dn), Rn = O(be, 2);
    {
      var Fn = (Ae) => {
        var Pt = rl(), In = N(Pt);
        we(() => ye(In, p(m).error)), Ne(Ae, Pt);
      };
      Lt(Rn, (Ae) => {
        p(m).error && Ae(Fn);
      });
    }
    we(
      (Ae) => {
        Ht(ge, 1, `badge ${p(m).success ? "badge-success" : "badge-error"}`, "svelte-1klxta8"), ye(Pn, p(m).success ? "✓" : "✗"), ye(Cn, p(m).method), ye(Mn, Ae);
      },
      [() => new Date(p(m).timestamp).toLocaleString()]
    ), Ne(S, J);
  }), we(() => {
    B.disabled = p(f), fe.disabled = p(f), Ue.disabled = p(f);
  }), Gr(A, () => p(r), (S) => k(r, S)), ft("click", B, d), Xr(ee, () => p(a), (S) => k(a, S)), Zr(Ve, () => p(l), (S) => k(l, S)), ft("click", fe, c), ft("click", Ue, _), Ne(e, v), ur();
}
export {
  il as default
};
