import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Check, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  booking_date: string;
  booking_time: string;
  notes: string | null;
  status: string;
  created_at: string;
  services?: { name: string } | null;
  specialists?: { full_name: string } | null;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services(name),
          specialists(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "موفق", description: "وضعیت رزرو تغییر کرد" });
      fetchBookings();
    } catch (error: any) {
      toast({ variant: "destructive", title: "خطا", description: error.message });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700">تایید شده</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">لغو شده</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700">انجام شده</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700">در انتظار</Badge>;
    }
  };

  const filteredBookings = bookings.filter(
    (b) =>
      b.customer_name.includes(search) ||
      b.customer_phone.includes(search)
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">مدیریت رزروها</h1>
        <p className="text-muted-foreground mt-1">{bookings.length} رزرو</p>
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
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground">هیچ رزروی یافت نشد</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right p-4 font-medium">مشتری</th>
                <th className="text-right p-4 font-medium">خدمت</th>
                <th className="text-right p-4 font-medium">متخصص</th>
                <th className="text-right p-4 font-medium">تاریخ و ساعت</th>
                <th className="text-right p-4 font-medium">وضعیت</th>
                <th className="text-right p-4 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking, index) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-t border-border hover:bg-muted/30"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{booking.customer_name}</p>
                      <p className="text-sm text-muted-foreground" dir="ltr">
                        {booking.customer_phone}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">{booking.services?.name || "-"}</td>
                  <td className="p-4">{booking.specialists?.full_name || "-"}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDate(booking.booking_date)}</span>
                      <span className="text-muted-foreground">{booking.booking_time}</span>
                    </div>
                  </td>
                  <td className="p-4">{getStatusBadge(booking.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(booking.id, "confirmed")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(booking.id, "cancelled")}
                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(booking.id, "completed")}
                        >
                          انجام شد
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
