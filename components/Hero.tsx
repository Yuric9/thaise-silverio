export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero-bg" />
      <div className="hero-copy">
        <p className="eyebrow">
          <i /> MICROPIGMENTAÇÃO & ESTÉTICA
        </p>
        <h1>
          Sua beleza,
          <br />
          <em>em sua melhor</em> versão.
        </h1>
        <p className="hero-text">
          Realce sua essência com cuidado, técnica e resultados que respeitam a
          sua beleza natural.
        </p>
        <div className="hero-actions">
          <a className="button button-gold" href="#procedimentos">
            Conheça os procedimentos <span>↗</span>
          </a>
          <a className="text-link" href="#sobre">
            Conheça a Thaise <span>→</span>
          </a>
        </div>
        <div className="hero-note">
          <span className="seal">TS</span>
          <span>
            BELEZA COM
            <br />
            IDENTIDADE
          </span>
          <b>01 / 06</b>
        </div>
      </div>
      <div className="hero-art">
        <div className="art-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="art-photo"
            src="/images/thaise-silverio.webp"
            alt="Thaise Silvério sorrindo, sentada em uma cadeira, de blazer e calça brancos"
            width={900}
            height={1200}
          />
          <div className="art-caption">SUA ESSÊNCIA, EM DESTAQUE</div>
        </div>
        <span className="art-side">THAISE SILVÉRIO · ESTÉTICA</span>
      </div>
      <div className="hero-bottom">
        <span>01 — CUIDADO PERSONALIZADO</span>
        <span>DESLIZE PARA DESCOBRIR ↓</span>
      </div>
    </section>
  );
}
