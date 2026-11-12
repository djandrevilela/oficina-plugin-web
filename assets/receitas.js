// Receitas web: synth que ensina. 6 receitas × 5 passos; aplicar um passo muda os botões e podes ouvir antes/depois.
(function () {
  const W = globalThis.W, { h, ui, L } = W;
  const R = (W.receitas = {});
  R.DEF = { w1: 'square', w2: 'sawtooth', mix2: 0, det2: 0, uni: 1, spread: 0, sub: 0, noise: 0, cutoff: 8000, res: 0.7, env: 0, atk: 0.01, dec: 0.3, sus: 0.8, rel: 0.2, lfoDiv: 0, lfoDepth: 0, drive: 0, gain: 0.4 };
  const WAVES = [['sine', 'Seno', 'Sine'], ['triangle', 'Triângulo', 'Triangle'], ['sawtooth', 'Serrote', 'Saw'], ['square', 'Quadrada', 'Square']];
  R.PARAMS = [
    { id: 'w1', pt: 'Onda 1', en: 'Wave 1', t: 'sel', opts: WAVES }, { id: 'w2', pt: 'Onda 2', en: 'Wave 2', t: 'sel', opts: WAVES }, { id: 'mix2', pt: 'Mistura onda 2', en: 'Wave 2 mix', min: 0, max: 1, step: 0.01 },
    { id: 'det2', pt: 'Afinação onda 2 (cents)', en: 'Wave 2 tune (cents)', min: -1200, max: 1900, step: 1 }, { id: 'uni', pt: 'Unison (vozes)', en: 'Unison (voices)', min: 1, max: 7, step: 1 }, { id: 'spread', pt: 'Largura do unison (cents)', en: 'Unison spread (cents)', min: 0, max: 50, step: 1 },
    { id: 'sub', pt: 'Sub', en: 'Sub', min: 0, max: 1, step: 0.01 }, { id: 'noise', pt: 'Ruído', en: 'Noise', min: 0, max: 1, step: 0.01 },
    { id: 'cutoff', pt: 'Filtro (corte)', en: 'Filter cutoff', min: 100, max: 20000, step: 1, log: true }, { id: 'res', pt: 'Ressonância', en: 'Resonance', min: 0.1, max: 10, step: 0.1 }, { id: 'env', pt: 'Envelope do filtro (oitavas)', en: 'Filter env (octaves)', min: 0, max: 5, step: 0.1 },
    { id: 'atk', pt: 'Ataque', en: 'Attack', min: 0.002, max: 2, step: 0.001 }, { id: 'dec', pt: 'Decay', en: 'Decay', min: 0.05, max: 2, step: 0.01 }, { id: 'sus', pt: 'Sustain', en: 'Sustain', min: 0, max: 1, step: 0.01 }, { id: 'rel', pt: 'Release', en: 'Release', min: 0.02, max: 3, step: 0.01 },
    { id: 'lfoDiv', pt: 'LFO (duração, tempos)', en: 'LFO (length, beats)', t: 'sel', opts: [[0, 'Off', 'Off'], [4, '1/1', '1/1'], [2, '1/2', '1/2'], [1, '1/4', '1/4'], [0.5, '1/8', '1/8'], [0.25, '1/16', '1/16']] },
    { id: 'lfoDepth', pt: 'LFO → filtro', en: 'LFO → filter', min: 0, max: 1, step: 0.01 }, { id: 'drive', pt: 'Drive', en: 'Drive', min: 0, max: 1, step: 0.01 }, { id: 'gain', pt: 'Volume', en: 'Volume', min: 0.05, max: 0.8, step: 0.01 },
  ];
  const lab = id => { const p = R.PARAMS.find(x => x.id === id); return L(p.pt, p.en); };
  const S5 = (title, text, set) => ({ title, text, set });
  R.RECIPES = [
    { id: 'lead', pt: 'Lead supersaw', en: 'Supersaw lead', goal: ['Um lead largo e brilhante, típico de EDM.', 'A wide, bright lead typical of EDM.'], notes: 'lead', steps: [
      S5(['Onda de serrote', 'Saw wave'], ['O serrote tem todos os harmónicos: é a base brilhante dos leads.', 'A saw has all harmonics: the bright base of leads.'], { w1: 'sawtooth' }),
      S5(['Camadas desafinadas', 'Detuned layers'], ['Várias cópias ligeiramente desafinadas criam o efeito largo de "coro".', 'Several slightly detuned copies create the wide "chorus" effect.'], { uni: 5, spread: 22 }),
      S5(['Filtro', 'Filter'], ['Corta os agudos agressivos e dá uma pontinha de ressonância.', 'Tames harsh highs and adds a hint of resonance.'], { cutoff: 4500, res: 1.2 }),
      S5(['Envelope', 'Envelope'], ['Ataque rápido, sustain alto e o filtro a "abrir" no início dão ataque brilhante.', 'Fast attack, high sustain and the filter opening at the start give a bright attack.'], { atk: 0.01, dec: 0.4, sus: 0.7, rel: 0.3, env: 1.2 }),
      S5(['Cor final', 'Final colour'], ['Uma onda quadrada por baixo e um pouco de drive dão corpo e garra.', 'A square wave underneath and a little drive add body and bite.'], { w2: 'square', mix2: 0.25, drive: 0.15 })] },
    { id: 'pluck', pt: 'Pluck future bass', en: 'Future bass pluck', goal: ['Um pluck curto e brilhante para acordes.', 'A short bright pluck for chords.'], notes: 'chords', steps: [
      S5(['Duas ondas', 'Two waves'], ['Serrote + quadrada: harmónicos ricos e um toque oco.', 'Saw + square: rich harmonics with a hollow touch.'], { w1: 'sawtooth', w2: 'square', mix2: 0.4 }),
      S5(['Unison curto', 'Light unison'], ['Três vozes com pouca largura dão largura sem perder definição.', 'Three voices with little spread add width without losing definition.'], { uni: 3, spread: 12, det2: 7 }),
      S5(['Filtro que fecha', 'Closing filter'], ['Corte baixo + envelope forte: o filtro abre no ataque e fecha logo (o "pluck").', 'Low cutoff + strong envelope: the filter opens at the attack and closes fast (the "pluck").'], { cutoff: 1800, res: 3, env: 3 }),
      S5(['Envelope curto', 'Short envelope'], ['Sem sustain: a nota morre depressa, perfeita para acordes rítmicos.', 'No sustain: the note dies fast, perfect for rhythmic chords.'], { atk: 0.002, dec: 0.22, sus: 0, rel: 0.15 }),
      S5(['Corpo', 'Body'], ['Um pouco de sub e drive para o pluck encher.', 'A little sub and drive to fill the pluck out.'], { sub: 0.2, drive: 0.1 })] },
    { id: 'pad', pt: 'Pad quente', en: 'Warm pad', goal: ['Um pad macio para fundo harmónico.', 'A soft pad for harmonic backing.'], notes: 'chords', steps: [
      S5(['Serrote com unison', 'Unison saw'], ['Base rica e larga.', 'A rich, wide base.'], { w1: 'sawtooth', uni: 4, spread: 15 }),
      S5(['Filtro suave', 'Soft filter'], ['Corte baixo: tira o brilho agressivo e dá calor.', 'Low cutoff removes harshness and adds warmth.'], { cutoff: 1400, res: 0.7, env: 0.3 }),
      S5(['Ataque lento', 'Slow attack'], ['Ataque e release longos: o som "respira" e entra devagar.', 'Long attack and release: the sound "breathes" and fades in.'], { atk: 0.6, dec: 0.5, sus: 0.8, rel: 1.2 }),
      S5(['Brilho oitava acima', 'Octave shimmer'], ['Triângulo uma oitava acima dá brilho suave.', 'A triangle an octave up adds gentle shimmer.'], { w2: 'triangle', mix2: 0.4, det2: 1200 }),
      S5(['Movimento lento', 'Slow movement'], ['Um LFO lento no filtro dá vida ao pad.', 'A slow LFO on the filter brings the pad to life.'], { lfoDiv: 4, lfoDepth: 0.08 })] },
    { id: 'reese', pt: 'Baixo reese', en: 'Reese bass', goal: ['Um baixo grosso e "a mexer".', 'A thick, moving bass.'], notes: 'bass', steps: [
      S5(['Serrote', 'Saw'], ['Base rica em harmónicos.', 'Harmonic-rich base.'], { w1: 'sawtooth' }),
      S5(['Duas vozes desafinadas', 'Two detuned voices'], ['A "batida" entre duas vozes desafinadas é o carácter do reese.', 'The beating between two detuned voices is the reese character.'], { uni: 2, spread: 18 }),
      S5(['Filtro baixo', 'Low filter'], ['Fecha o filtro para ficar só o grosso.', 'Close the filter to keep only the thick part.'], { cutoff: 700, res: 2, env: 1.2, atk: 0.005, dec: 0.3, sus: 0.8, rel: 0.1 }),
      S5(['Sub por baixo', 'Sub underneath'], ['Um seno uma oitava abaixo garante o peso nos graves.', 'A sine an octave below ensures low-end weight.'], { sub: 0.5 }),
      S5(['Drive', 'Drive'], ['Distorção suave faz o baixo ouvir-se em colunas pequenas.', 'Gentle distortion makes the bass audible on small speakers.'], { drive: 0.3 })] },
    { id: 'sub', pt: 'Sub limpo', en: 'Clean sub', goal: ['Graves puros e profundos.', 'Pure, deep lows.'], notes: 'bass', steps: [
      S5(['Seno', 'Sine'], ['O seno é só a fundamental: grave puro.', 'A sine is only the fundamental: pure low.'], { w1: 'sine' }),
      S5(['Filtro', 'Filter'], ['Corta o que sobra acima dos graves.', 'Cut what is left above the lows.'], { cutoff: 500, res: 0.5 }),
      S5(['Envelope direto', 'Direct envelope'], ['Sustain total e release curto: o sub toca só enquanto a nota dura.', 'Full sustain and short release: the sub plays only while the note lasts.'], { env: 0, atk: 0.005, dec: 0.1, sus: 1, rel: 0.1 }),
      S5(['Harmónicos subtis', 'Subtle harmonics'], ['Um pouco de drive acrescenta harmónicos para se ouvir em colunas pequenas.', 'A little drive adds harmonics so it can be heard on small speakers.'], { drive: 0.08 }),
      S5(['Volume', 'Level'], ['Mais volume: o sub é o elemento que mais energia leva.', 'More level: the sub carries the most energy.'], { gain: 0.6 })] },
    { id: 'wobble', pt: 'Baixo wobble', en: 'Wobble bass', goal: ['Um baixo com movimento rítmico no filtro.', 'A bass with rhythmic filter movement.'], notes: 'bass', steps: [
      S5(['Serrote', 'Saw'], ['Base com muitos harmónicos para o filtro "esculpir".', 'Many harmonics for the filter to sculpt.'], { w1: 'sawtooth' }),
      S5(['Largura e sub', 'Width and sub'], ['Duas vozes e um sub dão corpo.', 'Two voices and a sub give body.'], { uni: 2, spread: 10, sub: 0.4 }),
      S5(['Filtro ressonante', 'Resonant filter'], ['Corte baixo com ressonância alta: som vocal "uóu".', 'Low cutoff with high resonance: a vocal "wow" sound.'], { cutoff: 600, res: 4 }),
      S5(['LFO sincronizado', 'Synced LFO'], ['O LFO move o filtro em colcheias, sincronizado com o tempo.', 'The LFO moves the filter in eighth notes, synced to tempo.'], { lfoDiv: 0.5, lfoDepth: 0.55 }),
      S5(['Drive', 'Drive'], ['Distorção para dar garra ao wobble.', 'Distortion to add bite to the wobble.'], { drive: 0.25, gain: 0.4 })] },
  ];
  R.stateAfter = (rec, n) => { const p = Object.assign({}, R.DEF); for (let i = 0; i < n; i++) Object.assign(p, rec.steps[i].set); return p; };
  R.changedIds = (rec, n) => { if (n < 1) return []; const a = R.stateAfter(rec, n - 1), b = R.stateAfter(rec, n); return Object.keys(b).filter(k => a[k] !== b[k]); };
  R.toInst = (p, bpm) => Object.assign({}, p, { lfo: p.lfoDiv > 0 ? 1 / (p.lfoDiv * 60 / bpm) : 0 });
  R.testEvents = function (rec, root, mode) {
    const sc = W.SCALES[mode], N = d => 60 + root + sc[d % 7] + 12 * Math.floor(d / 7), ev = [], add = (t, d, m, v) => ev.push({ t, dur: d, midi: m, vel: v || 100 });
    if (rec.notes === 'lead') [[0, 4], [1, 2], [2, 6], [3, 4], [4, 2], [6, 7], [7, 9], [8, 11]].forEach(([i, d]) => add(i * 0.5, 0.45, N(d) + 12));
    else if (rec.notes === 'chords') ['1', '6', '4', '5'].forEach((t, i) => W.voiceLead([W.chordFromToken(t, root, mode, false).pcs])[0].forEach(m => add(i * 2, 1.9, m)));
    else [0, 5, 3, 4].forEach((d, i) => add(i * 2, 1.9, 36 + root + sc[d] - 12 * (rec.id === 'sub' ? 0 : 0)));
    return ev;
  };

  const S = (R.state = { rec: 0, step: 0, p: null });
  W.tools.push({
    id: 'receitas', icon: '🧪', name: 'Receitas',
    desc: () => L('Um synth que ensina: 6 receitas passo a passo; aplicar um passo muda os botões e podes ouvir antes e depois.', 'A synth that teaches: 6 step-by-step recipes; applying a step moves the knobs and you can hear before and after.'),
    render(rootEl) {
      const P = W.project, knobs = h('div', { class: 'knobs' }), stepsBox = h('div'), goal = h('p', { class: 'hint' });
      const rec = () => R.RECIPES[S.rec];
      const sync = () => { S.p = R.stateAfter(rec(), S.step); };
      const audition = p => { W.audio.stop(); const inst = R.toInst(p, P.bpm); W.audio.play(R.testEvents(rec(), P.root, P.mode).map(e => Object.assign({ kind: 'note', inst }, e)), P.bpm, { loop: false, length: 8 }); };
      const drawKnobs = () => { const ch = new Set(R.changedIds(rec(), S.step)); knobs.replaceChildren(...R.PARAMS.map(pr => {
        let c; const cls = ch.has(pr.id) ? ' flash' : '';
        if (pr.t === 'sel') c = ui.select(L(pr.pt, pr.en), pr.opts.map(o => ({ v: o[0], t: o.length === 3 ? L(o[1], o[2]) : o[1] })), S.p[pr.id], v => { S.p[pr.id] = typeof R.DEF[pr.id] === 'number' ? +v : v; });
        else if (pr.log) { const lo = Math.log(pr.min), hi = Math.log(pr.max); c = ui.range(L(pr.pt, pr.en), 0, 1, 0.001, (Math.log(S.p[pr.id]) - lo) / (hi - lo), v => { S.p[pr.id] = Math.exp(lo + v * (hi - lo)); }, v => Math.round(Math.exp(lo + v * (hi - lo))) + ' Hz'); }
        else c = ui.range(L(pr.pt, pr.en), pr.min, pr.max, pr.step, S.p[pr.id], v => { S.p[pr.id] = v; }, v => (+v.toFixed(3)).toString());
        c.className += cls; return c; })); };
      const drawSteps = () => { const r = rec(); goal.textContent = L(...r.goal);
        stepsBox.replaceChildren(...r.steps.map((s, i) => h('div', { class: 'step' + (i + 1 === S.step ? ' now' : i + 1 < S.step ? ' done' : ''), onclick: () => { S.step = i + 1; refresh(); } }, h('b', null, `${i + 1}. ${L(...s.title)}`), h('p', null, L(...s.text)), h('small', null, Object.keys(s.set).map(lab).join(' · ')))));
      };
      const refresh = () => { sync(); drawSteps(); drawKnobs(); };
      rootEl.append(ui.card(L('Receitas de som', 'Sound recipes'), h('div', { class: 'row' }, ui.select(L('Receita', 'Recipe'), R.RECIPES.map((r, i) => ({ v: i, t: L(r.pt, r.en) })), S.rec, v => { S.rec = +v; S.step = 0; refresh(); })), goal, stepsBox,
        h('div', { class: 'row' }, ui.btn(L('◂ Passo anterior', '◂ Previous step'), () => { S.step = Math.max(0, S.step - 1); refresh(); }), ui.btn(L('Aplicar passo seguinte ▸', 'Apply next step ▸'), () => { S.step = Math.min(5, S.step + 1); refresh(); }, 'primary'),
          ui.btn(L('▶ Ouvir agora', '▶ Listen now'), () => audition(S.p)), ui.btn(L('▶ Ouvir antes deste passo', '▶ Listen before this step'), () => audition(R.stateAfter(rec(), Math.max(0, S.step - 1)))),
          ui.btn(L('⎘ Copiar valores', '⎘ Copy values'), () => { const t = R.PARAMS.map(p => `${L(p.pt, p.en)}: ${typeof S.p[p.id] === 'number' ? +S.p[p.id].toFixed(3) : S.p[p.id]}`).join('\n'); const fb = () => W.download('receita.txt', t, 'text/plain;charset=utf-8'); try { navigator.clipboard.writeText(t).catch(fb); } catch (e) { fb(); } }, 'ghost'))),
        ui.card(L('Botões do synth', 'Synth knobs'), h('p', { class: 'hint' }, L('Os botões que mudam neste passo ficam destacados. Podes mexer à vontade e ouvir.', 'Knobs that change in this step are highlighted. Feel free to tweak and listen.')), knobs));
      refresh();
    },
  });
})();
