import { Hero } from "@/components/Hero";
import { SEOHead } from "@/components/SEOHead";
import { HelmetProvider } from "react-helmet-async";

const Index = () => {
  return (
    <HelmetProvider>
      <SEOHead />
      <main>
        <Hero />
      </main>
    </HelmetProvider>
  );
};

export default Index;
