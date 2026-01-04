import { motion } from "framer-motion";
import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Services() {
  const navigate = useNavigate();
  
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/booking?service=${serviceId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium mb-4 block">خدمات ما</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              خدمات زیبایی <span className="gradient-text">حرفه‌ای</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              با تیم متخصص ما، بهترین خدمات زیبایی را تجربه کنید
            </p>
          </motion.div>

          {/* Services Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : services && services.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
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
                      {formatPrice(Number(service.price))} تومان
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold">{service.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {service.description || "خدمات حرفه‌ای زیبایی"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration_minutes} دقیقه</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        className="gap-2 p-0 h-auto text-primary hover:text-primary/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookService(service.id);
                        }}
                      >
                        رزرو نوبت
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">هنوز خدماتی اضافه نشده است</p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/">بازگشت به خانه</Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
