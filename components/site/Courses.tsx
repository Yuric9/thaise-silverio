import { RichText } from "./rich-text";
import { whatsappLink } from "@/lib/site-content";

export default function Courses({
  text,
  whatsappNumber,
  coursePublished = false,
}: {
  text: string;
  whatsappNumber: string;
  /** Com a página do curso publicada, o botão leva para /curso. */
  coursePublished?: boolean;
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
        {coursePublished ? (
          <a
            className="button button-outline"
            href="/curso"
            target="_blank"
            rel="noopener"
            aria-label="Conheça o curso (abre em uma nova aba)"
          >
            Conheça o curso <span aria-hidden="true">↗</span>
          </a>
        ) : (
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
        )}
      </div>
      <div className="statement-mark" aria-hidden="true">
        TS
      </div>
    </section>
  );
}
