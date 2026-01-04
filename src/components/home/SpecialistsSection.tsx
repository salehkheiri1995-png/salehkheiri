import { motion } from "framer-motion";
import { Star, Instagram, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export function SpecialistsSection() {
  const { data: settings } = useSalonSettings();
  const navigate = useNavigate();

  const { data: specialists, isLoading } = useQuery({
    queryKey: ["home-specialists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .eq("is_active", true)
        .order("rating", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const parseTitle = (title: string) => {
    const match = title.match(/^(.+?)\s+(\S+)\s+(\S+)$/);
    if (match) {
      return { main: match[1], highlight: match[2], suffix: match[3] };
    }
    return { main: title, highlight: "", suffix: "" };
  };

  const titleParts = parseTitle(settings?.home_specialists_title || "متخصصان حرفه‌ای ما");

  return (
    <section className="py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">تیم ما</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {titleParts.main} <span className="gradient-text">{titleParts.highlight}</span> {titleParts.suffix}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {settings?.home_specialists_subtitle || "با بهترین متخصصان زیبایی آشنا شوید"}
          </p>
        </motion.div>

        {/* Specialists Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        ) : specialists && specialists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialists.map((specialist, index) => (
              <motion.div
                key={specialist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl p-6 text-center shadow-card hover-lift cursor-pointer"
                onClick={() => navigate(`/specialists/${specialist.id}`)}
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
                <p className="text-muted-foreground text-sm mb-3">{specialist.title}</p>

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
                    <Button variant="outline" size="sm" className="flex-1" asChild onClick={(e) => e.stopPropagation()}>
                      <a href={specialist.instagram_url} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                  <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); navigate(`/booking?specialist=${specialist.id}`); }}>
                    رزرو نوبت
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            هنوز متخصصی ثبت نشده است
          </div>
        )}
      </div>
    </section>
  );
}
