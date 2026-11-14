"use client";

import { useState } from "react";
import { useApi } from "../../../lib/client/api";
import { useClients, useServices } from "../../../lib/client/resources";
import type { MarketingContact } from "../../../lib/client/types";
import { campaignContactKey, touchUpPhase } from "../../../lib/domain/touch-up";
import type { Dashboard } from "../../../lib/client/types";
import { MONTH_NAMES } from "../../../lib/domain/dates";
import { percentChange } from "../../../lib/domain/finance";
import { formatMoney } from "../../../lib/domain/money";
import { plural } from "../../../lib/domain/text";
import type { SectionProps } from "../admin-app";
import { EntryList, useDeleteEntry } from "../entry-list";
import { ExpenseModal, RecurringRow } from "../expenses";
import { QuickEntry } from "../quick-entry";
import { Button } from "../../ui/button";
import { AsyncContent } from "../../ui/feedback";
import { Panel } from "../../ui/layout";

/** Sem lançar gastos há tantos dias, a tela inicial lembra. */
const EXPENSE_REMINDER_DAYS = 7;

/** "↑ 12%" / "↓ 5%" comparando com o mesmo período do mês anterior. */
function Trend({
  current,
  previous,
  monthName,
}: {
  current: number;
  previous: number;
  monthName: string;
}) {
  const change = percentChange(current, previous);
  if (change === null) return null;
  const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "=";
  return (
    <span
      className={
        change > 0
          ? "trend trend--up"
          : change < 0
            ? "trend trend--down"
            : "trend"
      }
      title={`Comparado com o mesmo período de ${monthName}`}
    >
      {arrow} {Math.abs(change)}%
    </span>
  );
}

export default function DashboardSection({ navigate }: SectionProps) {
  const dashboard = useApi<Dashboard>("/api/dashboard");
  const remove = useDeleteEntry();
  const [expenseOpen, setExpenseOpen] = useState(false);

  return (
    <>
      <AsyncContent {...dashboard} onRetry={dashboard.reload}>
        {(data) => {
          const monthIndex = Number(data.today.slice(5, 7)) - 1;
          const previousMonthName =
            MONTH_NAMES[(monthIndex + 11) % 12].toLowerCase();
          const forgotExpenses =
            data.daysSinceLastExpense === null ||
            data.daysSinceLastExpense >= EXPENSE_REMINDER_DAYS;
          const dueRecurring = data.recurring.filter((item) => item.due);

          return (
            <div className="stack">
              <section className="today-card" aria-label="Resumo de hoje">
                <span className="today-card__label">Hoje</span>
                <strong className="today-card__value">
                  {formatMoney(data.day.income)}
                </strong>
                <span className="today-card__hint">
                  {plural(data.day.services, "atendimento", "atendimentos")}
                </span>
                <dl className="today-card__stats">
                  <div>
                    <dt>Semana</dt>
                    <dd>{formatMoney(data.week.income)}</dd>
                  </div>
                  <div>
                    <dt>{MONTH_NAMES[monthIndex]}</dt>
                    <dd>
                      {formatMoney(data.month.income)}{" "}
                      <Trend
                        current={data.month.income}
                        previous={data.previousMonth.income}
                        monthName={previousMonthName}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt>Saldo do mês</dt>
                    <dd
                      className={
                        data.monthTotals.balance < 0 ? "is-negative" : ""
                      }
                    >
                      {formatMoney(data.monthTotals.balance)}
                    </dd>
                  </div>
                </dl>
              </section>

              {dueRecurring.length > 0 && (
                <ul className="entry-list notice-list">
                  {dueRecurring.map((expense) => (
                    <RecurringRow key={expense.id} expense={expense} />
                  ))}
                </ul>
              )}

              {forgotExpenses && (
                <p className="notice">
                  {data.daysSinceLastExpense === null
                    ? "Nenhum gasto lançado ainda."
                    : `Sem gastos lançados há ${plural(data.daysSinceLastExpense, "dia", "dias")}.`}{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => setExpenseOpen(true)}
                  >
                    Lançar gasto
                  </button>
                </p>
              )}

              {data.pendingOrders > 0 && (
                <p className="notice">
                  {plural(data.pendingOrders, "pedido", "pedidos")} de produtos
                  aguardando.{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("produtos")}
                  >
                    Ver pedidos
                  </button>
                </p>
              )}

              {data.siteRequests > 0 && (
                <p className="notice">
                  <strong>
                    {plural(
                      data.siteRequests,
                      "pedido de horário",
                      "pedidos de horário",
                    )}
                  </strong>{" "}
                  pelo site aguardando confirmação.{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("agenda")}
                  >
                    Ver agenda
                  </button>
                </p>
              )}

              {data.newLeads > 0 && (
                <p className="notice">
                  {plural(
                    data.newLeads,
                    "interessada nova",
                    "interessadas novas",
                  )}{" "}
                  no curso.{" "}
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => navigate("interessadas")}
                  >
                    Ver lista
                  </button>
                </p>
              )}

              <TouchUpNotice />

              <Panel title="Lançar atendimento">
                <QuickEntry
                  extra={
                    <Button
                      variant="secondary"
                      icon="minus"
                      onClick={() => setExpenseOpen(true)}
                    >
                      Gasto
                    </Button>
                  }
                />
              </Panel>

              <Panel title="Lançamentos de hoje">
                <EntryList
                  hideDays
                  transactions={data.todayEntries}
                  empty="Nenhum lançamento hoje."
                  onDelete={remove}
                />
              </Panel>
            </div>
          );
        }}
      </AsyncContent>

      {expenseOpen && <ExpenseModal onClose={() => setExpenseOpen(false)} />}
    </>
  );
}

/**
 * Lembrete de retoque: quantas clientes estão na época do retoque ou da
 * manutenção anual e ainda não receberam a mensagem (mesma regra do Remarketing).
 */
function TouchUpNotice() {
  const clients = useClients();
  const services = useServices();
  const contacts = useApi<{ contacts: MarketingContact[] }>(
    "/api/marketing-contacts",
  );
  if (!clients.data || !services.data || !contacts.data) return null;

  const sent = new Set(
    contacts.data.contacts
      .filter((contact) => contact.sentAt)
      .map((contact) => contact.key),
  );
  const count = { retoque: 0, manutencao: 0 };
  for (const client of clients.data.clients) {
    if (!client.phone) continue;
    const phase = touchUpPhase(client, services.data.services);
    if (phase && !sent.has(campaignContactKey(phase, client))) count[phase]++;
  }
  if (!count.retoque && !count.manutencao) return null;

  const open = (campaign: "retoque" | "manutencao") => {
    window.location.hash = `remarketing/${campaign}`;
    window.scrollTo({ top: 0 });
  };
  return (
    <div className="notice touch-up-notice">
      {count.retoque > 0 && (
        <p>
          <strong>{plural(count.retoque, "cliente", "clientes")}</strong> na
          época do retoque, ainda sem mensagem.{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => open("retoque")}
          >
            Ver lista
          </button>
        </p>
      )}
      {count.manutencao > 0 && (
        <p>
          <strong>{plural(count.manutencao, "cliente", "clientes")}</strong> na
          época da manutenção anual, ainda sem mensagem.{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => open("manutencao")}
          >
            Ver lista
          </button>
        </p>
      )}
    </div>
  );
}
