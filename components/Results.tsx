import { results } from "@/lib/site";

export default function Results() {
  return (
    <section className="results section" id="resultados">
      <div className="section-heading">
        <div>
          <p className="eyebrow">RESULTADOS REAIS</p>
          <h2>
            Antes <em>&</em> depois
          </h2>
        </div>
        <p>
          Alguns dos trabalhos realizados, com resultados que respeitam a beleza
          natural de cada cliente.
        </p>
      </div>
      <div className="results-grid">
        {results.map((r) => (
          <figure className="result-card" key={r.src}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.src}
              alt={r.alt}
              width={r.width}
              height={r.height}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>{r.title}</span>
              <span className="result-tag">{r.tag}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
