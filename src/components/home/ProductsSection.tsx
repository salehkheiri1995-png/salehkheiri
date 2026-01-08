import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Heart, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableText } from "@/components/visual-editor/EditableText";
import { EditableSection } from "@/components/visual-editor/EditableSection";

export function ProductsSection() {
  const { addItem, items } = useCart();
  const { data: settings } = useSalonSettings();

  const { data: products, isLoading } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("is_hot", { ascending: false })
        .order("rating", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = (product: NonNullable<typeof products>[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand || "",
      price: Number(product.price),
      image_url: product.image_url,
      stock: product.stock,
    });
    toast.success(`${product.name} به سبد خرید اضافه شد`);
  };

  const isInCart = (id: string) => items.some((item) => item.id === id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <EditableSection pageKey="home" contentKey="products_section" className="py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <EditableText
              pageKey="home"
              contentKey="products_label"
              defaultValue="فروشگاه"
              as="span"
              className="text-primary font-medium mb-4 block"
            />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <EditableText
                pageKey="home"
                contentKey="products_title"
                defaultValue={settings?.home_products_title || "محصولات پرفروش"}
                as="span"
              />
            </h2>
            <EditableText
              pageKey="home"
              contentKey="products_subtitle"
              defaultValue={settings?.home_products_subtitle || "بهترین محصولات زیبایی با ضمانت اصالت کالا"}
              as="p"
              className="text-muted-foreground max-w-2xl"
            />
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link to="/shop">
              مشاهده فروشگاه
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift"
              >
                {/* Image */}
                <Link to={`/shop/${product.id}`} className="relative aspect-square overflow-hidden bg-muted block">
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
                    {product.stock <= 0 && (
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
                </Link>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                  <Link to={`/shop/${product.id}`}>
                    <h3 className="font-bold mb-2 line-clamp-1 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>

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
                      disabled={product.stock <= 0}
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
          <div className="text-center py-12 text-muted-foreground">
            هنوز محصولی ثبت نشده است
          </div>
        )}
      </div>
    </EditableSection>
  );
}
