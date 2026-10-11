import { useEffect, useRef, useState } from 'react'
import icone from './assets/logo-icone.svg'
import nome from './assets/logo-nome.svg'
import diagrama from './assets/arquitetura.svg?raw'
import diagramaUrl from './assets/arquitetura.svg'
import './apresentacao.css'

const API = import.meta.env.VITE_API_URL
const REPOSITORIO =
  'https://github.com/marheusmatos/meli-conversor-moeda/blob/develop'
const ABERTURA_MS = 5000
const SAIDA_MS = 800
const [jingle] = Object.values(
  import.meta.glob('./assets/jingle.*', {
    eager: true,
    query: '?url',
    import: 'default',
  }),
)

const SLIDES = [
  {
    titulo: 'Conversor de Moedas',
    corpo: (
      <>
        <p>
          Uma API em Python que converte valores entre moedas usando o dólar
          como base, com as taxas guardadas no Redis e uma tela em React para
          usar tudo.
        </p>
        <ul className="numeros">
          <li>
            <strong>7</strong> endpoints
          </li>
          <li>
            <strong>27</strong> testes automatizados
          </li>
          <li>
            <strong>5</strong> bônus entregues
          </li>
        </ul>
      </>
    ),
  },
  {
    titulo: 'Como a conversão funciona',
    corpo: (
      <>
        <p className="formula">valor ÷ taxa da origem × taxa do destino</p>
        <p>
          Exemplo: 100 BRL para ARS, com 1 USD = 5 BRL e 1 USD = 700 ARS.
        </p>
        <p className="formula">100 ÷ 5 × 700 = 14.000 ARS</p>
        <ul className="pontos">
          <li>Cálculo em decimal exato, arredondado para 2 casas.</li>
          <li>As taxas ficam só no Redis; nenhuma vem fixa no código.</li>
          <li>Cada conversão entra no histórico das 5 mais recentes.</li>
        </ul>
      </>
    ),
  },
  {
    titulo: 'Arquitetura',
    corpo: (
      <>
        <div
          className="diagrama"
          role="img"
          aria-label="Diagrama: o navegador passa pelo WAF da Cloudflare e chega ao proxy reverso, que entrega as requisições ao container da API; nele, middlewares, routes, services e repository; o repository grava no Redis, o services consulta a API pública de câmbio, e GitHub, GitHub Actions e Jenkins cuidam da entrega."
          tabIndex={0}
          dangerouslySetInnerHTML={{ __html: diagrama }}
        />
        <p className="andes-input-helper">
          É o diagrama do system design. Role para o lado para ver tudo ou{' '}
          <a href={diagramaUrl} target="_blank" rel="noreferrer">
            abra em tamanho real
          </a>
          .
        </p>
      </>
    ),
  },
  {
    titulo: 'Endpoints',
    corpo: (
      <>
        <ul className="rotas">
          <li>
            <code>POST /taxas/{'{moeda}'}/{'{valor}'}</code>
            <span>Cadastra ou atualiza uma taxa</span>
          </li>
          <li>
            <code>GET /converter/{'{valor}'}/{'{origem}'}/{'{destino}'}</code>
            <span>Converte e guarda no histórico</span>
          </li>
          <li>
            <code>GET /conversoes</code>
            <span>Últimas 5 conversões</span>
          </li>
          <li>
            <code>GET /taxas</code>
            <span>Moedas, taxas e última atualização</span>
          </li>
          <li>
            <code>POST /moedas/{'{codigo}'}</code>
            <span>Adiciona uma moeda</span>
          </li>
          <li>
            <code>POST /taxas/atualizar</code>
            <span>Atualiza pelo câmbio real</span>
          </li>
          <li>
            <code>GET /health</code>
            <span>Verifica a API e o Redis</span>
          </li>
        </ul>
      </>
    ),
  },
  {
    titulo: 'Qualidade e segurança',
    corpo: (
      <ul className="pontos">
        <li>
          27 testes com pytest: pelo menos um caso de sucesso e um de falha por
          endpoint, sem depender de Redis nem de rede.
        </li>
        <li>Lint e testes configurados para rodar a cada push.</li>
        <li>Limite de requisições por IP, contado no Redis.</li>
        <li>
          Validação estrita de entrada: valor negativo, texto ou{' '}
          <code>nan</code> voltam como 400.
        </li>
        <li>
          Nenhum segredo no repositório: toda a configuração vem de variáveis
          de ambiente.
        </li>
      </ul>
    ),
  },
  {
    titulo: 'Documentação',
    corpo: (
      <>
        <p>Tudo o que foi decidido e construído está escrito.</p>
        <div className="docs">
          <a href={`${API}/docs`} target="_blank" rel="noreferrer">
            <strong>Swagger</strong>
            Todos os endpoints, com descrição, exemplos e respostas de erro.
          </a>
          <a
            href={`${REPOSITORIO}/docs/system-design.md`}
            target="_blank"
            rel="noreferrer"
          >
            <strong>System design</strong>
            Requisitos, estimativas, entidades e diagramas de sequência.
          </a>
          <a href={`${REPOSITORIO}/README.md`} target="_blank" rel="noreferrer">
            <strong>README</strong>
            Como rodar, testar e publicar, com exemplos de chamada.
          </a>
        </div>
      </>
    ),
  },
]

