import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const title = "Thaise Silvério | Micropigmentação e Estética";
const description =
  "Realce sua beleza com naturalidade. Micropigmentação, design de sobrancelhas, Hidralips e cursos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
