// Dados do site: altere aqui sem precisar mexer nos componentes.

// Endereço público do site (troque quando tiver domínio próprio).
export const SITE_URL = "https://thaise-silverio.pages.dev";

export const INSTAGRAM_HANDLE = "thaisesilverio_estetica";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// WhatsApp: altere só aqui (o número aparece no botão e no texto do contato).
export const WHATSAPP_NUMBER = "556281231427"; // só dígitos, com 55 + DDD
export const WHATSAPP_DISPLAY = "(62) 8123-1427"; // como aparece para a cliente

// Monta um link do WhatsApp que já abre a conversa com a mensagem escrita.
export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = whatsappLink(
  "Olá, Thaise! Vim pelo site e gostaria de agendar uma avaliação.",
);

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

export type Result = {
  src: string;
  alt: string;
  title: string;
  tag: string;
  width: number;
  height: number;
};

// Fotos em public/images/resultados (WebP, até 1000px).
export const results: Result[] = [
  {
    src: "/images/resultados/micropigmentacao-labial-antes-depois.webp",
    alt: "Lábios antes e depois da micropigmentação labial, com cor mais viva e contorno definido",
    title: "Micropigmentação labial",
    tag: "Antes e depois",
    width: 828,
    height: 828,
  },
  {
    src: "/images/resultados/sobrancelhas-fio-a-fio-antes-depois.webp",
    alt: "Sobrancelhas antes e depois da micropigmentação, mais preenchidas e alinhadas",
    title: "Sobrancelhas fio a fio",
    tag: "Antes e depois",
    width: 1000,
    height: 1000,
  },
  {
    src: "/images/resultados/tratamento-facial-procedimento.webp",
    alt: "Cliente deitada recebendo aplicação de produto no rosto com pincel durante tratamento facial",
    title: "Tratamento facial",
    tag: "Procedimento",
    width: 562,
    height: 1000,
  },
  {
    src: "/images/resultados/tratamento-facial-antes-depois.webp",
    alt: "Pele do rosto antes e depois do tratamento facial, com menos vermelhidão e textura mais uniforme",
    title: "Tratamento facial",
    tag: "Antes e depois",
    width: 1000,
    height: 983,
  },
  {
    src: "/images/resultados/sobrancelhas-antes-depois.webp",
    alt: "Sobrancelhas antes e depois da micropigmentação, com desenho mais definido",
    title: "Micropigmentação de sobrancelhas",
    tag: "Antes e depois",
    width: 800,
    height: 1000,
  },
];
