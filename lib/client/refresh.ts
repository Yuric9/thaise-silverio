/**
 * Endereços da API que precisam ser recarregados depois de cada tipo de
 * alteração (usados com `useAction({ refresh })`).
 */
export const REFRESH = {
  agenda: [
    "/api/appointments",
    "/api/dashboard",
    "/api/clients",
    "/api/transactions",
  ],
  finance: [
    "/api/transactions",
    "/api/dashboard",
    "/api/appointments",
    "/api/clients",
    "/api/recurring-expenses",
  ],
  clients: ["/api/clients"],
  services: ["/api/services", "/api/appointments/availability", "/api/site"],
  products: [
    "/api/products",
    "/api/product-orders",
    "/api/transactions",
    "/api/dashboard",
  ],
  site: ["/api/site", "/api/services"],
  settings: ["/api/settings", "/api/appointments/availability"],
  marketing: ["/api/marketing-contacts"],
} as const satisfies Record<string, readonly string[]>;
