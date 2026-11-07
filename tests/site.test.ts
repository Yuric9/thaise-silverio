import assert from "node:assert/strict";
import test from "node:test";
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
