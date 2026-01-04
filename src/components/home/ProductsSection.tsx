import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Heart, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const products = [
  {
    name: "سرم ویتامین C",
    brand: "اوردینری",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
    price: "۳۵۰,۰۰۰",
    originalPrice: "۴۵۰,۰۰۰",
    rating: 4.8,
    reviews: 124,
    inStock: true,
    isHot: true,
  },
  {
    name: "ماسک مو کراتین",
    brand: "کراتین کمپلکس",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop",
    price: "۲۸۰,۰۰۰",
    originalPrice: null,
    rating: 4.6,
    reviews: 89,
    inStock: true,
    isHot: false,
  },
  {
    name: "کرم ضد آفتاب SPF50",
    brand: "لاروش پوزای",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    price: "۴۲۰,۰۰۰",
    originalPrice: null,
    rating: 4.9,
    reviews: 256,
    inStock: true,
    isHot: false,
  },
  {
    name: "لاک ژل UV",
    brand: "او پی آی",
    image: "https://images.unsplash.com/photo-1585128792020-803d29415281?w=400&h=400&fit=crop",
    price: "۱۸۰,۰۰۰",
    originalPrice: "۲۲۰,۰۰۰",
    rating: 4.5,
    reviews: 67,
    inStock: false,
    isHot: false,
  },
];

export function ProductsSection() {
  const { addItem, items } = useCart();

  const handleAddToCart = (product: typeof products[0]) => {
    addItem({
      id: product.name,
      name: product.name,
      brand: product.brand,
      price: parseInt(product.price.replace(/[^0-9]/g, "")),
      image_url: product.image,
      stock: product.inStock ? 10 : 0,
    });
    toast.success(`${product.name} به سبد خرید اضافه شد`);
  };

  const isInCart = (name: string) => items.some((item) => item.id === name);

  return (
    <section className="py-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-primary font-medium mb-4 block">فروشگاه</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              محصولات <span className="gradient-text">پرفروش</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              بهترین محصولات زیبایی با ضمانت اصالت کالا
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link to="/shop">
              مشاهده فروشگاه
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Badges */}
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  {product.isHot && (
                    <Badge className="bg-destructive text-destructive-foreground">پرفروش</Badge>
                  )}
                  {!product.inStock && (
                    <Badge variant="secondary">ناموجود</Badge>
                  )}
                  {product.originalPrice && (
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
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                {/* Price & Cart */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-muted-foreground line-through mr-2">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant={isInCart(product.name) ? "default" : "ghost"}
                    className="h-9 w-9"
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    {isInCart(product.name) ? (
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
      </div>
    </section>
  );
}
