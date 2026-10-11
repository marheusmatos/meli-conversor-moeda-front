# Front-end do Conversor de Moedas

Front-end em React + Vite (JavaScript) do desafio "Conversor de Moedas". São quatro páginas (Converter, Histórico, Taxas e Moedas), todas em `src/App.jsx`, com navegação pelo `#` do endereço e sem biblioteca de rotas. O estilo fica em `src/index.css` e segue o Andes Design System do Mercado Livre (https://mercado-livre-meli-plus-ux-challeng.vercel.app/ui-design/andes-design-system); os tokens estão no topo do arquivo.

## De onde vem o contexto

O backend já está pronto em outro repositório, na mesma máquina:

- Código: `E:\documents\GitHub\meli conversor moeda` (branch `develop`)
- Contrato e decisões: `E:\documents\GitHub\meli conversor moeda\docs\system-design.md`
- Exemplos de chamada e erros: `E:\documents\GitHub\meli conversor moeda\README.md`
- Conversa completa em que o backend foi feito: `C:\Users\Matheus\.claude\projects\e--documents-GitHub-meli-conversor-moeda\ef788a60-5847-47df-9a53-463153707522.jsonl`

Leia os dois primeiros arquivos antes de escrever código. O enunciado da etapa 4 (front-end) foi passado em imagens e não está em nenhum arquivo: peça as imagens ao Matheus se precisar do texto exato.

## O que a tela precisa fazer

- Converter um valor entre duas moedas e mostrar o resultado.
- Mostrar as 5 últimas conversões, da mais nova para a mais antiga, atualizando depois de cada conversão.
- Cadastrar ou atualizar a taxa de uma moeda.
- Bônus pedidos (todos): adicionar uma moeda nova pela interface, mostrar a data e hora da última atualização de cada taxa, botão para atualizar as taxas pelo câmbio real.
- As listas de moedas vêm de `GET /taxas`. Nenhuma moeda ou taxa fica fixa no código.
- Mostrar ao usuário a mensagem de erro que a API devolve.

## API

Base: variável `VITE_API_URL` (no `.env`; local é `http://localhost:8000`). Swagger em `{VITE_API_URL}/docs`.

| Método e rota | Sucesso | Erros |
|---|---|---|
| `GET /taxas` | `200` `[{moeda, valor, atualizada_em}]`; `valor` e `atualizada_em` são `null` na moeda sem taxa | — |
| `POST /taxas/{moeda}/{valor}` | `201` `{moeda, valor, atualizada_em, mensagem}` | `400` |
| `GET /converter/{valor}/{moeda_origem}/{moeda_destino}` | `200` `{valor, moeda_origem, moeda_destino, convertido}` | `400`, `404` (moeda sem taxa) |
| `GET /conversoes` | `200` lista com até 5 conversões | `404` histórico vazio |
| `POST /moedas/{codigo}` | `201` `{moeda, mensagem}` | `400` |
| `POST /taxas/atualizar` | `200` lista das taxas atualizadas | `502` |

Pontos que pegam:

- `GET /conversoes` devolve `404` quando o histórico está vazio. Isso é estado normal, e a tela mostra "nenhuma conversão ainda", não um erro.
- Erros `400`, `404` e `502` vêm como JSON `{"detail": "mensagem em português"}`. Já `429` (rate limit) e `503` (Redis fora) vêm como **texto puro**, então não dá para chamar `.json()` neles.
- `valor` vai no path e a API só aceita o formato `\d{1,15}(\.\d{1,8})?`: ponto como separador decimal, sem vírgula, sem sinal, sem notação científica.
- `atualizada_em` é ISO 8601 em UTC.
- O USD é a base e só aceita taxa 1.
- O CORS da API só libera as origens de `CORS_ORIGINS` (local: `http://localhost:5173`, a porta padrão do Vite). A URL de produção do front precisa ser adicionada lá.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Para subir a API local: no repositório do backend, `cd backend` e `uvicorn app.main:app --reload`. O `.env` de lá aponta para o Redis real do Matheus (dados de produção), então evite criar taxas e moedas de teste nele.

## Preferências do Matheus

- Código mínimo: menos arquivos, sem abstração especulativa, sem dependência nova para o que poucas linhas resolvem (ele usa a skill `/ponytail`).
- Sem comentários no código.
- Textos da interface e mensagens em português.
- Toda configuração por `.env`, que não é versionado. Nenhum segredo, IP ou credencial no repositório.
- Commit e push só quando ele pedir, e sem o Claude como coautor.
- O deploy será no servidor dele, via Jenkins, como o backend.
