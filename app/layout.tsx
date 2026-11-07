import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Thaise Silvério | Micropigmentação e Estética", description: "Realce sua beleza com naturalidade. Micropigmentação, design de sobrancelhas, Hidralips e cursos." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
