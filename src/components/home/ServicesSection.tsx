import { motion } from "framer-motion";
import { ArrowLeft, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableText } from "@/components/visual-editor/EditableText";

export function ServicesSection() {
  const { data: settings } = useSalonSettings();
  const navigate = useNavigate();

  const { data: services, isLoading } = useQuery({
    queryKey: ["home-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at")
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <EditableText
            pageKey="home"
            contentKey="services_label"
            defaultValue="خدمات ما"
            as="span"
            className="text-primary font-medium mb-4 block"
          />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <EditableText
              pageKey="home"
              contentKey="services_title"
              defaultValue={settings?.home_services_title || "خدمات زیبایی حرفه‌ای"}
              as="span"
            />
          </h2>
          <EditableText
            pageKey="home"
            contentKey="services_subtitle"
            defaultValue={settings?.home_services_subtitle || "با تیم متخصص ما، بهترین خدمات زیبایی را تجربه کنید"}
            as="p"
            className="text-muted-foreground max-w-2xl mx-auto"
          />
        </motion.div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                  <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    از {formatPrice(Number(service.price))} تومان
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">{service.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{service.description}</p>
                  <Button 
                    variant="ghost" 
                    className="gap-2 p-0 h-auto text-primary hover:text-primary/80"
                    onClick={() => navigate(`/booking?service=${service.id}`)}
                  >
                    رزرو نوبت
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            هنوز خدمتی ثبت نشده است
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button asChild size="lg" variant="outline">
            <Link to="/services" className="gap-2">
              مشاهده همه خدمات
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
