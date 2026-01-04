import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Loader2, Package } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { data: settings } = useSalonSettings();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: user?.email || "",
    address: "",
    notes: "",
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const shippingCostAmount = settings?.shipping_cost ? Number(settings.shipping_cost) : 50000;
  const freeShippingThreshold = settings?.free_shipping_threshold ? Number(settings.free_shipping_threshold) : 500000;
  const shippingCost = totalPrice >= freeShippingThreshold ? 0 : shippingCostAmount;
  const finalTotal = totalPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("سبد خرید خالی است");
      return;
    }

    if (!formData.customer_name || !formData.customer_phone || !formData.address) {
      toast.error("لطفاً فیلدهای ضروری را پر کنید");
      return;
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id || null,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          address: formData.address,
          notes: formData.notes || null,
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          total: finalTotal,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Success
      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();
      toast.success("سفارش شما با موفقیت ثبت شد");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("خطا در ثبت سفارش");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container max-w-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-2xl p-8 text-center shadow-card"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">سفارش شما ثبت شد!</h1>
              <p className="text-muted-foreground mb-4">
                کد سفارش: {orderId?.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-muted-foreground mb-8">
                به زودی با شما تماس خواهیم گرفت
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/shop")}>ادامه خرید</Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  بازگشت به خانه
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container text-center py-16">
            <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">سبد خرید خالی است</h1>
            <Button onClick={() => navigate("/shop")}>مشاهده محصولات</Button>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">تکمیل سفارش</h1>
            <p className="text-muted-foreground">اطلاعات ارسال را وارد کنید</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 shadow-card space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">نام و نام خانوادگی *</Label>
                    <Input
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder="علی احمدی"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">شماره تماس *</Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      placeholder="09123456789"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer_email">ایمیل (اختیاری)</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">آدرس کامل *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="استان، شهر، خیابان، پلاک، واحد"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">توضیحات (اختیاری)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="توضیحات اضافی برای سفارش..."
                    rows={2}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      در حال ثبت سفارش...
                    </>
                  ) : (
                    `ثبت سفارش - ${formatPrice(finalTotal)} تومان`
                  )}
                </Button>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-card rounded-2xl p-6 shadow-card sticky top-24">
                <h2 className="font-bold text-lg mb-4">خلاصه سفارش</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=100&h=100&fit=crop"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} عدد</p>
                        <p className="text-sm text-primary font-medium">
                          {formatPrice(item.price * item.quantity)} تومان
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>جمع کالاها</span>
                    <span>{formatPrice(totalPrice)} تومان</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>هزینه ارسال</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">رایگان</span>
                      ) : (
                        `${formatPrice(shippingCost)} تومان`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>مجموع</span>
                    <span className="text-primary">{formatPrice(finalTotal)} تومان</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
