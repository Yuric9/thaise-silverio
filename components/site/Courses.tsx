import { RichText } from "./rich-text";
import { whatsappLink } from "@/lib/site-content";

export default function Courses({
  text,
  whatsappNumber,
}: {
  text: string;
  whatsappNumber: string;
}) {
  return (
    <section className="statement" id="cursos">
      <div className="statement-inner">
        <p className="eyebrow">CONHECIMENTO QUE TRANSFORMA</p>
        <h2>
          Seu próximo passo na
          <br />
          <em>área da beleza começa aqui.</em>
        </h2>
        <p>
          <RichText text={text} />
        </p>
        <a
          className="button button-outline"
          href={whatsappLink(
            whatsappNumber,
            "Olá, Thaise! Vim pelo site e quero saber mais sobre os cursos de micropigmentação.",
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          Conheça os cursos <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="statement-mark" aria-hidden="true">
        TS
      </div>
    </section>
  );
}