function Abertura({ aoTerminar }) {
  const [rodada, setRodada] = useState(0)
  const [semSom, setSemSom] = useState(false)
  const [saindo, setSaindo] = useState(false)
  const dialogo = useRef(null)

  useEffect(() => {
    if (!dialogo.current.open) dialogo.current.showModal()
  }, [])

  useEffect(() => {
    const audio = jingle && new Audio(jingle)
    audio?.play().catch((erro) => {
      if (erro.name === 'NotAllowedError') setSemSom(true)
    })
    const espera = setTimeout(() => setSaindo(true), ABERTURA_MS)
    return () => {
      audio?.pause()
      clearTimeout(espera)
    }
  }, [rodada])

  useEffect(() => {
    if (!saindo) return
    const espera = setTimeout(aoTerminar, SAIDA_MS)
    return () => clearTimeout(espera)
  }, [saindo, aoTerminar])

  return (
    <dialog
      ref={dialogo}
      className={saindo ? 'abertura abertura--saindo' : 'abertura'}
      aria-label="Abertura"
      onCancel={(e) => {
        e.preventDefault()
        setSaindo(true)
      }}
    >
      <div className="abertura__topo">
        {semSom && !saindo && (
          <button
            className="abertura__acao"
            onClick={() => {
              setSemSom(false)
              setRodada(rodada + 1)
            }}
          >
            Ativar som
          </button>
        )}
        <button
          className="abertura__acao"
          aria-label="Pular abertura"
          onClick={() => setSaindo(true)}
        >
          Pular
        </button>
      </div>

      <div className="abertura__marca">
        <div className="marca" key={rodada} role="img" aria-label="Mercado Livre">
          <span className="marca__icone">
            <img src={icone} alt="" />
          </span>
          <span className="marca__nome">
            <img className="marca__linha" src={nome} alt="" />
            <img className="marca__linha marca__linha--2" src={nome} alt="" />
          </span>
        </div>
      </div>
    </dialog>
  )
}

export default function Apresentacao({ aoFechar }) {
  const [abertura, setAbertura] = useState(true)
  const [atual, setAtual] = useState(0)
  const [altura, setAltura] = useState()
  const dialogo = useRef(null)
  const trilho = useRef(null)
  const ultimo = atual === SLIDES.length - 1

  useEffect(() => {
    if (!abertura && !dialogo.current.open) dialogo.current.showModal()
  }, [abertura])

  useEffect(() => {
    if (abertura) return
    const slide = trilho.current.children[atual]
    const observador = new ResizeObserver(() => setAltura(slide.offsetHeight))
    observador.observe(slide)
    return () => observador.disconnect()
  }, [abertura, atual])

  function fechar() {
    try {
      localStorage.setItem('apresentacaoVista', '1')
    } catch {}
    aoFechar()
  }

  function ir(i) {
    trilho.current.scrollTo({ left: i * trilho.current.clientWidth })
  }

  if (abertura) return <Abertura aoTerminar={() => setAbertura(false)} />

  return (
    <dialog
      ref={dialogo}
      className="andes-modal carrossel"
      aria-roledescription="carrossel"
      aria-label="Apresentação do projeto"
      onClose={fechar}
    >
      <button
        className="carrossel__fechar"
        aria-label="Fechar apresentação"
        onClick={() => dialogo.current.close()}
      >
        ✕
      </button>

      <div
        className="carrossel__trilho"
        ref={trilho}
        style={{ height: altura }}
        tabIndex={0}
        onScroll={(e) =>
          setAtual(
            Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth),
          )
        }
      >
        {SLIDES.map((slide, i) => (
          <article
            className="slide"
            key={slide.titulo}
            aria-roledescription="slide"
            aria-label={`${i + 1} de ${SLIDES.length}`}
          >
            <h2>{slide.titulo}</h2>
            {slide.corpo}
          </article>
        ))}
      </div>

      <div className="carrossel__controles">
        <button
          className="andes-button andes-button--transparent"
          disabled={atual === 0}
          onClick={() => ir(atual - 1)}
        >
          Voltar
        </button>
        <div className="carrossel__pontos">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.titulo}
              aria-label={`Ir para ${slide.titulo}`}
              aria-current={i === atual || undefined}
              onClick={() => ir(i)}
            />
          ))}
        </div>
        <button
          className="andes-button andes-button--primary"
          onClick={ultimo ? () => dialogo.current.close() : () => ir(atual + 1)}
        >
          {ultimo ? 'Abrir o conversor' : 'Próximo'}
        </button>
      </div>
    </dialog>
  )
}
