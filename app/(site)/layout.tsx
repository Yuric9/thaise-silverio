import type { Metadata } from "next";
import "./site.css";

const title = "Thaise Silvério | Micropigmentação e Estética";
const description =
  "Realce sua beleza com naturalidade. Micropigmentação, design de sobrancelhas, Hidralips e cursos.";

export const metadata: Metadata = {
  title,
  description,
  // Prévia exibida ao compartilhar o link (WhatsApp, Instagram, Facebook...)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: "Thaise Silvério",
    title,
    description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Thaise Silvério — Micropigmentação e Estética",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.jpg"],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
