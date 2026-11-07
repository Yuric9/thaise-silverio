export default function Footer() {
  return (
    <footer>
      <a href="#inicio" className="footer-brand">
        THAISE <em>SILVÉRIO</em>
      </a>
      <span>MICROPIGMENTAÇÃO E ESTÉTICA</span>
      <span>
        © {new Date().getFullYear()} Thaise Silvério. Todos os direitos
        reservados.
      </span>
      <a href="#inicio">Voltar ao topo ↑</a>
    </footer>
  );
}
