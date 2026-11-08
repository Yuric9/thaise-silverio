import {
  instagramUrl,
  SITE_URL,
  type ContactContent,
} from "@/lib/site-content";

/**
 * Dados estruturados (schema.org) para o Google: dizem que o site é do
 * estúdio, com endereço, telefone e Instagram. Ajuda a ligar o site ao perfil
 * do Google e a aparecer nas buscas locais. Não aparece na tela.
 */
export default function StructuredData({
  contact,
}: {
  contact: ContactContent;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    name: contact.studioName || "Thaise Silvério — Micropigmentação e Estética",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    logo: `${SITE_URL}/images/logo-monograma.webp`,
    telephone: `+${contact.whatsappNumber}`,
    sameAs: [instagramUrl(contact.instagramHandle)],
    ...(contact.city && {
      address: {
        "@type": "PostalAddress",
        ...(contact.street && { streetAddress: contact.street }),
        addressLocality: contact.city,
        ...(contact.state && { addressRegion: contact.state }),
        ...(contact.postalCode && { postalCode: contact.postalCode }),
        addressCountry: "BR",
      },
    }),
  };
  // "<" vira < para o texto salvo no painel nunca fechar a tag <script>.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
