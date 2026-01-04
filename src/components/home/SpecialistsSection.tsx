import { motion } from "framer-motion";
import { Star, Instagram, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";

const specialists = [
  {
    name: "سارا احمدی",
    role: "متخصص آرایش عروس",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviews: 328,
    experience: 12,
  },
  {
    name: "نیلوفر رضایی",
    role: "متخصص مراقبت پوست",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    rating: 4.8,
    reviews: 256,
    experience: 8,
  },
  {
    name: "مریم کریمی",
    role: "متخصص رنگ و کوتاهی",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    rating: 4.9,
    reviews: 412,
    experience: 15,
  },
  {
    name: "زهرا محمدی",
    role: "متخصص ناخن و پدیکور",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    rating: 4.7,
    reviews: 189,
    experience: 6,
  },
];

export function SpecialistsSection() {
  const { data: settings } = useSalonSettings();
  const navigate = useNavigate();

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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialists.map((specialist, index) => (
            <motion.div
              key={specialist.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl p-6 text-center shadow-card hover-lift"
            >
              {/* Avatar */}
              <div className="relative w-28 h-28 mx-auto mb-4">
                <img
                  src={specialist.image}
                  alt={specialist.name}
                  className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                />
                <div className="absolute -bottom-2 -left-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>

              {/* Info */}
              <h3 className="text-lg font-bold mb-1">{specialist.name}</h3>
              <p className="text-muted-foreground text-sm mb-3">{specialist.role}</p>

              {/* Rating */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="font-medium">{specialist.rating}</span>
                <span className="text-muted-foreground text-sm">({specialist.reviews} نظر)</span>
              </div>

              {/* Experience */}
              <p className="text-sm text-muted-foreground mb-4">
                {specialist.experience} سال تجربه
              </p>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button size="sm" className="flex-1" onClick={() => navigate(`/booking?specialistName=${encodeURIComponent(specialist.name)}`)}>
                  رزرو نوبت
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
