"use client";

import { useState, type FormEvent } from "react";
import { api, useApi } from "../../../lib/client/api";
import { REFRESH } from "../../../lib/client/refresh";
import { useAction } from "../../../lib/client/use-action";
import { WEEKDAY_NAMES, type OpeningHours } from "../../../lib/domain/schedule";
import type { BookingSettings, SiteContent } from "../../../lib/site-content";
import { Button } from "../../ui/button";
import { Alert, AsyncContent } from "../../ui/feedback";
import { CheckboxField, SelectField, TextField } from "../../ui/field";
import { PageHeader, Panel } from "../../ui/layout";

/** Configurações: horário de atendimento e agendamento pelo site. */
export default function SettingsSection() {
  const settings = useApi<{ openingHours: OpeningHours }>("/api/settings");
  const site = useApi<{ content: SiteContent }>("/api/site");
  return (
    <>
      <PageHeader
        eyebrow="Configurações"
        title="Horário de atendimento"
        description="A agenda só oferece horários dentro destes intervalos, de 30 em 30 minutos."
      />
      <AsyncContent {...settings} onRetry={settings.reload}>
        {({ openingHours }) => (
          <HoursForm
            key={JSON.stringify(openingHours)}
            initial={openingHours}
          />
        )}
      </AsyncContent>
      <AsyncContent {...site} onRetry={site.reload}>
        {({ content }) => (
          <BookingForm
            key={JSON.stringify(content.booking)}
            initial={content.booking}
          />
        )}
      </AsyncContent>
    </>
  );
}

function HoursForm({ initial }: { initial: OpeningHours }) {
  const { busy, run } = useAction();
  const [hours, setHours] = useState(initial);
  const update = (day: number, change: Partial<OpeningHours[number]>) =>
    setHours(
      hours.map((item, index) =>
        index === day ? { ...item, ...change } : item,
      ),
    );

  function submit(event: FormEvent) {
    event.preventDefault();
    run(
      () =>
        api("/api/settings", { method: "PUT", body: { openingHours: hours } }),
      {
        success: "Horário salvo. A agenda já usa os novos horários.",
        refresh: REFRESH.settings,
      },
    );
  }

  // Segunda a domingo, na ordem em que as pessoas leem a semana.
  const order = [1, 2, 3, 4, 5, 6, 0];

  return (
    <form onSubmit={submit} className="stack">
      <Alert tone="warning">
        Confira os horários: eles vieram com um padrão (segunda a sábado, 9h às
        18h). Agendamentos já marcados não mudam.
      </Alert>
      <Panel title="Dias e horários">
        <ul className="hours-list">
          {order.map((day) => (
            <li key={day} className={hours[day].open ? "" : "is-muted"}>
              <CheckboxField
                label={WEEKDAY_NAMES[day]}
                checked={hours[day].open}
                onChange={(event) =>
                  update(day, { open: event.target.checked })
                }
              />
              {hours[day].open ? (
                <div className="hours-list__times">
                  <TextField
                    label="Abre"
                    type="time"
                    step={1800}
                    value={hours[day].start}
                    onChange={(event) =>
                      update(day, { start: event.target.value })
                    }
                  />
                  <TextField
                    label="Fecha"
                    type="time"
                    step={1800}
                    value={hours[day].end}
                    onChange={(event) =>
                      update(day, { end: event.target.value })
                    }
                  />
                </div>
              ) : (
                <span className="muted">Fechado</span>
              )}
            </li>
          ))}
        </ul>
        <div className="form-actions">
          <Button type="submit" icon="check" loading={busy}>
            Salvar horário
          </Button>
        </div>
      </Panel>
    </form>
  );
}

/**
 * Agendamento pelo site (/agendar). Ligado, o botão "Agendar avaliação" do
 * site abre a página e os pedidos chegam na Agenda como "Pendente".
 */
function BookingForm({ initial }: { initial: BookingSettings }) {
  const { busy, run } = useAction();
  const [booking, setBooking] = useState(initial);

  function submit(event: FormEvent) {
    event.preventDefault();
    run(
      () =>
        api("/api/site", {
          method: "PUT",
          body: { key: "booking", value: booking },
        }),
      {
        success: booking.enabled
          ? "Salvo! O agendamento pelo site está ligado."
          : "Salvo. O agendamento pelo site está desligado.",
        refresh: REFRESH.site,
      },
    );
  }

  return (
    <form onSubmit={submit} className="stack booking-settings">
      <Panel title="Agendamento pelo site" eyebrow="Página /agendar">
        <div className="stack">
          <Alert tone="info">
            Antes de ligar, confira o horário de atendimento acima e a duração
            de cada procedimento (Cadastros → Procedimentos). O site só oferece
            horários livres, dentro desse horário. Em cada procedimento dá para
            escolher se ele aceita agendamento pelo site.
          </Alert>
          <CheckboxField
            label="Aceitar pedidos de horário pelo site"
            checked={booking.enabled}
            onChange={(event) =>
              setBooking({ ...booking, enabled: event.target.checked })
            }
          />
          <SelectField
            label="A cliente pode pedir horário para até"
            value={booking.maxDaysAhead}
            onChange={(event) =>
              setBooking({
                ...booking,
                maxDaysAhead: Number(event.target.value),
              })
            }
          >
            {[15, 30, 60, 90].map((days) => (
              <option key={days} value={days}>
                {days} dias à frente
              </option>
            ))}
          </SelectField>
          <p className="muted">
            O pedido entra na Agenda como <strong>Pendente</strong>, com a
            etiqueta “Pelo site”, e o horário fica reservado. Confirme ou
            cancele por lá (cancelar libera o horário).
          </p>
          {initial.enabled && (
            <a
              className="button button--secondary button--sm"
              href="/agendar"
              target="_blank"
              rel="noreferrer"
            >
              <span>Ver a página de agendamento</span>
            </a>
          )}
        </div>
      </Panel>
      <div className="form-actions">
        <Button type="submit" icon="check" loading={busy}>
          Salvar agendamento pelo site
        </Button>
      </div>
    </form>
  );
}
