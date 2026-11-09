import assert from "node:assert/strict";
import test from "node:test";
import { counterText, parseCounter } from "../lib/domain/counter.ts";
import { courseSchema, removedCourseImages } from "../lib/server/course.ts";
import {
  isMaintenanceDue,
  isTouchUpDue,
  touchUpDaysFor,
} from "../lib/domain/touch-up.ts";
import {
  DEFAULT_SITE_CONTENT,
  instagramUrl,
  whatsappLink,
} from "../lib/site-content.ts";
import { imageUrl } from "../lib/image-url.ts";

const services = [
  { name: "Micropigmentação de sobrancelhas", touchUpDays: 30 },
  { name: "Micropigmentação labial", touchUpDays: 45 },
  { name: "Hidralips", touchUpDays: 0 },
];

test("retoque: usa o maior prazo entre os procedimentos do atendimento", () => {
  assert.equal(
    touchUpDaysFor("Micropigmentação de sobrancelhas", services),
    30,
  );
  assert.equal(
    touchUpDaysFor(
      "Micropigmentação de sobrancelhas + Micropigmentação labial",
      services,
    ),
    45,
  );
  assert.equal(touchUpDaysFor("Hidralips", services), 0);
  assert.equal(touchUpDaysFor(null, services), 0);
});

test("retoque: lembra 5 dias antes e até 30 dias depois do prazo", () => {
  assert.equal(isTouchUpDue(24, 30), false);
  assert.equal(isTouchUpDue(25, 30), true);
  assert.equal(isTouchUpDue(60, 30), true);
  assert.equal(isTouchUpDue(61, 30), false);
  assert.equal(isTouchUpDue(30, 0), false); // procedimento sem retoque
  assert.equal(isTouchUpDue(null, 30), false);
});

test("manutenção anual: entre 11 e 13 meses", () => {
  assert.equal(isMaintenanceDue(329, 30), false);
  assert.equal(isMaintenanceDue(365, 30), true);
  assert.equal(isMaintenanceDue(401, 30), false);
  assert.equal(isMaintenanceDue(365, 0), false);
});

test("links do site usam os contatos salvos", () => {
  assert.equal(
    whatsappLink("5562999999999", "Olá!"),
    "https://wa.me/5562999999999?text=Ol%C3%A1!",
  );
  assert.equal(
    instagramUrl("thaisesilverio_estetica"),
    "https://www.instagram.com/thaisesilverio_estetica/",
  );
  assert.match(DEFAULT_SITE_CONTENT.contact.whatsappNumber, /^55\d{10,11}$/);
});

test("imagens: fotos do site e fotos enviadas pelo painel", () => {
  assert.equal(
    imageUrl("/images/resultados/x.webp"),
    "/images/resultados/x.webp",
  );
  assert.equal(
    imageUrl("gallery/abc.webp"),
    "/api/upload?key=gallery%2Fabc.webp",
  );
  assert.equal(imageUrl(""), "");
});

test("segredos colados com espaço, quebra de linha ou aspas ainda funcionam", async () => {
  const { cleanSecret } = await import("../lib/server/runtime-config.ts");
  assert.equal(
    cleanSecret("  pbkdf2-sha256$100000$abc$def\n"),
    "pbkdf2-sha256$100000$abc$def",
  );
  assert.equal(cleanSecret('"Thaise@Exemplo.com "'), "Thaise@Exemplo.com");
  assert.equal(cleanSecret(undefined), "");
});

test("endereço e link do Google Maps do estúdio", async () => {
  const { addressLine, mapsUrl } = await import("../lib/site-content.ts");
  const contact = { ...DEFAULT_SITE_CONTENT.contact };
  assert.equal(
    addressLine(contact),
    "R. Ibirapuera, Jardim Marista, Trindade – GO",
  );
  assert.match(
    mapsUrl(contact),
    /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=Studio%20Thaise/,
  );
  assert.equal(
    addressLine({
      ...contact,
      street: "",
      neighborhood: "",
      city: "",
      state: "",
    }),
    "",
  );
});

test("contagem dos destaques: lê o número salvo no painel", () => {
  assert.deepEqual(parseCounter("+500"), {
    before: "+",
    after: "",
    end: 500,
    grouped: false,
  });
  assert.equal(parseCounter("6 anos")?.end, 6);
  assert.equal(parseCounter("+1.000")?.end, 1000);
  assert.equal(parseCounter("Esteticista"), null);
});

test("contagem dos destaques: texto durante a contagem", () => {
  const anos = parseCounter("6 anos")!;
  assert.equal(counterText(anos, 0), "0 anos");
  assert.equal(counterText(anos, 1), "1 ano");
  assert.equal(counterText(anos, 6), "6 anos");
  const mil = parseCounter("+1.000")!;
  assert.equal(counterText(mil, 250), "+250");
  assert.equal(counterText(mil, 1000), "+1.000");
});

const photo = (
  n: number,
  alt = "Aluna praticando o desenho da sobrancelha",
) => ({
  key: `course/00000000-0000-4000-8000-${String(n).padStart(12, "0")}.webp`,
  alt,
  caption: "",
  width: 1000,
  height: 1000,
});

test("curso: conteúdo salvo antes das fotos continua válido", () => {
  const { photos, cover, ...antigo } = DEFAULT_SITE_CONTENT.course;
  const lido = courseSchema.parse(antigo);
  assert.deepEqual(lido.photos, []);
  assert.equal(lido.cover, null);
  assert.equal(photos.length + (cover ? 1 : 0), 0);
});

test("curso: fotos precisam de descrição e no máximo 12", () => {
  const base = DEFAULT_SITE_CONTENT.course;
  assert.ok(courseSchema.safeParse({ ...base, photos: [photo(1)] }).success);
  assert.ok(
    !courseSchema.safeParse({ ...base, photos: [photo(1, "curta")] }).success,
  );
  const treze = Array.from({ length: 13 }, (_, i) => photo(i + 1));
  assert.ok(!courseSchema.safeParse({ ...base, photos: treze }).success);
  // Só fotos enviadas pelo painel (pasta course/).
  const estranha = { ...photo(1), key: "gallery/qualquer.webp" };
  assert.ok(!courseSchema.safeParse({ ...base, photos: [estranha] }).success);
});

test("curso: apaga do R2 só as fotos que saíram", () => {
  const antes = { photos: [photo(1), photo(2)], cover: photo(3) };
  const depois = { photos: [photo(2)], cover: null };
  assert.deepEqual(removedCourseImages(antes, depois), [
    photo(1).key,
    photo(3).key,
  ]);
  assert.deepEqual(removedCourseImages(depois, depois), []);
  // Uma foto que virou a foto do topo não é apagada.
  assert.deepEqual(
    removedCourseImages(
      { photos: [photo(1)], cover: null },
      { photos: [], cover: photo(1) },
    ),
    [],
  );
});
