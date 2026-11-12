// Zenite web: arranjo com marcadores, drums por subgénero (variações/fills), build-up builder (snare roll + riser).
(function () {
  const W = globalThis.W, { h, ui, L } = W;
  const Z = (W.zenite = {});
  const GEN = [{ id: 'fb', pt: 'Future Bass', en: 'Future Bass', bpm: 150 }, { id: 'ph', pt: 'Progressive House', en: 'Progressive House', bpm: 126 }, { id: 'br', pt: 'Big Room', en: 'Big Room', bpm: 128 }];
  Z.GEN = GEN; Z.PIECES = ['Kick', 'Snare', 'Clap', 'HatC', 'HatO', 'Rim', 'TomL', 'TomM', 'TomH', 'Crash', 'Shaker', 'Impact', 'RevCrash'];
  const SEC = { Intro: { pt: 'Intro', en: 'Intro', c: '#5b8' }, Build: { pt: 'Build-up', en: 'Build-up', c: '#fa3' }, Drop: { pt: 'Drop', en: 'Drop', c: '#e46' }, Breakdown: { pt: 'Breakdown', en: 'Breakdown', c: '#58e' }, Outro: { pt: 'Outro', en: 'Outro', c: '#889' } };
  Z.SEC = SEC;
  const T = (s) => s.split(' ').map(x => ({ type: { I: 'Intro', B: 'Build', D: 'Drop', K: 'Breakdown', O: 'Outro' }[x[0]], bars: +x.slice(1) }));
  Z.TEMPLATES = {
    fb: [{ n: ['Padrão', 'Standard'], s: T('I8 B8 D16 K16 B8 D16 O8') }, { n: ['Compacto', 'Compact'], s: T('I4 B4 D8 K8 B4 D8 O4') }, { n: ['Extendido', 'Extended'], s: T('I16 B8 D16 K16 B8 D16 K8 B8 D16 O16') }],
    ph: [{ n: ['Padrão', 'Standard'], s: T('I16 B16 D32 K16 B16 D32 O16') }, { n: ['Compacto', 'Compact'], s: T('I16 B8 D16 K8 B8 D16 O8') }, { n: ['Extendido', 'Extended'], s: T('I32 B16 D32 K16 B16 D32 K8 B8 D16 O32') }],
    br: [{ n: ['Padrão', 'Standard'], s: T('I16 B8 D16 K16 B8 D16 O8') }, { n: ['Compacto', 'Compact'], s: T('I8 B8 D16 K8 B8 D16 O8') }, { n: ['Extendido', 'Extended'], s: T('I16 B8 D16 K16 B16 D16 K8 B8 D32 O16') }],
  };
  const TIPS = {
    fb: { Intro: ['Acordes suaves, pads e um pouco de percussão; apresenta o tom e o motivo principal.', 'Soft chords, pads and light percussion; introduce the key and main motif.'], Build: ['Sobe a energia: snare roll, riser e filtro a abrir; corta o baixo para o drop bater mais.', 'Raise energy: snare roll, riser and opening filter; cut the bass so the drop hits harder.'], Drop: ['Lead/chords em destaque, baixo e sub com sidechain; half-time na bateria dá o balanço típico.', 'Lead/chords up front, sidechained bass and sub; half-time drums give the typical swing.'], Breakdown: ['Tira bombo e baixo; fica a harmonia e a melodia (ou voz). Aqui é onde ensinas a "emoção" da faixa.', 'Remove kick and bass; keep harmony and melody (or vocal). This is the emotional core.'], Outro: ['Retira camadas até ficar só bateria/pads, ideal para o DJ misturar.', 'Strip layers down to drums/pads, DJ-friendly.'] },
    ph: { Intro: ['Bombo + hats desde cedo e poucos elementos; ótimo para mixar. Vai juntando um elemento a cada 8 compassos.', 'Kick + hats early with few elements; DJ-friendly. Add one element every 8 bars.'], Build: ['Tensão lenta: filtro, riser e repetição; o snare roll só nos últimos 4 compassos.', 'Slow tension: filter, riser and repetition; snare roll only in the last 4 bars.'], Drop: ['Groove constante com bombo a 4 e baixo a rolar; varia a cada 8 compassos para não cansar.', 'Constant four-on-floor groove and rolling bass; vary every 8 bars to keep interest.'], Breakdown: ['Sem bombo, acordes e melodia expostos; faz a transição de volta com um riser.', 'No kick, chords and melody exposed; return with a riser.'], Outro: ['Remove elementos em blocos de 8 compassos até ficar o bombo e a percussão.', 'Remove elements in 8-bar blocks until only kick and percussion remain.'] },
    br: { Intro: ['Intro curta e direta com bombo e hats; atenção à energia desde o início.', 'Short and direct intro with kick and hats; keep energy from the start.'], Build: ['Snare roll rápido com subida de tom, riser de ruído e silêncio antes do drop.', 'Fast snare roll with pitch rise, noise riser and a gap before the drop.'], Drop: ['Bombo forte, lead simples e marcante; menos notas, mais impacto. Impacto + crash no primeiro tempo.', 'Strong kick, simple punchy lead; fewer notes, more impact. Impact + crash on beat one.'], Breakdown: ['Momento melódico para respirar; repete o motivo do lead mais suave.', 'A melodic breather; restate the lead motif softer.'], Outro: ['Fecha com bateria e uma cauda de reverb/impacto.', 'Close with drums and a reverb/impact tail.'] },
  };
  const BARS = { Intro: ['8–16 compassos dão tempo para o DJ misturar sem cansar o ouvinte.', '8–16 bars give DJs time to mix without tiring the listener.'], Build: ['4–8 compassos: curto demais não dá tensão, longo demais cansa.', '4–8 bars: too short gives no tension, too long tires.'], Drop: ['16 compassos é o padrão (2 frases de 8); o 2.º drop pode repetir com variação.', '16 bars is standard (two 8-bar phrases); the 2nd drop can repeat with variation.'], Breakdown: ['8–16 compassos: espaço para melodia e voz.', '8–16 bars: room for melody and vocals.'], Outro: ['8–16 compassos para mixar para a faixa seguinte.', '8–16 bars to mix into the next track.'] };
  Z.sectionTip = (g, t) => L(...TIPS[g][t]); Z.barsTip = t => L(...BARS[t]);

  // Padrões de 16 passos: x normal, X acento, o fantasma
  const K4 = 'X...x...x...x...';
  Z.PAT = {
    fb: [
      { Kick: 'X.....x...x.....', Snare: '........X.......', Clap: '........X.......', HatC: 'x.x.x.x.x.x.x.x.', HatO: '..............x.' },
      { Kick: 'X.....x..x......', Snare: '........X.......', Clap: '........x.......', HatC: 'x.xxx.x.x.xxx.x.', Rim: '..o...o...o...o.' },
      { Kick: 'X.......x.x.....', Snare: '........X.......', Clap: '........X.......', HatC: 'xoxoxoxoxoxoxoxo' },
      { Kick: 'X...x.....x.....', Snare: '........X.......', HatC: 'x.x.x.x.x.x.x.xx', Rim: '.....o.....o....', Shaker: 'o.o.o.o.o.o.o.o.' },
    ],
    ph: [
      { Kick: K4, Clap: '....X.......X...', HatO: '..x...x...x...x.', Shaker: 'xoxoxoxoxoxoxoxo' },
      { Kick: K4, Clap: '....X.......X...', HatO: '..x...x...x...x.', Rim: '..o...o...o...o.', Shaker: 'x.x.x.x.x.x.x.x.' },
      { Kick: K4, Clap: '....X.......X...', Snare: '....o.......o...', HatC: 'xxxxxxxxxxxxxxxx' },
      { Kick: K4, Clap: '....X.......X...', HatO: '..x...x...x...x.', HatC: 'x...x...x...x...', Rim: '.o..o..o..o..o..' },
    ],
    br: [
      { Kick: K4, Snare: '....X.......X...', Clap: '....X.......X...', HatO: '..x...x...x...x.' },
      { Kick: K4, Snare: '....X.......X...', Clap: '....X.......X...', HatO: '..x...x...x...x.', HatC: 'x.xxx.xxx.xxx.xx' },
      { Kick: K4, Snare: '....X.......X...', Clap: '....X.......X...', HatO: '..x...x...x...x.', Shaker: 'xxxxxxxxxxxxxxxx' },
      { Kick: K4, Snare: '....X.......X...', Clap: '....x.......x...', HatO: '..x...x...x...x.', Rim: '.o..o..o..o..o..', TomL: '..............o.' },
    ],
  };
  const V = { x: 100, X: 120, o: 68 };
  const hitsOf = (pat, bar, scale) => { const o = []; for (const p in pat) for (let s = 0; s < 16; s++) { const c = pat[p][s]; if (c && c !== '.') o.push({ piece: p, start: bar * 4 + s * 0.25, length: 0.125, vel: Math.max(1, Math.round(V[c] * (scale || 1))) }); } return o; };
  Z.drumsForSection = function (dp, type, bars, startBeat) {
    const pats = Z.PAT[dp.genre], pat = pats[dp.variation % 4], hits = [];
    for (let b = 0; b < bars; b++) {
      let bh;
      if (type === 'Drop') bh = hitsOf(pat, b);
      else if (type === 'Breakdown') bh = hitsOf({ Shaker: 'x.x.x.x.x.x.x.x.', Rim: dp.genre === 'fb' ? '........x.......' : 'x...x...x...x...' }, b, 0.7);
      else bh = hitsOf(dp.genre === 'fb' ? { HatC: 'x.x.x.x.x.x.x.x.' } : { Kick: 'x...x...x...x...', HatC: 'x.x.x.x.x.x.x.x.' }, b, 0.7);
      const last = b === bars - 1, fillBar = type === 'Drop' && dp.fills > 0 && (b % 4 === 3 || (dp.fills >= 3 && b % 2 === 1) || last);
      if (fillBar) {
        const lvl = last ? Math.max(dp.fills, 2) : dp.fills, from = lvl >= 2 ? 8 : 12; bh = bh.filter(x => x.piece === 'Kick' || x.start < b * 4 + from * 0.25);
        if (lvl === 1) for (let s = 12; s < 16; s++) bh.push({ piece: 'Snare', start: b * 4 + s * 0.25, length: 0.125, vel: 70 + (s - 12) * 12 });
        else { const seq = lvl === 2 ? ['TomH', null, 'TomM', null, 'TomL', null, 'Snare', 'Snare'] : ['TomH', 'TomH', 'TomM', 'TomM', 'TomL', 'TomL', 'Snare', 'Snare'];
          seq.forEach((p, i) => p && bh.push({ piece: p, start: b * 4 + (8 + i) * 0.25, length: 0.125, vel: 80 + i * 6 })); }
      }
      if (type === 'Drop' && b > 0 && b % 8 === 0) bh.push({ piece: 'Crash', start: b * 4, length: 1, vel: 105 });
      hits.push(...bh);
    }
    if (type === 'Drop') hits.push({ piece: 'Impact', start: 0, length: 2, vel: 120 }, { piece: 'Crash', start: 0, length: 1, vel: 115 });
    hits.forEach(x => x.start += startBeat); return hits.sort((a, b) => a.start - b.start);
  };
  Z.riserAmp = t => 0.15 + 0.85 * t * t; Z.riserCutoff01 = t => t * t; Z.riserPitch01 = t => Math.pow(t, 1.5);
  Z.buildUpHits = function (bp, dp, bars, startBeat) {
    const total = bars * 4, end = total - (bp.silenceEnd ? 0.5 : 0), out = [], sn = [];
    if (bp.kicks) for (let b = 0; b < total; b++) out.push({ piece: 'Kick', start: b, length: 0.25, vel: 100 });
    if (bp.curve === 'stepped') {
      const iois = [1, 0.5, 0.25, 0.125].filter(x => x <= bp.startIoi + 1e-9), seg = end / iois.length;
      iois.forEach((ioi, i) => { for (let t = i * seg; t < (i + 1) * seg - 1e-9; t += ioi) sn.push(t); });
    } else { let t = 0; while (t < end - 1e-9) { sn.push(t); const x = t / end; t += Math.max(0.125, bp.startIoi * Math.pow(0.125 / bp.startIoi, x)); } }
    const last = sn.length - 1; sn.forEach((t, i) => out.push({ piece: 'Snare', start: t, length: 0.125, vel: Math.round(50 + 77 * (i / Math.max(1, last))) }));
    if (bp.revCrash) { const L_ = Math.min(4, total); out.push({ piece: 'RevCrash', start: total - L_, length: L_, vel: 100 }); }
    out.forEach(x => x.start += startBeat); return out.sort((a, b) => a.start - b.start);
  };
  Z.makePlan = function (mode, dp, bp, ti, override, buildBars, loopBars) {
    const plan = { hits: [], risers: [], sections: [], length: 0 };
    let defs;
    if (mode === 'build') defs = [{ type: 'Build', bars: buildBars }]; else if (mode === 'drums') defs = [{ type: 'Drop', bars: loopBars }];
    else { defs = Z.TEMPLATES[dp.genre][ti].s.map(x => Object.assign({}, x)); if (override && override.length === defs.length) defs.forEach((d, i) => d.bars = override[i]); }
    let t = 0;
    defs.forEach((d, i) => {
      const len = d.bars * 4, sp = { type: d.type, start: t, length: len, bars: d.bars, label: L(SEC[d.type].pt, SEC[d.type].en), tip: Z.sectionTip(dp.genre, d.type), barsTip: Z.barsTip(d.type) };
      plan.sections.push(sp);
      if (d.type === 'Build') { plan.hits.push(...Z.buildUpHits(bp, dp, d.bars, t)); plan.risers.push({ start: t, length: len, p: bp }); }
      else plan.hits.push(...Z.drumsForSection(dp, d.type, d.bars, t));
      t += len;
    });
    plan.length = t; plan.hits.sort((a, b) => a.start - b.start); return plan;
  };
  Z.riserEvent = function (r, rootPc) {
    return { kind: 'fn', t: r.start, fn(tt, spb, bus) {
      const A = W.audio, c = A.ctx, dur = r.length * spb, N = 64, p = r.p, ton = W.freq(60 + rootPc);
      const amp = new Float32Array(N), cut = new Float32Array(N), pit = new Float32Array(N);
      for (let i = 0; i < N; i++) { const x = i / (N - 1); amp[i] = Z.riserAmp(x) * 0.5; cut[i] = 200 * Math.pow(90, Z.riserCutoff01(x) * p.filterAmt + (1 - p.filterAmt) * 0.3); pit[i] = ton * Math.pow(2, -(p.rangeSemis / 12) * (1 - Z.riserPitch01(x))); }
      const g = c.createGain(), f = c.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 3; g.gain.setValueCurveAtTime(amp, tt, dur); f.frequency.setValueCurveAtTime(cut, tt, dur); f.connect(g); g.connect(bus);
      if (p.riser !== 'noise') for (let k = -1; k <= 1; k++) { const o = c.createOscillator(); o.type = 'sawtooth'; o.detune.value = k * 14; o.frequency.setValueCurveAtTime(pit, tt, dur); const og = c.createGain(); og.gain.value = 0.28; o.connect(og); og.connect(f); o.start(tt); o.stop(tt + dur + 0.05); }
      if (p.riser !== 'saw') { const s = c.createBufferSource(); s.buffer = A.noise; s.loop = true; const ng = c.createGain(); ng.gain.value = p.riser === 'both' ? 0.35 : 0.8; s.connect(ng); ng.connect(f); s.start(tt); s.stop(tt + dur + 0.05); }
    } };
  };
  Z.guide = function (plan, dp, ti) {
    let bar = 1; const g = GEN.find(x => x.id === dp.genre);
    const lines = [L('GUIA DE ARRANJO', 'ARRANGEMENT GUIDE') + ' — ' + L(g.pt, g.en), ''];
    plan.sections.forEach(s => { lines.push(`${L('Compasso', 'Bar')} ${bar}–${bar + s.bars - 1}  ${s.label} (${s.bars} ${L('compassos', 'bars')})`, '  ' + s.tip, '  ' + s.barsTip, ''); bar += s.bars; });
    return lines.join('\n');
  };

  W.tools.push({
    id: 'zenite', icon: '⚡', name: 'Zenite',
    desc: () => L('Template de arranjo com marcadores e dicas, build-up builder (snare roll + riser) e drums por subgénero.', 'Arrangement template with markers and tips, build-up builder (snare roll + riser) and drums per subgenre.'),
    render(root) {
      const P = W.project, st = (W.zeniteState = W.zeniteState || { mode: 'arr', genre: 'fb', variation: 0, fills: 2, tpl: 0, ov: null, buildBars: 8, loopBars: 8, bp: { curve: 'stepped', startIoi: 1, kicks: true, silenceEnd: true, revCrash: true, riser: 'both', rangeSemis: 24, filterAmt: 0.7 } });
      const body = h('div'), tl = h('div', { class: 'timeline' }), tips = h('div', { class: 'tips' }), rollBox = h('div'); let plan, cv;
      const dp = () => ({ genre: st.genre, variation: st.variation, fills: st.fills });
      const calc = () => { plan = Z.makePlan(st.mode, dp(), st.bp, st.tpl, st.ov, st.buildBars, st.loopBars); };
      const draw = () => {
        calc(); tl.replaceChildren(...plan.sections.map((s, i) => h('div', { class: 'sec', style: `flex:${s.bars};background:${SEC[s.type].c}` }, h('b', null, s.label), h('small', null, `${s.bars} ${L('comp.', 'bars')}`),
          st.mode === 'arr' ? h('select', { onchange: e => { st.ov = plan.sections.map(x => x.bars); st.ov[i] = +e.target.value; draw(); } }, [4, 8, 16, 32].map(n => h('option', { value: n, selected: n === s.bars }, n))) : null)));
        tips.replaceChildren(...(st.mode === 'arr' ? plan.sections : plan.sections.slice(0, 1)).map(s => h('div', { class: 'tip' }, h('b', { style: `color:${SEC[s.type].c}` }, s.label + ' · ' + s.bars), h('div', null, s.tip), h('small', null, s.barsTip))));
        const rn = plan.hits.map(x => ({ t: x.start, dur: Math.max(0.1, Math.min(x.length, 1)), midi: 40 + Z.PIECES.indexOf(x.piece), vel: x.vel, color: x.piece === 'Kick' ? '#f66' : x.piece === 'Snare' || x.piece === 'Clap' ? '#fc6' : '#6cf' }));
        cv = W.roll(rn, plan.length, { height: 150 }); rollBox.replaceChildren(cv);
      };
      const events = () => { const ev = plan.hits.map(x => ({ kind: 'drum', t: x.start, piece: x.piece, vel: x.vel, len: x.length })); plan.risers.forEach(r => ev.push(Z.riserEvent(r, P.root))); return ev; };
      const play = () => { if (W.audio.isPlaying()) return W.audio.stop(); calc(); W.audio.play(events(), P.bpm, { loop: st.mode !== 'arr', length: plan.length, onTick: b => cv && cv.draw(b), onStop: () => cv && cv.draw() }); };
      const expMidi = () => { calc(); const cc = [], notes = [];
        plan.risers.forEach(r => { for (let b = 0; b <= r.length; b += 0.25) { const x = b / r.length; cc.push({ t: r.start + b, cc: 74, val: 127 * Z.riserCutoff01(x) }, { t: r.start + b, cc: 11, val: 127 * Z.riserAmp(x) }); } notes.push({ t: r.start, dur: r.length, note: 48 + P.root, vel: 90 }); });
        W.download(`Zenite-${st.genre}-${st.mode}.mid`, W.midi.write({ bpm: P.bpm, name: 'Zenite', markers: plan.sections.map(s => ({ t: s.start, text: s.label })), tracks: [{ name: 'Drums', channel: 9, notes: plan.hits.map(x => ({ t: x.start, dur: Math.max(0.1, x.length), note: A_GM[x.piece], vel: x.vel })) }, { name: 'Riser (CC74 filtro / CC11 volume)', channel: 1, notes, cc }] })); };
      const A_GM = W.audio.GM;
      const expTxt = () => { calc(); W.download(`Zenite-${st.genre}-guia.txt`, Z.guide(plan, dp(), st.tpl), 'text/plain;charset=utf-8'); };
      const ctl = () => {
        const bp = st.bp, r = [];
        r.push(h('div', { class: 'row' }, ui.select(L('Modo', 'Mode'), [{ v: 'arr', t: L('Arranjo completo', 'Full arrangement') }, { v: 'build', t: 'Build-up' }, { v: 'drums', t: 'Drums' }], st.mode, v => { st.mode = v; mount(); }),
          ui.select(L('Subgénero', 'Subgenre'), GEN.map(g => ({ v: g.id, t: L(g.pt, g.en) })), st.genre, v => { st.genre = v; st.ov = null; draw(); }),
          ui.range(L('Variação de drums', 'Drum variation'), 1, 4, 1, st.variation + 1, v => { st.variation = v - 1; draw(); }),
          ui.range('Fills', 0, 3, 1, st.fills, v => { st.fills = v; draw(); }),
          ui.btn(L('Usar BPM do subgénero', 'Use subgenre BPM'), () => { P.bpm = GEN.find(g => g.id === st.genre).bpm; W.syncProject(); }, 'ghost')));
        if (st.mode === 'arr') r.push(h('div', { class: 'row' }, ui.select(L('Modelo', 'Template'), Z.TEMPLATES[st.genre].map((t, i) => ({ v: i, t: L(...t.n) })), st.tpl, v => { st.tpl = +v; st.ov = null; draw(); })));
        if (st.mode === 'drums') r.push(h('div', { class: 'row' }, ui.select(L('Compassos', 'Bars'), [4, 8, 16].map(n => ({ v: n, t: n })), st.loopBars, v => { st.loopBars = +v; draw(); })));
        if (st.mode === 'build' || st.mode === 'arr') r.push(h('details', { open: st.mode === 'build' }, h('summary', null, L('Build-up: snare roll e riser', 'Build-up: snare roll and riser')), h('div', { class: 'row' },
          st.mode === 'build' ? ui.select(L('Compassos', 'Bars'), [4, 8, 16].map(n => ({ v: n, t: n })), st.buildBars, v => { st.buildBars = +v; draw(); }) : null,
          ui.select(L('Rampa', 'Ramp'), [{ v: 'stepped', t: L('Em degraus (1/4→1/32)', 'Stepped (1/4→1/32)') }, { v: 'smooth', t: L('Contínua', 'Smooth') }], bp.curve, v => { bp.curve = v; draw(); }),
          ui.select(L('Início do roll', 'Roll start'), [{ v: 1, t: '1/4' }, { v: 0.5, t: '1/8' }, { v: 0.25, t: '1/16' }], bp.startIoi, v => { bp.startIoi = +v; draw(); }),
          ui.select('Riser', [{ v: 'both', t: L('Saw + ruído', 'Saw + noise') }, { v: 'saw', t: 'Saw' }, { v: 'noise', t: L('Ruído', 'Noise') }], bp.riser, v => { bp.riser = v; }),
          ui.range(L('Subida do riser (semitons)', 'Riser rise (semitones)'), 5, 36, 1, bp.rangeSemis, v => { bp.rangeSemis = v; }), ui.range(L('Abertura do filtro', 'Filter opening'), 0, 1, 0.05, bp.filterAmt, v => { bp.filterAmt = v; }),
          ui.check(L('Bombo a 4', 'Kick on 4'), bp.kicks, v => { bp.kicks = v; draw(); }), ui.check(L('Silêncio antes do drop', 'Gap before drop'), bp.silenceEnd, v => { bp.silenceEnd = v; draw(); }), ui.check(L('Prato invertido', 'Reverse crash'), bp.revCrash, v => { bp.revCrash = v; draw(); }))));
        return r;
      };
      const mount = () => { body.replaceChildren(ui.card(L('Estrutura e energia', 'Structure & energy'), ...ctl(), tl, rollBox, tips,
        h('div', { class: 'row' }, ui.btn(L('▶ Tocar / parar', '▶ Play / stop'), play, 'primary'), ui.btn(L('⬇ MIDI com marcadores', '⬇ MIDI with markers'), expMidi), ui.btn(L('⬇ Guia (.txt)', '⬇ Guide (.txt)'), expTxt)))); draw(); };
      root.append(body); mount();
    },
  });
})();
