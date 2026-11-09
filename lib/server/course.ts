/**
 * Validação da página do curso (/curso) e limpeza das fotos que saíram dela.
 * Sem dependências do banco, para poder ser testado direto no Node.
 */
import { z } from "zod";
import type { CourseContent } from "../site-content.ts";
import {
  faqSchema,
  listText,
  shortText,
  titledItems,
} from "./content-fields.ts";

/** Foto do curso: só imagens enviadas pelo painel (pasta `course/` do R2). */
const coursePhotoSchema = z.object({
  key: z
    .string()
    .regex(
      /^course\/[0-9a-f-]{36}\.(jpg|png|webp)$/,
      "Envie a foto do curso novamente.",
    ),
  alt: z
    .string()
    .trim()
    .min(
      10,
      "Descreva cada foto do curso em pelo menos 10 letras (ajuda quem usa leitor de tela e o Google).",
    )
    .max(240, "Descrição da foto muito longa."),
  caption: z.string().trim().max(80, "Legenda da foto muito longa."),
  width: z.coerce.number().int().min(1).max(5000),
  height: z.coerce.number().int().min(1).max(5000),
});

export const courseSchema = z.object({
  published: z.boolean(),
  title: shortText("o nome do curso", 120),
  subtitle: shortText("a frase de apresentação", 400),
  audience: z.array(listText("o item de “Para quem é”", 200)).max(10),
  modules: titledItems("“O que você vai aprender”"),
  details: titledItems("“Como funciona”"),
  includes: z.array(listText("o item de “O que está incluso”", 200)).max(12),
  price: z.string().trim().max(40, "Preço muito longo."),
  priceNote: z.string().trim().max(160, "Condições muito longas."),
  faq: faqSchema,
  ctaMessage: shortText("a mensagem do WhatsApp", 300),
  photos: z
    .array(coursePhotoSchema)
    .max(12, "Use no máximo 12 fotos do curso.")
    .default([]),
  cover: coursePhotoSchema.omit({ caption: true }).nullable().default(null),
});

/**
 * Fotos do curso (incluindo a do topo) que estavam salvas e não estão mais:
 * os arquivos podem ser apagados do R2.
 */
export function removedCourseImages(
  before: Pick<CourseContent, "photos" | "cover">,
  after: Pick<CourseContent, "photos" | "cover">,
) {
  const keys = (course: Pick<CourseContent, "photos" | "cover">) =>
    new Set(
      [...course.photos.map((photo) => photo.key), course.cover?.key].filter(
        (key): key is string => Boolean(key?.startsWith("course/")),
      ),
    );
  const kept = keys(after);
  return [...keys(before)].filter((key) => !kept.has(key));
}
