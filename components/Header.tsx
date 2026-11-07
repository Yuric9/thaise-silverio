export default function Header() {
  return (
    <>
      <div className="topline">
        <span>BELEZA • PRECISÃO • NATURALIDADE</span>
        <span>ATENDIMENTO COM HORA MARCADA</span>
      </div>
      <header className="header">
        <a href="#inicio" className="brand">
          <img
            src="/images/logo-thaise-silverio-horizontal.webp"
            alt="Thaise Silvério — Micropigmentação e Estética"
            width={518}
            height={160}
          />
        </a>
        <nav aria-label="Menu principal">
          <a href="#inicio">Início</a>
          <a href="#sobre">Sobre</a>
          <a href="#procedimentos">Procedimentos</a>
          <a href="#resultados">Resultados</a>
          <a href="#cursos">Cursos</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="header-cta" href="#contato">
          Agendar avaliação <span aria-hidden="true">↗</span>
        </a>
      </header>
    </>
  );
}
