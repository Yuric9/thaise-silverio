import { RichText } from "./rich-text";
import { imageUrl } from "@/lib/image-url";
import type { GalleryItem } from "@/lib/site-content";

export default function Results({
  gallery,
  intro,
}: {
  gallery: GalleryItem[];
  intro: string;
}) {
  if (!gallery.length) return null;
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
          <RichText text={intro} />
        </p>
      </div>
      <div className="results-grid">
        {gallery.map((r) => (
          <figure className="result-card" key={r.id}>
            <img
              src={imageUrl(r.imageKey)}
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
