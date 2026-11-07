"use client";

import { useState } from "react";
import { api } from "../../../lib/client/api";
import { REFRESH } from "../../../lib/client/refresh";
import { useServices } from "../../../lib/client/resources";
import type { Service } from "../../../lib/client/types";
import { useAction } from "../../../lib/client/use-action";
import { centsToInput, formatMoney } from "../../../lib/domain/money";
import { Button } from "../../ui/button";
import { Alert, AsyncContent, EmptyState } from "../../ui/feedback";
import { CheckboxField, TextAreaField, TextField } from "../../ui/field";
import { Badge, PageHeader } from "../../ui/layout";
import { Modal } from "../../ui/modal";

export default function ServicesSection() {
  const services = useServices();
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const { busy, run } = useAction();

  const toggle = (service: Service) =>
    run(
      () =>
        api(`/api/services/${service.id}`, {
          method: "PATCH",
          body: { active: !service.active },
        }),
      {
        success: service.active
          ? "Procedimento desativado na agenda."
          : "Procedimento ativado na agenda.",
        refresh: REFRESH.services,
      },
    );

  return (
    <>
      <PageHeader
        eyebrow="Cadastros"
        title="Procedimentos"
        description="Preço e duração usados na agenda e no caixa. Descrição e etiqueta aparecem nos cards do site."
        primary={{
          label: "Novo procedimento",
          icon: "plus",
          onClick: () => setEditing("new"),
        }}
      />
      <AsyncContent {...services} onRetry={services.reload}>
        {({ services: rows }) =>
          rows.length ? (
            <div className="stack">
              {rows.some(
                (service) => service.active && service.priceCents === 0,
              ) && (
                <Alert tone="warning">
                  Alguns procedimentos estão com{" "}
                  <strong>preço a definir</strong>. Toque em Editar para
                  informar o preço e a duração reais.
                </Alert>
              )}
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Procedimento</th>
                      <th className="table__number">Preço</th>
                      <th className="table__number">Duração</th>
                      <th>Site</th>
                      <th>Agenda</th>
                      <th>
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((service) => (
                      <tr
                        key={service.id}
                        className={service.active ? "" : "is-muted"}
                      >
                        <td data-label="Procedimento">
                          <strong>{service.name}</strong>
                          {service.touchUpDays > 0 && (
                            <small className="muted">
                              {" "}
                              · retoque em {service.touchUpDays} dias
                            </small>
                          )}
                        </td>
                        <td data-label="Preço" className="table__number">
                          {service.priceCents > 0 ? (
                            formatMoney(service.priceCents)
                          ) : (
                            <Badge tone="warning">A definir</Badge>
                          )}
                        </td>
                        <td data-label="Duração" className="table__number">
                          {service.durationMin} min
                        </td>
                        <td data-label="Site">
                          <Badge
                            tone={service.showOnSite ? "success" : "neutral"}
                          >
                            {service.showOnSite ? "Aparece" : "Oculto"}
                          </Badge>
                        </td>
                        <td data-label="Agenda">
                          <Badge tone={service.active ? "success" : "neutral"}>
                            {service.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </td>
                        <td className="table__actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon="edit"
                            onClick={() => setEditing(service)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => toggle(service)}
                          >
                            {service.active ? "Desativar" : "Ativar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState icon="sparkle" title="Nenhum procedimento cadastrado" />
          )
        }
      </AsyncContent>
      {editing && (
        <ServiceModal
          key={editing === "new" ? "new" : editing.id}
          service={editing === "new" ? null : editing}
          nextOrder={(services.data?.services.length ?? 0) + 1}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ServiceModal({
  service,
  nextOrder,
  onClose,
}: {
  service: Service | null;
  nextOrder: number;
  onClose: () => void;
}) {
  const { busy, run } = useAction();
  const [form, setForm] = useState({
    name: service?.name ?? "",
    price:
      service && service.priceCents > 0 ? centsToInput(service.priceCents) : "",
    durationMin: String(service?.durationMin ?? 60),
    active: service?.active ?? true,
    description: service?.description ?? "",
    tag: service?.tag ?? "",
    showOnSite: service?.showOnSite ?? true,
    sortOrder: String(service?.sortOrder ?? nextOrder),
    touchUpDays: String(service?.touchUpDays ?? 0),
  });

  async function submit() {
    const body = {
      ...form,
      durationMin: Number(form.durationMin),
      sortOrder: Number(form.sortOrder),
      touchUpDays: Number(form.touchUpDays),
    };
    const done = await run(
      () =>
        service
          ? api(`/api/services/${service.id}`, { method: "PATCH", body })
          : api("/api/services", { method: "POST", body }),
      { success: "Procedimento salvo.", refresh: REFRESH.services },
    );
    if (done) onClose();
  }

  return (
    <Modal
      open
      size="lg"
      title={service ? "Editar procedimento" : "Novo procedimento"}
      description={
        service
          ? "Mudar o preço não altera atendimentos já registrados."
          : undefined
      }
      onClose={onClose}
      onSubmit={submit}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={busy}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="form-sections">
        <fieldset className="form-section">
          <legend>Agenda e caixa</legend>
          <div className="form-grid">
            <TextField
              className="form-grid__full"
              label="Nome"
              required
              maxLength={120}
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
            <TextField
              label="Preço (R$)"
              inputMode="decimal"
              required
              placeholder="Ex.: 350,00"
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: event.target.value })
              }
            />
            <TextField
              label="Duração (minutos)"
              type="number"
              min={5}
              step={5}
              required
              value={form.durationMin}
              onChange={(event) =>
                setForm({ ...form, durationMin: event.target.value })
              }
            />
            <TextField
              label="Retoque após (dias)"
              type="number"
              min={0}
              max={730}
              hint="Use 0 se não tem retoque. A cliente entra na lista de retoque do Remarketing."
              value={form.touchUpDays}
              onChange={(event) =>
                setForm({ ...form, touchUpDays: event.target.value })
              }
            />
            <CheckboxField
              className="form-grid__full"
              label="Disponível para agendamento"
              checked={form.active}
              onChange={(event) =>
                setForm({ ...form, active: event.target.checked })
              }
            />
          </div>
        </fieldset>
        <fieldset className="form-section">
          <legend>Card no site</legend>
          <div className="form-grid">
            <TextAreaField
              className="form-grid__full"
              label="Descrição curta"
              maxLength={300}
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
            <TextField
              label="Etiqueta"
              placeholder="Ex.: Sobrancelhas"
              maxLength={30}
              value={form.tag}
              onChange={(event) =>
                setForm({ ...form, tag: event.target.value })
              }
            />
            <TextField
              label="Ordem no site"
              type="number"
              min={0}
              max={999}
              hint="Menor número aparece primeiro."
              value={form.sortOrder}
              onChange={(event) =>
                setForm({ ...form, sortOrder: event.target.value })
              }
            />
            <CheckboxField
              className="form-grid__full"
              label="Mostrar este procedimento no site"
              checked={form.showOnSite}
              onChange={(event) =>
                setForm({ ...form, showOnSite: event.target.checked })
              }
            />
          </div>
        </fieldset>
      </div>
    </Modal>
  );
}
