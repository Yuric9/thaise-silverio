"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { addDays, formatLongDate, todayKey } from "@/lib/domain/dates";
import { formatMoney } from "@/lib/domain/money";
import { whatsappLink } from "@/lib/site-content";

type BookableService = {
  id: number;
  name: string;
  durationMin: number;
  priceCents: number;
  description: string;
};

type Done = { date: string; time: string; service: string; name: string };

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) throw new Error(data.error || "Não foi possível carregar.");
  return data;
}

/**
 * Agendamento pelo site, em passos: procedimento → dia → horário → dados.
 * O pedido entra na agenda como "Pendente" e a Thaise confirma pelo WhatsApp.
 */
export default function BookingForm({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const [services, setServices] = useState<BookableService[] | null>(null);
  const [maxDays, setMaxDays] = useState(60);
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [times, setTimes] = useState<string[] | null>(null);
  const [time, setTime] = useState("");
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const today = todayKey();

  useEffect(() => {
    fetch("/api/booking")
      .then((response) =>
        readJson<{ services: BookableService[]; maxDaysAhead: number }>(
          response,
        ),
      )
      .then((data) => {
        setServices(data.services);
        setMaxDays(data.maxDaysAhead);
      })
      .catch((failure: Error) => setError(failure.message));
  }, []);

  // Busca os horários livres quando a cliente escolhe o procedimento ou o dia.
  // A última escolha vence: respostas antigas que chegam depois são ignoradas.
  const request = useRef(0);
  async function loadTimes(nextService: number | null, nextDate: string) {
    setTime("");
    setTimes(null);
    setError("");
    if (!nextService || !nextDate) return;
    const id = ++request.current;
    setLoadingTimes(true);
    try {
      const data = await readJson<{ times: string[] }>(
        await fetch(
          `/api/booking/availability?serviceId=${nextService}&date=${nextDate}`,
        ),
      );
      if (id === request.current) setTimes(data.times);
    } catch (failure) {
      if (id === request.current)
        setError(
          failure instanceof Error
            ? failure.message
            : "Não foi possível carregar.",
        );
    } finally {
      if (id === request.current) setLoadingTimes(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    setError("");
    try {
      const data = await readJson<Omit<Done, "name">>(
        await fetch("/api/booking", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            serviceId,
            date,
            time,
            name: form.get("name"),
            phone: form.get("phone"),
            note: form.get("note"),
            consent: form.get("consent") === "on",
            website: form.get("website"),
          }),
        }),
      );
      setDone({ ...data, name: String(form.get("name") ?? "") });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Não foi possível enviar agora.",
      );
      // O horário pode ter sido ocupado: atualiza a lista.
      if (serviceId && date) {
        const fresh = await fetch(
          `/api/booking/availability?serviceId=${serviceId}&date=${date}`,
        )
          .then((response) => readJson<{ times: string[] }>(response))
          .catch(() => null);
        if (fresh) setTimes(fresh.times);
      }
    } finally {
      setSending(false);
    }
  }

  if (done) {
    const when = `${formatLongDate(done.date)}, às ${done.time}`;
    const message = `Olá, Thaise! Sou ${done.name} e acabei de pedir um horário pelo site: ${done.service}, ${when}.`;
    return (
      <div className="site-form__done booking-done" role="status">
        <p>
          <strong>Pedido enviado!</strong> {done.service} · {when}.
        </p>
        <p>
          O horário fica reservado para você e a Thaise confirma pelo WhatsApp.
          Se quiser agilizar, avise que já fez o pedido:
        </p>
        <a
          className="button button-gold"
          href={whatsappLink(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Avisar a Thaise no WhatsApp <span aria-hidden="true">↗</span>
        </a>
      </div>
    );
  }

  const service = services?.find((item) => item.id === serviceId);

  return (
    <form className="site-form booking-form" onSubmit={submit}>
      <fieldset className="booking-step">
        <legend>1. Escolha o procedimento</legend>
        {!services ? (
          <p className="booking-hint">{error || "Carregando..."}</p>
        ) : services.length === 0 ? (
          <p className="booking-hint">
            Nenhum procedimento disponível para agendar pelo site no momento.
          </p>
        ) : (
          <div className="booking-options">
            {services.map((item) => (
              <label
                key={item.id}
                className={`booking-option ${serviceId === item.id ? "is-selected" : ""}`}
              >
                <input
                  type="radio"
                  name="service"
                  value={item.id}
                  checked={serviceId === item.id}
                  onChange={() => {
                    setServiceId(item.id);
                    void loadTimes(item.id, date);
                  }}
                />
                <span className="booking-option__name">{item.name}</span>
                <span className="booking-option__meta">
                  {item.durationMin} min
                  {item.priceCents > 0 && ` · ${formatMoney(item.priceCents)}`}
                </span>
              </label>
            ))}
          </div>
        )}
      </fieldset>

      {service && (
        <fieldset className="booking-step">
          <legend>2. Escolha o dia</legend>
          <label className="site-form__field booking-date">
            <span>Data</span>
            <input
              type="date"
              required
              min={today}
              max={addDays(today, maxDays)}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                void loadTimes(serviceId, event.target.value);
              }}
            />
          </label>
          {date && <p className="booking-hint">{formatLongDate(date)}</p>}
        </fieldset>
      )}

      {service && date && (
        <fieldset className="booking-step">
          <legend>3. Escolha o horário</legend>
          {loadingTimes || !times ? (
            <p className="booking-hint">Buscando horários livres...</p>
          ) : times.length === 0 ? (
            <p className="booking-hint">
              Sem horários livres neste dia. Escolha outra data.
            </p>
          ) : (
            <div className="booking-times">
              {times.map((item) => (
                <label
                  key={item}
                  className={`booking-time ${time === item ? "is-selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="time"
                    value={item}
                    checked={time === item}
                    onChange={() => setTime(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          )}
        </fieldset>
      )}

      {service && date && time && (
        <fieldset className="booking-step">
          <legend>4. Seus dados</legend>
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
            <label className="site-form__field site-form__full">
              <span>Observação (opcional)</span>
              <textarea
                name="note"
                rows={2}
                maxLength={240}
                placeholder="Ex.: é a minha primeira vez / tenho uma micropigmentação antiga"
              />
            </label>
          </div>
          <div className="site-form__trap" aria-hidden="true">
            <label>
              Não preencha
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="site-form__consent">
            <input type="checkbox" name="consent" required />
            <span>
              Autorizo a Thaise Silvério a guardar meu nome e WhatsApp para
              cuidar do meu agendamento e entrar em contato comigo.
            </span>
          </label>
        </fieldset>
      )}

      {error && services && (
        <p className="site-form__error" role="alert">
          {error}
        </p>
      )}

      {service && date && time && (
        <button type="submit" className="button button-gold" disabled={sending}>
          {sending ? "Enviando..." : "Pedir este horário"}{" "}
          <span aria-hidden="true">→</span>
        </button>
      )}
    </form>
  );
}
