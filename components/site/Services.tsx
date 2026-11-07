import { RichText } from "./rich-text";
import { whatsappLink, type SiteService } from "@/lib/site-content";

type Props = { services: SiteService[]; intro: string; whatsappNumber: string };

export default function Services({ services, intro, whatsappNumber }: Props) {
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
          <RichText text={intro} />
        </p>
      </div>
      <div className="service-grid">
        {services.map((s, index) => (
          <article className="service-card" key={s.id}>
            <div className="service-top">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="service-tag">{s.tag}</span>
            </div>
            <div className="service-symbol" aria-hidden="true">
              ✳
            </div>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <a
              href={whatsappLink(
                whatsappNumber,
                `Olá, Thaise! Vim pelo site e quero saber mais sobre ${s.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Saiba mais<span className="sr-only"> sobre {s.name}</span>{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
