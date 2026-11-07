/** Valores fixos usados em formulários e validações. */

export const APPOINTMENT_STATUSES = [
  "Pendente",
  "Confirmado",
  "Finalizado",
  "Cancelado",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const PAYMENT_METHODS = [
  "Pix",
  "Dinheiro",
  "Cartão de débito",
  "Cartão de crédito",
] as const;

export const COURTESY = "Cortesia";

/** Categorias de gasto, para saber para onde vai o dinheiro. */
export const EXPENSE_CATEGORIES = [
  "Aluguel",
  "Materiais e pigmentos",
  "Produtos",
  "Energia",
  "Água",
  "Internet e telefone",
  "Manutenção",
  "Marketing",
  "Impostos e taxas",
  "Outros",
] as const;

export const UNCATEGORIZED = "Sem categoria";

/**
 * Procedimentos criados automaticamente no primeiro acesso, com os mesmos
 * textos do site. Preço e duração ficam "a definir" (preço 0) até a Thaise
 * ajustar em Procedimentos.
 */
export const DEFAULT_SERVICES = [
  {
    name: "Micropigmentação de sobrancelhas",
    description:
      "Definição e harmonia para realçar sua expressão com naturalidade.",
    tag: "Sobrancelhas",
    touchUpDays: 30,
  },
  {
    name: "Micropigmentação labial",
    description: "Mais definição e realce para a beleza natural dos lábios.",
    tag: "Lábios",
    touchUpDays: 30,
  },
  {
    name: "Hidralips",
    description:
      "Cuidado estético para lábios com aparência hidratada e viçosa.",
    tag: "Tratamento",
    touchUpDays: 0,
  },
  {
    name: "Design de sobrancelhas",
    description:
      "Um desenho pensado para valorizar os traços e a individualidade.",
    tag: "Design",
    touchUpDays: 0,
  },
  {
    name: "Cursos de micropigmentação",
    description: "Conhecimento e aperfeiçoamento para profissionais da beleza.",
    tag: "Educação",
    touchUpDays: 0,
  },
  {
    name: "Outros procedimentos estéticos",
    description: "Conheça as possibilidades de cuidado e beleza disponíveis.",
    tag: "Estética",
    touchUpDays: 0,
  },
].map((service, index) => ({
  ...service,
  priceCents: 0,
  durationMin: 60,
  showOnSite: true,
  sortOrder: index + 1,
}));

/** Transições de status permitidas na agenda. */
export function canTransition(from: string, to: AppointmentStatus) {
  if (from === to) return false;
  if (from === "Finalizado" || from === "Cancelado") return false;
  return true;
}
