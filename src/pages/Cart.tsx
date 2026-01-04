import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/useCart";
import { Link } from "react-router-dom";

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const shippingCost = totalPrice > 500000 ? 0 : 50000;
  const finalTotal = totalPrice + shippingCost;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">سبد خرید</h1>
            <p className="text-muted-foreground">
              {items.length > 0
                ? `${items.length} محصول در سبد خرید شما`
                : "سبد خرید شما خالی است"}
            </p>
          </motion.div>

          {items.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-2xl p-4 flex gap-4 shadow-card"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img
                        src={
                          item.image_url ||
                          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop"
                        }
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{item.brand}</p>
                      <h3 className="font-bold truncate">{item.name}</h3>
                      <p className="text-primary font-bold mt-1">
                        {formatPrice(item.price)} تومان
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-6 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={clearCart}
                >
                  <Trash2 className="w-4 h-4 ml-2" />
                  پاک کردن سبد خرید
                </Button>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-card rounded-2xl p-6 shadow-card sticky top-24"
                >
                  <h2 className="font-bold text-lg mb-6">خلاصه سفارش</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>جمع کالاها ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                      <span>{formatPrice(totalPrice)} تومان</span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>هزینه ارسال</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">رایگان</span>
                        ) : (
                          `${formatPrice(shippingCost)} تومان`
                        )}
                      </span>
                    </div>

                    {shippingCost > 0 && (
                      <p className="text-xs text-muted-foreground">
                        برای ارسال رایگان {formatPrice(500000 - totalPrice)} تومان دیگر خرید کنید
                      </p>
                    )}

                    <div className="border-t pt-4">
                      <div className="flex justify-between font-bold text-lg">
                        <span>مجموع</span>
                        <span className="text-primary">
                          {formatPrice(finalTotal)} تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    تکمیل سفارش
                  </Button>

                  <Button asChild variant="outline" className="w-full mt-3">
                    <Link to="/shop">
                      ادامه خرید
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <ShoppingBag className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-2">سبد خرید شما خالی است</h2>
              <p className="text-muted-foreground mb-6">
                محصولات مورد علاقه خود را به سبد خرید اضافه کنید
              </p>
              <Button asChild size="lg">
                <Link to="/shop">مشاهده محصولات</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
