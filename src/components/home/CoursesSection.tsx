import { motion } from "framer-motion";
import { ArrowLeft, Clock, Users, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useSalonSettings } from "@/hooks/useSalonSettings";

const courses = [
  {
    title: "دوره جامع آرایش عروس",
    instructor: "سارا احمدی",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop",
    duration: "۴۰ ساعت",
    students: 234,
    rating: 4.9,
    price: "۲,۵۰۰,۰۰۰",
    originalPrice: "۳,۵۰۰,۰۰۰",
    level: "پیشرفته",
    isNew: true,
  },
  {
    title: "آموزش مراقبت پوست",
    instructor: "نیلوفر رضایی",
    image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&h=400&fit=crop",
    duration: "۲۵ ساعت",
    students: 456,
    rating: 4.8,
    price: "۱,۸۰۰,۰۰۰",
    originalPrice: null,
    level: "متوسط",
    isNew: false,
  },
  {
    title: "دوره تخصصی کراتین و احیا مو",
    instructor: "مریم کریمی",
    image: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=600&h=400&fit=crop",
    duration: "۱۵ ساعت",
    students: 178,
    rating: 4.7,
    price: "۱,۲۰۰,۰۰۰",
    originalPrice: "۱,۵۰۰,۰۰۰",
    level: "مبتدی",
    isNew: false,
  },
];

export function CoursesSection() {
  const { data: settings } = useSalonSettings();

  const parseTitle = (title: string) => {
    const match = title.match(/^(.+?)\s+(\S+)\s+(.+)$/);
    if (match) {
      return { main: match[1], highlight: match[2], suffix: match[3] };
    }
    return { main: title, highlight: "", suffix: "" };
  };

  const titleParts = parseTitle(settings?.home_courses_title || "آموزش حرفه‌ای زیبایی");

  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-medium mb-4 block">دوره‌های آموزشی</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {titleParts.main} <span className="gradient-text">{titleParts.highlight}</span> {titleParts.suffix}
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {settings?.home_courses_subtitle || "با دوره‌های تخصصی ما، مهارت‌های زیبایی خود را ارتقا دهید"}
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link to="/courses">
              همه دوره‌ها
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {course.isNew && (
                    <Badge className="bg-accent text-accent-foreground">جدید</Badge>
                  )}
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">مدرس: {course.instructor}</p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.students} دانشجو
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-accent" />
                    {course.rating}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary">{course.price} تومان</span>
                    {course.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {course.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button size="sm" asChild>
                    <Link to="/courses">ثبت‌نام</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
