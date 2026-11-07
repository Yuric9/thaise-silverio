import type { Metadata } from "next";
import { SITE_URL } from "../lib/site-content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
};

/** Estrutura comum ao site público e ao painel (/admin). Cada um tem seu próprio CSS. */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
