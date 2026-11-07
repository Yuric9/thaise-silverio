// Dados do site: altere aqui sem precisar mexer nos componentes.

export const WHATSAPP_NUMBER = "556281231427"; // +55 (62) 8123-1427

const WHATSAPP_MESSAGE =
  "Olá, Thaise! Vim pelo site e gostaria de agendar uma avaliação.";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

export type Service = {
  n: string;
  title: string;
  desc: string;
  tag: string;
};

export const services: Service[] = [
  {
    n: "01",
    title: "Micropigmentação de sobrancelhas",
    desc: "Definição e harmonia para realçar sua expressão com naturalidade.",
    tag: "Sobrancelhas",
  },
  {
    n: "02",
    title: "Micropigmentação labial",
    desc: "Mais definição e realce para a beleza natural dos lábios.",
    tag: "Lábios",
  },
  {
    n: "03",
    title: "Hidralips",
    desc: "Cuidado estético para lábios com aparência hidratada e viçosa.",
    tag: "Tratamento",
  },
  {
    n: "04",
    title: "Design de sobrancelhas",
    desc: "Um desenho pensado para valorizar os traços e a individualidade.",
    tag: "Design",
  },
  {
    n: "05",
    title: "Cursos de micropigmentação",
    desc: "Conhecimento e aperfeiçoamento para profissionais da beleza.",
    tag: "Educação",
  },
  {
    n: "06",
    title: "Outros procedimentos estéticos",
    desc: "Conheça as possibilidades de cuidado e beleza disponíveis.",
    tag: "Estética",
  },
];
