import { motion } from "framer-motion";
import { ShoppingCart, Heart, Star, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function Shop() {
  const { addItem, items } = useCart();
  
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
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

  const handleAddToCart = (product: NonNullable<typeof products>[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: Number(product.price),
      image_url: product.image_url,
      stock: product.stock,
    });
    toast.success(`${product.name} به سبد خرید اضافه شد`);
  };

  const isInCart = (productId: string) => items.some((item) => item.id === productId);

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
            <span className="text-primary font-medium mb-4 block">فروشگاه</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              محصولات <span className="gradient-text">زیبایی</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              بهترین محصولات زیبایی با ضمانت اصالت کالا
            </p>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {product.is_hot && (
                        <Badge className="bg-destructive text-destructive-foreground">پرفروش</Badge>
                      )}
                      {product.stock === 0 && (
                        <Badge variant="secondary">ناموجود</Badge>
                      )}
                      {product.original_price && (
                        <Badge className="bg-accent text-accent-foreground">تخفیف</Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-9 h-9 rounded-full bg-background/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="font-bold mb-2 line-clamp-1">{product.name}</h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <span className="text-sm font-medium">{Number(product.rating).toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
                    </div>

                    {/* Price & Cart */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-primary">{formatPrice(Number(product.price))}</span>
                        {product.original_price && (
                          <span className="text-xs text-muted-foreground line-through mr-2">
                            {formatPrice(Number(product.original_price))}
                          </span>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant={isInCart(product.id) ? "default" : "ghost"}
                        className="h-9 w-9"
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product)}
                      >
                        {isInCart(product.id) ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">هنوز محصولی اضافه نشده است</p>
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
