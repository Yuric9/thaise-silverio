"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { counterText, parseCounter } from "@/lib/domain/counter";

/**
 * Efeitos visuais do site (todos suaves):
 * 1. seções e cards surgem ao rolar a página;
 * 2. números dos destaques contam até o valor salvo no painel ("+500", "6 anos");
 * 3. a linha dourada ao lado dos títulos pequenos se desenha;
 * 5. fotos da galeria abrem ampliadas ao clicar.
 * Zoom nas fotos, cards que sobem e brilho dos botões ficam só no CSS (site.css).
 *
 * Quem pediu ao celular para "reduzir movimento" vê tudo parado, sem animação.
 * Sem JavaScript o site aparece normalmente (nada começa escondido no HTML).
 */
const REVEAL =
  ".section-heading, .service-card, .result-card, .intro-main, .intro-aside, .statement-inner, .contact-side, .contact-actions, .course-checklist, .course-details, .highlights > div, .faq-item";

function countUp(dt: HTMLElement, delay: number) {
  const final = dt.textContent ?? "";
  const counter = parseCounter(final);
  if (!counter || counter.end < 2) return;
  // Leitores de tela leem só o valor final; a contagem é só visual.
  const hidden = document.createElement("span");
  hidden.className = "sr-only";
  hidden.textContent = final;
  const shown = document.createElement("span");
  shown.setAttribute("aria-hidden", "true");
  shown.textContent = counterText(counter, 0);
  dt.replaceChildren(hidden, shown);
  window.setTimeout(() => {
    let start: number | null = null;
    const step = (time: number) => {
      start ??= time;
      const progress = Math.min((time - start) / 3000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      shown.textContent = counterText(counter, Math.round(counter.end * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, delay);
}

export default function Effects() {
  const [photo, setPhoto] = useState<{ src: string; alt: string } | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  // 1, 2 e 3: surgir ao rolar, contagem e linha dourada.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-visible");
          const delay = (parseFloat(el.style.transitionDelay) || 0) * 1000;
          if (el.parentElement?.classList.contains("highlights"))
            el.querySelectorAll("dt").forEach((dt) => countUp(dt, delay + 700));
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );

    // Só anima o que ainda está abaixo da tela: o topo aparece na hora.
    const below = (el: Element) =>
      el.getBoundingClientRect().top > window.innerHeight * 0.9;
    document.querySelectorAll<HTMLElement>(REVEAL).forEach((el) => {
      if (!below(el)) return;
      const position = Array.from(el.parentElement?.children ?? []).indexOf(el);
      el.style.transitionDelay = `${Math.min(Math.max(position, 0), 5) * 0.12}s`;
      el.classList.add("fx-reveal");
      observer.observe(el);
    });
    document.querySelectorAll<HTMLElement>(".eyebrow").forEach((el) => {
      if (!below(el)) return;
      el.classList.add("fx-line");
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // 5: fotos da galeria abrem ampliadas (mouse, toque ou teclado).
  useEffect(() => {
    const images =
      document.querySelectorAll<HTMLImageElement>(".result-card img");
    const open = (img: HTMLImageElement) => {
      opener.current = img;
      setPhoto({ src: img.currentSrc || img.src, alt: img.alt });
    };
    const cleanups = Array.from(images).map((img) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Ampliar foto: ${img.alt}`);
      const onClick = () => open(img);
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open(img);
        }
      };
      img.addEventListener("click", onClick);
      img.addEventListener("keydown", onKey);
      return () => {
        img.removeEventListener("click", onClick);
        img.removeEventListener("keydown", onKey);
      };
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  const close = useCallback(() => {
    setPhoto(null);
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!photo) return;
    closeButton.current?.focus();
    // Enquanto a foto está aberta, a página de trás não rola
    // e o Tab não sai da foto (o único botão é o Fechar).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        event.preventDefault();
        closeButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [photo, close]);

  if (!photo) return null;
  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      onClick={close}
    >
      <img src={photo.src} alt={photo.alt} />
      <button
        ref={closeButton}
        type="button"
        className="lightbox-close"
        onClick={close}
      >
        <span aria-hidden="true">×</span>
        <span className="sr-only">Fechar foto</span>
      </button>
    </div>
  );
}
