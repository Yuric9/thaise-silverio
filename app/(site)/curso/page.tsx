import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CoursePage from "@/components/site/CoursePage";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import { getPublicSite } from "@/lib/server/site";
import { SITE_URL } from "@/lib/site-content";

// Conteúdo vem do banco (painel → Curso): montado a cada visita.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { content } = await getPublicSite();
  const { course } = content;
  const title = `${course.title.replace(/\*/g, "")} | Thaise Silvério`;
  const description = course.subtitle.replace(/\*/g, "");
  return {
    title,
    description,
    alternates: { canonical: "/curso" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/curso",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function CursoPage() {
  const { content } = await getPublicSite();
  const { course, contact, texts, highlights } = content;
  // Enquanto não estiver publicado no painel, a página não existe.
  if (!course.published) notFound();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title.replace(/\*/g, ""),
    description: course.subtitle.replace(/\*/g, ""),
    url: `${SITE_URL}/curso`,
    inLanguage: "pt-BR",
    provider: {
      "@type": "Organization",
      name: contact.studioName || "Thaise Silvério",
      sameAs: SITE_URL,
    },
  };

  return (
    <>
      <Header base="/" course="current" />
      <main>
        <CoursePage
          course={course}
          whatsappNumber={contact.whatsappNumber}
          bio={texts.bio}
          highlights={highlights}
        />
      </main>
      <Footer contact={contact} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
