import { instagramUrl, type ContactContent } from "@/lib/site-content";

export default function Footer({ contact }: { contact: ContactContent }) {
  return (
    <footer>
      <a href="#inicio" className="footer-brand">
        <img
          src="/images/logo-monograma.webp"
          alt="Thaise Silvério — voltar ao início"
          width={140}
          height={144}
          loading="lazy"
        />
      </a>
      <span>MICROPIGMENTAÇÃO E ESTÉTICA</span>
      <span>
        © {new Date().getFullYear()} Thaise Silvério. Todos os direitos
        reservados.
      </span>
      <div className="footer-links">
        <a
          href={instagramUrl(contact.instagramHandle)}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{contact.instagramHandle}
        </a>
        <a href="#inicio">Voltar ao topo ↑</a>
      </div>
    </footer>
  );
}
