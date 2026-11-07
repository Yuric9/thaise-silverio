export default function Header() {
  return (
    <>
      <div className="topline">
        <span>BELEZA • PRECISÃO • NATURALIDADE</span>
        <span>ATENDIMENTO COM HORA MARCADA</span>
      </div>
      <header className="header">
        <a href="#inicio" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-thaise-silverio.svg"
            alt="Thaise Silvério — Micropigmentação e Estética"
          />
        </a>
        <nav>
          <a href="#inicio">Início</a>
          <a href="#sobre">Sobre</a>
          <a href="#procedimentos">Procedimentos</a>
          <a href="#cursos">Cursos</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="header-cta" href="#contato">
          Agendar avaliação <span>↗</span>
        </a>
      </header>
    </>
  );
}
