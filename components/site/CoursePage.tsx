import type { CourseContent, Highlight } from "@/lib/site-content";
import { whatsappLink } from "@/lib/site-content";
import Faq from "./Faq";
import { RichText } from "./rich-text";

type Props = {
  course: CourseContent;
  whatsappNumber: string;
  bio: string[];
  highlights: Highlight[];
};

/**
 * Página de vendas do curso. Cada seção só aparece quando foi preenchida no
 * painel (Curso), para nunca mostrar informação inventada ou vazia.
 */
export default function CoursePage({
  course,
  whatsappNumber,
  bio,
  highlights,
}: Props) {
  const enrollUrl = whatsappLink(whatsappNumber, course.ctaMessage);
  const enroll = (label: string, variant = "button-gold") => (
    <a
      className={`button ${variant}`}
      href={enrollUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label} <span aria-hidden="true">↗</span>
    </a>
  );

  return (
    <>
      <section className="hero course-hero" id="inicio">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">
            <i /> CURSO COM THAISE SILVÉRIO
          </p>
          <h1>
            <RichText text={course.title} />
          </h1>
          <p className="hero-text">
            <RichText text={course.subtitle} />
          </p>
          <div className="hero-actions">
            {enroll("Quero me inscrever")}
            {course.modules.length > 0 && (
              <a className="text-link" href="#conteudo">
                Ver o conteúdo <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
        <div className="hero-art">
          <div className="art-frame">
            <img
              className="art-photo"
              src="/images/thaise-silverio.webp"
              alt="Thaise Silvério, instrutora do curso"
              width={900}
              height={1200}
              fetchPriority="high"
            />
            <div className="art-caption">FORMAÇÃO COM QUEM FAZ</div>
          </div>
        </div>
      </section>

      {course.audience.length > 0 && (
        <section className="section course-section" id="para-quem">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PARA QUEM É</p>
              <h2>
                Este curso é <em>para você</em>
              </h2>
            </div>
          </div>
          <ul className="course-checklist">
            {course.audience.map((item) => (
              <li key={item}>
                <span aria-hidden="true">✓</span>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {course.modules.length > 0 && (
        <section className="services section" id="conteudo">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CONTEÚDO</p>
              <h2>
                O que você vai <em>aprender</em>
              </h2>
            </div>
          </div>
          <div className="service-grid">
            {course.modules.map((module, index) => (
              <article
                className="service-card"
                key={`${module.title}-${index}`}
              >
                <div className="service-top">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{module.title}</h3>
                {module.text && (
                  <p>
                    <RichText text={module.text} />
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {(course.details.length > 0 || course.includes.length > 0) && (
        <section
          className="section course-section course-how"
          id="como-funciona"
        >
          {course.details.length > 0 && (
            <div>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">COMO FUNCIONA</p>
                  <h2>
                    Detalhes do <em>curso</em>
                  </h2>
                </div>
              </div>
              <dl className="course-details">
                {course.details.map((item, index) => (
                  <div key={`${item.title}-${index}`}>
                    <dt>{item.title}</dt>
                    <dd>
                      <RichText text={item.text} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {course.includes.length > 0 && (
            <div>
              <div className="section-heading">
                <div>
                  <p className="eyebrow">INCLUSO</p>
                  <h2>
                    O que você <em>recebe</em>
                  </h2>
                </div>
              </div>
              <ul className="course-checklist">
                {course.includes.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">✓</span>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="intro section course-instructor" id="instrutora">
        <div className="section-label">INSTRUTORA</div>
        <div className="intro-main">
          <p className="eyebrow">QUEM VAI TE ENSINAR</p>
          <h2>
            Thaise <em>Silvério</em>
          </h2>
          <div className="bio">
            {bio.map((paragraph, index) => (
              <p key={index}>
                <RichText text={paragraph} />
              </p>
            ))}
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
        </div>
      </section>

      <section className="statement course-offer" id="inscricao">
        <div className="statement-inner">
          <p className="eyebrow">INSCRIÇÕES</p>
          <h2>
            Garanta a sua <em>vaga.</em>
          </h2>
          {course.price && (
            <p className="course-price">
              <strong>{course.price}</strong>
              {course.priceNote && <span>{course.priceNote}</span>}
            </p>
          )}
          <p>
            Fale com a Thaise pelo WhatsApp para tirar dúvidas e reservar a sua
            vaga.
          </p>
          {enroll("Quero me inscrever")}
        </div>
        <div className="statement-mark" aria-hidden="true">
          TS
        </div>
      </section>

      <Faq items={course.faq} id="duvidas-curso" />
    </>
  );
}
