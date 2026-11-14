import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingForm from "@/components/site/BookingForm";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import { getPublicSite } from "@/lib/server/site";

// Liga e desliga pelo painel (Configurações): montada a cada visita.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agendar horário | Thaise Silvério",
  description:
    "Escolha o procedimento, o dia e um horário livre no Studio Thaise Silvério, em Trindade (GO). A Thaise confirma pelo WhatsApp.",
  alternates: { canonical: "/agendar" },
};

export default async function AgendarPage() {
  const { content } = await getPublicSite();
  if (!content.booking.enabled) notFound();
  return (
    <>
      <Header
        base="/"
        booking
        course={content.course.published ? "new-tab" : "section"}
      />
      <main>
        <section className="section booking-page" id="inicio">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                <i /> AGENDAMENTO
              </p>
              <h1>
                Escolha o seu <em>horário</em>
              </h1>
            </div>
            <p>
              Escolha o procedimento, o dia e um horário livre. O horário fica
              reservado e a Thaise confirma com você pelo WhatsApp.
            </p>
          </div>
          <BookingForm whatsappNumber={content.contact.whatsappNumber} />
        </section>
      </main>
      <Footer contact={content.contact} />
    </>
  );
}
