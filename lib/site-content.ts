/**
 * Conteúdo editável do site público.
 *
 * Os valores abaixo são o padrão (o texto que o site já tinha). A Thaise pode
 * mudar tudo pelo painel (/admin → Site); o que ela salvar fica no banco e
 * substitui o padrão. Este arquivo não acessa o banco: serve tanto ao servidor
 * quanto às telas do painel.
 */

/** Endereço público do site (troque quando tiver domínio próprio). */
export const SITE_URL = "https://thaise-silverio-app.jesika-yure.workers.dev";

export type ContactContent = {
  /** Só dígitos, com 55 + DDD (ex.: 556281231427). */
  whatsappNumber: string;
  /** Como o número aparece para a cliente (ex.: (62) 8123-1427). */
  whatsappDisplay: string;
  /** Sem o @ (ex.: thaisesilverio_estetica). */
  instagramHandle: string;
  /** Nome do estúdio, como no perfil do Google. */
  studioName: string;
  /** Rua e número (ex.: R. Ibirapuera). Vazio = o endereço não aparece. */
  street: string;
  neighborhood: string;
  city: string;
  /** Sigla do estado (ex.: GO). */
  state: string;
  postalCode: string;
  /** Link "Escreva uma avaliação" do perfil no Google (opcional). */
  googleReviewUrl: string;
};

export type Highlight = { value: string; label: string };

/**
 * Nos textos, `*palavras*` ficam em destaque (itálico colorido) e
 * `**palavras**` ficam em negrito. Veja `components/site/rich-text.tsx`.
 */
export type TextsContent = {
  heroText: string;
  aboutHeading: string;
  bio: string[];
  signature: string;
  servicesIntro: string;
  resultsIntro: string;
  coursesText: string;
  contactText: string;
};

/** Pergunta frequente: a resposta é sempre escrita pela Thaise. */
export type FaqItem = { question: string; answer: string };

/** Item com título e texto (módulos do curso, "como funciona"...). */
export type TitledItem = { title: string; text: string };

/**
 * Página de vendas do curso (/curso). Só vai ao ar quando `published` é
 * verdadeiro. Listas vazias = a seção correspondente não aparece.
 * Preço, carga horária, certificado etc. são sempre informados pela Thaise.
 */
/** Foto do curso enviada pelo painel (fica no R2, pasta `course/`). */
export type CoursePhoto = {
  key: string;
  /** Descrição da foto (leitor de tela e Google). */
  alt: string;
  /** Legenda opcional mostrada embaixo da foto. */
  caption: string;
  width: number;
  height: number;
};

/** Foto do topo da página do curso (enviada pelo painel). */
export type CourseCover = Omit<CoursePhoto, "caption">;

export type CourseContent = {
  published: boolean;
  title: string;
  subtitle: string;
  /** Para quem é o curso. */
  audience: string[];
  /** O que a aluna vai aprender (módulos). */
  modules: TitledItem[];
  /** Como funciona: formato, carga horária, turma, local... */
  details: TitledItem[];
  /** O que está incluso (material, kit, certificado...). */
  includes: string[];
  /** Preço como deve aparecer (ex.: "R$ 1.500"). Vazio = não mostra preço. */
  price: string;
  /** Condições (ex.: "em até 10x no cartão"). */
  priceNote: string;
  faq: FaqItem[];
  /** Mensagem que já vai escrita no WhatsApp ao clicar em "Quero me inscrever". */
  ctaMessage: string;
  /** Fotos da seção "Por dentro do curso" (turma, prática, kit...). */
  photos: CoursePhoto[];
  /** Foto do topo da página; `null` = a mesma foto da Thaise da página inicial. */
  cover: CourseCover | null;
};

