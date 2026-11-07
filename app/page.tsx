import About from "@/components/About";
import Contact from "@/components/Contact";
import Courses from "@/components/Courses";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <Services />
      <Courses />
      <Contact />
      <Footer />
    </main>
  );
}
