import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "فاطمه حسینی",
    role: "عروس",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "بهترین تجربه آرایش عروس رو داشتم. خانم احمدی واقعاً حرفه‌ای هستن و دقیقاً همون چیزی که می‌خواستم رو ایجاد کردن.",
    rating: 5,
    service: "آرایش عروس",
  },
  {
    name: "مینا رحیمی",
    role: "طراح مد",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "دوره آموزشی مراقبت پوست عالی بود. تمام نکات کاربردی و عملی آموزش داده شد. به همه توصیه می‌کنم.",
    rating: 5,
    service: "دوره آموزشی",
  },
  {
    name: "سحر کمالی",
    role: "پزشک",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
    content: "محصولاتی که خریدم همه اورجینال و با کیفیت بودن. ارسال هم سریع انجام شد. ممنون از سالن زیبایی.",
    rating: 4,
    service: "خرید محصول",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-charcoal text-white overflow-hidden">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium mb-4 block">نظرات مشتریان</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            مشتریان ما <span className="text-primary">چه می‌گویند</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            رضایت مشتریان، افتخار ماست
          </p>
        </motion.div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 left-6 w-8 h-8 text-primary/30" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? "text-accent fill-accent"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-white/80 mb-6 leading-relaxed">{testimonial.content}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-white/60">{testimonial.service}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
