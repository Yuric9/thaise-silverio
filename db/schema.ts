/**
 * Estrutura do banco de dados (Cloudflare D1 / SQLite) usada pelo Drizzle ORM.
 *
 * Convenções:
 * - valores em dinheiro ficam em centavos (`*_cents`);
 * - datas do negócio são texto "AAAA-MM-DD" e horários "HH:MM" (fuso de São Paulo);
 * - carimbos de data/hora técnicos (`created_at`) são ISO 8601 em UTC;
 * - clientes são identificadas pelo e-mail. Quem é cadastrada só com telefone
 *   recebe um e-mail técnico `cliente-<telefone>@cadastro.local`.
 *
 * Alterações aqui exigem uma nova migração em `drizzle/` (`npm run db:generate`).
 */
import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ─── Acesso ──────────────────────────────────────────────────────────────────

export const accounts = sqliteTable("accounts", {
  email: text("email").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("client"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const authSessions = sqliteTable("auth_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  accountEmail: text("account_email").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const authAttempts = sqliteTable("auth_attempts", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: text("window_start").notNull(),
  blockedUntil: text("blocked_until").notNull().default(""),
});

// ─── Clientes ────────────────────────────────────────────────────────────────

export const profiles = sqliteTable("profiles", {
  email: text("email").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  birthDate: text("birth_date").notNull().default(""),
  /** Correção manual somada à contagem automática do cartão fidelidade. */
  loyaltyAdjustment: integer("loyalty_adjustment").notNull().default(0),
  loyaltyRewardsRedeemed: integer("loyalty_rewards_redeemed")
    .notNull()
    .default(0),
  loyaltyAdjustmentNote: text("loyalty_adjustment_note").notNull().default(""),
  loyaltyUpdatedAt: text("loyalty_updated_at").notNull().default(""),
  loyaltyUpdatedBy: text("loyalty_updated_by").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const marketingContacts = sqliteTable("marketing_contacts", {
  key: text("key").primaryKey(),
  clientEmail: text("client_email").notNull(),
  campaign: text("campaign").notNull(),
  sentAt: text("sent_at").notNull().default(""),
  answered: integer("answered", { mode: "boolean" }).notNull().default(false),
  returned: integer("returned", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull(),
});

// ─── Catálogo ────────────────────────────────────────────────────────────────

/**
 * Procedimentos: usados na agenda (preço e duração) e no site
 * (descrição, etiqueta e se aparecem na página).
 */
export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  priceCents: integer("price_cents").notNull(),
  durationMin: integer("duration_min").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  /** Texto curto exibido no card do site. */
  description: text("description").notNull().default(""),
  /** Etiqueta do card do site (ex.: "Sobrancelhas"). */
  tag: text("tag").notNull().default(""),
  showOnSite: integer("show_on_site", { mode: "boolean" })
    .notNull()
    .default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Dias até o retoque (0 = não tem retoque). Usado no remarketing. */
  touchUpDays: integer("touch_up_days").notNull().default(0),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  imageKey: text("image_key").notNull().default(""),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

// ─── Agenda ──────────────────────────────────────────────────────────────────

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientEmail: text("client_email").notNull(),
  clientName: text("client_name").notNull(),
  /** Primeiro procedimento do atendimento. */
  serviceId: integer("service_id").notNull(),
  /** Nomes de todos os procedimentos, ex.: "Design + Hidralips". */
  serviceName: text("service_name").notNull(),
  /** Ids de todos os procedimentos, separados por vírgula (ex.: "1,3"). */
  serviceIds: text("service_ids").notNull().default(""),
  date: text("date").notNull(),
  time: text("time").notNull(),
  durationMin: integer("duration_min").notNull().default(30),
  status: text("status").notNull().default("Pendente"),
  /** Observação interna do atendimento. */
  adminMessage: text("admin_message").notNull().default(""),
  totalCents: integer("total_cents").notNull(),
  paymentMethod: text("payment_method").notNull().default(""),
  cashTransactionId: integer("cash_transaction_id"),
  createdAt: text("created_at").notNull(),
});

/**
 * Reserva de faixas de 30 minutos. O índice único impede dois agendamentos
 * no mesmo horário, mesmo com requisições simultâneas.
 */
export const appointmentSlots = sqliteTable(
  "appointment_slots",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    time: text("time").notNull(),
    resourceKey: text("resource_key").notNull(),
    reservationId: text("reservation_id").notNull(),
    appointmentId: integer("appointment_id"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("appointment_slots_unique").on(
      table.date,
      table.time,
      table.resourceKey,
    ),
  ],
);

export const scheduleBlocks = sqliteTable("schedule_blocks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  /** "HH:MM" ou "Dia inteiro". */
  time: text("time").notNull().default("Dia inteiro"),
  reason: text("reason").notNull(),
  createdAt: text("created_at").notNull(),
});

// ─── Financeiro ──────────────────────────────────────────────────────────────

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** "entrada" ou "despesa". */
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  date: text("date").notNull(),
  appointmentId: integer("appointment_id"),
  clientEmail: text("client_email").notNull().default(""),
  clientName: text("client_name").notNull().default(""),
  serviceId: integer("service_id"),
  serviceName: text("service_name").notNull().default(""),
  paymentMethod: text("payment_method").notNull().default(""),
  /** Categoria do gasto (aluguel, materiais...). Vazio nas entradas. */
  category: text("category").notNull().default(""),
  /** Despesa fixa que originou este lançamento, se houver. */
  recurringExpenseId: integer("recurring_expense_id"),
  createdAt: text("created_at").notNull(),
});

/** Gastos que se repetem todo mês (ex.: aluguel), confirmados com 1 toque. */
export const recurringExpenses = sqliteTable("recurring_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  category: text("category").notNull().default(""),
  /** Dia do mês em que vence (1 a 31). */
  dayOfMonth: integer("day_of_month").notNull().default(1),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const businessSettings = sqliteTable("business_settings", {
  id: integer("id").primaryKey().default(1),
  monthlyGoalCents: integer("monthly_goal_cents").notNull().default(500000),
  loyaltyTarget: integer("loyalty_target").notNull().default(10),
  loyaltyReward: text("loyalty_reward")
    .notNull()
    .default("1 atendimento grátis"),
  /**
   * Horário de atendimento por dia da semana, em JSON:
   * `[{"open":true,"start":"09:00","end":"18:00"}, ...]` (0 = domingo).
   */
  openingHours: text("opening_hours").notNull().default(""),
});

// ─── Vendas de produtos ──────────────────────────────────────────────────────

export const productOrders = sqliteTable("product_orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientEmail: text("client_email").notNull().default(""),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull().default(""),
  status: text("status").notNull().default("Pendente"),
  totalCents: integer("total_cents").notNull(),
  paymentMethod: text("payment_method").notNull().default(""),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at").notNull().default(""),
});

export const productOrderItems = sqliteTable("product_order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  priceCents: integer("price_cents").notNull(),
});

// ─── Site público ────────────────────────────────────────────────────────────

/**
 * Textos e contatos editáveis do site (chave → valor em JSON).
 * Chaves ausentes usam o padrão de `lib/site-content.ts`.
 */
export const siteContent = sqliteTable("site_content", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/** Fotos da galeria "Antes & depois". */
export const galleryItems = sqliteTable("gallery_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  tag: text("tag").notNull().default("Antes e depois"),
  alt: text("alt").notNull(),
  /** Chave no R2 (`gallery/...`) ou caminho em `public/` (`/images/...`). */
  imageKey: text("image_key").notNull(),
  width: integer("width").notNull().default(1000),
  height: integer("height").notNull().default(1000),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});
