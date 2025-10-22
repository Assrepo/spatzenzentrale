const hn = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(hn);
let Ne = !1, dn = !1;
function pn() {
  Ne = !0;
}
pn();
const wn = 1, gn = 2, mn = 16, yn = 2, T = Symbol(), xt = !1;
var nt = Array.isArray, bn = Array.prototype.indexOf, Tt = Array.from, Xe = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, En = Object.getOwnPropertyDescriptors, kn = Object.prototype, xn = Array.prototype, At = Object.getPrototypeOf;
function Tn(e) {
  return e();
}
function Ze(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Dt() {
  var e, t, n = new Promise((r, s) => {
    e = r, t = s;
  });
  return { promise: n, resolve: e, reject: t };
}
const S = 2, Nt = 4, rt = 8, ue = 16, X = 32, we = 64, St = 128, j = 256, Fe = 512, D = 1024, F = 2048, ne = 4096, V = 8192, ge = 16384, lt = 32768, st = 65536, pt = 1 << 17, An = 1 << 18, Ue = 1 << 19, Ct = 1 << 20, Je = 1 << 21, at = 1 << 22, ae = 1 << 23, ke = Symbol("$state"), he = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Rt(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Dn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Nn(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Sn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Cn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Rn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function On() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Fn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Mn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let In = !1;
function Ot(e) {
  return e === this.v;
}
function Pn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Ft(e) {
  return !Pn(e, this.v);
}
let E = null;
function Me(e) {
  E = e;
}
function Ln(e, t = !1, n) {
  E = {
    p: E,
    c: null,
    e: null,
    s: e,
    x: null,
    l: Ne && !t ? { s: null, u: null, $: [] } : null
  };
}
function jn(e) {
  var t = (
    /** @type {ComponentContext} */
    E
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Kt(r);
  }
  return E = t.p, /** @type {T} */
  {};
}
function Se() {
  return !Ne || E !== null && E.l === null;
}
let de = [];
function qn() {
  var e = de;
  de = [], Ze(e);
}
function Mt(e) {
  if (de.length === 0) {
    var t = de;
    queueMicrotask(() => {
      t === de && qn();
    });
  }
  de.push(e);
}
const Un = /* @__PURE__ */ new WeakMap();
function Bn(e) {
  var t = m;
  if (t === null)
    return g.f |= ae, e;
  if (t.f & lt)
    Ie(e, t);
  else {
    if (!(t.f & St))
      throw !t.parent && e instanceof Error && It(e), e;
    t.b.error(e);
  }
}
function Ie(e, t) {
  for (; t !== null; ) {
    if (t.f & St)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e instanceof Error && It(e), e;
}
function It(e) {
  const t = Un.get(e);
  t && (Xe(e, "message", {
    value: t.message
  }), Xe(e, "stack", {
    value: t.stack
  }));
}
const Oe = /* @__PURE__ */ new Set();
let k = null, B = null, wt = /* @__PURE__ */ new Set(), Q = [], it = null, Qe = !1;
class xe {
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
  #s = [];
  /**
   * Block effects, which may need to re-run on subsequent flushes
   * in order to update internal sources (e.g. each block items)
   * @type {Effect[]}
   */
  #a = [];
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
    Q = [], this.apply();
    for (const l of t)
      this.#o(l);
    if (this.#e === 0) {
      var n = B;
      this.#c();
      var r = this.#r, s = this.#s;
      this.#r = [], this.#s = [], this.#a = [], k = null, B = n, gt(r), gt(s), this.#l?.resolve();
    } else
      this.#i(this.#r), this.#i(this.#s), this.#i(this.#a);
    B = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   */
  #o(t) {
    t.f ^= D;
    for (var n = t.first; n !== null; ) {
      var r = n.f, s = (r & (X | we)) !== 0, l = s && (r & D) !== 0, a = l || (r & V) !== 0 || this.skipped_effects.has(n);
      if (!a && n.fn !== null) {
        s ? n.f ^= D : r & Nt ? this.#s.push(n) : Be(n) && (n.f & ue && this.#a.push(n), qe(n));
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
      (n.f & F ? this.#f : this.#u).push(n), N(n, D);
    t.length = 0;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    this.#n.has(t) || this.#n.set(t, n), this.current.set(t, t.v), B?.set(t, t.v);
  }
  activate() {
    k = this;
  }
  deactivate() {
    k = null, B = null;
  }
  flush() {
    if (Q.length > 0) {
      if (this.activate(), Vn(), k !== null && k !== this)
        return;
    } else this.#e === 0 && this.#c();
    this.deactivate();
    for (const t of wt)
      if (wt.delete(t), t(), k !== null)
        break;
  }
  /**
   * Append and remove branches to/from the DOM
   */
  #c() {
    for (const t of this.#t)
      t();
    if (this.#t.clear(), Oe.size > 1) {
      this.#n.clear();
      let t = !0;
      for (const n of Oe) {
        if (n === this) {
          t = !1;
          continue;
        }
        const r = [];
        for (const [l, a] of this.current) {
          if (n.current.has(l))
            if (t && a !== n.current.get(l))
              n.current.set(l, a);
            else
              continue;
          r.push(l);
        }
        if (r.length === 0)
          continue;
        const s = [...n.current.keys()].filter((l) => !this.current.has(l));
        if (s.length > 0) {
          for (const l of r)
            Pt(l, s);
          if (Q.length > 0) {
            k = n, n.apply();
            for (const l of Q)
              n.#o(l);
            Q = [], n.deactivate();
          }
        }
      }
      k = null;
    }
    Oe.delete(this);
  }
  increment() {
    this.#e += 1;
  }
  decrement() {
    this.#e -= 1;
    for (const t of this.#f)
      N(t, F), fe(t);
    for (const t of this.#u)
      N(t, ne), fe(t);
    this.flush();
  }
  /** @param {() => void} fn */
  add_callback(t) {
    this.#t.add(t);
  }
  settled() {
    return (this.#l ??= Dt()).promise;
  }
  static ensure() {
    if (k === null) {
      const t = k = new xe();
      Oe.add(k), xe.enqueue(() => {
        k === t && t.flush();
      });
    }
    return k;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Mt(t);
  }
  apply() {
  }
}
function Vn() {
  var e = pe;
  Qe = !0;
  try {
    var t = 0;
    for (mt(!0); Q.length > 0; ) {
      var n = xe.ensure();
      if (t++ > 1e3) {
        var r, s;
        Hn();
      }
      n.process(Q), ee.clear();
    }
  } finally {
    Qe = !1, mt(e), it = null;
  }
}
function Hn() {
  try {
    Rn();
  } catch (e) {
    Ie(e, it);
  }
}
let se = null;
function gt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (!(r.f & (ge | V)) && Be(r) && (se = [], qe(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null && r.ac === null ? Xt(r) : r.fn = null), se?.length > 0)) {
        ee.clear();
        for (const s of se)
          qe(s);
        se = [];
      }
    }
    se = null;
  }
}
function Pt(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      r & S ? Pt(
        /** @type {Derived} */
        n,
        t
      ) : r & (at | ue) && Lt(n, t) && (N(n, F), fe(
        /** @type {Effect} */
        n
      ));
    }
}
function Lt(e, t) {
  if (e.deps !== null) {
    for (const n of e.deps)
      if (t.includes(n) || n.f & S && Lt(
        /** @type {Derived} */
        n,
        t
      ))
        return !0;
  }
  return !1;
}
function fe(e) {
  for (var t = it = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (Qe && t === m && n & ue)
      return;
    if (n & (we | X)) {
      if (!(n & D)) return;
      t.f ^= D;
    }
  }
  Q.push(t);
}
function Yn(e, t, n) {
  const r = Se() ? ft : jt;
  if (t.length === 0) {
    n(e.map(r));
    return;
  }
  var s = k, l = (
    /** @type {Effect} */
    m
  ), a = Kn();
  Promise.all(t.map((f) => /* @__PURE__ */ Wn(f))).then((f) => {
    a();
    try {
      n([...e.map(r), ...f]);
    } catch (i) {
      l.f & ge || Ie(i, l);
    }
    s?.deactivate(), $e();
  }).catch((f) => {
    Ie(f, l);
  });
}
function Kn() {
  var e = m, t = g, n = E, r = k;
  return function() {
    te(e), K(t), Me(n), r?.activate();
  };
}
function $e() {
  te(null), K(null), Me(null);
}
// @__NO_SIDE_EFFECTS__
function ft(e) {
  var t = S | F, n = g !== null && g.f & S ? (
    /** @type {Derived} */
    g
  ) : null;
  return m === null || n !== null && n.f & j ? t |= j : m.f |= Ue, {
    ctx: E,
    deps: null,
    effects: null,
    equals: Ot,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      T
    ),
    wv: 0,
    parent: n ?? m,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function Wn(e, t) {
  let n = (
    /** @type {Effect | null} */
    m
  );
  n === null && Dn();
  var r = (
    /** @type {Boundary} */
    n.b
  ), s = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = Te(
    /** @type {V} */
    T
  ), a = !g, f = /* @__PURE__ */ new Map();
  return tr(() => {
    var i = Dt();
    s = i.promise;
    try {
      Promise.resolve(e()).then(i.resolve, i.reject).then($e);
    } catch (o) {
      i.reject(o), $e();
    }
    var u = (
      /** @type {Batch} */
      k
    ), c = r.is_pending();
    a && (r.update_pending_count(1), c || (u.increment(), f.get(u)?.reject(he), f.delete(u), f.set(u, i)));
    const h = (o, _ = void 0) => {
      if (c || u.activate(), _)
        _ !== he && (l.f |= ae, Pe(l, _));
      else {
        l.f & ae && (l.f ^= ae), Pe(l, o);
        for (const [v, p] of f) {
          if (f.delete(v), v === u) break;
          p.reject(he);
        }
      }
      a && (r.update_pending_count(-1), c || u.decrement());
    };
    i.promise.then(h, (o) => h(null, o || "unknown"));
  }), Yt(() => {
    for (const i of f.values())
      i.reject(he);
  }), new Promise((i) => {
    function u(c) {
      function h() {
        c === s ? i(l) : u(s);
      }
      c.then(h, h);
    }
    u(s);
  });
}
// @__NO_SIDE_EFFECTS__
function jt(e) {
  const t = /* @__PURE__ */ ft(e);
  return t.equals = Ft, t;
}
function qt(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      G(
        /** @type {Effect} */
        t[n]
      );
  }
}
function zn(e) {
  for (var t = e.parent; t !== null; ) {
    if (!(t.f & S))
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function ut(e) {
  var t, n = m;
  te(zn(e));
  try {
    qt(e), t = nn(e);
  } finally {
    te(n);
  }
  return t;
}
function Ut(e) {
  var t = ut(e);
  if (e.equals(t) || (e.v = t, e.wv = en()), !me)
    if (B !== null)
      B.set(e, e.v);
    else {
      var n = ($ || e.f & j) && e.deps !== null ? ne : D;
      N(e, n);
    }
}
const ee = /* @__PURE__ */ new Map();
function Te(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Ot,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function Z(e, t) {
  const n = Te(e);
  return sr(n), n;
}
// @__NO_SIDE_EFFECTS__
function be(e, t = !1, n = !0) {
  const r = Te(e);
  return t || (r.equals = Ft), Ne && n && E !== null && E.l !== null && (E.l.s ??= []).push(r), r;
}
function L(e, t, n = !1) {
  g !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!Y || g.f & pt) && Se() && g.f & (S | ue | at | pt) && !z?.includes(e) && Mn();
  let r = n ? Ee(t) : t;
  return Pe(e, r);
}
function Pe(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    me ? ee.set(e, t) : ee.set(e, n), e.v = t;
    var r = xe.ensure();
    r.capture(e, n), e.f & S && (e.f & F && ut(
      /** @type {Derived} */
      e
    ), N(e, e.f & j ? ne : D)), e.wv = en(), Bt(e, F), Se() && m !== null && m.f & D && !(m.f & (X | we)) && (P === null ? ar([e]) : P.push(e));
  }
  return t;
}
function Ke(e) {
  L(e, e.v + 1);
}
function Bt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Se(), s = n.length, l = 0; l < s; l++) {
      var a = n[l], f = a.f;
      if (!(!r && a === m)) {
        var i = (f & F) === 0;
        i && N(a, t), f & S ? Bt(
          /** @type {Derived} */
          a,
          ne
        ) : i && (f & ue && se !== null && se.push(
          /** @type {Effect} */
          a
        ), fe(
          /** @type {Effect} */
          a
        ));
      }
    }
}
function Ee(e) {
  if (typeof e != "object" || e === null || ke in e)
    return e;
  const t = At(e);
  if (t !== kn && t !== xn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = nt(e), s = /* @__PURE__ */ Z(0), l = ie, a = (f) => {
    if (ie === l)
      return f();
    var i = g, u = ie;
    K(null), bt(l);
    var c = f();
    return K(i), bt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ Z(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, i, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && On();
        var c = n.get(i);
        return c === void 0 ? c = a(() => {
          var h = /* @__PURE__ */ Z(u.value);
          return n.set(i, h), h;
        }) : L(c, u.value, !0), !0;
      },
      deleteProperty(f, i) {
        var u = n.get(i);
        if (u === void 0) {
          if (i in f) {
            const c = a(() => /* @__PURE__ */ Z(T));
            n.set(i, c), Ke(s);
          }
        } else
          L(u, T), Ke(s);
        return !0;
      },
      get(f, i, u) {
        if (i === ke)
          return e;
        var c = n.get(i), h = i in f;
        if (c === void 0 && (!h || Ye(f, i)?.writable) && (c = a(() => {
          var _ = Ee(h ? f[i] : T), v = /* @__PURE__ */ Z(_);
          return v;
        }), n.set(i, c)), c !== void 0) {
          var o = x(c);
          return o === T ? void 0 : o;
        }
        return Reflect.get(f, i, u);
      },
      getOwnPropertyDescriptor(f, i) {
        var u = Reflect.getOwnPropertyDescriptor(f, i);
        if (u && "value" in u) {
          var c = n.get(i);
          c && (u.value = x(c));
        } else if (u === void 0) {
          var h = n.get(i), o = h?.v;
          if (h !== void 0 && o !== T)
            return {
              enumerable: !0,
              configurable: !0,
              value: o,
              writable: !0
            };
        }
        return u;
      },
      has(f, i) {
        if (i === ke)
          return !0;
        var u = n.get(i), c = u !== void 0 && u.v !== T || Reflect.has(f, i);
        if (u !== void 0 || m !== null && (!c || Ye(f, i)?.writable)) {
          u === void 0 && (u = a(() => {
            var o = c ? Ee(f[i]) : T, _ = /* @__PURE__ */ Z(o);
            return _;
          }), n.set(i, u));
          var h = x(u);
          if (h === T)
            return !1;
        }
        return c;
      },
      set(f, i, u, c) {
        var h = n.get(i), o = i in f;
        if (r && i === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          h.v; _ += 1) {
            var v = n.get(_ + "");
            v !== void 0 ? L(v, T) : _ in f && (v = a(() => /* @__PURE__ */ Z(T)), n.set(_ + "", v));
          }
        if (h === void 0)
          (!o || Ye(f, i)?.writable) && (h = a(() => /* @__PURE__ */ Z(void 0)), L(h, Ee(u)), n.set(i, h));
        else {
          o = h.v !== T;
          var p = a(() => Ee(u));
          L(h, p);
        }
        var y = Reflect.getOwnPropertyDescriptor(f, i);
        if (y?.set && y.set.call(c, u), !o) {
          if (r && typeof i == "string") {
            var C = (
              /** @type {Source<number>} */
              n.get("length")
            ), d = Number(i);
            Number.isInteger(d) && d >= C.v && L(C, d + 1);
          }
          Ke(s);
        }
        return !0;
      },
      ownKeys(f) {
        x(s);
        var i = Reflect.ownKeys(f).filter((h) => {
          var o = n.get(h);
          return o === void 0 || o.v !== T;
        });
        for (var [u, c] of n)
          c.v !== T && !(u in f) && i.push(u);
        return i;
      },
      setPrototypeOf() {
        Fn();
      }
    }
  );
}
var Gn, Xn, Zn;
function Ae(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function ot(e) {
  return Xn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Ce(e) {
  return Zn.call(e);
}
function I(e, t) {
  return /* @__PURE__ */ ot(e);
}
function Jn(e, t = !1) {
  {
    var n = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ ot(
        /** @type {Node} */
        e
      )
    );
    return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Ce(n) : n;
  }
}
function J(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Ce(r);
  return r;
}
function Qn(e) {
  e.textContent = "";
}
function Vt() {
  return !1;
}
function ct(e) {
  var t = g, n = m;
  K(null), te(null);
  try {
    return e();
  } finally {
    K(t), te(n);
  }
}
function Ht(e) {
  m === null && g === null && Cn(), g !== null && g.f & j && m === null && Sn(), me && Nn();
}
function $n(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function oe(e, t, n, r = !0) {
  var s = m;
  s !== null && s.f & V && (e |= V);
  var l = {
    ctx: E,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | F,
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
      qe(l), l.f |= lt;
    } catch (i) {
      throw G(l), i;
    }
  else t !== null && fe(l);
  if (r) {
    var a = l;
    if (n && a.deps === null && a.teardown === null && a.nodes_start === null && a.first === a.last && // either `null`, or a singular child
    !(a.f & Ue) && (a = a.first), a !== null && (a.parent = s, s !== null && $n(a, s), g !== null && g.f & S && !(e & we))) {
      var f = (
        /** @type {Derived} */
        g
      );
      (f.effects ??= []).push(a);
    }
  }
  return l;
}
function Yt(e) {
  const t = oe(rt, null, !1);
  return N(t, D), t.teardown = e, t;
}
function et(e) {
  Ht();
  var t = (
    /** @type {Effect} */
    m.f
  ), n = !g && (t & X) !== 0 && (t & lt) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      E
    );
    (r.e ??= []).push(e);
  } else
    return Kt(e);
}
function Kt(e) {
  return oe(Nt | Ct, e, !1);
}
function er(e) {
  return Ht(), oe(rt | Ct, e, !0);
}
function tr(e) {
  return oe(at | Ue, e, !0);
}
function We(e, t = [], n = []) {
  Yn(t, n, (r) => {
    oe(rt, () => e(...r.map(x)), !0);
  });
}
function Wt(e, t = 0) {
  var n = oe(ue | t, e, !0);
  return n;
}
function Le(e, t = !0) {
  return oe(X | Ue, e, !0, t);
}
function zt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = me, r = g;
    yt(!0), K(null);
    try {
      t.call(null);
    } finally {
      yt(n), K(r);
    }
  }
}
function Gt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const s = n.ac;
    s !== null && ct(() => {
      s.abort(he);
    });
    var r = n.next;
    n.f & we ? n.parent = null : G(n, t), n = r;
  }
}
function nr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    t.f & X || G(t), t = n;
  }
}
function G(e, t = !0) {
  var n = !1;
  (t || e.f & An) && e.nodes_start !== null && e.nodes_end !== null && (rr(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), n = !0), Gt(e, t && !n), je(e, 0), N(e, ge);
  var r = e.transitions;
  if (r !== null)
    for (const l of r)
      l.stop();
  zt(e);
  var s = e.parent;
  s !== null && s.first !== null && Xt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function rr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ce(e)
    );
    e.remove(), e = n;
  }
}
function Xt(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Zt(e, t, n = !0) {
  var r = [];
  vt(e, r, !0), Jt(r, () => {
    n && G(e), t && t();
  });
}
function Jt(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var s of e)
      s.out(r);
  } else
    t();
}
function vt(e, t, n) {
  if (!(e.f & V)) {
    if (e.f ^= V, e.transitions !== null)
      for (const a of e.transitions)
        (a.is_global || n) && t.push(a);
    for (var r = e.first; r !== null; ) {
      var s = r.next, l = (r.f & st) !== 0 || (r.f & X) !== 0;
      vt(r, t, l ? n : !1), r = s;
    }
  }
}
function _t(e) {
  Qt(e, !0);
}
function Qt(e, t) {
  if (e.f & V) {
    e.f ^= V, e.f & D || (N(e, F), fe(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, s = (n.f & st) !== 0 || (n.f & X) !== 0;
      Qt(n, s ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const l of e.transitions)
        (l.is_global || t) && l.in();
  }
}
function lr(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var s = n === r ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ce(n)
    );
    t.append(n), n = s;
  }
}
let pe = !1;
function mt(e) {
  pe = e;
}
let me = !1;
function yt(e) {
  me = e;
}
let g = null, Y = !1;
function K(e) {
  g = e;
}
let m = null;
function te(e) {
  m = e;
}
let z = null;
function sr(e) {
  g !== null && (z === null ? z = [e] : z.push(e));
}
let A = null, O = 0, P = null;
function ar(e) {
  P = e;
}
let $t = 1, De = 0, ie = De;
function bt(e) {
  ie = e;
}
let $ = !1;
function en() {
  return ++$t;
}
function Be(e) {
  var t = e.f;
  if (t & F)
    return !0;
  if (t & ne) {
    var n = e.deps, r = (t & j) !== 0;
    if (n !== null) {
      var s, l, a = (t & Fe) !== 0, f = r && m !== null && !$, i = n.length;
      if ((a || f) && (m === null || !(m.f & ge))) {
        var u = (
          /** @type {Derived} */
          e
        ), c = u.parent;
        for (s = 0; s < i; s++)
          l = n[s], (a || !l?.reactions?.includes(u)) && (l.reactions ??= []).push(u);
        a && (u.f ^= Fe), f && c !== null && !(c.f & j) && (u.f ^= j);
      }
      for (s = 0; s < i; s++)
        if (l = n[s], Be(
          /** @type {Derived} */
          l
        ) && Ut(
          /** @type {Derived} */
          l
        ), l.wv > e.wv)
          return !0;
    }
    (!r || m !== null && !$) && N(e, D);
  }
  return !1;
}
function tn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !z?.includes(e))
    for (var s = 0; s < r.length; s++) {
      var l = r[s];
      l.f & S ? tn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? N(l, F) : l.f & D && N(l, ne), fe(
        /** @type {Effect} */
        l
      ));
    }
}
function nn(e) {
  var t = A, n = O, r = P, s = g, l = $, a = z, f = E, i = Y, u = ie, c = e.f;
  A = /** @type {null | Value[]} */
  null, O = 0, P = null, $ = (c & j) !== 0 && (Y || !pe || g === null), g = c & (X | we) ? null : e, z = null, Me(e.ctx), Y = !1, ie = ++De, e.ac !== null && (ct(() => {
    e.ac.abort(he);
  }), e.ac = null);
  try {
    e.f |= Je;
    var h = (
      /** @type {Function} */
      e.fn
    ), o = h(), _ = e.deps;
    if (A !== null) {
      var v;
      if (je(e, O), _ !== null && O > 0)
        for (_.length = O + A.length, v = 0; v < A.length; v++)
          _[O + v] = A[v];
      else
        e.deps = _ = A;
      if (!$ || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      c & S && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (v = O; v < _.length; v++)
          (_[v].reactions ??= []).push(e);
    } else _ !== null && O < _.length && (je(e, O), _.length = O);
    if (Se() && P !== null && !Y && _ !== null && !(e.f & (S | ne | F)))
      for (v = 0; v < /** @type {Source[]} */
      P.length; v++)
        tn(
          P[v],
          /** @type {Effect} */
          e
        );
    return s !== null && s !== e && (De++, P !== null && (r === null ? r = P : r.push(.../** @type {Source[]} */
    P))), e.f & ae && (e.f ^= ae), o;
  } catch (p) {
    return Bn(p);
  } finally {
    e.f ^= Je, A = t, O = n, P = r, g = s, $ = l, z = a, Me(f), Y = i, ie = u;
  }
}
function ir(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = bn.call(n, e);
    if (r !== -1) {
      var s = n.length - 1;
      s === 0 ? n = t.reactions = null : (n[r] = n[s], n.pop());
    }
  }
  n === null && t.f & S && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (A === null || !A.includes(t)) && (N(t, ne), t.f & (j | Fe) || (t.f ^= Fe), qt(
    /** @type {Derived} **/
    t
  ), je(
    /** @type {Derived} **/
    t,
    0
  ));
}
function je(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ir(e, n[r]);
}
function qe(e) {
  var t = e.f;
  if (!(t & ge)) {
    N(e, D);
    var n = m, r = pe;
    m = e, pe = !0;
    try {
      t & ue ? nr(e) : Gt(e), zt(e);
      var s = nn(e);
      e.teardown = typeof s == "function" ? s : null, e.wv = $t;
      var l;
      xt && dn && e.f & F && e.deps;
    } finally {
      pe = r, m = n;
    }
  }
}
function x(e) {
  var t = e.f, n = (t & S) !== 0;
  if (g !== null && !Y) {
    var r = m !== null && (m.f & ge) !== 0;
    if (!r && !z?.includes(e)) {
      var s = g.deps;
      if (g.f & Je)
        e.rv < De && (e.rv = De, A === null && s !== null && s[O] === e ? O++ : A === null ? A = [e] : (!$ || !A.includes(e)) && A.push(e));
      else {
        (g.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [g] : l.includes(g) || l.push(g);
      }
    }
  } else if (n && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var a = (
      /** @type {Derived} */
      e
    ), f = a.parent;
    f !== null && !(f.f & j) && (a.f ^= j);
  }
  if (me) {
    if (ee.has(e))
      return ee.get(e);
    if (n) {
      a = /** @type {Derived} */
      e;
      var i = a.v;
      return (!(a.f & D) && a.reactions !== null || rn(a)) && (i = ut(a)), ee.set(a, i), i;
    }
  } else if (n) {
    if (a = /** @type {Derived} */
    e, B?.has(a))
      return B.get(a);
    Be(a) && Ut(a);
  }
  if (B?.has(e))
    return B.get(e);
  if (e.f & ae)
    throw e.v;
  return e.v;
}
function rn(e) {
  if (e.v === T) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ee.has(t) || t.f & S && rn(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function ht(e) {
  var t = Y;
  try {
    return Y = !0, e();
  } finally {
    Y = t;
  }
}
const fr = -7169;
function N(e, t) {
  e.f = e.f & fr | t;
}
function ur(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (ke in e)
      tt(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && ke in n && tt(n);
      }
  }
}
function tt(e, t = /* @__PURE__ */ new Set()) {
  if (typeof e == "object" && e !== null && // We don't want to traverse DOM elements
  !(e instanceof EventTarget) && !t.has(e)) {
    t.add(e), e instanceof Date && e.getTime();
    for (let r in e)
      try {
        tt(e[r], t);
      } catch {
      }
    const n = At(e);
    if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
      const r = En(n);
      for (let s in r) {
        const l = r[s].get;
        if (l)
          try {
            l.call(e);
          } catch {
          }
      }
    }
  }
}
function or(e, t, n, r = {}) {
  function s(l) {
    if (r.capture || vr.call(t, l), !l.cancelBubble)
      return ct(() => n?.call(this, l));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Mt(() => {
    t.addEventListener(e, s, r);
  }) : t.addEventListener(e, s, r), s;
}
function cr(e, t, n, r, s) {
  var l = { capture: r, passive: s }, a = or(e, t, n, l);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && Yt(() => {
    t.removeEventListener(e, a, l);
  });
}
let Et = null;
function vr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, s = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    s[0] || e.target
  );
  Et = e;
  var a = 0, f = Et === e && e.__root;
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
    i <= u && (a = i);
  }
  if (l = /** @type {Element} */
  s[a] || e.target, l !== t) {
    Xe(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = g, h = m;
    K(null), te(null);
    try {
      for (var o, _ = []; l !== null; ) {
        var v = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var p = l["__" + r];
          if (p != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l))
            if (nt(p)) {
              var [y, ...C] = p;
              y.apply(l, [e, ...C]);
            } else
              p.call(l, e);
        } catch (d) {
          o ? _.push(d) : o = d;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        l = v;
      }
      if (o) {
        for (let d of _)
          queueMicrotask(() => {
            throw d;
          });
        throw o;
      }
    } finally {
      e.__root = t, delete e.currentTarget, K(c), te(h);
    }
  }
}
function _r(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function ln(e, t) {
  var n = (
    /** @type {Effect} */
    m
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function ye(e, t) {
  var n = (t & yn) !== 0, r, s = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = _r(s ? e : "<!>" + e), r = /** @type {Node} */
    /* @__PURE__ */ ot(r));
    var l = (
      /** @type {TemplateNode} */
      n || Gn ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return ln(l, l), l;
  };
}
function hr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Ae();
  return e.append(t, n), ln(t, n), e;
}
function le(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function _e(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = n + "");
}
class dr {
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
        _t(r);
      else {
        var s = this.#e.get(n);
        s && (this.#t.set(n, s.effect), this.#e.delete(n), s.fragment.lastChild.remove(), this.anchor.before(s.fragment), r = s.effect);
      }
      for (const [l, a] of this.#n) {
        if (this.#n.delete(l), l === t)
          break;
        const f = this.#e.get(a);
        f && (G(f.effect), this.#e.delete(a));
      }
      for (const [l, a] of this.#t) {
        if (l === n) continue;
        const f = () => {
          if (Array.from(this.#n.values()).includes(l)) {
            var u = document.createDocumentFragment();
            lr(a, u), u.append(Ae()), this.#e.set(l, { effect: a, fragment: u });
          } else
            G(a);
          this.#t.delete(l);
        };
        this.#l || !r ? Zt(a, f, !1) : f();
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
    ), s = Vt();
    if (n && !this.#t.has(t) && !this.#e.has(t))
      if (s) {
        var l = document.createDocumentFragment(), a = Ae();
        l.append(a), this.#e.set(t, {
          effect: Le(() => n(a)),
          fragment: l
        });
      } else
        this.#t.set(
          t,
          Le(() => n(this.anchor))
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
function sn(e) {
  E === null && Rt(), Ne && E.l !== null ? wr(E).m.push(e) : et(() => {
    const t = ht(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function pr(e) {
  E === null && Rt(), sn(() => () => ht(e));
}
function wr(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ??= { a: [], b: [], m: [] };
}
function ze(e, t, n = !1) {
  var r = new dr(e), s = n ? st : 0;
  function l(a, f) {
    r.ensure(a, f);
  }
  Wt(() => {
    var a = !1;
    t((f, i = !0) => {
      a = !0, l(i, f);
    }), a || l(!1, null);
  }, s);
}
function gr(e, t) {
  return t;
}
function mr(e, t, n) {
  for (var r = e.items, s = [], l = t.length, a = 0; a < l; a++)
    vt(t[a].e, s, !0);
  var f = l > 0 && s.length === 0 && n !== null;
  if (f) {
    var i = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    Qn(i), i.append(
      /** @type {Element} */
      n
    ), r.clear(), H(e, t[0].prev, t[l - 1].next);
  }
  Jt(s, () => {
    for (var u = 0; u < l; u++) {
      var c = t[u];
      f || (r.delete(c.k), H(e, c.prev, c.next)), G(c.e, !f);
    }
  });
}
function yr(e, t, n, r, s, l = null) {
  var a = e, f = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var i = (
      /** @type {Element} */
      e
    );
    a = i.appendChild(Ae());
  }
  var u = null, c = !1, h = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ jt(() => {
    var y = n();
    return nt(y) ? y : y == null ? [] : Tt(y);
  }), _, v;
  function p() {
    br(
      v,
      _,
      f,
      h,
      a,
      s,
      t,
      r,
      n
    ), l !== null && (_.length === 0 ? u ? _t(u) : u = Le(() => l(a)) : u !== null && Zt(u, () => {
      u = null;
    }));
  }
  Wt(() => {
    v ??= /** @type {Effect} */
    m, _ = /** @type {V[]} */
    x(o);
    var y = _.length;
    if (!(c && y === 0)) {
      c = y === 0;
      var C, d, w, b;
      if (Vt()) {
        var R = /* @__PURE__ */ new Set(), W = (
          /** @type {Batch} */
          k
        );
        for (d = 0; d < y; d += 1) {
          w = _[d], b = r(w, d);
          var q = f.items.get(b) ?? h.get(b);
          q ? an(q, w, d) : (C = fn(
            null,
            f,
            null,
            null,
            w,
            b,
            d,
            s,
            t,
            n,
            !0
          ), h.set(b, C)), R.add(b);
        }
        for (const [U, M] of f.items)
          R.has(U) || W.skipped_effects.add(M.e);
        W.add_callback(p);
      } else
        p();
      x(o);
    }
  });
}
function br(e, t, n, r, s, l, a, f, i) {
  var u = t.length, c = n.items, h = n.first, o = h, _, v = null, p = [], y = [], C, d, w, b;
  for (b = 0; b < u; b += 1) {
    if (C = t[b], d = f(C, b), w = c.get(d), w === void 0) {
      var R = r.get(d);
      if (R !== void 0) {
        r.delete(d), c.set(d, R);
        var W = v ? v.next : o;
        H(n, v, R), H(n, R, W), Ge(R, W, s), v = R;
      } else {
        var q = o ? (
          /** @type {TemplateNode} */
          o.e.nodes_start
        ) : s;
        v = fn(
          q,
          n,
          v,
          v === null ? n.first : v.next,
          C,
          d,
          b,
          l,
          a,
          i
        );
      }
      c.set(d, v), p = [], y = [], o = v.next;
      continue;
    }
    if (an(w, C, b), w.e.f & V && _t(w.e), w !== o) {
      if (_ !== void 0 && _.has(w)) {
        if (p.length < y.length) {
          var U = y[0], M;
          v = U.prev;
          var re = p[0], ce = p[p.length - 1];
          for (M = 0; M < p.length; M += 1)
            Ge(p[M], U, s);
          for (M = 0; M < y.length; M += 1)
            _.delete(y[M]);
          H(n, re.prev, ce.next), H(n, v, re), H(n, ce, U), o = U, v = ce, b -= 1, p = [], y = [];
        } else
          _.delete(w), Ge(w, o, s), H(n, w.prev, w.next), H(n, w, v === null ? n.first : v.next), H(n, v, w), v = w;
        continue;
      }
      for (p = [], y = []; o !== null && o.k !== d; )
        o.e.f & V || (_ ??= /* @__PURE__ */ new Set()).add(o), y.push(o), o = o.next;
      if (o === null)
        continue;
      w = o;
    }
    p.push(w), v = w, o = w.next;
  }
  if (o !== null || _ !== void 0) {
    for (var ve = _ === void 0 ? [] : Tt(_); o !== null; )
      o.e.f & V || ve.push(o), o = o.next;
    var Re = ve.length;
    if (Re > 0) {
      var Ve = u === 0 ? s : null;
      mr(n, ve, Ve);
    }
  }
  e.first = n.first && n.first.e, e.last = v && v.e;
  for (var He of r.values())
    G(He.e);
  r.clear();
}
function an(e, t, n, r) {
  Pe(e.v, t), e.i = n;
}
function fn(e, t, n, r, s, l, a, f, i, u, c) {
  var h = (i & wn) !== 0, o = (i & mn) === 0, _ = h ? o ? /* @__PURE__ */ be(s, !1, !1) : Te(s) : s, v = i & gn ? Te(a) : a, p = {
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
      var y = document.createDocumentFragment();
      y.append(e = Ae());
    }
    return p.e = Le(() => f(
      /** @type {Node} */
      e,
      _,
      v,
      u
    ), In), p.e.prev = n && n.e, p.e.next = r && r.e, n === null ? c || (t.first = p) : (n.next = p, n.e.next = p.e), r !== null && (r.prev = p, r.e.prev = p.e), p;
  } finally {
  }
}
function Ge(e, t, n) {
  for (var r = e.next ? (
    /** @type {TemplateNode} */
    e.next.e.nodes_start
  ) : n, s = t ? (
    /** @type {TemplateNode} */
    t.e.nodes_start
  ) : n, l = (
    /** @type {TemplateNode} */
    e.e.nodes_start
  ); l !== null && l !== r; ) {
    var a = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Ce(l)
    );
    s.before(l), l = a;
  }
}
function H(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function Er(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    E
  ), n = t.l.u;
  if (!n) return;
  let r = () => ur(t.s);
  if (e) {
    let s = 0, l = (
      /** @type {Record<string, any>} */
      {}
    );
    const a = /* @__PURE__ */ ft(() => {
      let f = !1;
      const i = t.s;
      for (const u in i)
        i[u] !== l[u] && (l[u] = i[u], f = !0);
      return f && s++, s;
    });
    r = () => x(a);
  }
  n.b.length && er(() => {
    kt(t, r), Ze(n.b);
  }), et(() => {
    const s = ht(() => n.m.map(Tn));
    return () => {
      for (const l of s)
        typeof l == "function" && l();
    };
  }), n.a.length && et(() => {
    kt(t, r), Ze(n.a);
  });
}
function kt(e, t) {
  if (e.l.s)
    for (const n of e.l.s) x(n);
  t();
}
var kr = /* @__PURE__ */ ye('<span class="loading-indicator svelte-1klxta8">Aktualisiere...</span>'), xr = /* @__PURE__ */ ye('<div class="alert alert-error svelte-1klxta8"><span class="svelte-1klxta8">❌</span> <p class="svelte-1klxta8"> </p> <button class="btn svelte-1klxta8">Erneut versuchen</button></div>'), Tr = /* @__PURE__ */ ye('<div class="empty-state svelte-1klxta8"><div class="svelte-1klxta8">📰</div> <p class="svelte-1klxta8">Keine News verfügbar</p></div>'), Ar = /* @__PURE__ */ ye('<div class="news-card svelte-1klxta8"><div class="news-header svelte-1klxta8"><span class="news-source svelte-1klxta8"> </span> <span class="news-time svelte-1klxta8"> </span></div> <h3 class="svelte-1klxta8"> </h3> <p class="svelte-1klxta8"> </p></div>'), Dr = /* @__PURE__ */ ye('<div class="news-grid svelte-1klxta8"></div>'), Nr = /* @__PURE__ */ ye('<div class="news-container svelte-1klxta8"><header class="svelte-1klxta8"><h1 class="svelte-1klxta8">📰 News Flash</h1> <p class="svelte-1klxta8">Aktuelle Nachrichten aus Ulm - Live aktualisiert</p> <div class="status svelte-1klxta8"><span class="svelte-1klxta8"> </span> <!></div></header> <!></div>');
function Cr(e, t) {
  Ln(t, !1);
  let n = /* @__PURE__ */ be([]), r = /* @__PURE__ */ be(!0), s = /* @__PURE__ */ be(""), l = /* @__PURE__ */ be(/* @__PURE__ */ new Date()), a;
  sn(async () => {
    await f(), a = window.setInterval(f, 3e4);
  }), pr(() => {
    a && clearInterval(a);
  });
  async function f() {
    try {
      const w = await (await fetch("/api/news")).json();
      L(n, w.data || []), L(l, /* @__PURE__ */ new Date()), L(r, !1);
    } catch (d) {
      L(s, d.message), L(r, !1);
    }
  }
  Er();
  var i = Nr(), u = I(i), c = J(I(u), 4), h = I(c), o = I(h), _ = J(h, 2);
  {
    var v = (d) => {
      var w = kr();
      le(d, w);
    };
    ze(_, (d) => {
      x(r) && d(v);
    });
  }
  var p = J(u, 2);
  {
    var y = (d) => {
      var w = xr(), b = J(I(w), 2), R = I(b), W = J(b, 2);
      We(() => _e(R, x(s))), cr("click", W, f), le(d, w);
    }, C = (d) => {
      var w = hr(), b = Jn(w);
      {
        var R = (q) => {
          var U = Tr();
          le(q, U);
        }, W = (q) => {
          var U = Dr();
          yr(U, 5, () => x(n), gr, (M, re) => {
            var ce = Ar(), ve = I(ce), Re = I(ve), Ve = I(Re), He = J(Re, 2), un = I(He), dt = J(ve, 2), on = I(dt), cn = J(dt, 2), vn = I(cn);
            We(
              (_n) => {
                _e(Ve, x(re).source), _e(un, _n), _e(on, x(re).title), _e(vn, x(re).summary);
              },
              [
                () => new Date(x(re).timestamp).toLocaleString("de-DE")
              ]
            ), le(M, ce);
          }), le(q, U);
        };
        ze(
          b,
          (q) => {
            x(n).length === 0 ? q(R) : q(W, !1);
          },
          !0
        );
      }
      le(d, w);
    };
    ze(p, (d) => {
      x(s) ? d(y) : d(C, !1);
    });
  }
  We((d) => _e(o, `Letztes Update: ${d ?? ""}`), [() => x(l).toLocaleTimeString("de-DE")]), le(e, i), jn();
}
export {
  Cr as default
};
