# Meli Conversor de Moeda — front-end

Tela em React + Vite do conversor de moedas. Consome a API do repositório [meli-conversor-moeda](https://github.com/marheusmatos/meli-conversor-moeda).

## Páginas

| Página | Endereço | O que faz |
| --- | --- | --- |
| Converter | `#/` | Converte um valor entre duas moedas |
| Histórico | `#/historico` | Mostra as 5 últimas conversões, da mais nova para a mais antiga |
| Taxas | `#/taxas` | Lista as taxas com a data da última atualização, cadastra ou atualiza uma taxa e atualiza todas pelo câmbio real |
| Moedas | `#/moedas` | Adiciona uma moeda nova e lista as disponíveis |

| Apresentação | `#/apresentacao` | Abertura animada com o logo e um carrossel que resume o projeto, a arquitetura e a documentação |

As moedas e as taxas vêm sempre da API; nenhuma fica no código.

A apresentação abre sozinha na primeira visita e pode ser revista pelo link do rodapé. Para a abertura tocar um som, coloque o arquivo de áudio em `src/assets/jingle.mp3`; sem ele, a abertura roda em silêncio. O navegador só libera som depois de um clique, então na primeira visita aparece o botão "Ativar som".

O visual segue o [Andes Design System](https://mercado-livre-meli-plus-ux-challeng.vercel.app/ui-design/andes-design-system) do Mercado Livre: os tokens de cor, tipografia, espaçamento, borda e sombra estão no topo de `src/index.css`. As páginas usam o `#` do endereço, então o `dist/` funciona em qualquer servidor de arquivos estáticos e em qualquer subcaminho.

## Rodar

```bash
cp .env.example .env
npm install
npm run dev
```

Abre em http://localhost:5173. A API precisa estar no ar e liberar essa origem em `CORS_ORIGINS`.

| Variável | Descrição |
| --- | --- |
| `VITE_API_URL` | Endereço da API, sem barra no final (ex.: `http://localhost:8000`) |

O valor é lido no build: mudou o `.env`, rode `npm run build` de novo.

## Build

```bash
npm run build     # gera dist/
npm run lint
```

## Deploy

O `Jenkinsfile` constrói a imagem Docker (Node para o build, nginx para servir o `dist/`) e sobe o container em `127.0.0.1:5501`.

O endereço da API entra no build pela variável `VITE_API_URL` do próprio `Jenkinsfile`. O valor é `/meli/api`, sem domínio, porque o site e a API ficam no mesmo endereço; assim funciona em HTTP e em HTTPS.

O proxy do servidor precisa encaminhar `/meli/` para essa porta, removendo o prefixo, e manter `/meli/api/` apontando para a API.

## Créditos

Cotações do câmbio real: [Rates By Exchange Rate API](https://www.exchangerate-api.com).
