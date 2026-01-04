import { motion } from "framer-motion";
import { Star, Instagram, Award, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function Specialists() {
  const { data: specialists, isLoading } = useQuery({
    queryKey: ["specialists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

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
            <span className="text-primary font-medium mb-4 block">تیم ما</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              متخصصان <span className="gradient-text">حرفه‌ای</span> ما
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              با بهترین متخصصان زیبایی آشنا شوید
            </p>
          </motion.div>

          {/* Specialists Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 text-center">
                  <Skeleton className="w-28 h-28 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-5 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto mb-4" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : specialists && specialists.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {specialists.map((specialist, index) => (
                <motion.div
                  key={specialist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl p-6 text-center shadow-card hover-lift"
                >
                  {/* Avatar */}
                  <div className="relative w-28 h-28 mx-auto mb-4">
                    <img
                      src={specialist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face"}
                      alt={specialist.full_name}
                      className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                    />
                    <div className="absolute -bottom-2 -left-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-bold mb-1">{specialist.full_name}</h3>
                  <p className="text-muted-foreground text-sm mb-3">{specialist.title || "متخصص زیبایی"}</p>

                  {/* Bio */}
                  {specialist.bio && (
                    <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{specialist.bio}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    <span className="font-medium">{Number(specialist.rating).toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">({specialist.reviews_count} نظر)</span>
                  </div>

                  {/* Experience */}
                  <p className="text-sm text-muted-foreground mb-4">
                    {specialist.experience_years} سال تجربه
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {specialist.instagram_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(specialist.instagram_url!, "_blank")}
                      >
                        <Instagram className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" className="flex-1">
                      رزرو نوبت
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">هنوز متخصصی اضافه نشده است</p>
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
