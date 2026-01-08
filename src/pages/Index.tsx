import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { SpecialistsSection } from "@/components/home/SpecialistsSection";
import { CoursesSection } from "@/components/home/CoursesSection";
import { ProductsSection } from "@/components/home/ProductsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { useSalonSettings } from "@/hooks/useSalonSettings";

const Index = () => {
  const { data: settings } = useSalonSettings();

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        {settings?.section_services_enabled !== false && <ServicesSection />}
        {settings?.section_specialists_enabled !== false && <SpecialistsSection />}
        {settings?.section_courses_enabled !== false && <CoursesSection />}
        {settings?.section_shop_enabled !== false && <ProductsSection />}
        <TestimonialsSection />
        {settings?.section_booking_enabled !== false && <CTASection />}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
