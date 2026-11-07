import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

export default function Footer() {
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
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          @{INSTAGRAM_HANDLE}
        </a>
        <a href="#inicio">Voltar ao topo ↑</a>
      </div>
    </footer>
  );
}
