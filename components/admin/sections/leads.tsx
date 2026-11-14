"use client";

import { useState } from "react";
import { api, useApi } from "../../../lib/client/api";
import { REFRESH } from "../../../lib/client/refresh";
import { useAction } from "../../../lib/client/use-action";
import { formatDate } from "../../../lib/domain/dates";
import { formatPhone, whatsappLink } from "../../../lib/domain/phone";
import { Button } from "../../ui/button";
import { AsyncContent, EmptyState } from "../../ui/feedback";
import { Badge, Metric, MetricGrid, PageHeader, Panel } from "../../ui/layout";

type Lead = {
  id: number;
  name: string;
  phone: string;
  city: string;
  message: string;
  status: "Nova" | "Contatada";
  createdAt: string;
  contactedAt: string;
};

const firstName = (name: string) => name.trim().split(" ")[0];

/**
 * Interessadas no curso: quem deixou nome e WhatsApp na página /curso.
 * A Thaise chama pelo WhatsApp, marca como contatada ou apaga da lista.
 */
export default function LeadsSection() {
  const leads = useApi<{ leads: Lead[] }>("/api/course-leads");
  return (
    <>
      <PageHeader
        eyebrow="Site"
        title="Interessadas no curso"
        description="Quem deixou nome e WhatsApp no formulário “Quero ser avisada” da página do curso."
      />
      <AsyncContent {...leads} onRetry={leads.reload}>
        {({ leads: list }) => {
          const fresh = list.filter((lead) => lead.status === "Nova").length;
          return (
            <div className="stack">
              <MetricGrid>
                <Metric highlight label="Novas" value={fresh} />
                <Metric label="Contatadas" value={list.length - fresh} />
                <Metric label="Total na lista" value={list.length} />
              </MetricGrid>
              <Panel title="Lista">
                {list.length ? (
                  <ul className="card-grid">
                    {list.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} />
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon="users" title="Ninguém na lista ainda">
                    Quando a página do curso estiver publicada, o formulário
                    “Quero ser avisada” aparece nela e as inscrições chegam
                    aqui.
                  </EmptyState>
                )}
              </Panel>
            </div>
          );
        }}
      </AsyncContent>
    </>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const { busy, run } = useAction();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const message = `Olá, ${firstName(lead.name)}! Aqui é a Thaise Silvério. Você se inscreveu na lista do Curso de Micropigmentação de Sobrancelhas pelo site. Tudo bem?`;

  const setStatus = (status: Lead["status"]) =>
    run(
      () =>
        api(`/api/course-leads/${lead.id}`, {
          method: "PATCH",
          body: { status },
        }),
      { refresh: REFRESH.leads },
    );
  const remove = () =>
    run(() => api(`/api/course-leads/${lead.id}`, { method: "DELETE" }), {
      success: "Removida da lista.",
      refresh: REFRESH.leads,
    });

  return (
    <li
      className={`campaign-card ${lead.status === "Contatada" ? "is-sent" : ""}`}
    >
      <div className="lead-card__head">
        <strong>{lead.name}</strong>
        <Badge tone={lead.status === "Nova" ? "gold" : "success"}>
          {lead.status}
        </Badge>
      </div>
      <p className="muted">
        {formatPhone(lead.phone)}
        {lead.city && ` · ${lead.city}`} ·{" "}
        {formatDate(lead.createdAt.slice(0, 10))}
      </p>
      {lead.message && <p className="lead-card__message">“{lead.message}”</p>}
      <div className="gallery-admin__actions">
        <a
          className="button button--primary button--sm"
          href={whatsappLink(lead.phone, message)}
          target="_blank"
          rel="noreferrer"
          onClick={() => lead.status === "Nova" && void setStatus("Contatada")}
        >
          <span>Chamar no WhatsApp</span>
        </a>
        {lead.status === "Contatada" ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => void setStatus("Nova")}
          >
            Voltar para nova
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            icon="check"
            disabled={busy}
            onClick={() => void setStatus("Contatada")}
          >
            Já contatei
          </Button>
        )}
        {confirmDelete ? (
          <Button
            variant="danger"
            size="sm"
            icon="trash"
            loading={busy}
            onClick={() => void remove()}
          >
            Confirmar exclusão
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            icon="trash"
            onClick={() => setConfirmDelete(true)}
          >
            Apagar
          </Button>
        )}
      </div>
    </li>
  );
}
