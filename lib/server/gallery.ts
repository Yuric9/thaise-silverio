/** Validação das fotos da galeria "Antes & depois". */
import { z } from "zod";

/** Foto enviada pelo painel (R2) ou que já vinha com o site (public/). */
const imageKey = z
  .string()
  .regex(
    /^(gallery\/[0-9a-f-]{36}\.(jpg|png|webp)|\/images\/resultados\/[a-z0-9-]+\.webp)$/,
    "Envie a foto novamente.",
  );

export const galleryFields = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Informe o título da foto.")
    .max(80, "Título muito longo."),
  tag: z
    .string()
    .trim()
    .min(1, "Informe a etiqueta.")
    .max(30, "Etiqueta muito longa."),
  alt: z
    .string()
    .trim()
    .min(
      10,
      "Descreva a foto em pelo menos 10 letras (ajuda quem usa leitor de tela e o Google).",
    )
    .max(240, "Descrição muito longa."),
  imageKey,
  width: z.coerce.number().int().min(1).max(5000),
  height: z.coerce.number().int().min(1).max(5000),
  sortOrder: z.coerce.number().int().min(0).max(999),
  active: z.boolean(),
});
