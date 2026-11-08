"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#sobre", label: "Sobre" },
  { href: "#procedimentos", label: "Procedimentos" },
  { href: "#resultados", label: "Resultados" },
  { href: "#cursos", label: "Cursos" },
  { href: "#contato", label: "Contato" },
];

/**
 * Cabeçalho do site. No computador o menu fica sempre à mostra; no celular
 * (até 900px) ele se recolhe no botão "Menu" (hambúrguer).
 */
export default function Header({
  showFaq = false,
  base = "",
  course = "section",
}: {
  showFaq?: boolean;
  /** "/" em páginas que não são a inicial: os links viram "/#sobre" etc. */
  base?: string;
  /**
   * O que o item "Cursos" do menu faz:
   * - "section": rola até a parte Cursos da página inicial (curso não publicado);
   * - "new-tab": abre a página do curso (/curso) em uma nova aba;
   * - "current": já estamos na página do curso, volta ao topo dela.
   */
  course?: "section" | "new-tab" | "current";
}) {
  const [open, setOpen] = useState(false);
  // "Dúvidas" só entra no menu quando há perguntas frequentes no site.
  const links = showFaq
    ? [...LINKS.slice(0, 5), { href: "#duvidas", label: "Dúvidas" }, LINKS[5]]
    : LINKS;

  // Fecha o menu com a tecla Esc.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className="topline">
        <span>BELEZA • PRECISÃO • NATURALIDADE</span>
        <span>ATENDIMENTO COM HORA MARCADA</span>
      </div>
      <header className={`header ${open ? "is-open" : ""}`.trim()}>
        <a
          href={`${base}#inicio`}
          className="brand"
          onClick={() => setOpen(false)}
        >
          <img
            src="/images/logo-monograma.webp"
            alt="Thaise Silvério — Micropigmentação e Estética"
            width={140}
            height={144}
          />
        </a>
        <nav id="menu-principal" aria-label="Menu principal">
          {links.map((link) => {
            if (link.href === "#cursos" && course === "new-tab") {
              return (
                <a
                  key={link.href}
                  href="/curso"
                  target="_blank"
                  rel="noopener"
                  aria-label="Cursos (abre em uma nova aba)"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              );
            }
            if (link.href === "#cursos" && course === "current") {
              return (
                <a
                  key={link.href}
                  href="#inicio"
                  aria-current="page"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <a
                key={link.href}
                href={`${base}${link.href}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            );
          })}
        </nav>
        <a
          className="header-cta"
          href={`${base}#contato`}
          onClick={() => setOpen(false)}
        >
          Agendar avaliação <span aria-hidden="true">↗</span>
        </a>
        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="menu-principal"
          onClick={() => setOpen(!open)}
        >
          <span className="menu-toggle__icon" aria-hidden="true" />
          <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        </button>
      </header>
    </>
  );
}
