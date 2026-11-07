import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/site";

export default function Contact() {
  return (
    <section className="contact section" id="contato">
      <div>
        <p className="eyebrow">VAMOS COMEÇAR?</p>
        <h2>
          Um cuidado especial
          <br />
          começa com uma <em>conversa.</em>
        </h2>
      </div>
      <div className="contact-side">
        <p>
          Entre em contato para tirar dúvidas, conhecer os procedimentos e
          consultar horários disponíveis.
        </p>
        <div className="contact-actions">
          <a
            className="button button-gold"
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar pelo WhatsApp <span>↗</span>
          </a>
          <a
            className="button button-line"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram <span>↗</span>
          </a>
        </div>
        <small>WhatsApp (62) 8123-1427 · @{INSTAGRAM_HANDLE}</small>
      </div>
    </section>
  );
}
