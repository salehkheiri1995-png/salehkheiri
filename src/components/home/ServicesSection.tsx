import { motion } from "framer-motion";
import { ArrowLeft, Scissors, Sparkles, Heart, Sun, Crown, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";

const services = [
  {
    icon: Scissors,
    title: "کوتاهی و مدل مو",
    description: "کوتاهی مو با جدیدترین مدل‌ها توسط متخصصان حرفه‌ای",
    price: "از ۱۵۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop",
  },
  {
    icon: Paintbrush,
    title: "رنگ و هایلایت",
    description: "رنگ مو با بهترین برندها و تکنیک‌های روز دنیا",
    price: "از ۳۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400&h=300&fit=crop",
  },
  {
    icon: Sparkles,
    title: "مراقبت پوست",
    description: "پاکسازی، ماسک صورت و جوانسازی پوست",
    price: "از ۲۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
  },
  {
    icon: Crown,
    title: "آرایش عروس",
    description: "میکاپ حرفه‌ای عروس با بهترین متریال‌ها",
    price: "از ۲,۵۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=400&h=300&fit=crop",
  },
  {
    icon: Sun,
    title: "خدمات ناخن",
    description: "مانیکور، پدیکور و طراحی ناخن",
    price: "از ۱۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=300&fit=crop",
  },
  {
    icon: Heart,
    title: "لیزر و زیبایی",
    description: "خدمات لیزر با پیشرفته‌ترین دستگاه‌ها",
    price: "از ۵۰۰,۰۰۰ تومان",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400&h=300&fit=crop",
  },
];

export function ServicesSection() {
  const { data: settings } = useSalonSettings();
  const navigate = useNavigate();

  const parseTitle = (title: string) => {
    const match = title.match(/^(.+?)\s+(\S+)$/);
    if (match) {
      return { main: match[1], highlight: match[2] };
    }
    return { main: title, highlight: "" };
  };

  const titleParts = parseTitle(settings?.home_services_title || "خدمات زیبایی حرفه‌ای");

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
          <span className="text-primary font-medium mb-4 block">خدمات ما</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {titleParts.main} <span className="gradient-text">{titleParts.highlight}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {settings?.home_services_subtitle || "با تیم متخصص ما، بهترین خدمات زیبایی را تجربه کنید"}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {service.price}
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">{service.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{service.description}</p>
              <Button 
                  variant="ghost" 
                  className="gap-2 p-0 h-auto text-primary hover:text-primary/80"
                  onClick={() => navigate(`/booking?serviceName=${encodeURIComponent(service.title)}`)}
                >
                  رزرو نوبت
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

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
