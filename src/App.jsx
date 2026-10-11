import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import logo from './assets/logo.png'

const API = import.meta.env.VITE_API_URL
const PADRAO_VALOR = '\\d{1,15}([.,]\\d{1,8})?'
const AJUDA_VALOR = 'Número maior que zero, com até 8 casas decimais'
const PAGINAS = [
  ['/', 'Converter'],
  ['/historico', 'Histórico'],
  ['/taxas', 'Taxas'],
  ['/moedas', 'Moedas'],
]

async function api(rota, method = 'GET') {
  let resposta
  try {
    resposta = await fetch(API + rota, { method })
  } catch {
    throw new Error('Não foi possível falar com o servidor. Tente de novo.')
  }
  const texto = await resposta.text()
  let corpo = texto
  try {
    corpo = JSON.parse(texto)
  } catch {}
  if (!resposta.ok) {
    const mensagem = typeof corpo === 'string' ? corpo : corpo.detail
    const erro = new Error(
      typeof mensagem === 'string' && mensagem
        ? mensagem
        : `Erro ${resposta.status}.`,
    )
    erro.status = resposta.status
    throw erro
  }
  return corpo
}

const nomes = new Intl.DisplayNames('pt-BR', { type: 'currency' })
function nomeDaMoeda(codigo) {
  try {
    const nome = nomes.of(codigo)
    return nome === codigo ? '' : nome
  } catch {
    return ''
  }
}

const valorDaRota = (texto) => encodeURIComponent(texto.trim().replace(',', '.'))
const numero = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 8 })
const data = (iso) =>
  new Date(iso).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })

function ouvirRota(aoMudar) {
  window.addEventListener('hashchange', aoMudar)
  return () => window.removeEventListener('hashchange', aoMudar)
}
const lerRota = () => window.location.hash.slice(1) || '/'

function Campo({ rotulo, ajuda, children }) {
  return (
    <label className="andes-form-group">
      <span className="andes-label">{rotulo}</span>
      {children}
      {ajuda && <span className="andes-input-helper">{ajuda}</span>}
    </label>
  )
}

function SeletorDeMoeda({ taxas, exigirTaxa, ...props }) {
  return (
    <select className="andes-input" {...props}>
      {taxas.map((t) => (
        <option
          key={t.moeda}
          value={t.moeda}
          disabled={exigirTaxa && t.valor === null}
        >
          {[t.moeda, nomeDaMoeda(t.moeda)].filter(Boolean).join(' · ')}
          {exigirTaxa && t.valor === null ? ' (sem taxa)' : ''}
        </option>
      ))}
    </select>
  )
}

function Vazio({ titulo, texto, children }) {
  return (
    <div className="andes-card andes-empty-state">
      <h2>{titulo}</h2>
      <p>{texto}</p>
      {children}
    </div>
  )
}

function Converter({ taxas, resultado, ocupado, aoConverter }) {
  const comTaxa = taxas.filter((t) => t.valor !== null)
  const [origem, setOrigem] = useState(comTaxa[0]?.moeda)
  const [destino, setDestino] = useState(comTaxa[1]?.moeda)

  if (comTaxa.length < 2)
    return (
      <Vazio
        titulo="Faltam taxas para converter"
        texto="Cadastre a taxa de pelo menos duas moedas para fazer a primeira conversão."
      >
        <a className="andes-button andes-button--primary" href="#/taxas">
          Cadastrar taxas
        </a>
      </Vazio>
    )

  function escolherOrigem(moeda) {
    if (moeda === destino) setDestino(origem)
    setOrigem(moeda)
  }

  function escolherDestino(moeda) {
    if (moeda === origem) setOrigem(destino)
    setDestino(moeda)
  }

  const taxaDe = (moeda) => taxas.find((t) => t.moeda === moeda)?.valor
  const taxaOrigem = resultado && taxaDe(resultado.moeda_origem)
  const taxaDestino = resultado && taxaDe(resultado.moeda_destino)

  return (
    <div className="andes-card">
      <form className="conversor" onSubmit={aoConverter}>
        <Campo rotulo="Valor">
          <input
            className="andes-input conversor__valor"
            name="valor"
            inputMode="decimal"
            autoComplete="off"
            required
            pattern={PADRAO_VALOR}
            title={AJUDA_VALOR}
            placeholder="100"
          />
        </Campo>
        <div className="conversor__moedas">
          <Campo rotulo="De">
            <SeletorDeMoeda
              taxas={taxas}
              exigirTaxa
              name="origem"
              value={origem}
              onChange={(e) => escolherOrigem(e.target.value)}
            />
          </Campo>
          <button
            type="button"
            className="andes-button andes-button--quiet conversor__inverter"
            aria-label="Inverter moedas"
            title="Inverter moedas"
            onClick={() => {
              setOrigem(destino)
              setDestino(origem)
            }}
          >
            ⇄
          </button>
          <Campo rotulo="Para">
            <SeletorDeMoeda
              taxas={taxas}
              exigirTaxa
              name="destino"
              value={destino}
              onChange={(e) => escolherDestino(e.target.value)}
            />
          </Campo>
        </div>
        <button
          className="andes-button andes-button--primary andes-button--full"
          disabled={ocupado}
        >
          Converter
        </button>
      </form>

      {resultado && (
        <div className="resultado" role="status">
          <p className="resultado__origem">
            {numero(resultado.valor)}{' '}
            {nomeDaMoeda(resultado.moeda_origem) || resultado.moeda_origem} =
          </p>
          <p className="resultado__valor">
            {numero(resultado.convertido)}{' '}
            <span>{resultado.moeda_destino}</span>
          </p>
          {taxaOrigem != null && taxaDestino != null && (
            <p className="resultado__taxas">
              Taxas usadas: 1 USD = {numero(taxaOrigem)}{' '}
              {resultado.moeda_origem} e 1 USD = {numero(taxaDestino)}{' '}
              {resultado.moeda_destino}.
            </p>
          )}
          <a href="#/historico">Ver últimas conversões</a>
        </div>
      )}
    </div>
  )
}

