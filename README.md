# Oficina de Teoria EDM — versão web

Site estático (HTML + JavaScript puro, sem dependências nem build) com versões web de seis ferramentas:
**Harmonia** (acordes/progressões, condução de vozes, scale lock, próxima nota, verificador),
**Alvorada** (melodia, contra-melodia, arpejos, baixo/sub, synth com presets),
**Zenite** (arranjo com marcadores, drums por subgénero, build-up com snare roll e riser),
**Farol** (modo "explica-me" + compatibilidade de samples), **Equilíbrio** (EQ por função, analisador de 8 bandas, ducker, bombo/baixo)
e **Receitas** (synth que ensina, 6 receitas × 5 passos).

Extras: 8 temas, PT/EN, tom/modo/BPM partilhados, definições guardadas no browser, exportação MIDI (com marcadores) e guias .txt, funciona offline (PWA).

## Regras do projeto
Sem IA e sem aleatoriedade (mesmos dados ⇒ mesmo resultado; "variação" = outra entrada de uma lista curada). Só acordes/notas que funcionam.
Sem músicas copiadas, sem nomes de artistas ou de produtos comerciais. Tudo corre no browser; nenhum áudio é enviado.

## Antes de publicar
Edita `assets/config.js`: troca `kofi` pelo teu link (https://ko-fi.com/o_teu_utilizador) e, se quiseres, `siteName`.

## Publicar no GitHub Pages
1. Cria um repositório e põe **o conteúdo desta pasta na raiz** (index.html, assets/, .github/, ...).
2. Em *Settings → Pages → Build and deployment → Source* escolhe **GitHub Actions** (o workflow `.github/workflows/pages.yml` publica ao fazer push para `main`).
   Alternativa sem Actions: *Source = Deploy from a branch*, branch `main`, pasta `/ (root)`.
3. O site fica em `https://<utilizador>.github.io/<repositório>/`.

## Testar localmente
`python3 -m http.server 8000` na pasta e abrir http://localhost:8000 (o áudio exige um clique para arrancar — regra dos browsers).

## Estrutura
- `assets/core.js` teoria, MIDI, motor de áudio (synth/bateria/agendador), piano roll
- `assets/harmonia.js`, `alvorada.js`, `zenite.js`, `farol.js`, `equilibrio.js`, `receitas.js` uma ferramenta por ficheiro (lógica pura + UI)
- `assets/app.js` navegação, temas, idioma, footer; `assets/style.css` temas via variáveis CSS
- `sw.js` + `manifest.webmanifest` modo offline/instalável
