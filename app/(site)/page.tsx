import About from "@/components/site/About";
import Contact from "@/components/site/Contact";
import Courses from "@/components/site/Courses";
import Faq from "@/components/site/Faq";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Results from "@/components/site/Results";
import Services from "@/components/site/Services";
import { getPublicSite } from "@/lib/server/site";

// O conteúdo vem do banco: a página é montada a cada visita, para refletir
// na hora o que a Thaise mudar no painel.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { content, services, gallery } = await getPublicSite();
  const { contact, texts, highlights, faq } = content;
  return (
    <>
      <Header showFaq={faq.length > 0} />
      <main>
        <Hero text={texts.heroText} />
        <About texts={texts} highlights={highlights} />
        <Services
          services={services}
          intro={texts.servicesIntro}
          whatsappNumber={contact.whatsappNumber}
        />
        <Results gallery={gallery} intro={texts.resultsIntro} />
        <Courses
          text={texts.coursesText}
          whatsappNumber={contact.whatsappNumber}
        />
        <Faq items={faq} />
        <Contact contact={contact} text={texts.contactText} />
      </main>
      <Footer contact={contact} />
    </>
  );
}