function Historico({ conversoes }) {
  if (!conversoes.length)
    return (
      <Vazio
        titulo="Você ainda não fez conversões"
        texto="As cinco conversões mais recentes aparecem aqui."
      >
        <a className="andes-button andes-button--primary" href="#/">
          Converter agora
        </a>
      </Vazio>
    )

  return (
    <div className="andes-card">
      <div className="tabela">
        <table>
          <thead>
            <tr>
              <th>De</th>
              <th>Para</th>
              <th className="num">Valor</th>
              <th className="num">Convertido</th>
            </tr>
          </thead>
          <tbody>
            {conversoes.map((c, i) => (
              <tr key={i}>
                <td>{c.moeda_origem}</td>
                <td>{c.moeda_destino}</td>
                <td className="num">{numero(c.valor)}</td>
                <td className="num">
                  <strong>{numero(c.convertido)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="andes-input-helper">
        Mostramos as 5 conversões mais recentes, da mais nova para a mais
        antiga.
      </p>
    </div>
  )
}

function Taxas({ taxas, ocupado, aoSalvar, aoAtualizar }) {
  const dialogo = useRef(null)

  return (
    <>
      <div className="andes-card">
        <div className="tabela">
          <table>
            <thead>
              <tr>
                <th>Moeda</th>
                <th className="num">1 USD vale</th>
                <th>Última atualização</th>
              </tr>
            </thead>
            <tbody>
              {taxas.map((t) => (
                <tr key={t.moeda}>
                  <td>
                    <strong>{t.moeda}</strong>
                    <span className="suave"> {nomeDaMoeda(t.moeda)}</span>
                  </td>
                  <td className="num">
                    {t.valor === null ? (
                      <span className="andes-badge">Sem taxa</span>
                    ) : (
                      numero(t.valor)
                    )}
                  </td>
                  <td className="suave">
                    {t.atualizada_em ? data(t.atualizada_em) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="andes-button andes-button--quiet"
          disabled={ocupado}
          onClick={() => dialogo.current.showModal()}
        >
          Atualizar pelo câmbio real
        </button>
      </div>

      <div className="andes-card">
        <h2>Cadastrar ou atualizar taxa</h2>
        <form className="linha" onSubmit={aoSalvar}>
          <Campo rotulo="Moeda">
            <SeletorDeMoeda taxas={taxas} name="moeda" />
          </Campo>
          <Campo rotulo="Quanto vale 1 USD nessa moeda">
            <input
              className="andes-input"
              name="valor"
              inputMode="decimal"
              autoComplete="off"
              required
              pattern={PADRAO_VALOR}
              title={AJUDA_VALOR}
              placeholder="700"
            />
          </Campo>
          <button
            className="andes-button andes-button--primary"
            disabled={ocupado}
          >
            Salvar taxa
          </button>
        </form>
      </div>

      <dialog
        ref={dialogo}
        className="andes-modal"
        aria-labelledby="titulo-do-dialogo"
      >
        <h2 id="titulo-do-dialogo">Atualizar pelo câmbio real?</h2>
        <p>
          As taxas cadastradas à mão serão substituídas pelas cotações de
          hoje. Não dá para desfazer.
        </p>
        <form method="dialog" className="andes-modal__footer">
          <button className="andes-button andes-button--transparent">
            Cancelar
          </button>
          <button
            className="andes-button andes-button--primary"
            onClick={aoAtualizar}
          >
            Atualizar taxas
          </button>
        </form>
      </dialog>
    </>
  )
}

function Moedas({ taxas, ocupado, aoAdicionar }) {
  return (
    <>
      <div className="andes-card">
        <h2>Adicionar moeda</h2>
        <form className="linha" onSubmit={aoAdicionar}>
          <Campo rotulo="Código da moeda" ajuda="Três letras, como EUR ou CLP.">
            <input
              className="andes-input codigo"
              name="codigo"
              autoComplete="off"
              required
              maxLength={3}
              pattern="[A-Za-z]{3}"
              title="Três letras, como EUR"
              placeholder="EUR"
            />
          </Campo>
          <button
            className="andes-button andes-button--primary"
            disabled={ocupado}
          >
            Adicionar moeda
          </button>
        </form>
      </div>

      <div className="andes-card">
        <h2>Moedas disponíveis</h2>
        <ul className="moedas">
          {taxas.map((t) => (
            <li key={t.moeda}>
              <strong>{t.moeda}</strong>
              <span className="suave">{nomeDaMoeda(t.moeda)}</span>
              {t.valor === null && (
                <a href="#/taxas" className="andes-badge">
                  Sem taxa
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

export default function App() {
  const rota = useSyncExternalStore(ouvirRota, lerRota)
  const [pagina, titulo] = PAGINAS.find(([c]) => c === rota) ?? PAGINAS[0]
  const [taxas, setTaxas] = useState(null)
  const [conversoes, setConversoes] = useState([])
  const [resultado, setResultado] = useState(null)
  const [aviso, setAviso] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  async function buscar() {
    return [
      await api('/taxas'),
      await api('/conversoes').catch((erro) => {
        if (erro.status === 404) return []
        throw erro
      }),
    ]
  }

  function mostrar([novasTaxas, novasConversoes]) {
    setTaxas(novasTaxas)
    setConversoes(novasConversoes)
  }

  async function executar(acao) {
    setOcupado(true)
    setAviso(null)
    try {
      const texto = await acao()
      mostrar(await buscar())
      if (texto) setAviso({ ok: true, texto, pagina })
    } catch (erro) {
      setAviso({ texto: erro.message, pagina })
    }
    setOcupado(false)
  }

  useEffect(() => {
    buscar().then(mostrar, (erro) => setAviso({ texto: erro.message }))
  }, [])

  useEffect(() => {
    document.title = `${titulo} | Conversor de moedas`
  }, [titulo])

  function enviar(acao) {
    return (evento) => {
      evento.preventDefault()
      const form = evento.currentTarget
      executar(() => acao(Object.fromEntries(new FormData(form)), form))
    }
  }

  const aoConverter = enviar(async ({ valor, origem, destino }) => {
    setResultado(null)
    setResultado(
      await api(`/converter/${valorDaRota(valor)}/${origem}/${destino}`),
    )
  })

  const aoSalvar = enviar(async ({ moeda, valor }, form) => {
    const { mensagem } = await api(
      `/taxas/${moeda}/${valorDaRota(valor)}`,
      'POST',
    )
    form.reset()
    return mensagem
  })

  const aoAdicionar = enviar(async ({ codigo }, form) => {
    const { mensagem } = await api(
      `/moedas/${encodeURIComponent(codigo.trim())}`,
      'POST',
    )
    form.reset()
    return mensagem
  })

  const aoAtualizar = () =>
    executar(async () => {
      await api('/taxas/atualizar', 'POST')
      return 'Taxas atualizadas pelo câmbio real.'
    })

  return (
    <>
      <header>
        <div className="largura cabecalho">
          <a href="#/">
            <img src={logo} alt="Mercado Livre" width="134" height="34" />
          </a>
          <span>Conversor de moedas</span>
        </div>
      </header>
      <nav aria-label="Páginas">
        <div className="largura">
          {PAGINAS.map(([caminho, nome]) => (
            <a
              key={caminho}
              href={`#${caminho}`}
              aria-current={caminho === pagina ? 'page' : undefined}
            >
              {nome}
            </a>
          ))}
        </div>
      </nav>

      <main className="largura">
        <div className="pagina" key={pagina}>
          <h1>{titulo}</h1>
          {!taxas ? (
            aviso ? (
              <Vazio titulo="Não foi possível carregar" texto={aviso.texto}>
                <button
                  className="andes-button andes-button--primary"
                  disabled={ocupado}
                  onClick={() => executar(() => {})}
                >
                  Tentar de novo
                </button>
              </Vazio>
            ) : (
              <div
                className="andes-spinner"
                role="status"
                aria-label="Carregando"
              />
            )
          ) : pagina === '/historico' ? (
            <Historico conversoes={conversoes} />
          ) : pagina === '/taxas' ? (
            <Taxas
              taxas={taxas}
              ocupado={ocupado}
              aoSalvar={aoSalvar}
              aoAtualizar={aoAtualizar}
            />
          ) : pagina === '/moedas' ? (
            <Moedas taxas={taxas} ocupado={ocupado} aoAdicionar={aoAdicionar} />
          ) : (
            <Converter
              taxas={taxas}
              resultado={resultado}
              ocupado={ocupado}
              aoConverter={aoConverter}
            />
          )}
        </div>
      </main>

      <footer className="largura">
        Cotações do câmbio real:{' '}
        <a href="https://www.exchangerate-api.com">
          Rates By Exchange Rate API
        </a>
      </footer>

      {taxas && aviso?.pagina === pagina && (
        <div
          className={
            aviso.ok ? 'andes-snackbar andes-snackbar--ok' : 'andes-snackbar'
          }
          role={aviso.ok ? 'status' : 'alert'}
        >
          <span>{aviso.texto}</span>
          <button aria-label="Fechar aviso" onClick={() => setAviso(null)}>
            ✕
          </button>
        </div>
      )}
    </>
  )
}
