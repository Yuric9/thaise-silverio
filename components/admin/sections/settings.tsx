"use client";

import { useState, type FormEvent } from "react";
import { api, useApi } from "../../../lib/client/api";
import { REFRESH } from "../../../lib/client/refresh";
import { useAction } from "../../../lib/client/use-action";
import { WEEKDAY_NAMES, type OpeningHours } from "../../../lib/domain/schedule";
import { Button } from "../../ui/button";
import { Alert, AsyncContent } from "../../ui/feedback";
import { CheckboxField, TextField } from "../../ui/field";
import { PageHeader, Panel } from "../../ui/layout";

/** Configurações: por enquanto, o horário de atendimento usado na agenda. */
export default function SettingsSection() {
  const settings = useApi<{ openingHours: OpeningHours }>("/api/settings");
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
