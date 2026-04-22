import Navbar from "@/frontend/components/Navbar";
import Hero from "@/frontend/components/Hero";
import Features from "@/frontend/components/Features";
import Courses from "@/frontend/components/Courses";
import HowItWorks from "@/frontend/components/HowItWorks";
import Testimonials from "@/frontend/components/Testimonials";
import Pricing from "@/frontend/components/Pricing";
import { CTA, Footer } from "@/frontend/components/Footer";

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
