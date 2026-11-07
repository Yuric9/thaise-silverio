import type { Highlight, TextsContent } from "@/lib/site-content";
import { RichText } from "./rich-text";

export default function About({
  texts,
  highlights,
}: {
  texts: TextsContent;
  highlights: Highlight[];
}) {
  return (
    <section className="intro section" id="sobre">
      <div className="section-label">01 / SOBRE</div>
      <div className="intro-main">
        <p className="eyebrow">UM OLHAR ATENTO A CADA DETALHE</p>
        <h2>
          <RichText text={texts.aboutHeading} />
        </h2>
        <div className="bio">
          {texts.bio.map((paragraph, index) => (
            <p key={index}>
              <RichText text={paragraph} />
            </p>
          ))}
          <p className="bio-signature">{texts.signature}</p>
        </div>
      </div>
      <div className="intro-aside">
        <dl className="highlights">
          {highlights.map((h) => (
            <div key={`${h.value}-${h.label}`}>
              <dt>{h.value}</dt>
              <dd>{h.label}</dd>
            </div>
          ))}
        </dl>
        <a className="text-link" href="#contato">
          Vamos conversar <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
