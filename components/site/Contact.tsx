import { RichText } from "./rich-text";
import {
  addressLine,
  instagramUrl,
  mapsUrl,
  whatsappLink,
  type ContactContent,
} from "@/lib/site-content";

export default function Contact({
  contact,
  text,
}: {
  contact: ContactContent;
  text: string;
}) {
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
          <RichText text={text} />
        </p>
        <div className="contact-actions">
          <a
            className="button button-gold"
            href={whatsappLink(
              contact.whatsappNumber,
              "Olá, Thaise! Vim pelo site e gostaria de agendar uma avaliação.",
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar pelo WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <a
            className="button button-line"
            href={instagramUrl(contact.instagramHandle)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram <span aria-hidden="true">↗</span>
          </a>
        </div>
        <small>
          WhatsApp {contact.whatsappDisplay} · @{contact.instagramHandle}
        </small>
        {addressLine(contact) && (
          <address className="contact-address">
            <strong>{contact.studioName || "Endereço"}</strong>
            <span>
              {addressLine(contact)}
              {contact.postalCode && ` · CEP ${contact.postalCode}`}
            </span>
            <a
              href={mapsUrl(contact)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Como chegar <span aria-hidden="true">↗</span>
            </a>
          </address>
        )}
      </div>
    </section>
  );
}
