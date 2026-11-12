// Equilíbrio web: EQ por função com explicações, analisador de 8 bandas com conselhos, ducker sincronizado, conselhos bombo/baixo.
(function () {
  const W = globalThis.W, { h, ui, L } = W, mod = W.mod;
  const E = (W.equilibrio = {});
  E.EDGES = [20, 60, 120, 250, 500, 2000, 4000, 8000, 20000];
  E.CENTERS = E.EDGES.slice(0, 8).map((f, i) => Math.sqrt(f * E.EDGES[i + 1]));
  E.BANDN = [['Sub 20–60 Hz', 'Sub 20–60 Hz'], ['Graves 60–120 Hz', 'Bass 60–120 Hz'], ['Graves-médios 120–250 Hz', 'Low-mids 120–250 Hz'], ['Lama 250–500 Hz', 'Mud 250–500 Hz'], ['Médios 500 Hz–2 kHz', 'Mids 500 Hz–2 kHz'], ['Presença 2–4 kHz', 'Presence 2–4 kHz'], ['Brilho 4–8 kHz', 'Brightness 4–8 kHz'], ['Ar 8–20 kHz', 'Air 8–20 kHz']];
  const OFF = { mix: [0, 0, 0, 0, 0, 0, 0, 0], kick: [10, 8, 2, -3, -8, -8, -12, -16], bass: [3, 8, 6, -1, -8, -14, -20, -26], sub: [14, 6, -8, -20, -30, -40, -45, -50], lead: [-20, -14, -6, 0, 6, 5, 2, -2], pad: [-18, -10, -3, 0, 3, 0, -3, -8], vocal: [-30, -18, -6, 0, 6, 4, 1, -3], hats: [-40, -40, -30, -20, -10, -2, 8, 10] };
  E.ROLES = [['mix', 'Mix geral', 'Full mix'], ['kick', 'Bombo', 'Kick'], ['bass', 'Baixo', 'Bass'], ['sub', 'Sub', 'Sub'], ['lead', 'Lead', 'Lead'], ['pad', 'Pad / acordes', 'Pad / chords'], ['vocal', 'Voz / vocal chop', 'Vocal / chop'], ['hats', 'Hats / topo', 'Hats / top']];
  const SUG = {
    mix: [[25, 'hp', 0, 0.7, ['Filtro passa-alto: tira energia inútil abaixo do sub e liberta headroom.', 'High-pass: removes useless energy below the sub and frees headroom.']], [300, 'pk', -1.5, 1, ['Corte suave nos 300 Hz: reduz a "lama" acumulada de muitas camadas.', 'Gentle cut at 300 Hz: reduces the mud from stacked layers.']], [10000, 'hs', 1, 0.7, ['Prateleira suave de ar para abrir o topo.', 'Soft air shelf to open the top.']]],
    kick: [[30, 'hp', 0, 0.7, ['Corta o que está abaixo da fundamental para não gastar headroom.', 'Cut below the fundamental to save headroom.']], [60, 'pk', 3, 1.2, ['Realça o peso do bombo na fundamental.', 'Boosts the kick weight at the fundamental.']], [300, 'pk', -3, 1.2, ['Tira o som "de caixa de cartão" que mascara o baixo.', 'Removes the boxy tone that masks the bass.']], [3500, 'pk', 2, 1.5, ['Realça o clique para o bombo cortar a mistura.', 'Boosts the click so the kick cuts through.']]],
    bass: [[30, 'hp', 0, 0.7, ['Passa-alto para limpar sub-graves que não se ouvem.', 'High-pass to clean inaudible sub-lows.']], [250, 'pk', -2, 1, ['Reduz a lama dos médios-graves.', 'Reduces low-mid mud.']], [80, 'pk', 2, 1, ['Realça o corpo do baixo.', 'Boosts bass body.']], [700, 'pk', 1.5, 1.2, ['Dá definição para o baixo ouvir-se em colunas pequenas.', 'Adds definition so the bass is heard on small speakers.']]],
    sub: [[25, 'hp', 0, 0.7, ['Remove infra-sons que só gastam energia.', 'Removes infra-sonics that just waste energy.']], [120, 'lp', 0, 0.7, ['Passa-baixo: o sub só deve ter graves puros (o resto é do baixo).', 'Low-pass: sub should be pure lows (the rest belongs to the bass).']]],
    lead: [[120, 'hp', 0, 0.7, ['Libertar os graves para o bombo e o baixo.', 'Free the lows for kick and bass.']], [300, 'pk', -2, 1, ['Menos lama para o lead ficar limpo.', 'Less mud so the lead stays clean.']], [3000, 'pk', 2, 1, ['Presença: o lead destaca-se.', 'Presence: the lead stands out.']], [10000, 'hs', 1.5, 0.7, ['Brilho extra.', 'Extra shine.']]],
    pad: [[150, 'hp', 0, 0.7, ['Pads não precisam de graves; deixa o espaço ao baixo.', 'Pads do not need lows; leave room for the bass.']], [400, 'pk', -2, 1, ['Menos corpo, menos lama.', 'Less body, less mud.']], [3000, 'pk', -2, 1, ['Abre espaço para o lead e a voz.', 'Makes room for the lead and vocal.']]],
    vocal: [[100, 'hp', 0, 0.7, ['Tira ruído de graves e plosivas.', 'Removes low rumble and plosives.']], [250, 'pk', -2, 1, ['Reduz o som "enfiado" na voz.', 'Reduces boxiness in the voice.']], [3000, 'pk', 2.5, 1, ['Inteligibilidade e presença.', 'Intelligibility and presence.']], [10000, 'hs', 2, 0.7, ['Ar e brilho.', 'Air and sparkle.']]],
    hats: [[400, 'hp', 0, 0.7, ['Hats não têm nada a fazer nos médios-graves.', 'Hats have no business in the low-mids.']], [8000, 'pk', 2, 0.9, ['Brilho metálico.', 'Metallic sparkle.']]],
  };
  E.suggestedEq = role => SUG[role].map(x => ({ f: x[0], type: x[1], gain: x[2], q: x[3], why: L(...x[4]) }));
  E.targetProfile = function (role) {
    const base = E.CENTERS.map((fc, i) => 10 * Math.log10(Math.log2(E.EDGES[i + 1] / E.EDGES[i])) - 1.5 * Math.log2(fc / 1000));
    const raw = base.map((b, i) => b + OFF[role][i]), m = raw.reduce((a, b) => a + b, 0) / 8; return raw.map(x => x - m);
  };
  E.analyse = function (powers /* potência linear por banda */, role) {
    const db = powers.map(p => 10 * Math.log10(Math.max(p, 1e-20))), m = db.reduce((a, b) => a + b, 0) / 8, meas = db.map(x => x - m), tgt = E.targetProfile(role);
    return meas.map((x, i) => ({ meas: x, target: tgt[i], diff: x - tgt[i] }));
  };
  E.advice = function (an) {
    const out = an.map((b, i) => { if (Math.abs(b.diff) <= 4) return null; const g = Math.min(6, Math.round(Math.abs(b.diff) * 0.6 * 2) / 2), fc = Math.round(E.CENTERS[i]), nm = L(...E.BANDN[i]);
      return b.diff > 0 ? { l: 'warn', t: L(`${nm}: ${b.diff.toFixed(1)} dB acima do esperado — corta ~${g} dB com um sino largo perto de ${fc} Hz.`, `${nm}: ${b.diff.toFixed(1)} dB above expected — cut ~${g} dB with a wide bell near ${fc} Hz.`) }
        : { l: 'info', t: L(`${nm}: ${(-b.diff).toFixed(1)} dB abaixo do esperado — realça ~${g} dB perto de ${fc} Hz (ou corta o que o mascara).`, `${nm}: ${(-b.diff).toFixed(1)} dB below expected — boost ~${g} dB near ${fc} Hz (or cut what masks it).`) }; }).filter(Boolean);
    return out.length ? out : [{ l: 'ok', t: L('Equilíbrio dentro da tolerância (±4 dB) para esta função.', 'Balance within tolerance (±4 dB) for this role.') }];
  };
  E.sidechainFor = function (bpm, kind) { const spb = 60 / bpm; return { atk: 0.004 / spb, rel: Math.min(0.9, (kind === 'fb' ? 0.28 : 0.22) / spb * (120 / Math.max(60, bpm))), depth: kind === 'fb' ? 0.85 : 0.75 }; };
  E.duckGainAt = function (t, atk, rel, depth) { // t em tempos desde o gatilho
    let a = 0; if (t < 0) a = 0; else if (t < atk) a = t / atk; else if (t < atk + rel) { const x = (t - atk) / rel; a = (1 - x) * (1 - x); } return 1 - depth * a;
  };
  E.TRIG = { beat: [0, 1, 2, 3], half: [0, 2], fb: [0, 2.5] };
  E.kickBass = function (kickHz, root, mode) {
    const mf = 69 + 12 * Math.log2(kickHz / 440), m = Math.round(mf), pc = mod(m, 12), fl = W.useFlats(root, mode), cents = Math.round((mf - m) * 100);
    const inKey = W.inScale(m, root, mode); let target = null;
    if (!(pc === root || pc === mod(root + 7, 12))) { let bd = 99; [root, mod(root + 7, 12)].forEach(t => { for (let k = -6; k <= 6; k++) if (Math.abs(k) < bd && mod(m + k, 12) === t) { bd = Math.abs(k); target = k; } }); }
    return { note: W.noteName(pc, fl), cents, crossover: Math.max(70, Math.min(130, Math.round(kickHz * 1.6))), inKey, shift: target,
      tips: [target ? L(`O bombo (${W.noteName(pc, fl)}) não está na tónica nem na quinta: afina-o ${target > 0 ? '+' : ''}${target} semitons para ${W.noteName(mod(m + target, 12), fl)} (tónica ou quinta) e fica harmonioso com o baixo.`, `The kick (${W.noteName(pc, fl)}) is neither the tonic nor the fifth: tune it ${target > 0 ? '+' : ''}${target} semitones to ${W.noteName(mod(m + target, 12), fl)} (tonic or fifth) so it blends with the bass.`) : L('Bombo afinado na tónica ou quinta: ótimo.', 'Kick tuned to tonic or fifth: great.'),
        L(`Crossover sugerido: ~${Math.max(70, Math.min(130, Math.round(kickHz * 1.6)))} Hz — abaixo dele o sub/bombo, acima o corpo do baixo (um deles ocupa os graves em cada instante).`, `Suggested crossover: ~${Math.max(70, Math.min(130, Math.round(kickHz * 1.6)))} Hz — below it sub/kick, above it the bass body (only one owns the lows at a time).`),
        L('Usa sidechain no baixo com o bombo como gatilho: release curto (≈1/8 de tempo), profundidade 70–85%.', 'Sidechain the bass from the kick: short release (≈1/8 beat), depth 70–85%.')] };
  };

  const S = (E.state = { role: 'mix', src: 'demo', apply: true, duck: true, pat: 'beat', depth: 0.8, rel: 0.5, kick: 50, buf: null, fname: '' });
  W.tools.push({
    id: 'equilibrio', icon: '⚖️', name: 'Equilíbrio',
    desc: () => L('EQ por função com explicações, analisador de 8 bandas com conselhos, ducker sincronizado e conselhos bombo/baixo.', 'Role-based EQ with explanations, 8-band analyser with advice, synced ducker and kick/bass advice.'),
    render(rootEl) {
      const P = W.project, ctx0 = () => W.audio.ensure(); let raf = 0, nodes = null, acc = new Array(8).fill(1e-12), timer = 0, fileSrc = null, t0 = 0;
      const eqBox = h('div'), an = h('canvas', { class: 'roll', width: 900, height: 200 }), adv = h('div', { class: 'report' }), scv = h('canvas', { class: 'roll', width: 900, height: 120 }), kbBox = h('div', { class: 'report' });
      const drawEq = () => eqBox.replaceChildren(h('table', { class: 'tbl' }, h('tr', null, ['Hz', L('Tipo', 'Type'), 'dB', L('Porquê', 'Why')].map(x => h('th', null, x))), ...E.suggestedEq(S.role).map(s => h('tr', null, h('td', null, s.f), h('td', null, { hp: L('passa-alto', 'high-pass'), lp: L('passa-baixo', 'low-pass'), pk: L('sino', 'bell'), hs: L('prateleira alta', 'high shelf') }[s.type]), h('td', null, s.type === 'hp' || s.type === 'lp' ? '—' : (s.gain > 0 ? '+' : '') + s.gain), h('td', null, s.why)))));
      const drawSc = () => { const g = scv.getContext('2d'), w = scv.width, hh = scv.height, st = getComputedStyle(document.documentElement), sc = E.sidechainFor(P.bpm, 'fb'), rel = Math.max(0.05, S.rel * 0.9);
        g.clearRect(0, 0, w, hh); g.fillStyle = st.getPropertyValue('--panel2'); g.fillRect(0, 0, w, hh); g.strokeStyle = st.getPropertyValue('--accent'); g.lineWidth = 2; g.beginPath();
        for (let x = 0; x <= w; x++) { const t = (x / w) * 4; let gn = 1; E.TRIG[S.pat].forEach(tr => { gn = Math.min(gn, E.duckGainAt(t - tr, sc.atk, rel, S.depth)); }); const y = hh - 8 - gn * (hh - 16); x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); };
      const drawAn = (res) => { const g = an.getContext('2d'), w = an.width, hh = an.height, st = getComputedStyle(document.documentElement); g.clearRect(0, 0, w, hh); g.fillStyle = st.getPropertyValue('--panel2'); g.fillRect(0, 0, w, hh);
        const bw = w / 8, y = v => hh / 2 - (v / 24) * (hh / 2 - 14); g.strokeStyle = st.getPropertyValue('--border'); g.beginPath(); g.moveTo(0, y(0)); g.lineTo(w, y(0)); g.stroke();
        const tgt = E.targetProfile(S.role);
        for (let i = 0; i < 8; i++) { const m = res ? res[i].meas : 0, ok = res && Math.abs(res[i].diff) <= 4; g.fillStyle = res ? (ok ? st.getPropertyValue('--good') : st.getPropertyValue('--warn')) : st.getPropertyValue('--muted'); g.globalAlpha = res ? 0.85 : 0.2; const y0 = y(0), y1 = y(Math.max(-24, Math.min(24, m))); g.fillRect(i * bw + 8, Math.min(y0, y1), bw - 16, Math.max(2, Math.abs(y1 - y0))); g.globalAlpha = 1;
          g.fillStyle = st.getPropertyValue('--accent2'); g.fillRect(i * bw + 4, y(tgt[i]) - 2, bw - 8, 4); g.fillStyle = st.getPropertyValue('--text'); g.font = '11px sans-serif'; g.fillText(L(...E.BANDN[i]).split(' ').slice(-2).join(' '), i * bw + 8, hh - 3); } };
      const stopAll = () => { cancelAnimationFrame(raf); clearInterval(timer); if (fileSrc) { try { fileSrc.stop(); } catch (e) {} fileSrc = null; } W.audio.stop(); if (nodes && nodes.out) { try { nodes.out.disconnect(); } catch (e) {} } nodes = null; };
      const mkChain = () => { const c = ctx0(), inp = c.createGain(), out = c.createGain(), eq = [];
        let last = inp; E.suggestedEq(S.role).forEach(s => { const f = c.createBiquadFilter(); f.type = { hp: 'highpass', lp: 'lowpass', pk: 'peaking', hs: 'highshelf' }[s.type]; f.frequency.value = s.f; f.Q.value = s.q; f.gain.value = S.apply ? s.gain : 0; if (!S.apply && s.type === 'hp') f.frequency.value = 10; if (!S.apply && s.type === 'lp') f.frequency.value = 20000; last.connect(f); last = f; });
        const duck = c.createGain(), analyser = c.createAnalyser(); analyser.fftSize = 4096; analyser.smoothingTimeConstant = 0.7; last.connect(duck); duck.connect(out); out.connect(analyser); return { inp, out, duck, analyser, eq }; };
      const scheduleDuck = (ch, grid, from, to) => { const sc = E.sidechainFor(P.bpm, S.pat === 'fb' ? 'fb' : 'x'), spb = 60 / P.bpm, rel = Math.max(0.05, S.rel * 0.9), len = Math.min(0.95, sc.atk + rel), n = 40, bTo = (to - grid) / spb;
        for (let bar = Math.max(0, Math.floor((from - grid) / spb / 4)); bar * 4 <= bTo; bar++) E.TRIG[S.pat].forEach(tr => { const tt = grid + (bar * 4 + tr) * spb; if (tt < from - 1e-6 || tt >= to || tt < ch.last) return; ch.last = tt + len * spb + 0.001;
          const cur = new Float32Array(n).map((_, i) => E.duckGainAt((i / (n - 1)) * len, sc.atk, rel, S.duck ? S.depth : 0)); try { ch.duck.gain.setValueCurveAtTime(cur, tt, len * spb); } catch (e) {} }); };
      const loop = () => { if (!nodes) return; const a = nodes.analyser, arr = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(arr); const sr = W.audio.ctx.sampleRate, binHz = sr / a.fftSize, p = new Array(8).fill(0);
        for (let i = 1; i < arr.length; i++) { const f = i * binHz; for (let b = 0; b < 8; b++) if (f >= E.EDGES[b] && f < E.EDGES[b + 1]) { p[b] += Math.pow(10, arr[i] / 10); break; } }
        for (let b = 0; b < 8; b++) acc[b] = acc[b] * 0.9 + p[b] * 0.1; const res = E.analyse(acc, S.role); drawAn(res); nodes.frame = (nodes.frame || 0) + 1; if (nodes.frame % 20 === 1) adv.replaceChildren(...E.advice(res).map(x => h('div', { class: 'rep ' + x.l }, x.t))); raf = requestAnimationFrame(loop); };
      const play = () => {
        if (nodes) { stopAll(); return; } const c = ctx0(); acc = new Array(8).fill(1e-12); const ch = (nodes = mkChain()); ch.last = 0;
        if (S.src === 'file' && S.buf) { ch.out.connect(W.audio.master); t0 = c.currentTime + 0.15; fileSrc = c.createBufferSource(); fileSrc.buffer = S.buf; fileSrc.loop = true; fileSrc.connect(ch.inp); fileSrc.start(t0);
          scheduleDuck(ch, t0, c.currentTime, c.currentTime + 1); timer = setInterval(() => scheduleDuck(ch, t0, c.currentTime, c.currentTime + 1), 250); }
        else { // demo: bombo (sem duck) + baixo (com duck) + hats
          const ev = []; for (let b = 0; b < 4; b++) ev.push({ kind: 'drum', t: b, piece: 'Kick', vel: 115 }, { kind: 'drum', t: b + 0.5, piece: 'HatC', vel: 90 });
          ev.push({ kind: 'fn', t: 0, fn(tt, spb, bus) { if (!ch.hooked) { ch.hooked = true; ch.out.connect(bus); bus.connect(ch.analyser); } W.audio.voice(Object.assign({}, W.PRESETS.reese.p, { gain: 0.5 }), W.bassNote(P.root), tt, 3.9 * spb, 100, ch.inp); ch.last = 0; scheduleDuck(ch, tt, tt - 0.001, tt + 4 * spb); } });
          W.audio.play(ev, P.bpm, { loop: true, length: 4, onStop: () => { nodes = null; cancelAnimationFrame(raf); } }); }
        loop();
      };
      const fileIn = h('input', { type: 'file', accept: 'audio/*', onchange: async e => { const f = e.target.files[0]; if (!f) return; try { const c = ctx0(); S.buf = await c.decodeAudioData(await f.arrayBuffer()); S.fname = f.name; S.src = 'file'; mount(); } catch (err) { alert(L('Não foi possível ler este áudio.', 'Could not read this audio.')); } } });
      const kb = () => { const r = E.kickBass(S.kick, P.root, P.mode); kbBox.replaceChildren(h('div', { class: 'rep ok' }, L(`Fundamental do bombo ≈ ${S.kick} Hz = ${r.note} (${r.cents >= 0 ? '+' : ''}${r.cents} cents).`, `Kick fundamental ≈ ${S.kick} Hz = ${r.note} (${r.cents >= 0 ? '+' : ''}${r.cents} cents).`)), ...r.tips.map(t => h('div', { class: 'rep info' }, t))); };
      const mount = () => { stopAll(); rootEl.replaceChildren(
        ui.card(L('EQ por função', 'Role-based EQ'), h('p', { class: 'hint' }, L('Escolhe a função do som. São valores de partida (guias, não regras): ouve sempre.', 'Pick the sound\'s role. These are starting points (guidelines, not rules): always listen.')),
          h('div', { class: 'row' }, ui.select(L('Função', 'Role'), E.ROLES.map(r => ({ v: r[0], t: L(r[1], r[2]) })), S.role, v => { S.role = v; mount(); }), ui.check(L('Aplicar EQ sugerido ao ouvir', 'Apply suggested EQ when playing'), S.apply, v => { S.apply = v; })), eqBox),
        ui.card(L('Analisador de 8 bandas + conselhos', '8-band analyser + advice'), h('p', { class: 'hint' }, L('Barras = o teu som (relativo); traço colorido = alvo para a função (±4 dB). Usa a demo ou carrega o teu áudio (ficheiro local; nada é enviado).', 'Bars = your sound (relative); coloured tick = target for the role (±4 dB). Use the demo or load your audio (local file; nothing is uploaded).')),
          h('div', { class: 'row' }, ui.select(L('Fonte', 'Source'), [{ v: 'demo', t: L('Demo (bombo + baixo)', 'Demo (kick + bass)') }, { v: 'file', t: L('O meu ficheiro', 'My file') + (S.fname ? ': ' + S.fname : '') }], S.src, v => { S.src = v; }), h('label', { class: 'ctl' }, h('span', null, L('Carregar áudio', 'Load audio')), fileIn), ui.btn(L('▶ Tocar / parar', '▶ Play / stop'), play, 'primary')), an, adv),
        ui.card(L('Ducker sincronizado (sidechain)', 'Synced ducker (sidechain)'), h('p', { class: 'hint' }, L('Aplicado ao baixo da demo ou ao teu ficheiro, ao BPM do projeto.', 'Applied to the demo bass or your file, at the project BPM.')),
          h('div', { class: 'row' }, ui.check(L('Ducker ligado (A/B)', 'Ducker on (A/B)'), S.duck, v => { S.duck = v; }), ui.select(L('Padrão', 'Pattern'), [{ v: 'beat', t: L('Cada tempo', 'Every beat') }, { v: 'half', t: 'Half-time' }, { v: 'fb', t: 'Future bass (0 & 2.5)' }], S.pat, v => { S.pat = v; drawSc(); }),
            ui.range(L('Profundidade', 'Depth'), 0.2, 1, 0.05, S.depth, v => { S.depth = v; drawSc(); }, v => Math.round(v * 100) + '%'), ui.range('Release', 0.2, 1, 0.05, S.rel, v => { S.rel = v; drawSc(); }, v => v.toFixed(2))), scv),
        ui.card(L('Bombo & baixo', 'Kick & bass'), h('div', { class: 'row' }, ui.range(L('Fundamental do bombo (Hz)', 'Kick fundamental (Hz)'), 30, 100, 1, S.kick, v => { S.kick = v; kb(); })), kbBox)); drawEq(); drawSc(); drawAn(null); kb(); };
      mount();
      rootEl._cleanup = stopAll;
    },
  });
})();
