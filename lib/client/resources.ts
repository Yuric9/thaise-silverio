"use client";

/** Hooks de leitura dos recursos mais usados no painel. */
import { useApi } from "./api";
import type { ClientSummary, Product, Service } from "./types";

export const useServices = () =>
  useApi<{ services: Service[] }>("/api/services");
export const useProducts = () =>
  useApi<{ products: Product[] }>("/api/products");
export const useClients = () =>
  useApi<{ clients: ClientSummary[] }>("/api/clients");
