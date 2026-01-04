import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  Award,
  Instagram,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";

export default function SpecialistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: specialist, isLoading } = useQuery({
    queryKey: ["specialist", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container text-center py-16">
            <h1 className="text-2xl font-bold mb-4">متخصص یافت نشد</h1>
            <Button asChild>
              <Link to="/specialists">بازگشت به متخصصان</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = specialist.gallery_images || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">خانه</Link>
            <ArrowRight className="w-4 h-4" />
            <Link to="/specialists" className="hover:text-primary">متخصصان</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground">{specialist.full_name}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <img
                  src={specialist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&h=600&fit=crop&crop=face"}
                  alt={specialist.full_name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">{specialist.experience_years} سال تجربه</span>
                </div>
              </div>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {galleryImages.slice(0, 6).map((img, index) => (
                    <div key={index} className="aspect-square rounded-xl overflow-hidden bg-muted">
                      <img
                        src={img}
                        alt={`${specialist.full_name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <div>
                <Badge variant="secondary" className="mb-3">{specialist.title}</Badge>
                <h1 className="text-3xl font-bold mb-2">{specialist.full_name}</h1>
                
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(Number(specialist.rating))
                            ? "text-accent fill-accent"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{Number(specialist.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground">({specialist.reviews_count} نظر)</span>
                </div>
              </div>

              {/* Bio */}
              {specialist.bio && (
                <div>
                  <h2 className="font-bold text-lg mb-3">درباره</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {specialist.bio}
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-4 text-center shadow-card">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <span className="block text-2xl font-bold">{specialist.experience_years}</span>
                  <span className="text-sm text-muted-foreground">سال تجربه</span>
                </div>
                <div className="bg-card rounded-xl p-4 text-center shadow-card">
                  <Star className="w-6 h-6 mx-auto mb-2 text-accent" />
                  <span className="block text-2xl font-bold">{Number(specialist.rating).toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">امتیاز</span>
                </div>
                <div className="bg-card rounded-xl p-4 text-center shadow-card">
                  <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <span className="block text-2xl font-bold">{specialist.reviews_count}</span>
                  <span className="text-sm text-muted-foreground">نظر</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button size="lg" className="flex-1" onClick={() => navigate(`/booking?specialist=${specialist.id}`)}>
                  <Calendar className="w-5 h-5 ml-2" />
                  رزرو نوبت
                </Button>
                {specialist.instagram_url && (
                  <Button variant="outline" size="lg" asChild>
                    <a href={specialist.instagram_url} target="_blank" rel="noopener noreferrer">
                      <Instagram className="w-5 h-5" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
