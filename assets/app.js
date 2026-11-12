// Casca da aplicação: navegação, projeto (tom/modo/BPM), temas, idioma, footer, persistência.
(function () {
  const W = globalThis.W, { h, ui } = W, L = (...a) => W.L(...a);
  const THEMES = [['midnight', 'Meia-noite', 'Midnight'], ['aurora', 'Aurora', 'Aurora'], ['sunset', 'Pôr do sol', 'Sunset'], ['ocean', 'Oceano', 'Ocean'], ['neon', 'Neon', 'Neon'], ['paper', 'Papel (claro)', 'Paper (light)'], ['mint', 'Menta (claro)', 'Mint (light)'], ['contrast', 'Alto contraste', 'High contrast']];
  const store = { get(k, d) { try { const v = localStorage.getItem('ote.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('ote.' + k, JSON.stringify(v)); } catch (e) {} } };
  let cur = null;
  const root = () => document.getElementById('root');
  const applyTheme = t => { document.documentElement.dataset.theme = t; store.set('theme', t); };
  W.syncProject = () => { store.set('project', W.project); render(); };

  function header() {
    const th = h('select', { class: 'sel-mini', 'aria-label': 'Tema', onchange: e => { applyTheme(e.target.value); } }, THEMES.map(t => h('option', { value: t[0], selected: t[0] === document.documentElement.dataset.theme }, L(t[1], t[2]))));
    const lg = h('div', { class: 'seg' }, ['pt', 'en'].map(l => h('button', { class: W.lang === l ? 'on' : '', onclick: () => { W.lang = l; store.set('lang', l); document.documentElement.lang = l === 'pt' ? 'pt-PT' : 'en-GB'; render(); } }, l === 'pt' ? 'PT' : 'EN')));
    return h('header', { class: 'top' }, h('div', { class: 'brand' }, h('span', { class: 'logo' }, '♫'), h('div', null, h('b', null, W.config.siteName), h('small', null, L('versão web · 100% no teu browser', 'web version · 100% in your browser')))),
      h('nav', { class: 'tabs' }, W.tools.map(t => h('a', { href: '#' + t.id, class: cur && cur.id === t.id ? 'on' : '', onclick: e => { e.preventDefault(); show(t.id); } }, h('span', null, t.icon), ' ', t.name))),
      h('div', { class: 'ctrls' }, th, lg, h('a', { class: 'btn kofi', href: W.config.kofi, target: '_blank', rel: 'noopener' }, '☕ Ko-fi')));
  }
  function projectBar() {
    const P = W.project, fl = W.useFlats(P.root, P.mode);
    const set = () => { store.set('project', P); if (W.audio.isPlaying()) W.audio.stop(); renderTool(); };
    return h('div', { class: 'proj' }, h('b', null, L('Projeto', 'Project')),
      ui.select(L('Tom', 'Key'), W.NOTE_OPTS().map(o => ({ v: o.v, t: W.noteName(o.v, fl) })), P.root, v => { P.root = +v; set(); }),
      ui.select(L('Modo', 'Mode'), [{ v: 'major', t: L('Maior', 'Major') }, { v: 'minor', t: L('Menor', 'Minor') }], P.mode, v => { P.mode = v; set(); }),
      ui.range('BPM', 70, 180, 1, P.bpm, v => { P.bpm = v; store.set('project', P); }, v => v),
      h('small', { class: 'muted' }, L('Partilhado por todas as ferramentas. Escala: ', 'Shared by all tools. Scale: ') + W.SCALES[P.mode].map(x => W.noteName(W.mod(P.root + x, 12), fl)).join(' ')));
  }
  function footer() {
    const c = W.config;
    return h('footer', { class: 'foot' }, h('div', { class: 'foot-grid' },
      h('div', null, h('div', { class: 'brand' }, h('span', { class: 'logo' }, '♫'), h('b', null, c.siteName)), h('p', null, L('Ferramentas de teoria musical para produtores de EDM — sem IA, sem aleatoriedade: mesmos dados, mesmo resultado.', 'Music-theory tools for EDM producers — no AI, no randomness: same inputs, same output.')),
        h('a', { class: 'btn kofi big', href: c.kofi, target: '_blank', rel: 'noopener' }, L('☕ Oferece-me um café no Ko-fi', '☕ Buy me a coffee on Ko-fi'))),
      h('div', null, h('h4', null, L('Ferramentas', 'Tools')), W.tools.map(t => h('a', { href: '#' + t.id, onclick: e => { e.preventDefault(); show(t.id); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, t.icon + ' ' + t.name))),
      h('div', null, h('h4', null, L('Princípios', 'Principles')), h('p', null, L('✔ Só acordes e notas que funcionam', '✔ Only chords and notes that work')), h('p', null, L('✔ Sem músicas copiadas nem nomes de artistas', '✔ No copied songs or artist names')), h('p', null, L('✔ Tudo corre no teu browser; nada é enviado', '✔ Everything runs in your browser; nothing is uploaded'))),
      h('div', null, h('h4', null, L('Aparência', 'Appearance')), h('div', { class: 'dots' }, THEMES.map(t => h('button', { class: 'dot', 'data-t': t[0], title: L(t[1], t[2]), onclick: () => { applyTheme(t[0]); const s = document.querySelector('.sel-mini'); if (s) s.value = t[0]; } }))),
        h('p', { class: 'muted' }, L('Os ficheiros MIDI exportados são teus: usa-os livremente nas tuas músicas.', 'Exported MIDI files are yours: use them freely in your tracks.')))),
      h('div', { class: 'foot-bot' }, h('span', null, `© ${c.year} · v${c.version} · ${L('Feito com', 'Made with')} `, h('span', { class: 'heart' }, '♥'), L(' em Portugal', ' in Portugal')), h('span', { class: 'muted' }, L('Projeto independente, sem afiliação a marcas ou artistas.', 'Independent project, not affiliated with any brand or artist.')), h('a', { href: '#top', onclick: e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }, L('↑ Topo', '↑ Top'))));
  }
  function renderTool() {
    const m = document.getElementById('tool'); if (!m) return; if (m._cleanup) m._cleanup(); const old = m.firstChild; m.replaceChildren(); m._cleanup = null;
    const t = cur; m.append(h('div', { class: 'tool-head' }, h('h1', null, t.icon + ' ' + t.name), h('p', null, t.desc())));
    const box = h('div'); m.append(box); t.render(box); m._cleanup = () => { if (box._cleanup) box._cleanup(); W.audio.stop(); };
  }
  function render() {
    if (document.getElementById('tool') && document.getElementById('tool')._cleanup) document.getElementById('tool')._cleanup();
    root().replaceChildren(header(), projectBar(), h('main', { id: 'tool' }), footer()); renderTool();
  }
  function show(id) { const t = W.tools.find(x => x.id === id) || W.tools[0]; cur = t; store.set('tool', t.id); history.replaceState(null, '', '#' + t.id); render(); }
  function init() {
    W.lang = store.get('lang', (navigator.language || 'pt').toLowerCase().startsWith('pt') ? 'pt' : 'en'); document.documentElement.lang = W.lang === 'pt' ? 'pt-PT' : 'en-GB';
    Object.assign(W.project, store.get('project', {})); applyTheme(store.get('theme', 'midnight'));
    const id = location.hash.slice(1) || store.get('tool', 'harmonia'); cur = W.tools.find(x => x.id === id) || W.tools[0]; render();
    document.addEventListener('keydown', e => { if (e.code === 'Space' && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) { e.preventDefault(); W.audio.stop(); } });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  document.addEventListener('DOMContentLoaded', init);
})();
