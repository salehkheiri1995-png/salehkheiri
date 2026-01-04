import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Check, X, Clock, Eye, Package, Truck, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportToExcel, formatOrdersForExport } from "@/lib/excelExport";
import { SendNotificationDialog } from "@/components/admin/SendNotificationDialog";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
  shipping_methods?: { name: string } | null;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          shipping_methods(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "موفق", description: "وضعیت سفارش تغییر کرد" });
      fetchOrders();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">تایید شده</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-700">در حال آماده‌سازی</Badge>;
      case "shipped":
        return <Badge className="bg-purple-100 text-purple-700">ارسال شده</Badge>;
      case "delivered":
        return <Badge className="bg-emerald-100 text-emerald-700">تحویل داده شده</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">لغو شده</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700">در انتظار</Badge>;
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.customer_name.includes(search) ||
      o.customer_phone.includes(search)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const handleExport = () => {
    const exportData = formatOrdersForExport(filteredOrders);
    exportToExcel(exportData, `سفارشات-${new Date().toLocaleDateString('fa-IR')}`, 'سفارشات');
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مدیریت سفارشات</h1>
          <p className="text-muted-foreground mt-1">{orders.length} سفارش</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            خروجی Excel
          </Button>
          <SendNotificationDialog />
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="جستجو بر اساس نام یا شماره..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-11"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">هیچ سفارشی یافت نشد</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right">مشتری</TableHead>
                <TableHead className="text-right">تعداد اقلام</TableHead>
                <TableHead className="text-right">مبلغ کل</TableHead>
                <TableHead className="text-right">روش ارسال</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {order.customer_phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.order_items?.length || 0} محصول</TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(order.total)} تومان
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      {order.shipping_methods?.name || "نامشخص"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(order.id, "confirmed")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(order.id, "cancelled")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {order.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(order.id, "processing")}
                        >
                          آماده‌سازی
                        </Button>
                      )}
                      {order.status === "processing" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(order.id, "shipped")}
                        >
                          ارسال شد
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(order.id, "delivered")}
                        >
                          تحویل شد
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>جزئیات سفارش</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">مشتری</p>
                  <p className="font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">شماره تماس</p>
                  <p className="font-medium" dir="ltr">{selectedOrder.customer_phone}</p>
                </div>
                {selectedOrder.customer_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">ایمیل</p>
                    <p className="font-medium">{selectedOrder.customer_email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">تاریخ</p>
                  <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">آدرس</p>
                <p className="p-3 bg-muted rounded-lg">{selectedOrder.address}</p>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">یادداشت</p>
                  <p className="p-3 bg-muted rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-3">محصولات</p>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} عدد × {formatPrice(item.product_price)} تومان
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.total)} تومان</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">جمع اقلام:</span>
                  <span>{formatPrice(selectedOrder.subtotal)} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">هزینه ارسال:</span>
                  <span>{formatPrice(selectedOrder.shipping_cost)} تومان</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>مبلغ کل:</span>
                  <span className="text-primary">{formatPrice(selectedOrder.total)} تومان</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
