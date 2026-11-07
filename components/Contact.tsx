import { WHATSAPP_URL } from "@/lib/site";

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
        <a
          className="button button-gold"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Falar pelo WhatsApp <span>↗</span>
        </a>
        <small>(62) 8123-1427</small>
      </div>
    </section>
  );
}
