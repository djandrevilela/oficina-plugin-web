// Farol web: modo "explica-me" (acordes, transições, notas) e compatibilidade de samples. Bilingue pt-PT / en-GB.
(function () {
  const W = globalThis.W, { h, ui, L } = W, mod = W.mod;
  const F = (W.farol = {});
  const ROLE = {
    tonic: [['Tónica', 'Tonic'], ['É a "casa" do tom: o ponto de repouso. Não pede para ir a lado nenhum, por isso soa estável e resolvido.', 'The "home" of the key: the resting point. It does not ask to go anywhere, so it feels stable and resolved.']],
    supertonic: [['Supertónica', 'Supertonic'], ['Prepara o dominante (função de subdominante): cria movimento suave em direção à tensão sem ser ainda a tensão máxima.', 'Prepares the dominant (subdominant function): moves smoothly toward tension without being the peak yet.']],
    mediant: [['Mediante', 'Mediant'], ['Partilha notas com a tónica, por isso soa como uma tónica mais suave e nostálgica: estável, mas com cor.', 'Shares notes with the tonic, so it sounds like a softer, nostalgic tonic: stable but colourful.']],
    subdominant: [['Subdominante', 'Subdominant'], ['Afasta-se da tónica e cria abertura e esperança; é o clássico "passo em frente" antes do dominante.', 'Moves away from the tonic creating openness and hope; the classic "step forward" before the dominant.']],
    dominant: [['Dominante', 'Dominant'], ['Contém a sensível, que "quer" subir à tónica; por isso cria a maior tensão e pede resolução.', 'Contains the leading tone, which "wants" to rise to the tonic; hence the highest tension and a need to resolve.']],
    dominantMinor: [['Dominante menor (v)', 'Minor dominant (v)'], ['Sem a sensível, a tensão é mais suave e melancólica do que a do V maior; típica do modo menor natural.', 'Without the leading tone the tension is softer and more melancholic than a major V; typical of natural minor.']],
    submediant: [['Relativo (vi / VI)', 'Submediant (vi / VI)'], ['Partilha duas notas com a tónica: traz o lado emocional (em maior) ou luminoso (em menor) sem sair do tom.', 'Shares two notes with the tonic: brings an emotional (major) or bright (minor) side without leaving the key.']],
    leading: [['Sensível (vii°)', 'Leading-tone (vii°)'], ['Acorde diminuto instável que pede resolução na tónica; funciona como um V sem fundamental.', 'Unstable diminished chord that asks to resolve to the tonic; acts like a V without its root.']],
    subtonic: [['Subtónica (VII)', 'Subtonic (VII)'], ['Do modo menor natural: sem tensão forte, empurra suavemente de volta à tónica (muito usado em EDM épico).', 'From natural minor: no strong tension, gently pushes back to the tonic (very common in epic EDM).']],
    borrowed7: [['bVII emprestado', 'Borrowed bVII'], ['Emprestado do modo menor: dá cor épica e resolve na tónica sem a tensão do dominante.', 'Borrowed from the minor mode: epic colour that resolves to the tonic without dominant tension.']],
    borrowed6: [['bVI emprestado', 'Borrowed bVI'], ['Emprestado do modo menor: som cinemático, sobe a emoção; funciona antes do V ou do I.', 'Borrowed from the minor mode: cinematic, lifts emotion; works before V or I.']],
    borrowedIv: [['iv emprestado', 'Borrowed iv'], ['Subdominante menor: transforma a esperança do IV em melancolia — o toque agridoce.', 'Minor subdominant: turns the hope of IV into melancholy — the bittersweet touch.']],
  };
  const IV = [['tónica', 'root'], ['2.ª menor (b2)', 'minor 2nd (b2)'], ['2.ª maior (9)', 'major 2nd (9)'], ['3.ª menor (b3)', 'minor 3rd (b3)'], ['3.ª maior', 'major 3rd'], ['4.ª justa (11)', 'perfect 4th (11)'], ['trítono (b5)', 'tritone (b5)'], ['5.ª justa', 'perfect 5th'], ['6.ª menor (b6)', 'minor 6th (b6)'], ['6.ª maior (13)', 'major 6th (13)'], ['7.ª menor (b7)', 'minor 7th (b7)'], ['7.ª maior', 'major 7th']];
  const TENS = ['0/4 repouso', '1/4 suave', '2/4 movimento', '3/4 tensa', '4/4 máxima'], TENSE = ['0/4 rest', '1/4 mild', '2/4 motion', '3/4 tense', '4/4 peak'];
  const NEXT = { major: { 0: [3, 4, 5, 1], 1: [4, 3], 2: [5, 3], 3: [4, 0, 1], 4: [0, 5, 3], 5: [3, 1, 4], 6: [0, 2] }, minor: { 0: [3, 5, 6, 4], 1: [4, 0], 2: [5, 3, 6], 3: [6, 0, 4], 4: [0, 5], 5: [6, 2, 3], 6: [2, 0, 5] } };
  const NEXTB = { b7: ['1', '4'], b6: ['b7', '5', '1'], iv: ['1', '5'], V: ['1', '6'] };

  F.explainChord = function (c, mode) {
    const r = W.roleOf(c, mode), R = ROLE[r], t = W.TENSION[r];
    return { name: c.name, roman: c.roman, role: L(...R[0]), text: L(...R[1]), tension: t, tensionText: L(TENS[t], TENSE[t]), notes: c.pcs.map(p => W.noteName(p, W.useFlats(W.project.root, mode))).join(' – ') };
  };
  F.explainTransition = function (a, b, mode) {
    const d = mod(b.rootPc - a.rootPc, 12), common = a.pcs.filter(p => b.pcs.includes(p)).length, ra = W.roleOf(a, mode), rb = W.roleOf(b, mode), out = [];
    const mv = { 7: L('a fundamental sobe uma 5.ª (ou desce uma 4.ª): o movimento mais forte da harmonia, soa a "chegada"', 'the root rises a 5th (or falls a 4th): the strongest motion in harmony, it sounds like an "arrival"'),
      5: L('a fundamental sobe uma 4.ª: movimento forte e aberto', 'the root rises a 4th: strong, open motion'), 2: L('a fundamental sobe um tom: movimento suave por graus', 'the root rises a tone: smooth stepwise motion'),
      10: L('a fundamental desce um tom: movimento suave por graus', 'the root falls a tone: smooth stepwise motion'), 1: L('a fundamental sobe meio-tom: tensão forte', 'the root rises a semitone: strong tension'), 11: L('a fundamental desce meio-tom: resolução forte', 'the root falls a semitone: strong resolution'),
      3: L('a fundamental sobe uma 3.ª menor: muda a cor sem grande tensão', 'the root rises a minor 3rd: changes colour with little tension'), 4: L('a fundamental sobe uma 3.ª maior: salto brilhante', 'the root rises a major 3rd: a bright leap'),
      8: L('a fundamental desce uma 3.ª maior: movimento suave e natural', 'the root falls a major 3rd: smooth and natural'), 9: L('a fundamental desce uma 3.ª menor: movimento suave e natural', 'the root falls a minor 3rd: smooth and natural'), 6: L('salto de trítono: muito instável', 'tritone leap: very unstable'), 0: L('mesma fundamental', 'same root') }[d];
    out.push(`${a.name} → ${b.name}: ${mv}.`);
    out.push(common >= 2 ? L(`Partilham ${common} notas, por isso a ligação é suave.`, `They share ${common} notes, so the join is smooth.`) : common === 1 ? L('Partilham 1 nota (uma "âncora" que liga os dois acordes).', 'They share 1 note (an "anchor" linking both chords).') : L('Não partilham notas: a mudança é marcante.', 'No common notes: the change is striking.'));
    const cad = (ra === 'dominant' || ra === 'leading') && rb === 'tonic' ? L('Cadência perfeita (V→I): a resolução mais conclusiva.', 'Perfect cadence (V→I): the most conclusive resolution.')
      : ra === 'subdominant' && rb === 'tonic' ? L('Cadência plagal (IV→I): resolução suave, "amén".', 'Plagal cadence (IV→I): gentle "amen" resolution.')
      : ra === 'dominant' && rb === 'submediant' ? L('Cadência de engano (V→vi): esperas a tónica e vem o relativo — surpresa emotiva.', 'Deceptive cadence (V→vi): you expect the tonic and get the relative — an emotional surprise.')
      : (ra === 'subtonic' || ra === 'borrowed7' || ra === 'dominantMinor') && rb === 'tonic' ? L('Resolução suave na tónica, sem tensão de dominante.', 'Soft resolution to the tonic with no dominant tension.')
      : rb === 'dominant' || rb === 'dominantMinor' ? L('Chega ao dominante: a tensão sobe e prepara a resolução.', 'Arrives at the dominant: tension builds and prepares resolution.') : null;
    if (cad) out.push(cad); return out.join(' ');
  };
  F.matchToken = function (c, root, mode) { for (const t of ['1', '2', '3', '4', '5', '6', '7', 'b7', 'b6', 'iv', 'V']) { const d = W.chordFromToken(t, root, mode, false); if (d.rootPc === c.rootPc && d.quality === c.quality) return W.chordFromToken(t, root, mode, !!c.seventh); } return null; };
  F.suggestNext = function (c, root, mode) {
    const toks = c.borrowed ? NEXTB[c.tok] : NEXT[mode][c.degree].map(d => String(d + 1));
    return toks.map(t => { const n = W.chordFromToken(t, root, mode, false); return { chord: n, why: F.explainTransition(c, n, mode) }; });
  };
  F.explainNote = function (pc, c, root, mode) {
    const iv = mod(pc - c.rootPc, 12), inCh = c.pcs.includes(pc), inKey = W.inScale(pc, root, mode), nm = W.noteName(pc, W.useFlats(root, mode));
    const kind = inCh ? L('nota do acorde: soa estável e "assenta" bem', 'chord tone: sounds stable and "sits" well') : inKey ? L('nota da escala fora do acorde: cria cor/movimento; resolve-a por passo para uma nota do acorde', 'scale note outside the chord: adds colour/motion; resolve it by step to a chord tone') : L('nota fora do tom: cria tensão forte; usa só de passagem', 'out-of-key note: strong tension; use only as a passing note');
    return `${nm} sobre ${c.name} = ${L(...IV[iv])} — ${kind}.`.replace(' sobre ', L(' sobre ', ' over '));
  };
  F.lessonText = function (chords, root, mode, title) {
    const fl = W.useFlats(root, mode), lines = [`${L('LIÇÃO', 'LESSON')}: ${title}`, `${L('Tom', 'Key')}: ${W.noteName(root, fl)} ${mode === 'major' ? L('maior', 'major') : L('menor', 'minor')}`, ''];
    chords.forEach((c, i) => { const e = F.explainChord(c, mode); lines.push(`${i + 1}. ${e.name} (${e.roman}) — ${e.role}`, '   ' + e.text, `   ${L('Tensão', 'Tension')}: ${e.tensionText} · ${L('Notas', 'Notes')}: ${e.notes}`); if (i > 0) lines.push('   ' + F.explainTransition(chords[i - 1], c, mode)); lines.push(''); });
    lines.push(L('Dica: se algo soar estranho, troca um acorde por outro com a mesma função (por exemplo IV ↔ ii).', 'Tip: if something sounds off, swap a chord for another with the same function (e.g. IV ↔ ii).')); return lines.join('\n');
  };
  F.adviseSample = function (sr, sm, sb, pr, pm, pb) {
    const sset = W.SCALES[sm].map(x => mod(sr + x, 12)), pset = new Set(W.SCALES[pm].map(x => mod(pr + x, 12))), opts = [];
    for (let s = -6; s <= 6; s++) opts.push({ s, ov: sset.filter(x => pset.has(mod(x + s, 12))).length });
    opts.sort((a, b) => b.ov - a.ov || Math.abs(a.s) - Math.abs(b.s) || a.s - b.s);
    const best = opts[0]; let r = pb / sb, mode = '1×'; for (const [k, v] of [['2×', r / 2], ['½×', r * 2]]) if (Math.abs(v - 1) < Math.abs(r - 1) - 0.05) { r = v; mode = k; }
    return { best, alts: opts.slice(1, 3), ratio: r, ratioMode: mode, pct: (r - 1) * 100 };
  };

  const S = (F.state = { src: 'style', style: 'em', variant: 0, seventh: false, text: 'Am F C G', sel: 0, noteSel: 0, sR: 9, sM: 'minor', sB: 120 });
  W.tools.push({
    id: 'farol', icon: '🔦', name: 'Farol',
    desc: () => L('Modo "explica-me": porque cada acorde, transição e nota funciona; compatibilidade de samples (tom e BPM).', 'Explain-me mode: why each chord, transition and note works; sample compatibility (key and BPM).'),
    render(rootEl) {
      const P = W.project, fl = W.useFlats(P.root, P.mode), body = h('div'), out = h('div');
      const getChords = () => {
        if (S.src === 'style') return W.progression(S.style, S.variant, P.root, P.mode, S.seventh).chords;
        return W.chordsFromText(S.text, P.root, P.mode).filter(c => !c.bad).map(c => F.matchToken(c, P.root, P.mode)).filter(Boolean);
      };
      const draw = () => {
        const cs = getChords(); if (S.sel >= cs.length) S.sel = 0; out.replaceChildren();
        if (!cs.length) { out.append(h('p', { class: 'hint' }, L('Sem acordes reconhecidos no tom. Experimenta: Am F C G', 'No recognised in-key chords. Try: Am F C G'))); return; }
        cs.forEach((c, i) => { const e = F.explainChord(c, P.mode);
          out.append(h('div', { class: 'explain' + (i === S.sel ? ' sel' : ''), onclick: () => { S.sel = i; draw(); } }, h('div', { class: 'eh' }, h('b', null, `${i + 1}. ${e.name}`), h('span', { class: 'pill' }, e.roman), h('span', { class: 'pill' }, e.role), h('span', { class: 'tens t' + e.tension }, e.tensionText)), h('p', null, e.text), h('small', null, L('Notas: ', 'Notes: ') + e.notes),
            i > 0 ? h('p', { class: 'trans' }, '↳ ' + F.explainTransition(cs[i - 1], c, P.mode)) : null)); });
        const cur = cs[S.sel], nx = F.suggestNext(cur, P.root, P.mode);
        out.append(ui.card(L(`Próximo acorde depois de ${cur.name}`, `Next chord after ${cur.name}`), ...nx.map(n => h('div', { class: 'tip' }, h('b', null, `${n.chord.name} (${n.chord.roman})`), h('div', null, n.why)))));
        out.append(ui.card(L('Explica uma nota', 'Explain a note'), h('div', { class: 'row' }, ui.select(L('Nota', 'Note'), W.NOTE_OPTS().map(o => ({ v: o.v, t: W.noteName(o.v, fl) })), S.noteSel, v => { S.noteSel = +v; draw(); })), h('p', null, F.explainNote(S.noteSel, cur, P.root, P.mode))));
        const play = () => { if (W.audio.isPlaying()) return W.audio.stop(); const r = W.chordEvents(cs, { beats: 2, vl: true, bass: true, preset: 'piano' }); W.audio.play(r.ev, P.bpm, { loop: false, length: r.length }); };
        out.append(h('div', { class: 'row' }, ui.btn(L('▶ Ouvir progressão', '▶ Hear progression'), play, 'primary'),
          ui.btn(L('⬇ Lição (.txt)', '⬇ Lesson (.txt)'), () => W.download('Farol-licao.txt', F.lessonText(cs, P.root, P.mode, S.src === 'style' ? W.styleName(W.STYLES.find(s => s.id === S.style)) : L('a tua progressão', 'your progression')), 'text/plain;charset=utf-8')),
          ui.btn(L('⬇ MIDI', '⬇ MIDI'), () => { const r = W.chordEvents(cs, { beats: 4, vl: true, bass: false, preset: 'piano' }); W.download('Farol-progressao.mid', W.midi.write({ bpm: P.bpm, name: 'Farol', tracks: [{ name: 'Acordes', notes: r.notes.map(n => ({ t: n.t, dur: n.dur, note: n.midi, vel: n.vel })) }] })); })));
      };
      const srcCtl = h('div', { class: 'row' });
      const mkSrc = () => srcCtl.replaceChildren(ui.select(L('Origem', 'Source'), [{ v: 'style', t: L('Exemplos curados', 'Curated examples') }, { v: 'text', t: L('A minha progressão', 'My progression') }], S.src, v => { S.src = v; mkSrc(); draw(); }),
        ...(S.src === 'style' ? [ui.select(L('Estilo', 'Style'), W.STYLES.map(s => ({ v: s.id, t: W.styleName(s) })), S.style, v => { S.style = v; draw(); }), ui.range(L('Variação', 'Variation'), 1, 4, 1, S.variant + 1, v => { S.variant = v - 1; draw(); }), ui.check(L('Sétimas', '7ths'), S.seventh, v => { S.seventh = v; draw(); })]
          : [h('label', { class: 'ctl' }, h('span', null, L('Acordes', 'Chords')), h('input', { type: 'text', class: 'txt', value: S.text, oninput: e => { S.text = e.target.value; draw(); } }))]));
      mkSrc();
      body.append(ui.card(L('Explica-me', 'Explain me'), h('p', { class: 'hint' }, L('Clica num acorde para ver as sugestões de "próximo acorde" a partir dele.', 'Click a chord to see "next chord" suggestions from it.')), srcCtl, out));
      // Samples
      const res = h('div'), nameOf = (r, m) => W.noteName(r, W.useFlats(r, m)) + (m === 'major' ? '' : 'm');
      const sdraw = () => {
        const a = F.adviseSample(S.sR, S.sM, S.sB, P.root, P.mode, P.bpm), s = a.best.s, fit = a.best.ov;
        const msgFit = fit === 7 ? L('Encaixe perfeito: todas as notas do sample existem no teu tom.', 'Perfect fit: every note of the sample exists in your key.') : fit >= 5 ? L('Funciona, mas algumas notas do sample serão "tensões" fora da escala; usa acordes que as incluam ou filtra o sample.', 'Works, but some sample notes will be out-of-scale tensions; use chords that include them or filter the sample.') : L('Encaixe fraco: muda o tom do projeto ou procura outro sample.', 'Weak fit: change the project key or find another sample.');
        const pct = a.pct, pctMsg = Math.abs(pct) <= 3 ? L('variação mínima, sem perda de qualidade', 'tiny change, no quality loss') : Math.abs(pct) <= 8 ? L('variação aceitável; usa time-stretch de boa qualidade', 'acceptable change; use good-quality time-stretch') : L('variação grande: pode ter artefactos — considera outro sample ou meio/duplo tempo', 'large change: may cause artefacts — consider another sample or half/double time');
        res.replaceChildren(h('div', { class: 'tip' }, h('b', null, L('Tom', 'Key')), h('div', null, `${nameOf(S.sR, S.sM)} → ${nameOf(P.root, P.mode)}: ` + (s === 0 ? L('não precisas de transpor.', 'no transposition needed.') : L(`transpõe ${s > 0 ? '+' : ''}${s} semitons (${s > 0 ? 'para cima' : 'para baixo'}).`, `transpose ${s > 0 ? '+' : ''}${s} semitones (${s > 0 ? 'up' : 'down'}).`))), h('small', null, `${fit}/7 ${L('notas em comum', 'notes in common')}. ${msgFit}`)),
          a.alts.length ? h('small', null, L('Alternativas: ', 'Alternatives: ') + a.alts.map(x => `${x.s > 0 ? '+' : ''}${x.s} (${x.ov}/7)`).join(' · ')) : null,
          h('div', { class: 'tip' }, h('b', null, 'BPM'), h('div', null, `${S.sB} → ${P.bpm} BPM (${a.ratioMode === '1×' ? '' : L('tempo ', 'time ') + a.ratioMode + ': '}${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%): ${pctMsg}.`)),
          h('div', { class: 'row' }, ui.btn(L('▶ Ouvir tónica do projeto', '▶ Hear project tonic'), () => { const c = W.chordFromToken('1', P.root, P.mode, false), r = W.chordEvents([c], { beats: 4, vl: true, bass: false, preset: 'pad' }); W.audio.play(r.ev, P.bpm, { loop: false, length: 4 }); }), ui.btn(L('▶ Ouvir tónica do sample (já transposta)', '▶ Hear sample tonic (transposed)'), () => { const c = W.chordFromToken('1', W.mod(S.sR + s, 12), S.sM, false), r = W.chordEvents([c], { beats: 4, vl: true, bass: false, preset: 'pad' }); W.audio.play(r.ev, P.bpm, { loop: false, length: 4 }); })));
      };
      body.append(ui.card(L('Compatibilidade de samples', 'Sample compatibility'), h('p', { class: 'hint' }, L('Indica o tom e o BPM do vocal chop/sample e vê como o usar no teu projeto (tom e BPM do projeto estão na barra de cima).', 'Enter the key and BPM of your vocal chop/sample to see how to use it in your project (project key and BPM are in the top bar).')),
        h('div', { class: 'row' }, ui.select(L('Tom do sample', 'Sample key'), W.NOTE_OPTS().map(o => ({ v: o.v, t: o.t })), S.sR, v => { S.sR = +v; sdraw(); }), ui.select(L('Modo', 'Mode'), [{ v: 'major', t: L('Maior', 'Major') }, { v: 'minor', t: L('Menor', 'Minor') }], S.sM, v => { S.sM = v; sdraw(); }),
          ui.range('BPM', 60, 200, 1, S.sB, v => { S.sB = v; sdraw(); })), res));
      rootEl.append(body); draw(); sdraw();
    },
  });
})();
