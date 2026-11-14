"use client";

import { useState, type FormEvent } from "react";

/**
 * "Quero ser avisada": a interessada deixa nome e WhatsApp e entra na lista
 * do painel (Curso → Interessadas). O campo `website` é escondido de pessoas
 * e serve de armadilha para robôs.
 */
export default function CourseLeadForm() {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/course-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          city: form.get("city"),
          message: form.get("message"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
        }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error || "Não foi possível enviar agora.");
      }
      setState("done");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível enviar agora.",
      );
      setState("idle");
    }
  }

  if (state === "done")
    return (
      <p className="site-form__done" role="status">
        Pronto! Você está na lista. A Thaise vai te chamar no WhatsApp quando
        abrir a próxima turma. 💕
      </p>
    );

  return (
    <form className="site-form" onSubmit={submit} noValidate={false}>
      <div className="site-form__grid">
        <label className="site-form__field">
          <span>Seu nome</span>
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </label>
        <label className="site-form__field">
          <span>WhatsApp com DDD</span>
          <input
            name="phone"
            required
            inputMode="tel"
            autoComplete="tel"
            placeholder="(62) 90000-0000"
            maxLength={30}
          />
        </label>
        <label className="site-form__field">
          <span>Cidade (opcional)</span>
          <input name="city" maxLength={60} autoComplete="address-level2" />
        </label>
        <label className="site-form__field site-form__full">
          <span>Quer contar algo? (opcional)</span>
          <textarea
            name="message"
            rows={3}
            maxLength={300}
            placeholder="Ex.: já atuo na área / estou começando"
          />
        </label>
      </div>
      {/* Armadilha para robôs: escondida de quem usa o site. */}
      <div className="site-form__trap" aria-hidden="true">
        <label>
          Não preencha
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="site-form__consent">
        <input type="checkbox" name="consent" required />
        <span>
          Autorizo a Thaise Silvério a entrar em contato comigo pelo WhatsApp
          sobre o curso. Posso pedir para sair da lista quando quiser.
        </span>
      </label>
      {error && (
        <p className="site-form__error" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="button button-gold"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Enviando..." : "Quero ser avisada"}{" "}
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
