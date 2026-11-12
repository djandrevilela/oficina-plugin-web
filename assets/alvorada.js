// Alvorada web: melodia, contra-melodia, arpejos, baixo/sub e synth com presets. Tudo determinístico.
(function () {
  const W = globalThis.W, { h, ui, L } = W, mod = W.mod;
  const S = { style: 'fb', variant: 0, contour: 0, complexity: 3, voice: 'pluck', arp: 'fb', bassPat: 'sidechain', sub: true, layers: { mel: true, counter: true, arp: false, bass: true }, bars: 8,
    presets: { mel: 'pluck', counter: 'strings', arp: 'pluck', bass: 'reese' }, cutoff: 1, release: 1 };
  W.alvorada = S;
  // Ritmos de 16 passos por nível de complexidade (3 variantes que alternam por compasso)
  const RH = {
    1: ['x.......x.......', 'x.....x.x.......', 'x.......x.....x.'],
    2: ['x...x.......x...', 'x.....x...x.....', 'x...x...x.......'],
    3: ['x..x..x...x.x...', 'x.x...x.x...x...', 'x..x..x.x..x....'],
    4: ['x.x.x..xx.x.x..x', 'x..xx.x.x.xx..x.', 'x.xx.x.x..x.x.x.'],
    5: ['xx.xx.x.xx.xx.xx', 'x.xxx.xx.xxx.x.x', 'xxx.x.xxx.x.xxx.'],
  };
  const STEPS = [1, 1, -1, 2, -1, -2, 1, -1];
  const BASSPAT = {
    offbeat: { pt: 'Offbeat', en: 'Offbeat', p: '..x...x...x...x.' },
    rolling: { pt: 'Rolling (16.ᵃˢ)', en: 'Rolling (16ths)', p: 'xxxxxxxxxxxxxxxx' },
    sidechain: { pt: 'Sidechain-ready', en: 'Sidechain-ready', p: '.xxx.xxx.xxx.xxx' },
    halftime: { pt: 'Half-time', en: 'Half-time', p: 'x.....x.x.......' },
    sub: { pt: 'Sub longo', en: 'Long sub', p: 'x...............' },
  };
  const ARPS = {
    fb: { pt: 'Future bass', en: 'Future bass', p: [0, 2, 4, 2, 5, 2, 4, 2, 1, 3, 5, 3, 6, 3, 5, 3] },
    up: { pt: 'Subida', en: 'Up', p: [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7] },
    updown: { pt: 'Sobe e desce', en: 'Up-down', p: [0, 1, 2, 3, 4, 3, 2, 1, 0, 1, 2, 3, 4, 3, 2, 1] },
    cascade: { pt: 'Cascata', en: 'Cascade', p: [5, 4, 3, 2, 1, 0, 1, 2, 5, 4, 3, 2, 1, 0, 1, 2] },
  };

  W.genMelody = function (chords, p) {
    const lo = 62, hi = 86, pool = []; for (let m = lo; m <= hi; m++) if (W.inScale(m, p.root, p.mode)) pool.push(m);
    const nearest = (pcs, target, dir) => { let best = -1, bd = 1e9; pool.forEach((m, i) => { if (!pcs.includes(mod(m, 12))) return; const d = Math.abs(m - target) + (dir && Math.sign(m - target) === dir ? -0.01 : 0); if (d < bd) { bd = d; best = i; } }); return best; };
    let idx = nearest(chords[0].pcs, 72, 1), k = 0; const notes = [], c = p.contour, bars = chords.length;
    for (let b = 0; b < bars; b++) {
      const ch = chords[b], rh = RH[p.complexity][(b % 4 === 3 ? 2 : b % 2)], on = []; for (let s = 0; s < 16; s++) if (rh[s] === 'x') on.push(s);
      on.forEach((s, j) => {
        let st = STEPS[k % 8]; k++;
        if (c > 0 && st < 0 && (c === 2 || k % 2 === 0)) st = -st; if (c < 0 && st > 0 && (c === -2 || k % 2 === 0)) st = -st;
        if (j === 0 && b === 0) st = 0;
        idx += st; if (idx >= pool.length - 1) idx = nearest(ch.pcs, lo + 8, 0); if (idx < 0) idx = nearest(ch.pcs, hi - 8, 0);
        const req = s % 8 === 0 || (p.complexity <= 2 && s % 4 === 0);
        if (req && !ch.pcs.includes(mod(pool[idx], 12))) idx = nearest(ch.pcs, pool[idx], Math.sign(st));
        if (b === bars - 1 && j === on.length - 1) idx = nearest([chords[bars - 1].pcs[0]], pool[idx], 0);
        const nxt = on[j + 1] != null ? on[j + 1] : 16, gap = (nxt - s) * 0.25, len = Math.max(0.1, gap * (p.voice === 'pluck' ? 0.5 : 0.95));
        notes.push({ t: b * 4 + s * 0.25, dur: len, midi: pool[idx], vel: s % 4 === 0 ? 108 : 88 });
      });
    }
    return notes;
  };
  W.genCounter = function (chords, mel, p) {
    const out = []; let prev = 62;
    chords.forEach((ch, b) => {
      const bm = mel.filter(n => n.t >= b * 4 && n.t < b * 4 + 4), dir = bm.length > 1 ? Math.sign(bm[bm.length - 1].midi - bm[0].midi) : 0;
      [0, 2].forEach(off => {
        const t = b * 4 + off, mm = mel.find(n => n.t <= t + 1e-6 && n.t + n.dur > t - 1e-6), avoid = mm ? mod(mm.midi, 12) : -1; let best = null, bd = 1e9;
        for (let m = 55; m <= 71; m++) { if (!ch.pcs.includes(mod(m, 12)) || mod(m, 12) === avoid) continue; const d = Math.abs(m - (prev - dir * 3)); if (d < bd) { bd = d; best = m; } }
        if (best != null) { out.push({ t, dur: 1.9, midi: best, vel: 80 }); prev = best; }
      });
    });
    return out;
  };
  W.genArp = function (chords, kind) {
    const out = [], pat = ARPS[kind].p;
    chords.forEach((ch, b) => {
      const base = W.voiceLead([ch.pcs], { lo: 55, hi: 67 })[0], pool = base.concat(base.map(m => m + 12)); for (let s = 0; s < 16; s++) out.push({ t: b * 4 + s * 0.25, dur: 0.2, midi: pool[pat[s] % pool.length], vel: s % 4 === 0 ? 100 : 80 });
    });
    return out;
  };
  W.genBass = function (chords, kind, sub) {
    const out = [], subN = [], pat = BASSPAT[kind].p;
    chords.forEach((ch, b) => {
      const r = W.bassNote(ch.rootPc);
      for (let s = 0; s < 16; s++) if (pat[s] === 'x') { const up = kind === 'rolling' && s % 4 === 3 ? 12 : 0; let nxt = s + 1; while (nxt < 16 && pat[nxt] !== 'x') nxt++; out.push({ t: b * 4 + s * 0.25, dur: kind === 'sub' ? 3.8 : Math.min(2, (nxt - s) * 0.25 * 0.9), midi: r + up, vel: s % 4 === 0 ? 112 : 95 }); }
      if (sub) subN.push({ t: b * 4, dur: 3.9, midi: r - 12 < 24 ? r : r - 12, vel: 100 });
    });
    return { bass: out, sub: subN };
  };

  W.tools.push({
    id: 'alvorada', icon: '🌅', name: 'Alvorada',
    desc: () => L('Melodia sempre dentro da harmonia, contra-melodia, arpejos, baixo/sub e synth fácil com biblioteca.', 'Melody that always stays in harmony, counter-melody, arps, bass/sub and an easy synth with a library.'),
    render(root) {
      const P = W.project, fl = W.useFlats(P.root, P.mode); let cv, data;
      const rollBox = h('div'), info = h('p', { class: 'hint' });
      const scaleP = key => { const p = Object.assign({}, W.PRESETS[S.presets[key]].p); p.cutoff = Math.min(20000, (p.cutoff || 3000) * S.cutoff); p.rel = (p.rel || 0.2) * S.release; return p; };
      const build = () => {
        const base = W.progression(S.style, S.variant, P.root, P.mode, false).chords, chords = []; for (let i = 0; i < S.bars; i++) chords.push(base[i % base.length]);
        const mel = W.genMelody(chords, { root: P.root, mode: P.mode, contour: S.contour, complexity: S.complexity, voice: S.voice });
        const ctr = W.genCounter(chords, mel, {}), arp = W.genArp(chords, S.arp), bs = W.genBass(chords, S.bassPat, S.sub);
        data = { chords, mel, ctr, arp, bass: bs.bass, sub: bs.sub, length: S.bars * 4 }; const L_ = S.layers, ev = [], rn = [];
        const add = (arr, key, inst, col) => arr.forEach(n => { ev.push({ kind: 'note', t: n.t, dur: n.dur, midi: n.midi, vel: n.vel, inst }); rn.push({ t: n.t, dur: n.dur, midi: n.midi, vel: n.vel, color: col }); });
        if (L_.mel) add(mel, 'mel', scaleP('mel'), '#6cf'); if (L_.counter) add(ctr, 'counter', scaleP('counter'), '#fc6'); if (L_.arp) add(arp, 'arp', scaleP('arp'), '#c8f');
        if (L_.bass) { add(data.bass, 'bass', scaleP('bass'), '#f88'); if (S.sub) add(data.sub, 'bass', W.PRESETS.sub.p, '#f55'); }
        data.ev = ev; data.rn = rn; cv = W.roll(rn, data.length, { height: 220 }); rollBox.replaceChildren(cv);
        info.textContent = chords.slice(0, Math.min(4, chords.length)).map(c => c.name).join(' – ') + ' ×' + (S.bars / Math.min(4, base.length));
      };
      const play = () => { if (W.audio.isPlaying()) return W.audio.stop(); build(); W.audio.play(data.ev, P.bpm, { loop: true, length: data.length, onTick: b => cv.draw(b), onStop: () => cv.draw() }); };
      const exp = () => { build(); const tr = (name, ch, arr) => ({ name, channel: ch, notes: arr.map(n => ({ t: n.t, dur: n.dur, note: n.midi, vel: n.vel })) });
        W.download(`Alvorada-${S.style}-${S.variant + 1}.mid`, W.midi.write({ bpm: P.bpm, name: 'Alvorada', tracks: [tr('Melodia', 0, data.mel), tr('Contra-melodia', 1, data.ctr), tr('Arp', 2, data.arp), tr('Baixo', 3, data.bass), tr('Sub', 4, data.sub)] })); };
      const re = () => { build(); };
      const lay = (k, t) => ui.check(t, S.layers[k], v => { S.layers[k] = v; re(); });
      const presetSel = (k, t) => ui.select(t, Object.entries(W.PRESETS).map(([id, v]) => ({ v: id, t: L(v.pt, v.en) })), S.presets[k], v => { S.presets[k] = v; re(); });
      root.append(
        ui.card(L('Gerar camadas sobre os acordes', 'Generate layers over the chords'),
          h('div', { class: 'row' },
            ui.select(L('Estilo dos acordes', 'Chord style'), W.STYLES.map(s => ({ v: s.id, t: W.styleName(s) })), S.style, v => { S.style = v; re(); }),
            ui.range(L('Variação', 'Variation'), 1, 4, 1, S.variant + 1, v => { S.variant = v - 1; re(); }),
            ui.select(L('Compassos', 'Bars'), [4, 8, 16].map(n => ({ v: n, t: n })), S.bars, v => { S.bars = +v; re(); })),
          h('div', { class: 'row' },
            ui.range(L('Descida ◂ ▸ Subida', 'Down ◂ ▸ Up'), -2, 2, 1, S.contour, v => { S.contour = v; re(); }, v => (v > 0 ? '+' : '') + v),
            ui.range(L('Simples ◂ ▸ Complexa', 'Simple ◂ ▸ Complex'), 1, 5, 1, S.complexity, v => { S.complexity = v; re(); }),
            ui.select(L('Estilo', 'Style'), [{ v: 'pluck', t: 'Pluck' }, { v: 'lead', t: 'Lead' }], S.voice, v => { S.voice = v; S.presets.mel = v === 'pluck' ? 'pluck' : 'lead'; re(); })),
          h('div', { class: 'row' }, ui.select(L('Padrão de baixo', 'Bass pattern'), Object.entries(BASSPAT).map(([k, v]) => ({ v: k, t: L(v.pt, v.en) })), S.bassPat, v => { S.bassPat = v; re(); }),
            ui.select(L('Arpejo', 'Arp'), Object.entries(ARPS).map(([k, v]) => ({ v: k, t: L(v.pt, v.en) })), S.arp, v => { S.arp = v; S.layers.arp = true; re(); }),
            ui.check(L('Sub (oitava abaixo)', 'Sub (octave below)'), S.sub, v => { S.sub = v; re(); })),
          h('div', { class: 'row' }, lay('mel', L('Melodia', 'Melody')), lay('counter', L('Contra-melodia', 'Counter-melody')), lay('arp', L('Arpejo (1 clique future bass: escolhe "Future bass")', 'Arp (one-click future bass: pick "Future bass")')), lay('bass', L('Baixo', 'Bass'))),
          info, rollBox, h('div', { class: 'row' }, ui.btn(L('▶ Tocar / parar', '▶ Play / stop'), play, 'primary'), ui.btn(L('⬇ Exportar MIDI (5 pistas)', '⬇ Export MIDI (5 tracks)'), exp))),
        ui.card(L('Synth fácil', 'Easy synth'), h('p', { class: 'hint' }, L('Escolhe um som por camada (EDM, piano, baixo, guitarra…) e ajusta só dois botões.', 'Pick a sound per layer (EDM, piano, bass, guitar…) and tweak just two knobs.')),
          h('div', { class: 'row' }, presetSel('mel', L('Som da melodia', 'Melody sound')), presetSel('counter', L('Som da contra-melodia', 'Counter sound')), presetSel('arp', L('Som do arpejo', 'Arp sound')), presetSel('bass', L('Som do baixo', 'Bass sound'))),
          h('div', { class: 'row' }, ui.range(L('Brilho', 'Brightness'), 0.4, 2.5, 0.05, S.cutoff, v => { S.cutoff = v; re(); }, v => v.toFixed(2) + '×'), ui.range(L('Release', 'Release'), 0.3, 3, 0.05, S.release, v => { S.release = v; re(); }, v => v.toFixed(2) + '×')),
          h('div', { class: 'row' }, ['C4', 'E4', 'G4', 'C5'].map((n, i) => ui.btn(L('Testar ', 'Try ') + n, () => { W.audio.ensure(); const c = W.audio.ctx; W.audio.voice(scaleP('mel'), [60, 64, 67, 72][i], c.currentTime, 0.7, 100, W.audio.master); }))))
      );
      build();
    },
  });
})();
