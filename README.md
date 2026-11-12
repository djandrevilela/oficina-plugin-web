<div align="center">

# ♫ Oficina de Teoria EDM

**Seis ferramentas de teoria musical para produtores de EDM, 100% no browser.**
Acordes que funcionam, melodias dentro da harmonia, arranjos, explicações, mistura equilibrada e synths que ensinam.

`Sem IA` · `Sem aleatoriedade` · `Sem instalação` · `Grátis` · `PT-PT / EN-GB`

</div>

---

## Porquê?

Muita gente produz música eletrónica com ouvido e talento, mas sem teoria musical. Esta oficina traduz a teoria em **ferramentas práticas**: em vez de te dizer "usa a progressão vi–IV–I–V", mostra-te o acorde, toca-o, explica porque funciona e exporta-o em MIDI para o teu DAW.

Tudo é **determinístico**: os mesmos dados dão sempre o mesmo resultado. A "variação" é escolher outra entrada de uma lista curada à mão, nunca um sorteio, e nunca uma resposta de IA. Só entram acordes e notas que funcionam, baseados em convenções gerais de género, sem músicas copiadas nem nomes de artistas.

## As ferramentas

| | Ferramenta | O que faz |
|---|---|---|
| 🎹 | **Harmonia** | Progressões por estilo (Future Bass, Progressive House, Big Room, Emocional, Empréstimo modal), condução de vozes automática, *scale lock* com correção, sugestão de "próxima nota" e verificador de harmonia. |
| 🌅 | **Alvorada** | Melodia que fica sempre dentro da harmonia (controlos de subida/descida, simples/complexa, pluck/lead), contra-melodia, arpejos (incluindo o típico de future bass), baixo e sub (offbeat, rolling, sidechain-ready) e um synth fácil com biblioteca de sons. |
| ⚡ | **Zenite** | Templates de arranjo com marcadores e dicas de compassos por secção, *build-up builder* (snare roll, riser, filtro e pitch sincronizados com o tempo) e drums por subgénero com variações e fills. |
| 🔦 | **Farol** | Modo "explica-me": porque cada acorde, transição e nota funciona. Mais compatibilidade de samples: indicas o tom e o BPM de um vocal chop e ele diz como o transpor e ajustar. |
| ⚖️ | **Equilíbrio** | EQ por função (bombo, baixo, lead, voz…) com explicação de cada correção, analisador de 8 bandas com conselhos, ducker de sidechain sincronizado e dicas de afinação bombo/baixo. |
| 🧪 | **Receitas** | Um synth que ensina: 6 receitas de som × 5 passos. Aplicar um passo mexe nos botões e podes ouvir antes e depois. |

## Destaques

- **Projeto partilhado:** tom, modo e BPM definidos uma vez valem para todas as ferramentas.
- **Exportação:** MIDI de acordes, melodias, baixos e drums; MIDI do Zenite com marcadores de secção; guias e lições em `.txt`.
- **8 temas:** Meia-noite, Aurora, Pôr do sol, Oceano, Neon, Papel, Menta e Alto contraste.
- **Bilingue:** português europeu e inglês britânico, com alternância instantânea.
- **Privado:** tudo corre no teu browser; o áudio que carregues nunca sai do teu computador.
- **Offline:** instalável como app e funciona sem ligação depois da primeira visita.
- **Leve:** HTML, CSS e JavaScript puros, sem dependências nem processo de build.

## Como se usa

1. Abre o site e escolhe o **tom, modo e BPM** na barra do projeto.
2. Gera uma progressão no **Harmonia**, ouve-a e exporta o MIDI.
3. Constrói melodia e baixo por cima no **Alvorada**.
4. Estrutura a faixa no **Zenite** e cria o build-up.
5. Percebe o porquê no **Farol**, acerta a mistura no **Equilíbrio** e aprende a fazer os sons nas **Receitas**.

## Estrutura do código

```
index.html
assets/
  core.js        teoria musical, MIDI, motor de áudio (synth, bateria, agendador)
  harmonia.js    acordes, condução de vozes, scale lock, verificador
  alvorada.js    melodia, contra-melodia, arpejos, baixo/sub, presets
  zenite.js      arranjo, drums, build-up, risers
  farol.js       explicações bilingues e compatibilidade de samples
  equilibrio.js  EQ por função, analisador, ducker
  receitas.js    receitas de synth passo a passo
  app.js         navegação, temas, idioma
  style.css      temas através de variáveis CSS
```

Cada ferramenta separa a **lógica pura** (testável em Node, sem DOM) da interface.

## Desenvolvimento local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

O áudio só arranca depois de um clique na página (regra dos browsers).

## Princípios

1. Sem geração aleatória e sem IA: teoria musical e listas curadas.
2. Só acordes, notas e definições que funcionam.
3. Sem copiar músicas nem referir artistas ou produtos comerciais.
4. Interface em português europeu, com versão em inglês britânico.

## Apoio

Se estas ferramentas te ajudam, podes apoiar o projeto no [Ko-fi](https://ko-fi.com/SEU_UTILIZADOR) ☕

---

<div align="center">
Feito com ♥ em Portugal · Projeto independente, sem afiliação a marcas ou artistas.
</div>
