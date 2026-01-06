import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingCart,
  Calendar,
  BookOpen,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items?: any[];
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services?: { name: string; id: string } | null;
  notes?: string;
}

interface Enrollment {
  id: string;
  enrolled_at: string;
  progress_percent: number | null;
  courses?: { title: string; id: string } | null;
  status?: string;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  email?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  confirmed: "تایید شده",
  completed: "انجام شده",
  failed: "ناموفق",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-500/20 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-500/20 text-green-700 dark:text-green-400",
  cancelled: "bg-red-500/20 text-red-700 dark:text-red-400",
  confirmed: "bg-green-500/20 text-green-700 dark:text-green-400",
  completed: "bg-green-500/20 text-green-700 dark:text-green-400",
  failed: "bg-red-500/20 text-red-700 dark:text-red-400",
};

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const [orderStatusDialogOpen, setOrderStatusDialogOpen] = useState(false);
  const [bookingStatusDialogOpen, setBookingStatusDialogOpen] = useState(false);
  const [enrollmentStatusDialogOpen, setEnrollmentStatusDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'order' | 'booking' | 'enrollment' | null>(null);

  const [newStatus, setNewStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setUser(profileData);

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;
      setOrders(ordersData || []);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*, services(name, id)")
        .eq("user_id", userId)
        .order("booking_date", { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select("*, courses(title, id)")
        .eq("user_id", userId)
        .order("enrolled_at", { ascending: false });

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("خطا در دریافت اطلاعات کاربر");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast.success("وضعیت سفارش تغییر یافت");
      setOrderStatusDialogOpen(false);
      setSelectedOrder(null);
      setNewStatus("");
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("خطا در تغییر وضعیت");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBookingStatus = async () => {
    if (!selectedBooking || !newStatus) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status: newStatus })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      toast.success("وضعیت رزرو تغییر یافت");
      setBookingStatusDialogOpen(false);
      setSelectedBooking(null);
      setNewStatus("");
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("خطا در تغییر وضعیت");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEnrollmentProgress = async () => {
    if (!selectedEnrollment || !newStatus) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .update({ progress_percent: parseInt(newStatus) })
        .eq("id", selectedEnrollment.id);

      if (error) throw error;

      toast.success("پیشرفت دوره تغییر یافت");
      setEnrollmentStatusDialogOpen(false);
      setSelectedEnrollment(null);
      setNewStatus("");
      fetchUserDetails();
    } catch (error) {
      console.error("Error updating enrollment:", error);
      toast.error("خطا در تغییر پیشرفت");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteType || !selectedOrder && !selectedBooking && !selectedEnrollment) return;

    setIsSubmitting(true);
    try {
      if (deleteType === "order" && selectedOrder) {
        const { error } = await supabase
          .from("orders")
          .delete()
          .eq("id", selectedOrder.id);
        if (error) throw error;
        toast.success("سفارش حذف شد");
      } else if (deleteType === "booking" && selectedBooking) {
        const { error } = await supabase
          .from("bookings")
          .delete()
          .eq("id", selectedBooking.id);
        if (error) throw error;
        toast.success("رزرو حذف شد");
      } else if (deleteType === "enrollment" && selectedEnrollment) {
        const { error } = await supabase
          .from("course_enrollments")
          .delete()
          .eq("id", selectedEnrollment.id);
        if (error) throw error;
        toast.success("ثبت‌نام حذف شد");
      }

      setDeleteDialogOpen(false);
      setSelectedOrder(null);
      setSelectedBooking(null);
      setSelectedEnrollment(null);
      setDeleteType(null);
      fetchUserDetails();
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("خطا در حذف");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/users")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{user?.full_name || "بدون نام"}</h1>
              <p className="text-muted-foreground">{user?.phone || "بدون شماره تماس"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Orders Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-2xl font-bold">سفارشات ({orders.length})</h2>
          </div>

          {orders.length === 0 ? (
            <div className="border border-border rounded-lg p-6 text-center text-muted-foreground">
              سفارشی ندارد
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">سفارش #{order.id.slice(0, 8)}</span>
                        <Badge className={STATUS_COLORS[order.status]}>
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        {formatPrice(order.total)} تومان
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                          locale: faIR,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setOrderStatusDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        تغییر وضعیت
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedOrder(order);
                          setDeleteType("order");
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bookings Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <h2 className="text-2xl font-bold">رزروها ({bookings.length})</h2>
          </div>

          {bookings.length === 0 ? (
            <div className="border border-border rounded-lg p-6 text-center text-muted-foreground">
              رزروی ندارد
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground">رزرو #{booking.id.slice(0, 8)}</span>
                        <Badge className={STATUS_COLORS[booking.status]}>
                          {STATUS_LABELS[booking.status] || booking.status}
                        </Badge>
                      </div>
                      <p className="text-lg font-semibold text-foreground mb-1">
                        {booking.services?.name || "خدمت نامشخص"}
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>تاریخ: {booking.booking_date}</p>
                        <p>ساعت: {booking.booking_time}</p>
                        {booking.notes && <p>یادداشت: {booking.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setNewStatus(booking.status);
                          setBookingStatusDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        تغییر وضعیت
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setDeleteType("booking");
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Enrollments Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-2xl font-bold">دوره‌های ثبت‌نام شده ({enrollments.length})</h2>
          </div>

          {enrollments.length === 0 ? (
            <div className="border border-border rounded-lg p-6 text-center text-muted-foreground">
              دوره‌ای ثبت‌نام نکرده
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-foreground mb-2">
                        {enrollment.courses?.title || "دوره نامشخص"}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">پیشرفت:</span>
                          <div className="flex-1 bg-muted rounded-full h-2 max-w-xs overflow-hidden">
                            <div
                              className="bg-green-500 h-full transition-all"
                              style={{
                                width: `${enrollment.progress_percent || 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {enrollment.progress_percent || 0}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          ثبت‌نام: {formatDistanceToNow(new Date(enrollment.enrolled_at), {
                            addSuffix: true,
                            locale: faIR,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setNewStatus(String(enrollment.progress_percent || 0));
                          setEnrollmentStatusDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        تغییر پیشرفت
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedEnrollment(enrollment);
                          setDeleteType("enrollment");
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Order Status Dialog */}
      <Dialog open={orderStatusDialogOpen} onOpenChange={setOrderStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغییر وضعیت سفارش</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">در انتظار</SelectItem>
                <SelectItem value="processing">در حال پردازش</SelectItem>
                <SelectItem value="shipped">ارسال شده</SelectItem>
                <SelectItem value="delivered">تحویل شده</SelectItem>
                <SelectItem value="cancelled">لغو شده</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateOrderStatus}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              تایید تغییر
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Status Dialog */}
      <Dialog open={bookingStatusDialogOpen} onOpenChange={setBookingStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغییر وضعیت رزرو</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">در انتظار</SelectItem>
                <SelectItem value="confirmed">تایید شده</SelectItem>
                <SelectItem value="completed">انجام شده</SelectItem>
                <SelectItem value="cancelled">لغو شده</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleUpdateBookingStatus}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              تایید تغییر
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enrollment Progress Dialog */}
      <Dialog open={enrollmentStatusDialogOpen} onOpenChange={setEnrollmentStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغییر درصد پیشرفت</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="number"
              min="0"
              max="100"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md"
              placeholder="0-100"
            />
            <Button
              onClick={handleUpdateEnrollmentProgress}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              تایید تغییر
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}