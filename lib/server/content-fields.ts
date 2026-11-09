/**
 * Pedaços de validação reaproveitados pelo conteúdo do site e pelo curso.
 * Sem dependências do banco, para poder ser testado direto no Node.
 */
import { z } from "zod";

export const shortText = (label: string, max = 200) =>
  z
    .string({ error: `Informe ${label}.` })
    .trim()
    .min(1, `Informe ${label}.`)
    .max(max, `${label} muito longo.`);

export const faqSchema = z
  .array(
    z.object({
      question: shortText("a pergunta", 160),
      answer: shortText("a resposta (ou remova a pergunta)", 800),
    }),
  )
  .max(12, "Use no máximo 12 perguntas.");

export const listText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Preencha ${label} ou remova a linha.`)
    .max(max, `${label} muito longo.`);

export const titledItems = (label: string) =>
  z
    .array(
      z.object({
        title: listText(`o título de ${label}`, 120),
        text: z.string().trim().max(600, "Texto muito longo."),
      }),
    )
    .max(12, `Use no máximo 12 itens em ${label}.`);
