import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, X } from "lucide-react";
import { portfolioSampleData } from "@/data/portfolioData";

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [useSampleData, setUseSampleData] = useState(false);

  const { data: portfolioItems, isLoading, error } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .eq("is_active", true)
          .order("order_index");
        
        if (error) {
          console.error("Portfolio query error:", error);
          // Use sample data if query fails
          setUseSampleData(true);
          return portfolioSampleData;
        }
        
        // If no data from database, use sample data
        if (!data || data.length === 0) {
          setUseSampleData(true);
          return portfolioSampleData;
        }
        
        return data;
      } catch (err) {
        console.error("Portfolio fetch error:", err);
        setUseSampleData(true);
        return portfolioSampleData;
      }
    },
    retry: false,
  });

  const categories = [
    { id: "all", label: "همه" },
    { id: "hair", label: "مو" },
    { id: "makeup", label: "آرایش" },
    { id: "nail", label: "ناخن" },
    { id: "skin", label: "پوست" },
  ];

  const filteredItems = portfolioItems?.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
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
            {useSampleData && (
              <p className="text-sm text-amber-600 mt-2">
                ℹ️ نمونه داده‌های نمایشی
              </p>
            )}
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
                {filteredItems?.map((item, index) => (
                  <motion.div
                    key={item.id || `${item.category}-${index}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(item.image_url)}
                  >
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop"}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold">{item.title}</h3>
                        {item.description && (
                          <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
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