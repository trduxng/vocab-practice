import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import Features from "@/src/components/Features";
import Courses from "@/src/components/Courses";
import HowItWorks from "@/src/components/HowItWorks";
import Testimonials from "@/src/components/Testimonials";
import Pricing from "@/src/components/Pricing";
import { CTA, Footer } from "@/src/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Courses />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
