// Núcleo partilhado: i18n, UI, teoria, MIDI, áudio. Sem aleatoriedade: tudo determinístico.
(function () {
  const W = (globalThis.W = globalThis.W || {});
  W.tools = []; W.lang = 'pt'; W.project = { root: 0, mode: 'major', bpm: 128 };
  W.L = (pt, en) => (W.lang === 'en' ? en : pt);

  // ---------- DOM ----------
  const h = (W.h = function (tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v === true) e.setAttribute(k, ''); else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
    return e;
  });
  W.ui = {
    select(label, opts, value, cb) {
      const s = h('select'); opts.forEach(o => s.append(h('option', { value: o.v }, o.t))); s.value = value;
      s.addEventListener('change', () => cb(s.value)); return h('label', { class: 'ctl' }, h('span', null, label), s);
    },
    range(label, min, max, step, value, cb, fmt) {
      const out = h('output', null, fmt ? fmt(value) : value); const r = h('input', { type: 'range', min, max, step }); r.value = value;
      r.addEventListener('input', () => { out.textContent = fmt ? fmt(+r.value) : r.value; cb(+r.value); });
      const l = h('label', { class: 'ctl' }, h('span', null, label), r, out); l.input = r; l.out = out; l.fmt = fmt; return l;
    },
    check(label, value, cb) {
      const c = h('input', { type: 'checkbox' }); c.checked = !!value; c.addEventListener('change', () => cb(c.checked));
      return h('label', { class: 'ctl chk' }, c, h('span', null, label));
    },
    btn(text, cb, cls) { return h('button', { class: 'btn ' + (cls || ''), type: 'button', onclick: cb }, text); },
    card(title, ...kids) { return h('section', { class: 'card' }, title ? h('h3', null, title) : null, kids); },
    keyOpts() { return W.NOTE_OPTS(); },
  };
  W.download = function (name, data, mime) {
    const b = new Blob([data], { type: mime || 'application/octet-stream' }); const a = document.createElement('a');
    a.href = URL.createObjectURL(b); a.download = name; document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };

  // ---------- Teoria ----------
  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const FLATKEYS = new Set([5, 10, 3, 8, 1, 6]);
  const mod = (n, m) => ((n % m) + m) % m;
  W.mod = mod;
  W.useFlats = (root, mode) => FLATKEYS.has(mode === 'major' ? root : mod(root + 3, 12));
  W.noteName = (pc, fl) => (fl ? FLAT : SHARP)[mod(pc, 12)];
  W.midiName = (m, fl) => W.noteName(m, fl) + (Math.floor(m / 12) - 1);
  W.NOTE_OPTS = () => FLAT.map((n, i) => ({ v: i, t: n }));
  W.SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  W.inScale = (m, root, mode) => W.SCALES[mode].includes(mod(m - root, 12));
  W.snapToScale = function (m, root, mode) { for (let d = 0; d < 7; d++) { if (W.inScale(m - d, root, mode)) return m - d; if (W.inScale(m + d, root, mode)) return m + d; } return m; };
  W.freq = m => 440 * Math.pow(2, (m - 69) / 12);

  const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  // token: '1'..'7' diatónico; 'b7','b6','iv' (empréstimo do modo menor); 'V' (dominante maior no modo menor)
  W.chordFromToken = function (tok, root, mode, seventh) {
    const sc = W.SCALES[mode], fl = W.useFlats(root, mode); let rp, iv, deg = null, borrowed = false;
    if (/^[1-7]$/.test(tok)) {
      deg = +tok - 1; const s = [0, 2, 4, 6].map(k => sc[(deg + k) % 7] + (deg + k >= 7 ? 12 : 0));
      rp = mod(root + s[0], 12); iv = s.map(x => x - s[0]);
    } else {
      borrowed = true;
      const B = { b7: [10, [0, 4, 7, 10]], b6: [8, [0, 4, 7, 11]], iv: [5, [0, 3, 7, 10]], V: [7, [0, 4, 7, 10]] }[tok];
      rp = mod(root + B[0], 12); iv = B[1];
    }
    const tri = iv.slice(0, 3); const q = tri[1] === 4 ? 'maj' : tri[2] === 6 ? 'dim' : 'min';
    const ivs = seventh ? iv : tri; const s7 = iv[3];
    let suf = q === 'maj' ? '' : q === 'min' ? 'm' : 'dim';
    if (seventh) suf = q === 'maj' ? (s7 === 11 ? 'maj7' : '7') : q === 'min' ? 'm7' : 'm7b5';
    let rom = tok === 'b7' ? 'bVII' : tok === 'b6' ? 'bVI' : tok === 'iv' ? 'iv' : tok === 'V' ? 'V' : (q === 'maj' ? ROM[deg] : ROM[deg].toLowerCase() + (q === 'dim' ? '°' : ''));
    if (seventh) rom += q === 'maj' && s7 === 11 ? 'maj7' : '7';
    return { tok, rootPc: rp, ivs, pcs: ivs.map(x => mod(rp + x, 12)), quality: q, seventh: !!seventh, borrowed, degree: deg, name: W.noteName(rp, fl) + suf, roman: rom };
  };
  W.roleOf = function (c, mode) {
    if (c.borrowed) return { b7: 'borrowed7', b6: 'borrowed6', iv: 'borrowedIv', V: 'dominant' }[c.tok];
    const M = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading'];
    const m = ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominantMinor', 'submediant', 'subtonic'];
    return (mode === 'major' ? M : m)[c.degree];
  };
  W.TENSION = { tonic: 0, mediant: 1, submediant: 1, supertonic: 2, subdominant: 2, subtonic: 2, dominantMinor: 3, borrowed6: 3, borrowedIv: 3, borrowed7: 2, dominant: 4, leading: 4 };

  // Progressões curadas (convenções genéricas; tokens = graus). "Variação" = outra entrada da lista.
  W.STYLES = [
    { id: 'fb', pt: 'Future Bass', en: 'Future Bass', bpm: 150,
      major: ['6 4 1 5', '4 5 3 6', '1 5 6 4', '4 3 6 5'], minor: ['1 6 3 7', '6 7 1 V', '1 4 6 7', '3 7 1 6'] },
    { id: 'ph', pt: 'Progressive House', en: 'Progressive House', bpm: 126,
      major: ['1 5 6 4', '1 4 6 5', '6 5 4 5', '1 6 4 5'], minor: ['1 7 6 7', '1 6 7 1', '1 4 7 6', '1 3 7 6'] },
    { id: 'br', pt: 'Big Room', en: 'Big Room', bpm: 128,
      major: ['1 5 6 4', '4 1 5 6', '6 4 1 5', '1 3 4 5'], minor: ['1 7 6 7', '1 6 3 7', '6 7 1 1', '1 7 6 5'] },
    { id: 'em', pt: 'Emocional / melódico', en: 'Emotional / melodic', bpm: 128,
      major: ['6 4 1 5', '4 1 6 5', '1 3 6 4', '2 6 4 5'], minor: ['1 6 3 7', '6 7 1 3', '1 4 6 5', '3 6 7 1'] },
    { id: 'mo', pt: 'Empréstimo modal (cinemático)', en: 'Modal interchange (cinematic)', bpm: 124,
      major: ['1 b7 4 1', '1 iv 6 5', '4 iv 1 5', '1 b6 b7 1'], minor: ['1 4 V 1', '6 7 V 1', '1 6 V 1', '4 V 1 1'] },
  ];
  W.styleName = s => W.L(s.pt, s.en);
  W.progression = function (styleId, variant, root, mode, seventh) {
    const st = W.STYLES.find(s => s.id === styleId) || W.STYLES[0]; const list = st[mode];
    const toks = list[mod(variant, list.length)].split(' ');
    return { tokens: toks, chords: toks.map(t => W.chordFromToken(t, root, mode, seventh)) };
  };
  W.chordsFromText = function (txt, root, mode) { // aceita nomes (Am, F, G7, Bbmaj7, Edim...)
    const fl = W.useFlats(root, mode); const out = [];
    for (const raw of txt.split(/[\s,|\-–>]+/).filter(Boolean)) {
      const m = raw.match(/^([A-Ga-g])([#b]?)(maj7|m7b5|m7|dim|m|7|sus2|sus4|)$/); if (!m) { out.push({ bad: raw }); continue; }
      const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1].toUpperCase()] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
      const rp = mod(base, 12), suf = m[3];
      const iv = { '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10], sus2: [0, 2, 7], sus4: [0, 5, 7] }[suf];
      out.push({ name: m[1].toUpperCase() + m[2] + suf, rootPc: rp, ivs: iv, pcs: iv.map(x => mod(rp + x, 12)), quality: iv[1] === 4 ? 'maj' : iv[1] === 3 ? (iv[2] === 6 ? 'dim' : 'min') : 'sus', seventh: iv.length > 3 });
    }
    return out;
  };

  // Condução de vozes: escolhe a inversão/oitava com menor movimento total.
  W.voiceLead = function (chords, opt) {
    const lo = (opt && opt.lo) || 50, hi = (opt && opt.hi) || 74; const out = []; let prev = null;
    for (const pcs of chords) {
      const cands = [], cur = [];
      (function rec(i) {
        if (i === pcs.length) { const s = cur.slice().sort((a, b) => a - b); if (s[s.length - 1] - s[0] <= 16 && new Set(s).size === s.length) cands.push(s); return; }
        for (let m = lo; m <= hi; m++) if (mod(m, 12) === pcs[i]) { cur[i] = m; rec(i + 1); }
      })(0);
      if (!cands.length) cands.push(pcs.map(p => 60 + mod(p, 12)).sort((a, b) => a - b));
      let best = null, bc = 1e9;
      for (const s of cands) {
        const cen = s.reduce((a, b) => a + b, 0) / s.length; let c = 0.1 * Math.abs(cen - 62);
        if (prev) { for (let i = 0; i < Math.min(s.length, prev.length); i++) c += Math.abs(s[i] - prev[i]); c += 4 * Math.abs(s.length - prev.length); }
        else if (mod(s[0], 12) !== pcs[0]) c += 2;
        if (c < bc - 1e-9) { bc = c; best = s; }
      }
      out.push(best); prev = best;
    }
    return out;
  };
  W.bassNote = pc => 36 + mod(pc, 12);
  W.bestKey = function (pcsSet) { // deteção de tom pelo melhor encaixe (empate: menor índice)
    let best = null, bs = -1;
    for (const mode of ['major', 'minor']) for (let r = 0; r < 12; r++) {
      const sc = new Set(W.SCALES[mode].map(x => mod(r + x, 12))); let s = 0; pcsSet.forEach(p => { if (sc.has(p)) s++; });
      if (s > bs) { bs = s; best = { root: r, mode, score: s }; }
    }
    return best;
  };

  // ---------- MIDI ----------
  const vlq = n => { const b = [n & 127]; while ((n >>= 7)) b.unshift((n & 127) | 128); return b; };
  const strB = s => Array.from(new TextEncoder().encode(s));
  W.midi = {
    write({ bpm, tracks, markers, name }) {
      const PPQ = 480, tk = b => Math.round(b * PPQ);
      const mkTrack = evs => {
        evs.sort((a, b) => a.tick - b.tick || a.o - b.o); let last = 0; const d = [];
        for (const e of evs) { d.push(...vlq(e.tick - last), ...e.b); last = e.tick; }
        d.push(0, 0xff, 0x2f, 0);
        return [0x4d, 0x54, 0x72, 0x6b, (d.length >>> 24) & 255, (d.length >>> 16) & 255, (d.length >>> 8) & 255, d.length & 255, ...d];
      };
      const us = Math.round(60000000 / bpm);
      const t0 = [{ tick: 0, o: 0, b: [0xff, 0x03, ...vlq(strB(name || 'Projeto').length), ...strB(name || 'Projeto')] },
        { tick: 0, o: 0, b: [0xff, 0x58, 4, 4, 2, 24, 8] }, { tick: 0, o: 0, b: [0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255] }];
      (markers || []).forEach(m => { const s = strB(m.text); t0.push({ tick: tk(m.t), o: 1, b: [0xff, 0x06, ...vlq(s.length), ...s] }); });
      const trs = [mkTrack(t0)];
      for (const t of tracks) {
        const ch = (t.channel || 0) & 15, ev = []; const s = strB(t.name || 'Pista');
        ev.push({ tick: 0, o: 0, b: [0xff, 0x03, ...vlq(s.length), ...s] });
        (t.notes || []).forEach(n => {
          const a = tk(n.t), b = Math.max(a + 1, tk(n.t + n.dur)); const v = Math.max(1, Math.min(127, Math.round(n.vel || 96)));
          ev.push({ tick: a, o: 2, b: [0x90 | ch, n.note & 127, v] }, { tick: b, o: 0, b: [0x80 | ch, n.note & 127, 0] });
        });
        (t.cc || []).forEach(c => ev.push({ tick: tk(c.t), o: 1, b: [0xb0 | ch, c.cc & 127, Math.max(0, Math.min(127, Math.round(c.val)))] }));
        trs.push(mkTrack(ev));
      }
      const head = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 1, 0, trs.length, PPQ >> 8, PPQ & 255];
      return new Uint8Array([...head, ...trs.flat()]);
    },
  };

  // ---------- Áudio ----------
  const A = (W.audio = { ctx: null, nodes: null });
  A.ensure = function () {
    if (!A.ctx) {
      const C = window.AudioContext || window.webkitAudioContext; const c = (A.ctx = new C());
      A.master = c.createGain(); A.master.gain.value = 0.8;
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -10; comp.ratio.value = 4;
      A.master.connect(comp); comp.connect(c.destination);
      const buf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = buf.getChannelData(0); let s = 22222; // LCG de semente fixa (DSP, não geração musical)
      for (let i = 0; i < d.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; d[i] = (s >>> 8) / 8388608 - 1; }
      A.noise = buf;
    }
    if (A.ctx.state === 'suspended') A.ctx.resume(); return A.ctx;
  };
  const WV = { sine: 'sine', tri: 'triangle', triangle: 'triangle', saw: 'sawtooth', sawtooth: 'sawtooth', square: 'square' };
  A.shaper = function (amt) { const n = 256, c = new Float32Array(n), k = 1 + amt * 8; for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 2 - 1; c[i] = Math.tanh(k * x) / Math.tanh(k); } return c; };
  // p: {w1,w2,mix2,det2,uni,spread,sub,noise,cutoff,res,env,atk,dec,sus,rel,lfo(Hz),lfoDepth,drive,gain}
  A.voice = function (p, midi, t, dur, vel, dest) {
    const c = A.ctx, f0 = W.freq(midi), g0 = Math.pow(vel / 127, 1.2) * (p.gain == null ? 0.4 : p.gain);
    const amp = c.createGain(), filt = c.createBiquadFilter(); filt.type = 'lowpass';
    const base = Math.max(40, Math.min(p.cutoff == null ? 3000 : p.cutoff, 20000)); filt.Q.value = p.res == null ? 1 : p.res;
    const peak = Math.min(base * Math.pow(2, p.env || 0), 20000), dec = Math.max(0.05, p.dec == null ? 0.3 : p.dec);
    filt.frequency.setValueAtTime(peak, t); filt.frequency.exponentialRampToValueAtTime(base, t + 0.02 + dec);
    const atk = Math.max(0.002, p.atk == null ? 0.01 : p.atk), rel = Math.max(0.02, p.rel == null ? 0.2 : p.rel), sus = p.sus == null ? 0.7 : p.sus;
    const endT = t + Math.max(dur, 0.03);
    amp.gain.setValueAtTime(0.0001, t); amp.gain.linearRampToValueAtTime(g0, t + atk);
    amp.gain.setTargetAtTime(Math.max(0.0001, g0 * sus), t + atk, dec / 3);
    amp.gain.setTargetAtTime(0, endT, rel / 3);
    const stopT = endT + rel + 0.15; const mix = c.createGain(); mix.connect(filt);
    const n = Math.max(1, Math.min(7, p.uni || 1)), sp = p.spread || 0; const srcs = [];
    for (let i = 0; i < n; i++) {
      const o = c.createOscillator(); o.type = WV[p.w1 || 'sawtooth']; o.frequency.value = f0;
      o.detune.value = n === 1 ? 0 : sp * ((i / (n - 1)) * 2 - 1); const g = c.createGain(); g.gain.value = (1 - (p.mix2 || 0) * 0.5) / Math.sqrt(n);
      o.connect(g); g.connect(mix); srcs.push(o);
    }
    if (p.w2 && p.mix2 > 0) { const o = c.createOscillator(); o.type = WV[p.w2]; o.frequency.value = f0; o.detune.value = p.det2 || 0; const g = c.createGain(); g.gain.value = p.mix2; o.connect(g); g.connect(mix); srcs.push(o); }
    if (p.sub > 0) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f0 / 2; const g = c.createGain(); g.gain.value = p.sub; o.connect(g); g.connect(amp); srcs.push(o); }
    if (p.noise > 0) { const s = c.createBufferSource(); s.buffer = A.noise; s.loop = true; const g = c.createGain(); g.gain.value = p.noise * 0.6; s.connect(g); g.connect(mix); s.start(t); s.stop(stopT); }
    if (p.lfoDepth > 0 && p.lfo > 0) { const l = c.createOscillator(); l.type = 'sine'; l.frequency.value = p.lfo; const lg = c.createGain(); lg.gain.value = p.lfoDepth * 2400; l.connect(lg); lg.connect(filt.detune); l.start(t); l.stop(stopT); }
    let last = filt; if (p.drive > 0) { const ws = c.createWaveShaper(); ws.curve = A.shaper(p.drive); filt.connect(ws); last = ws; }
    last.connect(amp); amp.connect(dest || A.master); srcs.forEach(o => { o.start(t); o.stop(stopT); });
  };
  function nz(t, dur, type, f, q, g, dest, off) {
    const c = A.ctx, s = c.createBufferSource(); s.buffer = A.noise; s.loop = true; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 0.7;
    const gn = c.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(gn); gn.connect(dest);
    s.start(t, off || 0); s.stop(t + dur + 0.05); return gn;
  }
  function tone(t, dur, f0, f1, sweep, g, dest) {
    const c = A.ctx, o = c.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + sweep);
    const gn = c.createGain(); gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + dur + 0.05);
  }
  A.drum = function (piece, t, vel, dest, lenSec) {
    const c = A.ctx, v = Math.pow(vel / 127, 1.3), d = dest || A.master, g = c.createGain(); g.gain.value = v; g.connect(d);
    switch (piece) {
      case 'Kick': tone(t, 0.45, 170, 46, 0.09, 1.0, g); nz(t, 0.012, 'highpass', 2500, 0.7, 0.25, g); break;
      case 'Snare': tone(t, 0.1, 200, 170, 0.05, 0.45, g); nz(t, 0.22, 'highpass', 1500, 0.7, 0.75, g, 0.3); break;
      case 'Clap': [0, 0.011, 0.022].forEach(o => nz(t + o, 0.02, 'bandpass', 1500, 1.2, 0.8, g, 0.5)); nz(t + 0.033, 0.18, 'bandpass', 1400, 1, 0.6, g, 0.5); break;
      case 'HatC': if (A._oh) { try { A._oh.gain.cancelScheduledValues(t); A._oh.gain.setTargetAtTime(0.0001, t, 0.005); } catch (e) {} } nz(t, 0.05, 'highpass', 7000, 0.7, 0.55, g, 0.9); break;
      case 'HatO': A._oh = nz(t, 0.4, 'highpass', 6500, 0.7, 0.5, g, 1.1); break;
      case 'Rim': tone(t, 0.04, 1750, 1700, 0.02, 0.5, g); nz(t, 0.02, 'highpass', 3000, 0.7, 0.3, g); break;
      case 'TomL': tone(t, 0.4, 160, 100, 0.12, 0.8, g); break;
      case 'TomM': tone(t, 0.35, 225, 140, 0.12, 0.8, g); break;
      case 'TomH': tone(t, 0.3, 300, 190, 0.1, 0.8, g); break;
      case 'Crash': nz(t, 2.2, 'highpass', 3500, 0.7, 0.5, g, 0.2); break;
      case 'Shaker': nz(t, 0.1, 'bandpass', 5500, 0.8, 0.5, g, 0.6); break;
      case 'Impact': tone(t, 2.2, 85, 28, 1.2, 0.9, g); nz(t, 2.0, 'lowpass', 300, 0.7, 1.0, g, 1.3); break;
      case 'RevCrash': {
        const L = Math.max(0.2, lenSec || 1), s = c.createBufferSource(); s.buffer = A.noise; s.loop = true; const fl = c.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = 3500;
        const gn = c.createGain(), cur = new Float32Array(48).map((_, i) => 0.55 * Math.pow(i / 47, 2.2)); gn.gain.setValueCurveAtTime(cur, t, L); s.connect(fl); fl.connect(gn); gn.connect(g); s.start(t, 0.4); s.stop(t + L + 0.05); break; }
    }
  };
  A.GM = { Kick: 36, Snare: 38, Clap: 39, HatC: 42, HatO: 46, Rim: 37, TomL: 45, TomM: 47, TomH: 50, Crash: 49, Shaker: 70, Impact: 35, RevCrash: 52 };

  // Reprodutor com agendamento antecipado. Eventos (t em tempos): {kind:'note',t,dur,midi,vel,inst} | {kind:'drum',t,piece,vel,len} | {kind:'fn',t,fn(time,spb,bus)}
  A.play = function (events, bpm, opt) {
    opt = opt || {}; A.stop(); const c = A.ensure(), spb = 60 / bpm, bus = c.createGain(); bus.connect(opt.dest || A.master);
    const ev = events.slice().sort((a, b) => a.t - b.t), L = opt.length || 0, start = c.currentTime + 0.1; let idx = 0, loops = 0, done = false;
    const S = (A.cur = { bus, timer: null, raf: 0, onStop: opt.onStop });
    const sched = e => {
      const tt = start + (loops * L + e.t) * spb;
      if (e.kind === 'note') A.voice(e.inst, e.midi, tt, e.dur * spb, e.vel == null ? 100 : e.vel, bus);
      else if (e.kind === 'drum') A.drum(e.piece, tt, e.vel == null ? 100 : e.vel, bus, (e.len || 1) * spb);
      else if (e.kind === 'fn') e.fn(tt, spb, bus);
    };
    const tick = () => {
      const horizon = c.currentTime + 0.3;
      for (;;) {
        if (idx >= ev.length) {
          if (opt.loop && L) { loops++; idx = 0; continue; }
          if (!done && c.currentTime > start + ((L || (ev.length ? ev[ev.length - 1].t : 0)) + 1) * spb + 1.5) { done = true; A.stop(); } return;
        }
        const tt = start + (loops * L + ev[idx].t) * spb; if (tt > horizon) return; sched(ev[idx++]);
      }
    };
    tick(); S.timer = setInterval(tick, 60);
    const frame = () => { if (A.cur !== S) return; const b = (c.currentTime - start) / spb; if (opt.onTick) opt.onTick(L ? ((b % L) + L) % L : b); S.raf = requestAnimationFrame(frame); }; frame();
  };
  A.stop = function () {
    const S = A.cur; if (!S) return; A.cur = null; clearInterval(S.timer); cancelAnimationFrame(S.raf);
    try { S.bus.gain.setTargetAtTime(0, A.ctx.currentTime, 0.01); setTimeout(() => S.bus.disconnect(), 120); } catch (e) {}
    if (S.onStop) S.onStop();
  };
  A.isPlaying = () => !!A.cur;

  // ---------- Presets de synth (poucos parâmetros, fáceis de alterar) ----------
  W.PRESETS = {
    supersaw: { pt: 'Supersaw (lead)', en: 'Supersaw (lead)', p: { w1: 'sawtooth', uni: 5, spread: 22, cutoff: 5000, res: 1, env: 1, atk: 0.01, dec: 0.4, sus: 0.7, rel: 0.3, gain: 0.3 } },
    pluck: { pt: 'Pluck future bass', en: 'Future bass pluck', p: { w1: 'sawtooth', w2: 'square', mix2: 0.4, det2: 7, uni: 3, spread: 12, cutoff: 1800, res: 3, env: 3, atk: 0.002, dec: 0.22, sus: 0, rel: 0.15, gain: 0.35 } },
    pad: { pt: 'Pad quente', en: 'Warm pad', p: { w1: 'sawtooth', uni: 4, spread: 15, cutoff: 1400, res: 0.7, env: 0.3, atk: 0.6, dec: 0.5, sus: 0.8, rel: 1.2, gain: 0.28 } },
    piano: { pt: 'Piano suave', en: 'Soft piano', p: { w1: 'triangle', w2: 'sine', mix2: 0.5, det2: 1200, uni: 1, cutoff: 3500, res: 0.5, env: 1.5, atk: 0.003, dec: 0.9, sus: 0.15, rel: 0.35, gain: 0.5 } },
    reese: { pt: 'Baixo reese', en: 'Reese bass', p: { w1: 'sawtooth', uni: 2, spread: 18, cutoff: 700, res: 2, env: 1.2, atk: 0.005, dec: 0.3, sus: 0.8, rel: 0.1, sub: 0.5, drive: 0.3, gain: 0.4 } },
    sub: { pt: 'Sub limpo', en: 'Clean sub', p: { w1: 'sine', uni: 1, cutoff: 500, res: 0.5, env: 0, atk: 0.005, dec: 0.1, sus: 1, rel: 0.1, gain: 0.6 } },
    guitar: { pt: 'Guitarra (pluck)', en: 'Guitar-like pluck', p: { w1: 'sawtooth', w2: 'triangle', mix2: 0.3, cutoff: 2200, res: 1.5, env: 2.2, atk: 0.002, dec: 0.5, sus: 0.05, rel: 0.2, gain: 0.35 } },
    bell: { pt: 'Teclas / sino', en: 'Keys / bell', p: { w1: 'sine', w2: 'sine', mix2: 0.35, det2: 1900, cutoff: 9000, res: 0.5, env: 0, atk: 0.002, dec: 0.8, sus: 0.05, rel: 0.5, gain: 0.4 } },
    strings: { pt: 'Cordas', en: 'Strings', p: { w1: 'sawtooth', uni: 5, spread: 12, cutoff: 2600, res: 0.6, env: 0.2, atk: 0.35, dec: 0.4, sus: 0.85, rel: 0.7, gain: 0.25 } },
    lead: { pt: 'Lead brilhante', en: 'Bright lead', p: { w1: 'sawtooth', w2: 'square', mix2: 0.3, uni: 3, spread: 14, cutoff: 4500, res: 1.5, env: 1.5, atk: 0.01, dec: 0.25, sus: 0.7, rel: 0.2, gain: 0.3 } },
  };

  // ---------- Piano roll simples ----------
  W.roll = function (notes, length, opts) {
    opts = opts || {}; const cv = h('canvas', { class: 'roll', width: 900, height: opts.height || 170 }); const g = cv.getContext('2d');
    const draw = function (play) {
      const w = cv.width, hh = cv.height, st = getComputedStyle(document.documentElement);
      g.clearRect(0, 0, w, hh); g.fillStyle = st.getPropertyValue('--panel2') || '#222'; g.fillRect(0, 0, w, hh);
      let lo = 127, hi = 0; notes.forEach(n => { lo = Math.min(lo, n.midi); hi = Math.max(hi, n.midi); }); if (lo > hi) { lo = 48; hi = 72; } lo -= 1; hi += 1;
      const rows = Math.max(12, hi - lo + 1), rh = hh / rows;
      g.strokeStyle = st.getPropertyValue('--border') || '#444'; g.lineWidth = 1;
      for (let b = 0; b <= length; b++) { const x = (b / length) * w; g.globalAlpha = b % 4 === 0 ? 0.9 : 0.25; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, hh); g.stroke(); }
      g.globalAlpha = 1;
      notes.forEach(n => { g.fillStyle = n.color || st.getPropertyValue('--accent') || '#8af'; g.globalAlpha = 0.5 + 0.5 * Math.min(1, (n.vel || 100) / 127); g.fillRect((n.t / length) * w, hh - (n.midi - lo + 1) * rh, Math.max(2, (n.dur / length) * w - 1), Math.max(2, rh - 1)); });
      g.globalAlpha = 1; if (play != null) { g.fillStyle = st.getPropertyValue('--accent2') || '#fff'; g.fillRect((play / length) * w - 1, 0, 2, hh); }
    };
    cv.draw = draw; draw(); return cv;
  };
})();
