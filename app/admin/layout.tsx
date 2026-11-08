import type { Metadata, Viewport } from "next";
import "./admin.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f2133",
};

export const metadata: Metadata = {
  title: "Thaise Silvério | Gestão",
  description:
    "Painel de gestão: agenda, caixa, clientes, relatórios e conteúdo do site.",
  // O painel não deve aparecer no Google.
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    title: "TS Gestão",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Isola o CSS do painel (o build junta o CSS do site e do painel num arquivo só).
  return <div className="admin-scope">{children}</div>;
}
