// Harmonia web: progressões, condução de vozes, scale lock, próxima nota, verificador de harmonia.
(function () {
  const W = globalThis.W, { h, ui, L } = W;
  const S = { style: 'fb', variant: 0, seventh: false, vl: true, bass: true, preset: 'piano', last: [], ctx: 0, chk: 'Am F C G' };
  W.harmonia = S;

  W.chordEvents = function (chords, opts) { // opts: beats por acorde, vl, bass, preset
    const per = opts.beats || 4, vo = opts.vl ? W.voiceLead(chords.map(c => c.pcs)) : chords.map(c => c.pcs.map((p, i) => 55 + ((p - 55 % 12 + 1200) % 12)));
    const ev = [], notes = [], inst = W.PRESETS[opts.preset || 'piano'].p;
    chords.forEach((c, i) => {
      const t = i * per; vo[i].forEach(m => { ev.push({ kind: 'note', t, dur: per * 0.95, midi: m, vel: 90, inst }); notes.push({ t, dur: per * 0.95, midi: m, vel: 90 }); });
      if (opts.bass) { const b = W.bassNote(c.rootPc); ev.push({ kind: 'note', t, dur: per * 0.95, midi: b, vel: 100, inst: W.PRESETS.sub.p }); notes.push({ t, dur: per * 0.95, midi: b, vel: 100, color: '#e8a' }); }
    });
    return { ev, notes, voicings: vo, length: chords.length * per };
  };

  // Verificador de harmonia (regras simples; não é IA)
  W.checkHarmony = function (txt, root, mode) {
    const cs = W.chordsFromText(txt, root, mode), res = [], good = cs.filter(c => !c.bad);
    cs.forEach(c => c.bad && res.push({ l: 'bad', t: L(`"${c.bad}" não é um acorde reconhecido (usa por ex. Am, F, G7, Bbmaj7, Edim).`, `"${c.bad}" is not a recognised chord (use e.g. Am, F, G7, Bbmaj7, Edim).`) }));
    if (!good.length) return res;
    const dia = []; for (const t of ['1', '2', '3', '4', '5', '6', '7', 'b7', 'b6', 'iv', 'V']) dia.push(W.chordFromToken(t, root, mode, false));
    const sc = new Set(W.SCALES[mode].map(x => W.mod(root + x, 12))); const roles = [];
    good.forEach((c, i) => {
      const m = dia.find(d => d.rootPc === c.rootPc && d.quality === c.quality && (c.ivs.length < 4 || d.pcs.every(p => c.pcs.includes(p))));
      const out = c.pcs.filter(p => !sc.has(p)).map(p => W.noteName(p, W.useFlats(root, mode)));
      if (m && !m.borrowed) { const r = W.roleOf(m, mode); roles.push(r); res.push({ l: 'ok', t: L(`${c.name}: acorde do tom (${m.roman}).`, `${c.name}: in-key chord (${m.roman}).`) }); }
      else if (m) { roles.push(W.roleOf(m, mode)); res.push({ l: 'ok', t: L(`${c.name}: empréstimo modal (${m.roman}) — funciona como cor e tensão extra, sobretudo antes de voltar ao I.`, `${c.name}: modal interchange (${m.roman}) — works as extra colour/tension, especially before returning to I.`) }); }
      else { roles.push('?'); res.push({ l: 'warn', t: L(`${c.name}: fora do tom (notas fora da escala: ${out.join(', ') || '—'}). Se não for intencional, troca por um acorde do tom.`, `${c.name}: outside the key (out-of-scale notes: ${out.join(', ') || '—'}). Replace with an in-key chord unless intended.`) }); }
      if (i > 0 && good[i - 1].name === c.name) res.push({ l: 'warn', t: L(`${c.name} repete-se seguido; junta num só acorde mais longo ou muda a inversão.`, `${c.name} repeats back to back; merge into one longer chord or change the inversion.`) });
      if (i > 0) { const d = W.mod(c.rootPc - good[i - 1].rootPc, 12); if (d === 6) res.push({ l: 'warn', t: L(`${good[i - 1].name} → ${c.name}: salto de trítono na fundamental; soa instável (ok só se for efeito).`, `${good[i - 1].name} → ${c.name}: tritone root leap; unstable unless used as an effect.`) }); }
    });
    const tonicPc = root, first = good[0], last = good[good.length - 1];
    res.push(first.rootPc === tonicPc ? { l: 'ok', t: L('Começa na tónica: o ouvinte percebe logo o tom.', 'Starts on the tonic: the key is clear immediately.') } : { l: 'info', t: L('Não começa na tónica — válido (muitas faixas começam no vi ou IV), mas o tom só se confirma mais tarde.', 'Does not start on the tonic — valid (many tracks start on vi or IV) but the key is confirmed later.') });
    const lr = roles[roles.length - 1];
    if (last.rootPc === tonicPc) res.push({ l: 'ok', t: L('Termina na tónica: sensação de resolução (boa para fim de secção).', 'Ends on the tonic: feels resolved (good for section ends).') });
    else if (lr === 'dominant' || lr === 'dominantMinor' || lr === 'leading') res.push({ l: 'ok', t: L('Termina no dominante: sensação de suspense que "pede" voltar ao início — ideal para loops de drop.', 'Ends on the dominant: suspense that pulls back to the start — ideal for drop loops.') });
    else res.push({ l: 'info', t: L('Final aberto sem dominante nem tónica; em loop funciona se o primeiro acorde for forte.', 'Open ending without dominant or tonic; loops fine if the first chord is strong.') });
    if (!roles.includes('tonic')) res.push({ l: 'warn', t: L('Nenhum acorde de tónica: o tom pode soar ambíguo.', 'No tonic chord: the key may sound ambiguous.') });
    const all = new Set(); good.forEach(c => c.pcs.forEach(p => all.add(p))); const bk = W.bestKey(all);
    if (bk && (bk.root !== root || bk.mode !== mode) && bk.score > [...all].filter(p => sc.has(p)).length)
      res.push({ l: 'info', t: L(`Estes acordes encaixam melhor em ${W.noteName(bk.root, W.useFlats(bk.root, bk.mode))} ${bk.mode === 'major' ? 'maior' : 'menor'} do que no tom escolhido.`, `These chords fit ${W.noteName(bk.root, W.useFlats(bk.root, bk.mode))} ${bk.mode} better than the chosen key.`) });
    return res;
  };

  // Próxima nota: pontuação por regras (passo conjunto, notas do acorde, resolução da sensível)
  W.nextNotes = function (last, chord, root, mode) {
    const lead = W.mod(root + (mode === 'major' ? 11 : 10), 12), out = [];
    for (let m = last - 9; m <= last + 9; m++) {
      if (m < 48 || m > 88 || !W.inScale(m, root, mode)) continue; const d = Math.abs(m - last); let s = -0.4 * d, why = [];
      if (chord.pcs.includes(W.mod(m, 12))) { s += 3; why.push(L('nota do acorde (soa estável)', 'chord tone (stable)')); }
      if (d > 0 && d <= 2) { s += 2; why.push(L('passo conjunto (melodia fluida)', 'stepwise (smooth line)')); }
      if (d === 0) { s -= 2; why.push(L('repetição', 'repeat')); }
      if (W.mod(last, 12) === lead && W.mod(m - root, 12) === 0 && m > last) { s += 4; why.push(L('a sensível resolve na tónica', 'leading tone resolves to tonic')); }
      if (W.mod(m - root, 12) === 0) { s += 0.6; }
      out.push({ midi: m, s, why });
    }
    return out.sort((a, b) => b.s - a.s || a.midi - b.midi).slice(0, 3);
  };

  W.tools.push({
    id: 'harmonia', icon: '🎹', name: 'Harmonia',
    desc: () => L('Acordes e progressões que funcionam, condução de vozes, scale lock e verificador de harmonia.', 'Chords and progressions that work, voice leading, scale lock and harmony checker.'),
    render(root) {
      const P = W.project, fl = W.useFlats(P.root, P.mode);
      const st = () => W.progression(S.style, S.variant, P.root, P.mode, S.seventh);
      const out = h('div'), rollBox = h('div'), chipBox = h('div', { class: 'chips' });
      let cv = null, ev = null;
      const gen = () => {
        const pr = st(), r = W.chordEvents(pr.chords, { beats: 4, vl: S.vl, bass: S.bass, preset: S.preset }); ev = r; S.cur = pr;
        chipBox.replaceChildren(...pr.chords.map((c, i) => h('div', { class: 'chip' }, h('b', null, c.name), h('small', null, c.roman), h('small', null, r.voicings[i].map(m => W.midiName(m, fl)).join(' ')))));
        cv = W.roll(r.notes, r.length); rollBox.replaceChildren(cv);
      };
      const play = () => { if (W.audio.isPlaying()) return W.audio.stop(); gen(); W.audio.play(ev.ev, P.bpm, { loop: true, length: ev.length, onTick: b => cv && cv.draw(b), onStop: () => cv && cv.draw() }); };
      const exp = () => { gen(); const nm = `Harmonia-${S.style}-${S.variant + 1}`; W.download(nm + '.mid', W.midi.write({ bpm: P.bpm, name: nm, tracks: [{ name: 'Acordes', notes: ev.notes.filter(n => !n.color).map(n => ({ t: n.t, dur: n.dur, note: n.midi, vel: n.vel })) }, { name: 'Baixo', channel: 1, notes: ev.notes.filter(n => n.color).map(n => ({ t: n.t, dur: n.dur, note: n.midi, vel: n.vel })) }] })); };
      const regen = () => { gen(); };
      out.append(ui.card(L('Gerador de progressões', 'Progression generator'),
        h('p', { class: 'hint' }, L('Cada estilo tem 4 progressões curadas por modo. A "variação" escolhe outra da lista — sem sorteios: os mesmos dados dão sempre o mesmo resultado.', 'Each style has 4 curated progressions per mode. "Variation" picks another from the list — no randomness: same inputs, same output.')),
        h('div', { class: 'row' },
          ui.select(L('Estilo', 'Style'), W.STYLES.map(s => ({ v: s.id, t: W.styleName(s) })), S.style, v => { S.style = v; regen(); }),
          ui.range(L('Variação', 'Variation'), 1, 4, 1, S.variant + 1, v => { S.variant = v - 1; regen(); }),
          ui.select(L('Som', 'Sound'), Object.entries(W.PRESETS).map(([k, v]) => ({ v: k, t: L(v.pt, v.en) })), S.preset, v => { S.preset = v; regen(); }),
          ui.check(L('Sétimas', '7ths'), S.seventh, v => { S.seventh = v; regen(); }),
          ui.check(L('Condução de vozes', 'Voice leading'), S.vl, v => { S.vl = v; regen(); }),
          ui.check(L('Baixo (fundamental)', 'Bass (root)'), S.bass, v => { S.bass = v; regen(); })),
        chipBox, rollBox,
        h('div', { class: 'row' }, ui.btn(L('▶ Tocar / parar', '▶ Play / stop'), play, 'primary'), ui.btn(L('⬇ Exportar MIDI', '⬇ Export MIDI'), exp))));
      // Scale lock
      const kb = h('div', { class: 'kb' }), msg = h('p', { class: 'msg' }), sugBox = h('div', { class: 'sug' });
      const dia = [0, 1, 2, 3, 4, 5, 6].map(d => W.chordFromToken(String(d + 1), P.root, P.mode, false));
      const drawKb = () => {
        kb.replaceChildren(); const sug = S.last.length ? W.nextNotes(S.last[S.last.length - 1], dia[S.ctx], P.root, P.mode) : [];
        for (let m = 60; m <= 83; m++) {
          const black = [1, 3, 6, 8, 10].includes(m % 12), ins = W.inScale(m, P.root, P.mode), sg = sug.findIndex(x => x.midi === m);
          kb.append(h('button', { class: `key ${black ? 'blk' : 'wht'} ${ins ? 'in' : 'out'} ${sg >= 0 ? 'sug' : ''} ${W.mod(m - P.root, 12) === 0 ? 'tonic' : ''}`, title: W.midiName(m, fl), onclick: () => press(m) }, h('small', null, ins ? W.noteName(m, fl) : '')));
        }
        sugBox.replaceChildren(...sug.map((x, i) => h('div', { class: 'row-s' }, h('b', null, `${i + 1}. ${W.midiName(x.midi, fl)}`), ' — ', x.why.join('; ') || L('nota da escala', 'scale note'))));
      };
      const press = m => {
        const sn = W.snapToScale(m, P.root, P.mode); W.audio.ensure(); W.audio.voice(W.PRESETS.piano.p, sn, W.audio.ctx.currentTime, 0.6, 100, W.audio.master);
        msg.textContent = sn === m ? L(`${W.midiName(m, fl)} está na escala.`, `${W.midiName(m, fl)} is in the scale.`) : L(`${W.midiName(m, fl)} está fora da escala — corrigida para ${W.midiName(sn, fl)} (nota mais próxima; em empate, a mais grave).`, `${W.midiName(m, fl)} is out of scale — corrected to ${W.midiName(sn, fl)} (nearest; lower on ties).`);
        S.last.push(sn); if (S.last.length > 16) S.last.shift(); drawKb();
      };
      drawKb();
      out.append(ui.card(L('Scale lock + próxima nota', 'Scale lock + next note'),
        h('p', { class: 'hint' }, L('Teclas escuras/riscadas estão fora do tom e são corrigidas para a nota mais próxima da escala. As 3 sugestões a destacar são a "próxima nota" para o acorde escolhido.', 'Dimmed keys are outside the key and get corrected to the nearest scale note. The 3 highlighted keys are the "next note" for the chosen chord.')),
        ui.select(L('Acorde de contexto', 'Context chord'), dia.map((c, i) => ({ v: i, t: `${c.roman} · ${c.name}` })), S.ctx, v => { S.ctx = +v; drawKb(); }),
        kb, msg, sugBox, h('div', { class: 'row' }, ui.btn(L('Limpar histórico', 'Clear history'), () => { S.last = []; msg.textContent = ''; drawKb(); }))));
      // Verificador
      const ta = h('input', { type: 'text', value: S.chk, class: 'txt' }), rb = h('div', { class: 'report' });
      const run = () => { S.chk = ta.value; rb.replaceChildren(...W.checkHarmony(ta.value, P.root, P.mode).map(x => h('div', { class: 'rep ' + x.l }, x.t))); };
      ta.addEventListener('input', run); run();
      out.append(ui.card(L('Verificador de harmonia', 'Harmony checker'), h('p', { class: 'hint' }, L('Escreve acordes separados por espaços (ex.: Am F C G). O tom é o da barra de projeto.', 'Type chords separated by spaces (e.g. Am F C G). The key is the one in the project bar.')), ta, rb));
      root.append(out); gen();
    },
  });
})();
