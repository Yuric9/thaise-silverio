import { services, whatsappLink } from "@/lib/site";

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
            <div className="service-symbol" aria-hidden="true">
              ✳
            </div>
            <h3>{s.title}</h3>
            <p>{s.desc}</p>
            <a
              href={whatsappLink(
                `Olá, Thaise! Vim pelo site e quero saber mais sobre ${s.title}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Saiba mais<span className="sr-only"> sobre {s.title}</span>{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
