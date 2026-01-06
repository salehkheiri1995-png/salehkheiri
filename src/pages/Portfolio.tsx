import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";

// Sample data with id field - fallback only
const portfolioSampleData = [
  {
    id: "1",
    title: "آرایش عروس لاکچری",
    category: "makeup",
    description: "آرایش مدرن و الگان برای عروسی",
    image_url: "https://images.unsplash.com/photo-1607746882042-f3978991f23e?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 1,
    is_active: true,
  },
  {
    id: "2",
    title: "رنگ و مو طبیعی",
    category: "hair",
    description: "سبک مو زنانه مدرن",
    image_url: "https://images.unsplash.com/photo-1562599810-d0d1c27c9ae5?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 2,
    is_active: true,
  },
  {
    id: "3",
    title: "طراحی ناخن ژله‌ای",
    category: "nail",
    description: "رنگ های مختلف و طرح های جدید",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 3,
    is_active: true,
  },
  {
    id: "4",
    title: "درمان پوست صورت",
    category: "skin",
    description: "تمیزکاری و درمان پوست حساس",
    image_url: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 4,
    is_active: true,
  },
  {
    id: "5",
    title: "موج و فر طبیعی",
    category: "hair",
    description: "بوکل های صحیح و طبیعی",
    image_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 5,
    is_active: true,
  },
  {
    id: "6",
    title: "آرایش شام برای مهمانی",
    category: "makeup",
    description: "آرایش درخشان برای شب",
    image_url: "https://images.unsplash.com/photo-1529148482759-b3997e4ea767?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 6,
    is_active: true,
  },
  {
    id: "7",
    title: "طراحی ناخن مینیمالیست",
    category: "nail",
    description: "طرح ساده و شیک",
    image_url: "https://images.unsplash.com/photo-1610992015732-2449ec28227c?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 7,
    is_active: true,
  },
  {
    id: "8",
    title: "بلیچ و رنگ مو",
    category: "hair",
    description: "تبدیل رنگ مو به سایه‌های روشن",
    image_url: "https://images.unsplash.com/photo-1563458500-4b20c6cb4c9b?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 8,
    is_active: true,
  },
  {
    id: "9",
    title: "پاکسازی و مراقبت پوست",
    category: "skin",
    description: "پروتکل مراقبت کامل پوست",
    image_url: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 9,
    is_active: true,
  },
  {
    id: "10",
    title: "آرایش روزمره طبیعی",
    category: "makeup",
    description: "آرایش روزانه برای محیط کار",
    image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 10,
    is_active: true,
  },
  {
    id: "11",
    title: "ناخن کریستالی براق",
    category: "nail",
    description: "ناخن براق و درخشان",
    image_url: "https://images.unsplash.com/photo-1600797260371-e80fcca6a472?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 11,
    is_active: true,
  },
  {
    id: "12",
    title: "اصلاح ابرو حرفه‌ای",
    category: "makeup",
    description: "فرم‌دهی و رنگ ابرو",
    image_url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?ixlib=rb-4.0.3&w=500&h=500&fit=crop",
    order_index: 12,
    is_active: true,
  },
];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .eq("is_active", true)
          .order("order_index");
        
        // اگر Database خالی بود یا خطا داشت، از Sample Data استفاده کن
        if (error) {
          console.warn("Database fetch failed, using sample data", error);
          return portfolioSampleData;
        }
        
        if (!data || data.length === 0) {
          console.info("No portfolio items in database, using sample data");
          return portfolioSampleData;
        }
        
        return data;
      } catch (err) {
        console.error("Portfolio fetch error:", err);
        return portfolioSampleData;
      }
    },
    retry: 1,
  });

  const categories = [
    { id: "all", label: "همه" },
    { id: "hair", label: "مو" },
    { id: "makeup", label: "آرایش" },
    { id: "nail", label: "ناخن" },
    { id: "skin", label: "پوست" },
  ];

  const filteredItems = portfolioItems?.filter(
    (item: any) => selectedCategory === "all" || item.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">نمونه‌کارها</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              مجموعه‌ای از بهترین کارهای انجام شده توسط متخصصین ما
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          )}

          {/* Portfolio Grid */}
          {!isLoading && (
            <motion.div 
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              <AnimatePresence>
                {filteredItems?.map((item: any, index: number) => (
                  <motion.div
                    key={item.id || `${item.category}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted"
                    onClick={() => setSelectedImage(item.image_url)}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&w=500&h=500&fit=crop";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-sm">{item.title}</h3>
                        {item.description && (
                          <p className="text-white/80 text-xs line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && (!filteredItems || filteredItems.length === 0) && (
            <div className="text-center py-16">
              <Camera className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">نمونه‌کاری یافت نشد</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? "هنوز نمونه‌کاری اضافه نشده است"
                  : "در این دسته‌بندی نمونه‌کاری وجود ندارد"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Portfolio"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}