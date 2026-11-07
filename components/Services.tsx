import { services } from "@/lib/site";

export default function Services() {
  return (
    <section className="services section" id="procedimentos">
      <div className="section-heading">
        <div>
          <p className="eyebrow">CUIDADO EM CADA DETALHE</p>
          <h2>
            Nossos <em>procedimentos</em>
          </h2>
        </div>
        <p>
          Conheça os serviços e encontre o cuidado ideal para valorizar sua
          beleza.
        </p>
      </div>
      <div className="service-grid">
        {services.map((s) => (
          <article className="service-card" key={s.n}>
            <div className="service-top">
              <span>{s.n}</span>
              <span className="service-tag">{s.tag}</span>
            </div>
            <div className="service-symbol">✳</div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <a href="#contato">
              Saiba mais <span>↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
