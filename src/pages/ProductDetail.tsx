import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  ChevronRight,
  Check,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem, items, updateQuantity } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const isInCart = product ? items.some((item) => item.id === product.id) : false;
  const cartItem = product ? items.find((item) => item.id === product.id) : null;

  const allImages = product
    ? [
        product.image_url,
        ...(product.gallery_images || []),
      ].filter(Boolean)
    : [];

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: Number(product.price),
        image_url: product.image_url,
        stock: product.stock,
      });
    }
    toast.success(`${product.name} به سبد خرید اضافه شد`);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-2xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-3/4" />
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container text-center py-16">
            <h1 className="text-2xl font-bold mb-4">محصول یافت نشد</h1>
            <Button asChild>
              <Link to="/shop">بازگشت به فروشگاه</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link to="/" className="hover:text-primary">خانه</Link>
            <ArrowRight className="w-4 h-4" />
            <Link to="/shop" className="hover:text-primary">فروشگاه</Link>
            <ArrowRight className="w-4 h-4" />
            <span className="text-foreground">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    src={allImages[currentImageIndex] || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=800&fit=crop"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 flex items-center justify-center hover:bg-background transition-colors shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
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
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${
                        currentImageIndex === index
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {product.brand && (
                <p className="text-muted-foreground">{product.brand}</p>
              )}

              <h1 className="text-3xl font-bold">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(Number(product.rating))
                          ? "text-accent fill-accent"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{Number(product.rating).toFixed(1)}</span>
                <span className="text-muted-foreground">({product.reviews_count} نظر)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(Number(product.price))} تومان
                </span>
                {product.original_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(Number(product.original_price))} تومان
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">موجودی:</span>
                <span className={product.stock > 0 ? "text-green-600" : "text-destructive"}>
                  {product.stock > 0 ? `${product.stock} عدد` : "ناموجود"}
                </span>
              </div>

              {/* Quantity & Add to Cart */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4">
                  {!isInCart && (
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}

                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    {isInCart ? (
                      <>
                        <Check className="w-5 h-5 ml-2" />
                        در سبد خرید
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        افزودن به سبد خرید
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isInCart && cartItem && (
                <div className="bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                  <span>{cartItem.quantity} عدد در سبد خرید</span>
                  <Button asChild variant="outline">
                    <Link to="/cart">مشاهده سبد خرید</Link>
                  </Button>
                </div>
              )}

              {/* Category */}
              {product.category && (
                <div className="pt-4 border-t">
                  <span className="text-muted-foreground">دسته‌بندی: </span>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