export type SiteContent = {
  contact: ContactContent;
  highlights: Highlight[];
  texts: TextsContent;
  /** Vazio = a seção "Perguntas frequentes" não aparece no site. */
  faq: FaqItem[];
  course: CourseContent;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  contact: {
    whatsappNumber: "556281231427",
    whatsappDisplay: "(62) 8123-1427",
    instagramHandle: "thaisesilverio_estetica",
    // Dados do perfil "Studio Thaise Silvério" no Google, informados pela dona.
    studioName: "Studio Thaise Silvério",
    street: "R. Ibirapuera",
    neighborhood: "Jardim Marista",
    city: "Trindade",
    state: "GO",
    postalCode: "75383-414",
    googleReviewUrl: "",
  },
  highlights: [
    { value: "+500", label: "clientes atendidas" },
    { value: "6 anos", label: "de especialização em micropigmentação" },
    { value: "Esteticista", label: "e cosmetóloga" },
    { value: "Cursos", label: "para formar novas profissionais" },
  ],
  texts: {
    heroText:
      "Realce sua essência com cuidado, técnica e resultados que respeitam a sua beleza natural.",
    aboutHeading:
      "Beleza não é transformar quem você é. É *revelar sua essência.*",
    bio: [
      "Olá, sou **Thaise Silvério**, esteticista e cosmetóloga, especialista em micropigmentação há 6 anos e com mais de 500 clientes atendidas.",
      "Cada atendimento começa com uma escuta atenta: entender o que você deseja, respeitar os seus traços e escolher a técnica certa para um resultado natural e harmonioso, que combine com quem você é.",
      "Deixo aqui todo o meu comprometimento, carinho e cuidado com cada cliente. Para mim, realçar a sua beleza é também cuidar da sua autoestima e da confiança que você deposita no meu trabalho.",
    ],
    signature: "Thaise Silvério",
    servicesIntro:
      "Conheça os serviços e encontre o cuidado ideal para valorizar sua beleza.",
    resultsIntro:
      "Alguns dos trabalhos realizados, com resultados que respeitam a beleza natural de cada cliente.",
    coursesText:
      "Formação e aperfeiçoamento em micropigmentação, com foco em técnica, segurança e evolução profissional.",
    contactText:
      "Entre em contato para tirar dúvidas, conhecer os procedimentos e consultar horários disponíveis.",
  },
  faq: [],
  course: {
    published: false,
    title: "Curso de Micropigmentação de Sobrancelhas",
    subtitle:
      "Formação e aperfeiçoamento em micropigmentação, com foco em técnica, segurança e evolução profissional.",
    audience: [],
    modules: [],
    details: [],
    includes: [],
    price: "",
    priceNote: "",
    faq: [],
    ctaMessage:
      "Olá, Thaise! Vim pelo site e quero me inscrever no Curso de Micropigmentação de Sobrancelhas.",
    photos: [],
    cover: null,
  },
};

export const SITE_CONTENT_KEYS = [
  "contact",
  "highlights",
  "texts",
  "faq",
  "course",
] as const;

/**
 * Perguntas sugeridas no painel (só a pergunta; a resposta fica em branco
 * para a Thaise escrever). Não aparecem no site até serem respondidas.
 */
export const FAQ_SUGGESTIONS = [
  "A micropigmentação dói?",
  "Quanto tempo dura a micropigmentação?",
  "Quais são os cuidados depois do procedimento?",
  "Quando é feito o retoque?",
  "Quem não pode fazer micropigmentação?",
  "Quanto tempo leva o atendimento?",
];
export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

/** Monta um link do WhatsApp que já abre a conversa com a mensagem escrita. */
export function whatsappLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle}/`;
}

/** Endereço em uma linha, só com as partes preenchidas. */
export function addressLine(contact: ContactContent) {
  const cityState = [contact.city, contact.state].filter(Boolean).join(" – ");
  return [contact.street, contact.neighborhood, cityState]
    .filter(Boolean)
    .join(", ");
}

/** Link do Google Maps para o estúdio (abre o app de mapas no celular). */
export function mapsUrl(contact: ContactContent) {
  const query = [contact.studioName, addressLine(contact), contact.postalCode]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Item da galeria como o site e o painel recebem. */
export type GalleryItem = {
  id: number;
  title: string;
  tag: string;
  alt: string;
  imageKey: string;
  width: number;
  height: number;
  sortOrder: number;
  active: boolean;
};

/** Procedimento como o site recebe. */
export type SiteService = {
  id: number;
  name: string;
  description: string;
  tag: string;
};

/** Fotos que já estavam no site, cadastradas na galeria no primeiro acesso. */
export const DEFAULT_GALLERY = [
  {
    imageKey: "/images/resultados/micropigmentacao-labial-antes-depois.webp",
    alt: "Lábios antes e depois da micropigmentação labial, com cor mais viva e contorno definido",
    title: "Micropigmentação labial",
    tag: "Antes e depois",
    width: 828,
    height: 828,
  },
  {
    imageKey: "/images/resultados/sobrancelhas-fio-a-fio-antes-depois.webp",
    alt: "Sobrancelhas antes e depois da micropigmentação, mais preenchidas e alinhadas",
    title: "Sobrancelhas fio a fio",
    tag: "Antes e depois",
    width: 1000,
    height: 1000,
  },
  {
    imageKey: "/images/resultados/tratamento-facial-procedimento.webp",
    alt: "Cliente deitada recebendo aplicação de produto no rosto com pincel durante tratamento facial",
    title: "Tratamento facial",
    tag: "Procedimento",
    width: 562,
    height: 1000,
  },
  {
    imageKey: "/images/resultados/tratamento-facial-antes-depois.webp",
    alt: "Pele do rosto antes e depois do tratamento facial, com menos vermelhidão e textura mais uniforme",
    title: "Tratamento facial",
    tag: "Antes e depois",
    width: 1000,
    height: 983,
  },
  {
    imageKey: "/images/resultados/sobrancelhas-antes-depois.webp",
    alt: "Sobrancelhas antes e depois da micropigmentação, com desenho mais definido",
    title: "Micropigmentação de sobrancelhas",
    tag: "Antes e depois",
    width: 800,
    height: 1000,
  },
];
