import type { FaqItem } from "@/lib/site-content";
import { RichText } from "./rich-text";

/**
 * Perguntas frequentes. Usa <details>, que abre e fecha sem JavaScript e
 * funciona com teclado e leitores de tela. Sem perguntas, a seção não aparece.
 */
export default function Faq({
  items,
  id = "duvidas",
}: {
  items: FaqItem[];
  id?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="faq section" id={id}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">TIRE SUAS DÚVIDAS</p>
          <h2>
            Perguntas <em>frequentes</em>
          </h2>
        </div>
      </div>
      <div className="faq-list">
        {items.map((item) => (
          <details key={item.question} className="faq-item">
            <summary>
              <span>{item.question}</span>
              <span className="faq-item__icon" aria-hidden="true" />
            </summary>
            <p>
              <RichText text={item.answer} />
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
