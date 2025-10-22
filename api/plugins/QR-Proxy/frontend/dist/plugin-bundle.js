const wn = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add(wn);
let Re = !1, yn = !1;
function gn() {
  Re = !0;
}
gn();
const mn = 1, bn = 2, En = 16, kn = 2, R = Symbol(), St = !1;
var it = Array.isArray, xn = Array.prototype.indexOf, At = Array.from, et = Object.defineProperty, $e = Object.getOwnPropertyDescriptor, Tn = Object.getOwnPropertyDescriptors, Rn = Object.prototype, Cn = Array.prototype, Nt = Object.getPrototypeOf;
function Sn(e) {
  return e();
}
function tt(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Dt() {
  var e, t, n = new Promise((r, a) => {
    e = r, t = a;
  });
  return { promise: n, resolve: e, reject: t };
}
const N = 2, Ot = 4, Ue = 8, oe = 16, z = 32, pe = 64, Mt = 128, j = 256, Oe = 512, S = 1024, I = 2048, te = 4096, B = 8192, we = 16384, ft = 32768, ut = 65536, wt = 1 << 17, An = 1 << 18, Qe = 1 << 19, Ft = 1 << 20, nt = 1 << 21, ot = 1 << 22, ie = 1 << 23, be = Symbol("$state"), de = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
function Nn(e) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
function Dn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function On(e) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function Mn() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Fn(e) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Pn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function In() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function qn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ln() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let jn = !1;
function Pt(e) {
  return e === this.v;
}
function Un(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function It(e) {
  return !Un(e, this.v);
}
let x = null;
function Me(e) {
  x = e;
}
function Qn(e, t = !1, n) {
  x = {
    p: x,
    c: null,
    e: null,
    s: e,
    x: null,
    l: Re && !t ? { s: null, u: null, $: [] } : null
  };
}
function Vn(e) {
  var t = (
    /** @type {ComponentContext} */
    x
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Gt(r);
  }
  return x = t.p, /** @type {T} */
  {};
}
function Ce() {
  return !Re || x !== null && x.l === null;
}
let se = [];
function qt() {
  var e = se;
  se = [], tt(e);
}
function Lt(e) {
  if (se.length === 0 && !Ee) {
    var t = se;
    queueMicrotask(() => {
      t === se && qt();
    });
  }
  se.push(e);
}
function Bn() {
  for (; se.length > 0; )
    qt();
}
const Hn = /* @__PURE__ */ new WeakMap();
function Yn(e) {
  var t = w;
  if (t === null)
    return p.f |= ie, e;
  if (t.f & ft)
    Fe(e, t);
  else {
    if (!(t.f & Mt))
      throw !t.parent && e instanceof Error && jt(e), e;
    t.b.error(e);
  }
}
function Fe(e, t) {
  for (; t !== null; ) {
    if (t.f & Mt)
      try {
        t.b.error(e);
        return;
      } catch (n) {
        e = n;
      }
    t = t.parent;
  }
  throw e instanceof Error && jt(e), e;
}
function jt(e) {
  const t = Hn.get(e);
  t && (et(e, "message", {
    value: t.message
  }), et(e, "stack", {
    value: t.stack
  }));
}
const Ae = /* @__PURE__ */ new Set();
let E = null, De = null, V = null, yt = /* @__PURE__ */ new Set(), Y = [], Ve = null, rt = !1, Ee = !1;
class ke {
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
    Y = [], De = null, this.apply();
    for (const l of t)
      this.#o(l);
    if (this.#e === 0) {
      var n = V;
      this.#c();
      var r = this.#r, a = this.#a;
      this.#r = [], this.#a = [], this.#s = [], De = this, E = null, V = n, gt(r), gt(a), De = null, this.#l?.resolve();
    } else
      this.#i(this.#r), this.#i(this.#a), this.#i(this.#s);
    V = null;
  }
  /**
   * Traverse the effect tree, executing effects or stashing
   * them for later execution as appropriate
   * @param {Effect} root
   */
  #o(t) {
    t.f ^= S;
    for (var n = t.first; n !== null; ) {
      var r = n.f, a = (r & (z | pe)) !== 0, l = a && (r & S) !== 0, s = l || (r & B) !== 0 || this.skipped_effects.has(n);
      if (!s && n.fn !== null) {
        a ? n.f ^= S : r & Ot ? this.#a.push(n) : Ye(n) && (n.f & oe && this.#s.push(n), je(n));
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
      (n.f & I ? this.#f : this.#u).push(n), A(n, S);
    t.length = 0;
  }
  /**
   * Associate a change to a given source with the current
   * batch, noting its previous and current values
   * @param {Source} source
   * @param {any} value
   */
  capture(t, n) {
    this.#n.has(t) || this.#n.set(t, n), this.current.set(t, t.v), V?.set(t, t.v);
  }
  activate() {
    E = this;
  }
  deactivate() {
    E = null, V = null;
  }
  flush() {
    if (Y.length > 0) {
      if (this.activate(), Ut(), E !== null && E !== this)
        return;
    } else this.#e === 0 && this.#c();
    this.deactivate();
    for (const t of yt)
      if (yt.delete(t), t(), E !== null)
        break;
  }
  /**
   * Append and remove branches to/from the DOM
   */
  #c() {
    for (const t of this.#t)
      t();
    if (this.#t.clear(), Ae.size > 1) {
      this.#n.clear();
      let t = !0;
      for (const n of Ae) {
        if (n === this) {
          t = !1;
          continue;
        }
        const r = [];
        for (const [l, s] of this.current) {
          if (n.current.has(l))
            if (t && s !== n.current.get(l))
              n.current.set(l, s);
            else
              continue;
          r.push(l);
        }
        if (r.length === 0)
          continue;
        const a = [...n.current.keys()].filter((l) => !this.current.has(l));
        if (a.length > 0) {
          for (const l of r)
            Qt(l, a);
          if (Y.length > 0) {
            E = n, n.apply();
            for (const l of Y)
              n.#o(l);
            Y = [], n.deactivate();
          }
        }
      }
      E = null;
    }
    Ae.delete(this);
  }
  increment() {
    this.#e += 1;
  }
  decrement() {
    this.#e -= 1;
    for (const t of this.#f)
      A(t, I), ue(t);
    for (const t of this.#u)
      A(t, te), ue(t);
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
    if (E === null) {
      const t = E = new ke();
      Ae.add(E), Ee || ke.enqueue(() => {
        E === t && t.flush();
      });
    }
    return E;
  }
  /** @param {() => void} task */
  static enqueue(t) {
    Lt(t);
  }
  apply() {
  }
}
function Wn(e) {
  var t = Ee;
  Ee = !0;
  try {
    for (var n; ; ) {
      if (Bn(), Y.length === 0 && (E?.flush(), Y.length === 0))
        return Ve = null, /** @type {T} */
        n;
      Ut();
    }
  } finally {
    Ee = t;
  }
}
function Ut() {
  var e = he;
  rt = !0;
  try {
    var t = 0;
    for (Et(!0); Y.length > 0; ) {
      var n = ke.ensure();
      if (t++ > 1e3) {
        var r, a;
        Kn();
      }
      n.process(Y), X.clear();
    }
  } finally {
    rt = !1, Et(e), Ve = null;
  }
}
function Kn() {
  try {
    Pn();
  } catch (e) {
    Fe(e, Ve);
  }
}
let ae = null;
function gt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if (!(r.f & (we | B)) && Ye(r) && (ae = [], je(r), r.deps === null && r.first === null && r.nodes_start === null && (r.teardown === null && r.ac === null ? tn(r) : r.fn = null), ae?.length > 0)) {
        X.clear();
        for (const a of ae)
          je(a);
        ae = [];
      }
    }
    ae = null;
  }
}
function Qt(e, t) {
  if (e.reactions !== null)
    for (const n of e.reactions) {
      const r = n.f;
      r & N ? Qt(
        /** @type {Derived} */
        n,
        t
      ) : r & (ot | oe) && Vt(n, t) && (A(n, I), ue(
        /** @type {Effect} */
        n
      ));
    }
}
function Vt(e, t) {
  if (e.deps !== null) {
    for (const n of e.deps)
      if (t.includes(n) || n.f & N && Vt(
        /** @type {Derived} */
        n,
        t
      ))
        return !0;
  }
  return !1;
}
function ue(e) {
  for (var t = Ve = e; t.parent !== null; ) {
    t = t.parent;
    var n = t.f;
    if (rt && t === w && n & oe)
      return;
    if (n & (pe | z)) {
      if (!(n & S)) return;
      t.f ^= S;
    }
  }
  Y.push(t);
}
function Zn(e, t, n) {
  const r = Ce() ? ct : Bt;
  if (t.length === 0) {
    n(e.map(r));
    return;
  }
  var a = E, l = (
    /** @type {Effect} */
    w
  ), s = $n();
  Promise.all(t.map((f) => /* @__PURE__ */ zn(f))).then((f) => {
    s();
    try {
      n([...e.map(r), ...f]);
    } catch (i) {
      l.f & we || Fe(i, l);
    }
    a?.deactivate(), lt();
  }).catch((f) => {
    Fe(f, l);
  });
}
function $n() {
  var e = w, t = p, n = x, r = E;
  return function() {
    ee(e), K(t), Me(n), r?.activate();
  };
}
function lt() {
  ee(null), K(null), Me(null);
}
// @__NO_SIDE_EFFECTS__
function ct(e) {
  var t = N | I, n = p !== null && p.f & N ? (
    /** @type {Derived} */
    p
  ) : null;
  return w === null || n !== null && n.f & j ? t |= j : w.f |= Qe, {
    ctx: x,
    deps: null,
    effects: null,
    equals: Pt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      R
    ),
    wv: 0,
    parent: n ?? w,
    ac: null
  };
}
// @__NO_SIDE_EFFECTS__
function zn(e, t) {
  let n = (
    /** @type {Effect | null} */
    w
  );
  n === null && Dn();
  var r = (
    /** @type {Boundary} */
    n.b
  ), a = (
    /** @type {Promise<V>} */
    /** @type {unknown} */
    void 0
  ), l = xe(
    /** @type {V} */
    R
  ), s = !p, f = /* @__PURE__ */ new Map();
  return sr(() => {
    var i = Dt();
    a = i.promise;
    try {
      Promise.resolve(e()).then(i.resolve, i.reject).then(lt);
    } catch (o) {
      i.reject(o), lt();
    }
    var u = (
      /** @type {Batch} */
      E
    ), c = r.is_pending();
    s && (r.update_pending_count(1), c || (u.increment(), f.get(u)?.reject(de), f.delete(u), f.set(u, i)));
    const d = (o, _ = void 0) => {
      if (c || u.activate(), _)
        _ !== de && (l.f |= ie, Pe(l, _));
      else {
        l.f & ie && (l.f ^= ie), Pe(l, o);
        for (const [v, h] of f) {
          if (f.delete(v), v === u) break;
          h.reject(de);
        }
      }
      s && (r.update_pending_count(-1), c || u.decrement());
    };
    i.promise.then(d, (o) => d(null, o || "unknown"));
  }), zt(() => {
    for (const i of f.values())
      i.reject(de);
  }), new Promise((i) => {
    function u(c) {
      function d() {
        c === a ? i(l) : u(a);
      }
      c.then(d, d);
    }
    u(a);
  });
}
// @__NO_SIDE_EFFECTS__
function Bt(e) {
  const t = /* @__PURE__ */ ct(e);
  return t.equals = It, t;
}
function Ht(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      $(
        /** @type {Effect} */
        t[n]
      );
  }
}
function Gn(e) {
  for (var t = e.parent; t !== null; ) {
    if (!(t.f & N))
      return (
        /** @type {Effect} */
        t
      );
    t = t.parent;
  }
  return null;
}
function vt(e) {
  var t, n = w;
  ee(Gn(e));
  try {
    Ht(e), t = un(e);
  } finally {
    ee(n);
  }
  return t;
}
function Yt(e) {
  var t = vt(e);
  if (e.equals(t) || (e.v = t, e.wv = sn()), !ye)
    if (V !== null)
      V.set(e, e.v);
    else {
      var n = (J || e.f & j) && e.deps !== null ? te : S;
      A(e, n);
    }
}
const X = /* @__PURE__ */ new Map();
function xe(e, t) {
  var n = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: e,
    reactions: null,
    equals: Pt,
    rv: 0,
    wv: 0
  };
  return n;
}
// @__NO_SIDE_EFFECTS__
function G(e, t) {
  const n = xe(e);
  return cr(n), n;
}
// @__NO_SIDE_EFFECTS__
function ge(e, t = !1, n = !0) {
  const r = xe(e);
  return t || (r.equals = It), Re && n && x !== null && x.l !== null && (x.l.s ??= []).push(r), r;
}
function O(e, t, n = !1) {
  p !== null && // since we are untracking the function inside `$inspect.with` we need to add this check
  // to ensure we error if state is set inside an inspect effect
  (!W || p.f & wt) && Ce() && p.f & (N | oe | ot | wt) && !Z?.includes(e) && Ln();
  let r = n ? me(t) : t;
  return Pe(e, r);
}
function Pe(e, t) {
  if (!e.equals(t)) {
    var n = e.v;
    ye ? X.set(e, t) : X.set(e, n), e.v = t;
    var r = ke.ensure();
    r.capture(e, n), e.f & N && (e.f & I && vt(
      /** @type {Derived} */
      e
    ), A(e, e.f & j ? te : S)), e.wv = sn(), Wt(e, I), Ce() && w !== null && w.f & S && !(w.f & (z | pe)) && (L === null ? vr([e]) : L.push(e));
  }
  return t;
}
function ze(e) {
  O(e, e.v + 1);
}
function Wt(e, t) {
  var n = e.reactions;
  if (n !== null)
    for (var r = Ce(), a = n.length, l = 0; l < a; l++) {
      var s = n[l], f = s.f;
      if (!(!r && s === w)) {
        var i = (f & I) === 0;
        i && A(s, t), f & N ? Wt(
          /** @type {Derived} */
          s,
          te
        ) : i && (f & oe && ae !== null && ae.push(
          /** @type {Effect} */
          s
        ), ue(
          /** @type {Effect} */
          s
        ));
      }
    }
}
function me(e) {
  if (typeof e != "object" || e === null || be in e)
    return e;
  const t = Nt(e);
  if (t !== Rn && t !== Cn)
    return e;
  var n = /* @__PURE__ */ new Map(), r = it(e), a = /* @__PURE__ */ G(0), l = fe, s = (f) => {
    if (fe === l)
      return f();
    var i = p, u = fe;
    K(null), xt(l);
    var c = f();
    return K(i), xt(u), c;
  };
  return r && n.set("length", /* @__PURE__ */ G(
    /** @type {any[]} */
    e.length
  )), new Proxy(
    /** @type {any} */
    e,
    {
      defineProperty(f, i, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && In();
        var c = n.get(i);
        return c === void 0 ? c = s(() => {
          var d = /* @__PURE__ */ G(u.value);
          return n.set(i, d), d;
        }) : O(c, u.value, !0), !0;
      },
      deleteProperty(f, i) {
        var u = n.get(i);
        if (u === void 0) {
          if (i in f) {
            const c = s(() => /* @__PURE__ */ G(R));
            n.set(i, c), ze(a);
          }
        } else
          O(u, R), ze(a);
        return !0;
      },
      get(f, i, u) {
        if (i === be)
          return e;
        var c = n.get(i), d = i in f;
        if (c === void 0 && (!d || $e(f, i)?.writable) && (c = s(() => {
          var _ = me(d ? f[i] : R), v = /* @__PURE__ */ G(_);
          return v;
        }), n.set(i, c)), c !== void 0) {
          var o = m(c);
          return o === R ? void 0 : o;
        }
        return Reflect.get(f, i, u);
      },
      getOwnPropertyDescriptor(f, i) {
        var u = Reflect.getOwnPropertyDescriptor(f, i);
        if (u && "value" in u) {
          var c = n.get(i);
          c && (u.value = m(c));
        } else if (u === void 0) {
          var d = n.get(i), o = d?.v;
          if (d !== void 0 && o !== R)
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
        if (i === be)
          return !0;
        var u = n.get(i), c = u !== void 0 && u.v !== R || Reflect.has(f, i);
        if (u !== void 0 || w !== null && (!c || $e(f, i)?.writable)) {
          u === void 0 && (u = s(() => {
            var o = c ? me(f[i]) : R, _ = /* @__PURE__ */ G(o);
            return _;
          }), n.set(i, u));
          var d = m(u);
          if (d === R)
            return !1;
        }
        return c;
      },
      set(f, i, u, c) {
        var d = n.get(i), o = i in f;
        if (r && i === "length")
          for (var _ = u; _ < /** @type {Source<number>} */
          d.v; _ += 1) {
            var v = n.get(_ + "");
            v !== void 0 ? O(v, R) : _ in f && (v = s(() => /* @__PURE__ */ G(R)), n.set(_ + "", v));
          }
        if (d === void 0)
          (!o || $e(f, i)?.writable) && (d = s(() => /* @__PURE__ */ G(void 0)), O(d, me(u)), n.set(i, d));
        else {
          o = d.v !== R;
          var h = s(() => me(u));
          O(d, h);
        }
        var g = Reflect.getOwnPropertyDescriptor(f, i);
        if (g?.set && g.set.call(c, u), !o) {
          if (r && typeof i == "string") {
            var D = (
              /** @type {Source<number>} */
              n.get("length")
            ), y = Number(i);
            Number.isInteger(y) && y >= D.v && O(D, y + 1);
          }
          ze(a);
        }
        return !0;
      },
      ownKeys(f) {
        m(a);
        var i = Reflect.ownKeys(f).filter((d) => {
          var o = n.get(d);
          return o === void 0 || o.v !== R;
        });
        for (var [u, c] of n)
          c.v !== R && !(u in f) && i.push(u);
        return i;
      },
      setPrototypeOf() {
        qn();
      }
    }
  );
}
var Jn, Xn, er;
function Ie(e = "") {
  return document.createTextNode(e);
}
// @__NO_SIDE_EFFECTS__
function Kt(e) {
  return Xn.call(e);
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return er.call(e);
}
function F(e, t) {
  return /* @__PURE__ */ Kt(e);
}
function Q(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r = /** @type {TemplateNode} */
    /* @__PURE__ */ Be(r);
  return r;
}
function tr(e) {
  e.textContent = "";
}
function Zt() {
  return !1;
}
let mt = !1;
function nr() {
  mt || (mt = !0, document.addEventListener(
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
function He(e) {
  var t = p, n = w;
  K(null), ee(null);
  try {
    return e();
  } finally {
    K(t), ee(n);
  }
}
function rr(e, t, n, r = n) {
  e.addEventListener(t, () => He(n));
  const a = e.__on_r;
  a ? e.__on_r = () => {
    a(), r(!0);
  } : e.__on_r = () => r(!0), nr();
}
function $t(e) {
  w === null && p === null && Fn(), p !== null && p.f & j && w === null && Mn(), ye && On();
}
function lr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ne(e, t, n, r = !0) {
  var a = w;
  a !== null && a.f & B && (e |= B);
  var l = {
    ctx: x,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: e | I,
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
      je(l), l.f |= ft;
    } catch (i) {
      throw $(l), i;
    }
  else t !== null && ue(l);
  if (r) {
    var s = l;
    if (n && s.deps === null && s.teardown === null && s.nodes_start === null && s.first === s.last && // either `null`, or a singular child
    !(s.f & Qe) && (s = s.first), s !== null && (s.parent = a, a !== null && lr(s, a), p !== null && p.f & N && !(e & pe))) {
      var f = (
        /** @type {Derived} */
        p
      );
      (f.effects ??= []).push(s);
    }
  }
  return l;
}
function zt(e) {
  const t = ne(Ue, null, !1);
  return A(t, S), t.teardown = e, t;
}
function at(e) {
  $t();
  var t = (
    /** @type {Effect} */
    w.f
  ), n = !p && (t & z) !== 0 && (t & ft) === 0;
  if (n) {
    var r = (
      /** @type {ComponentContext} */
      x
    );
    (r.e ??= []).push(e);
  } else
    return Gt(e);
}
function Gt(e) {
  return ne(Ot | Ft, e, !1);
}
function ar(e) {
  return $t(), ne(Ue | Ft, e, !0);
}
function sr(e) {
  return ne(ot | Qe, e, !0);
}
function ir(e, t = 0) {
  return ne(Ue | t, e, !0);
}
function bt(e, t = [], n = []) {
  Zn(t, n, (r) => {
    ne(Ue, () => e(...r.map(m)), !0);
  });
}
function Jt(e, t = 0) {
  var n = ne(oe | t, e, !0);
  return n;
}
function qe(e, t = !0) {
  return ne(z | Qe, e, !0, t);
}
function Xt(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = p;
    kt(!0), K(null);
    try {
      t.call(null);
    } finally {
      kt(n), K(r);
    }
  }
}
function en(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const a = n.ac;
    a !== null && He(() => {
      a.abort(de);
    });
    var r = n.next;
    n.f & pe ? n.parent = null : $(n, t), n = r;
  }
}
function fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    t.f & z || $(t), t = n;
  }
}
function $(e, t = !0) {
  var n = !1;
  (t || e.f & An) && e.nodes_start !== null && e.nodes_end !== null && (ur(
    e.nodes_start,
    /** @type {TemplateNode} */
    e.nodes_end
  ), n = !0), en(e, t && !n), Le(e, 0), A(e, we);
  var r = e.transitions;
  if (r !== null)
    for (const l of r)
      l.stop();
  Xt(e);
  var a = e.parent;
  a !== null && a.first !== null && tn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes_start = e.nodes_end = e.ac = null;
}
function ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Be(e)
    );
    e.remove(), e = n;
  }
}
function tn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function nn(e, t, n = !0) {
  var r = [];
  _t(e, r, !0), rn(r, () => {
    n && $(e), t && t();
  });
}
function rn(e, t) {
  var n = e.length;
  if (n > 0) {
    var r = () => --n || t();
    for (var a of e)
      a.out(r);
  } else
    t();
}
function _t(e, t, n) {
  if (!(e.f & B)) {
    if (e.f ^= B, e.transitions !== null)
      for (const s of e.transitions)
        (s.is_global || n) && t.push(s);
    for (var r = e.first; r !== null; ) {
      var a = r.next, l = (r.f & ut) !== 0 || (r.f & z) !== 0;
      _t(r, t, l ? n : !1), r = a;
    }
  }
}
function dt(e) {
  ln(e, !0);
}
function ln(e, t) {
  if (e.f & B) {
    e.f ^= B, e.f & S || (A(e, I), ue(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, a = (n.f & ut) !== 0 || (n.f & z) !== 0;
      ln(n, a ? t : !1), n = r;
    }
    if (e.transitions !== null)
      for (const l of e.transitions)
        (l.is_global || t) && l.in();
  }
}
function or(e, t) {
  for (var n = e.nodes_start, r = e.nodes_end; n !== null; ) {
    var a = n === r ? null : (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Be(n)
    );
    t.append(n), n = a;
  }
}
let he = !1;
function Et(e) {
  he = e;
}
let ye = !1;
function kt(e) {
  ye = e;
}
let p = null, W = !1;
function K(e) {
  p = e;
}
let w = null;
function ee(e) {
  w = e;
}
let Z = null;
function cr(e) {
  p !== null && (Z === null ? Z = [e] : Z.push(e));
}
let C = null, P = 0, L = null;
function vr(e) {
  L = e;
}
let an = 1, Te = 0, fe = Te;
function xt(e) {
  fe = e;
}
let J = !1;
function sn() {
  return ++an;
}
function Ye(e) {
  var t = e.f;
  if (t & I)
    return !0;
  if (t & te) {
    var n = e.deps, r = (t & j) !== 0;
    if (n !== null) {
      var a, l, s = (t & Oe) !== 0, f = r && w !== null && !J, i = n.length;
      if ((s || f) && (w === null || !(w.f & we))) {
        var u = (
          /** @type {Derived} */
          e
        ), c = u.parent;
        for (a = 0; a < i; a++)
          l = n[a], (s || !l?.reactions?.includes(u)) && (l.reactions ??= []).push(u);
        s && (u.f ^= Oe), f && c !== null && !(c.f & j) && (u.f ^= j);
      }
      for (a = 0; a < i; a++)
        if (l = n[a], Ye(
          /** @type {Derived} */
          l
        ) && Yt(
          /** @type {Derived} */
          l
        ), l.wv > e.wv)
          return !0;
    }
    (!r || w !== null && !J) && A(e, S);
  }
  return !1;
}
function fn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !Z?.includes(e))
    for (var a = 0; a < r.length; a++) {
      var l = r[a];
      l.f & N ? fn(
        /** @type {Derived} */
        l,
        t,
        !1
      ) : t === l && (n ? A(l, I) : l.f & S && A(l, te), ue(
        /** @type {Effect} */
        l
      ));
    }
}
function un(e) {
  var t = C, n = P, r = L, a = p, l = J, s = Z, f = x, i = W, u = fe, c = e.f;
  C = /** @type {null | Value[]} */
  null, P = 0, L = null, J = (c & j) !== 0 && (W || !he || p === null), p = c & (z | pe) ? null : e, Z = null, Me(e.ctx), W = !1, fe = ++Te, e.ac !== null && (He(() => {
    e.ac.abort(de);
  }), e.ac = null);
  try {
    e.f |= nt;
    var d = (
      /** @type {Function} */
      e.fn
    ), o = d(), _ = e.deps;
    if (C !== null) {
      var v;
      if (Le(e, P), _ !== null && P > 0)
        for (_.length = P + C.length, v = 0; v < C.length; v++)
          _[P + v] = C[v];
      else
        e.deps = _ = C;
      if (!J || // Deriveds that already have reactions can cleanup, so we still add them as reactions
      c & N && /** @type {import('#client').Derived} */
      e.reactions !== null)
        for (v = P; v < _.length; v++)
          (_[v].reactions ??= []).push(e);
    } else _ !== null && P < _.length && (Le(e, P), _.length = P);
    if (Ce() && L !== null && !W && _ !== null && !(e.f & (N | te | I)))
      for (v = 0; v < /** @type {Source[]} */
      L.length; v++)
        fn(
          L[v],
          /** @type {Effect} */
          e
        );
    return a !== null && a !== e && (Te++, L !== null && (r === null ? r = L : r.push(.../** @type {Source[]} */
    L))), e.f & ie && (e.f ^= ie), o;
  } catch (h) {
    return Yn(h);
  } finally {
    e.f ^= nt, C = t, P = n, L = r, p = a, J = l, Z = s, Me(f), W = i, fe = u;
  }
}
function _r(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = xn.call(n, e);
    if (r !== -1) {
      var a = n.length - 1;
      a === 0 ? n = t.reactions = null : (n[r] = n[a], n.pop());
    }
  }
  n === null && t.f & N && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (C === null || !C.includes(t)) && (A(t, te), t.f & (j | Oe) || (t.f ^= Oe), Ht(
    /** @type {Derived} **/
    t
  ), Le(
    /** @type {Derived} **/
    t,
    0
  ));
}
function Le(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      _r(e, n[r]);
}
function je(e) {
  var t = e.f;
  if (!(t & we)) {
    A(e, S);
    var n = w, r = he;
    w = e, he = !0;
    try {
      t & oe ? fr(e) : en(e), Xt(e);
      var a = un(e);
      e.teardown = typeof a == "function" ? a : null, e.wv = an;
      var l;
      St && yn && e.f & I && e.deps;
    } finally {
      he = r, w = n;
    }
  }
}
async function dr() {
  await Promise.resolve(), Wn();
}
function m(e) {
  var t = e.f, n = (t & N) !== 0;
  if (p !== null && !W) {
    var r = w !== null && (w.f & we) !== 0;
    if (!r && !Z?.includes(e)) {
      var a = p.deps;
      if (p.f & nt)
        e.rv < Te && (e.rv = Te, C === null && a !== null && a[P] === e ? P++ : C === null ? C = [e] : (!J || !C.includes(e)) && C.push(e));
      else {
        (p.deps ??= []).push(e);
        var l = e.reactions;
        l === null ? e.reactions = [p] : l.includes(p) || l.push(p);
      }
    }
  } else if (n && /** @type {Derived} */
  e.deps === null && /** @type {Derived} */
  e.effects === null) {
    var s = (
      /** @type {Derived} */
      e
    ), f = s.parent;
    f !== null && !(f.f & j) && (s.f ^= j);
  }
  if (ye) {
    if (X.has(e))
      return X.get(e);
    if (n) {
      s = /** @type {Derived} */
      e;
      var i = s.v;
      return (!(s.f & S) && s.reactions !== null || on(s)) && (i = vt(s)), X.set(s, i), i;
    }
  } else if (n) {
    if (s = /** @type {Derived} */
    e, V?.has(s))
      return V.get(s);
    Ye(s) && Yt(s);
  }
  if (V?.has(e))
    return V.get(e);
  if (e.f & ie)
    throw e.v;
  return e.v;
}
function on(e) {
  if (e.v === R) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (X.has(t) || t.f & N && on(
      /** @type {Derived} */
      t
    ))
      return !0;
  return !1;
}
function ht(e) {
  var t = W;
  try {
    return W = !0, e();
  } finally {
    W = t;
  }
}
const hr = -7169;
function A(e, t) {
  e.f = e.f & hr | t;
}
function pr(e) {
  if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
    if (be in e)
      st(e);
    else if (!Array.isArray(e))
      for (let t in e) {
        const n = e[t];
        typeof n == "object" && n && be in n && st(n);
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
      const r = Tn(n);
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
function wr(e, t, n, r = {}) {
  function a(l) {
    if (r.capture || gr.call(t, l), !l.cancelBubble)
      return He(() => n?.call(this, l));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Lt(() => {
    t.addEventListener(e, a, r);
  }) : t.addEventListener(e, a, r), a;
}
function yr(e, t, n, r, a) {
  var l = { capture: r, passive: a }, s = wr(e, t, n, l);
  (t === document.body || // @ts-ignore
  t === window || // @ts-ignore
  t === document || // Firefox has quirky behavior, it can happen that we still get "canplay" events when the element is already removed
  t instanceof HTMLMediaElement) && zt(() => {
    t.removeEventListener(e, s, l);
  });
}
let Tt = null;
function gr(e) {
  var t = this, n = (
    /** @type {Node} */
    t.ownerDocument
  ), r = e.type, a = e.composedPath?.() || [], l = (
    /** @type {null | Element} */
    a[0] || e.target
  );
  Tt = e;
  var s = 0, f = Tt === e && e.__root;
  if (f) {
    var i = a.indexOf(f);
    if (i !== -1 && (t === document || t === /** @type {any} */
    window)) {
      e.__root = t;
      return;
    }
    var u = a.indexOf(t);
    if (u === -1)
      return;
    i <= u && (s = i);
  }
  if (l = /** @type {Element} */
  a[s] || e.target, l !== t) {
    et(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var c = p, d = w;
    K(null), ee(null);
    try {
      for (var o, _ = []; l !== null; ) {
        var v = l.assignedSlot || l.parentNode || /** @type {any} */
        l.host || null;
        try {
          var h = l["__" + r];
          if (h != null && (!/** @type {any} */
          l.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          e.target === l))
            if (it(h)) {
              var [g, ...D] = h;
              g.apply(l, [e, ...D]);
            } else
              h.call(l, e);
        } catch (y) {
          o ? _.push(y) : o = y;
        }
        if (e.cancelBubble || v === t || v === null)
          break;
        l = v;
      }
      if (o) {
        for (let y of _)
          queueMicrotask(() => {
            throw y;
          });
        throw o;
      }
    } finally {
      e.__root = t, delete e.currentTarget, K(c), ee(d);
    }
  }
}
function mr(e) {
  var t = document.createElement("template");
  return t.innerHTML = e.replaceAll("<!>", "<!---->"), t.content;
}
function br(e, t) {
  var n = (
    /** @type {Effect} */
    w
  );
  n.nodes_start === null && (n.nodes_start = e, n.nodes_end = t);
}
// @__NO_SIDE_EFFECTS__
function We(e, t) {
  var n = (t & kn) !== 0, r, a = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = mr(a ? e : "<!>" + e), r = /** @type {Node} */
    /* @__PURE__ */ Kt(r));
    var l = (
      /** @type {TemplateNode} */
      n || Jn ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return br(l, l), l;
  };
}
function Ne(e, t) {
  e !== null && e.before(
    /** @type {Node} */
    t
  );
}
function _e(e, t) {
  var n = t == null ? "" : typeof t == "object" ? t + "" : t;
  n !== (e.__t ??= e.nodeValue) && (e.__t = n, e.nodeValue = n + "");
}
class Er {
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
      E
    );
    if (this.#n.has(t)) {
      var n = (
        /** @type {Key} */
        this.#n.get(t)
      ), r = this.#t.get(n);
      if (r)
        dt(r);
      else {
        var a = this.#e.get(n);
        a && (this.#t.set(n, a.effect), this.#e.delete(n), a.fragment.lastChild.remove(), this.anchor.before(a.fragment), r = a.effect);
      }
      for (const [l, s] of this.#n) {
        if (this.#n.delete(l), l === t)
          break;
        const f = this.#e.get(s);
        f && ($(f.effect), this.#e.delete(s));
      }
      for (const [l, s] of this.#t) {
        if (l === n) continue;
        const f = () => {
          if (Array.from(this.#n.values()).includes(l)) {
            var u = document.createDocumentFragment();
            or(s, u), u.append(Ie()), this.#e.set(l, { effect: s, fragment: u });
          } else
            $(s);
          this.#t.delete(l);
        };
        this.#l || !r ? nn(s, f, !1) : f();
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
      E
    ), a = Zt();
    if (n && !this.#t.has(t) && !this.#e.has(t))
      if (a) {
        var l = document.createDocumentFragment(), s = Ie();
        l.append(s), this.#e.set(t, {
          effect: qe(() => n(s)),
          fragment: l
        });
      } else
        this.#t.set(
          t,
          qe(() => n(this.anchor))
        );
    if (this.#n.set(r, t), a) {
      for (const [f, i] of this.#t)
        f === t ? r.skipped_effects.delete(i) : r.skipped_effects.add(i);
      for (const [f, i] of this.#e)
        f === t ? r.skipped_effects.delete(i.effect) : r.skipped_effects.add(i.effect);
      r.add_callback(this.#r);
    } else
      this.#r();
  }
}
function kr(e) {
  x === null && Nn(), Re && x.l !== null ? xr(x).m.push(e) : at(() => {
    const t = ht(e);
    if (typeof t == "function") return (
      /** @type {() => void} */
      t
    );
  });
}
function xr(e) {
  var t = (
    /** @type {ComponentContextLegacy} */
    e.l
  );
  return t.u ??= { a: [], b: [], m: [] };
}
function Tr(e, t, n = !1) {
  var r = new Er(e), a = n ? ut : 0;
  function l(s, f) {
    r.ensure(s, f);
  }
  Jt(() => {
    var s = !1;
    t((f, i = !0) => {
      s = !0, l(i, f);
    }), s || l(!1, null);
  }, a);
}
function Rr(e, t) {
  return t;
}
function Cr(e, t, n) {
  for (var r = e.items, a = [], l = t.length, s = 0; s < l; s++)
    _t(t[s].e, a, !0);
  var f = l > 0 && a.length === 0 && n !== null;
  if (f) {
    var i = (
      /** @type {Element} */
      /** @type {Element} */
      n.parentNode
    );
    tr(i), i.append(
      /** @type {Element} */
      n
    ), r.clear(), H(e, t[0].prev, t[l - 1].next);
  }
  rn(a, () => {
    for (var u = 0; u < l; u++) {
      var c = t[u];
      f || (r.delete(c.k), H(e, c.prev, c.next)), $(c.e, !f);
    }
  });
}
function Sr(e, t, n, r, a, l = null) {
  var s = e, f = { flags: t, items: /* @__PURE__ */ new Map(), first: null };
  {
    var i = (
      /** @type {Element} */
      e
    );
    s = i.appendChild(Ie());
  }
  var u = null, c = !1, d = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ Bt(() => {
    var g = n();
    return it(g) ? g : g == null ? [] : At(g);
  }), _, v;
  function h() {
    Ar(
      v,
      _,
      f,
      d,
      s,
      a,
      t,
      r,
      n
    ), l !== null && (_.length === 0 ? u ? dt(u) : u = qe(() => l(s)) : u !== null && nn(u, () => {
      u = null;
    }));
  }
  Jt(() => {
    v ??= /** @type {Effect} */
    w, _ = /** @type {V[]} */
    m(o);
    var g = _.length;
    if (!(c && g === 0)) {
      c = g === 0;
      var D, y, b, T;
      if (Zt()) {
        var U = /* @__PURE__ */ new Set(), re = (
          /** @type {Batch} */
          E
        );
        for (y = 0; y < g; y += 1) {
          b = _[y], T = r(b, y);
          var k = f.items.get(T) ?? d.get(T);
          k ? cn(k, b, y) : (D = vn(
            null,
            f,
            null,
            null,
            b,
            T,
            y,
            a,
            t,
            n,
            !0
          ), d.set(T, D)), U.add(T);
        }
        for (const [M, q] of f.items)
          U.has(M) || re.skipped_effects.add(q.e);
        re.add_callback(h);
      } else
        h();
      m(o);
    }
  });
}
function Ar(e, t, n, r, a, l, s, f, i) {
  var u = t.length, c = n.items, d = n.first, o = d, _, v = null, h = [], g = [], D, y, b, T;
  for (T = 0; T < u; T += 1) {
    if (D = t[T], y = f(D, T), b = c.get(y), b === void 0) {
      var U = r.get(y);
      if (U !== void 0) {
        r.delete(y), c.set(y, U);
        var re = v ? v.next : o;
        H(n, v, U), H(n, U, re), Ge(U, re, a), v = U;
      } else {
        var k = o ? (
          /** @type {TemplateNode} */
          o.e.nodes_start
        ) : a;
        v = vn(
          k,
          n,
          v,
          v === null ? n.first : v.next,
          D,
          y,
          T,
          l,
          s,
          i
        );
      }
      c.set(y, v), h = [], g = [], o = v.next;
      continue;
    }
    if (cn(b, D, T), b.e.f & B && dt(b.e), b !== o) {
      if (_ !== void 0 && _.has(b)) {
        if (h.length < g.length) {
          var M = g[0], q;
          v = M.prev;
          var le = h[0], ce = h[h.length - 1];
          for (q = 0; q < h.length; q += 1)
            Ge(h[q], M, a);
          for (q = 0; q < g.length; q += 1)
            _.delete(g[q]);
          H(n, le.prev, ce.next), H(n, v, le), H(n, ce, M), o = M, v = ce, T -= 1, h = [], g = [];
        } else
          _.delete(b), Ge(b, o, a), H(n, b.prev, b.next), H(n, b, v === null ? n.first : v.next), H(n, v, b), v = b;
        continue;
      }
      for (h = [], g = []; o !== null && o.k !== y; )
        o.e.f & B || (_ ??= /* @__PURE__ */ new Set()).add(o), g.push(o), o = o.next;
      if (o === null)
        continue;
      b = o;
    }
    h.push(b), v = b, o = b.next;
  }
  if (o !== null || _ !== void 0) {
    for (var ve = _ === void 0 ? [] : At(_); o !== null; )
      o.e.f & B || ve.push(o), o = o.next;
    var Ke = ve.length;
    if (Ke > 0) {
      var Se = u === 0 ? a : null;
      Cr(n, ve, Se);
    }
  }
  e.first = n.first && n.first.e, e.last = v && v.e;
  for (var Ze of r.values())
    $(Ze.e);
  r.clear();
}
function cn(e, t, n, r) {
  Pe(e.v, t), e.i = n;
}
function vn(e, t, n, r, a, l, s, f, i, u, c) {
  var d = (i & mn) !== 0, o = (i & En) === 0, _ = d ? o ? /* @__PURE__ */ ge(a, !1, !1) : xe(a) : a, v = i & bn ? xe(s) : s, h = {
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
      var g = document.createDocumentFragment();
      g.append(e = Ie());
    }
    return h.e = qe(() => f(
      /** @type {Node} */
      e,
      _,
      v,
      u
    ), jn), h.e.prev = n && n.e, h.e.next = r && r.e, n === null ? c || (t.first = h) : (n.next = h, n.e.next = h.e), r !== null && (r.prev = h, r.e.prev = h.e), h;
  } finally {
  }
}
function Ge(e, t, n) {
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
    var s = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ Be(l)
    );
    a.before(l), l = s;
  }
}
function H(e, t, n) {
  t === null ? e.first = n : (t.next = n, t.e.next = n && n.e), n !== null && (n.prev = t, n.e.prev = t && t.e);
}
function Rt(e, t, n = t) {
  var r = /* @__PURE__ */ new WeakSet();
  rr(e, "input", async (a) => {
    var l = a ? e.defaultValue : e.value;
    if (l = Je(e) ? Xe(l) : l, n(l), E !== null && r.add(E), await dr(), l !== (l = t())) {
      var s = e.selectionStart, f = e.selectionEnd, i = e.value.length;
      if (e.value = l ?? "", f !== null) {
        var u = e.value.length;
        s === f && f === i && u > i ? (e.selectionStart = u, e.selectionEnd = u) : (e.selectionStart = s, e.selectionEnd = Math.min(f, u));
      }
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  ht(t) == null && e.value && (n(Je(e) ? Xe(e.value) : e.value), E !== null && r.add(E)), ir(() => {
    var a = t();
    if (e === document.activeElement) {
      var l = (
        /** @type {Batch} */
        De ?? E
      );
      if (r.has(l))
        return;
    }
    Je(e) && a === Xe(e.value) || e.type === "date" && !a && !e.value || a !== e.value && (e.value = a ?? "");
  });
}
function Je(e) {
  var t = e.type;
  return t === "number" || t === "range";
}
function Xe(e) {
  return e === "" ? null : +e;
}
function Nr(e = !1) {
  const t = (
    /** @type {ComponentContextLegacy} */
    x
  ), n = t.l.u;
  if (!n) return;
  let r = () => pr(t.s);
  if (e) {
    let a = 0, l = (
      /** @type {Record<string, any>} */
      {}
    );
    const s = /* @__PURE__ */ ct(() => {
      let f = !1;
      const i = t.s;
      for (const u in i)
        i[u] !== l[u] && (l[u] = i[u], f = !0);
      return f && a++, a;
    });
    r = () => m(s);
  }
  n.b.length && ar(() => {
    Ct(t, r), tt(n.b);
  }), at(() => {
    const a = ht(() => n.m.map(Sn));
    return () => {
      for (const l of a)
        typeof l == "function" && l();
    };
  }), n.a.length && at(() => {
    Ct(t, r), tt(n.a);
  });
}
function Ct(e, t) {
  if (e.l.s)
    for (const n of e.l.s) m(n);
  t();
}
var Dr = /* @__PURE__ */ We('<div class="empty svelte-1klxta8">Keine QR-Codes vorhanden</div>'), Or = /* @__PURE__ */ We('<div class="qr-card svelte-1klxta8"><h3 class="svelte-1klxta8"> </h3> <p class="url svelte-1klxta8"> </p> <p class="code svelte-1klxta8"> </p> <p class="date svelte-1klxta8"> </p></div>'), Mr = /* @__PURE__ */ We('<div class="grid svelte-1klxta8"></div>'), Fr = /* @__PURE__ */ We('<div class="qr-proxy svelte-1klxta8"><header class="svelte-1klxta8"><h1 class="svelte-1klxta8">🌶️ QR-Code Proxy</h1> <p class="svelte-1klxta8">QR-Codes erstellen und verwalten</p></header> <div class="create-form svelte-1klxta8"><h2 class="svelte-1klxta8">Neuen QR-Code erstellen</h2> <div class="form-group svelte-1klxta8"><label class="svelte-1klxta8">Name <input type="text" placeholder="Mein QR-Code" class="svelte-1klxta8"/></label> <label class="svelte-1klxta8">Ziel-URL <input type="url" placeholder="https://example.com" class="svelte-1klxta8"/></label> <button class="svelte-1klxta8"> </button></div></div> <div class="qr-list svelte-1klxta8"><h2 class="svelte-1klxta8"> </h2> <!></div></div>');
function Ir(e, t) {
  Qn(t, !1);
  let n = /* @__PURE__ */ ge([]), r = /* @__PURE__ */ ge(""), a = /* @__PURE__ */ ge(""), l = /* @__PURE__ */ ge(!1);
  kr(async () => {
    await s();
  });
  async function s() {
    try {
      const M = await (await fetch("/qr-proxy/codes")).json();
      O(n, M.data || []);
    } catch (k) {
      console.error("Failed to load QR codes", k);
    }
  }
  async function f() {
    if (!(!m(r) || !m(a))) {
      O(l, !0);
      try {
        (await fetch("/qr-proxy/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: m(r), targetUrl: m(a) })
        })).ok && (O(r, ""), O(a, ""), await s());
      } catch (k) {
        console.error("Failed to create QR code", k);
      } finally {
        O(l, !1);
      }
    }
  }
  Nr();
  var i = Fr(), u = Q(F(i), 2), c = Q(F(u), 2), d = F(c), o = Q(F(d)), _ = Q(d, 2), v = Q(F(_)), h = Q(_, 2), g = F(h), D = Q(u, 2), y = F(D), b = F(y), T = Q(y, 2);
  {
    var U = (k) => {
      var M = Dr();
      Ne(k, M);
    }, re = (k) => {
      var M = Mr();
      Sr(M, 5, () => m(n), Rr, (q, le) => {
        var ce = Or(), ve = F(ce), Ke = F(ve), Se = Q(ve, 2), Ze = F(Se), pt = Q(Se, 2), _n = F(pt), dn = Q(pt, 2), hn = F(dn);
        bt(
          (pn) => {
            _e(Ke, m(le).name), _e(Ze, m(le).targetUrl), _e(_n, `Code: ${m(le).shortCode ?? ""}`), _e(hn, pn);
          },
          [
            () => new Date(m(le).created).toLocaleDateString("de-DE")
          ]
        ), Ne(q, ce);
      }), Ne(k, M);
    };
    Tr(T, (k) => {
      m(n).length === 0 ? k(U) : k(re, !1);
    });
  }
  bt(() => {
    h.disabled = m(l) || !m(r) || !m(a), _e(g, m(l) ? "Erstelle..." : "QR-Code erstellen"), _e(b, `Vorhandene QR-Codes (${m(n).length ?? ""})`);
  }), Rt(o, () => m(r), (k) => O(r, k)), Rt(v, () => m(a), (k) => O(a, k)), yr("click", h, f), Ne(e, i), Vn();
}
export {
  Ir as default
};
