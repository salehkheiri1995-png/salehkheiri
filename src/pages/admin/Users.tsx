import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Eye, 
  ShoppingCart, 
  Calendar, 
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface UserOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

interface UserBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services?: { name: string } | null;
}

interface UserEnrollment {
  id: string;
  enrolled_at: string;
  progress_percent: number | null;
  courses?: { title: string } | null;
}

interface UserWithDetails extends UserProfile {
  orders: UserOrder[];
  bookings: UserBooking[];
  enrollments: UserEnrollment[];
}

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  confirmed: "تایید شده",
  completed: "انجام شده",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // For each profile, get their orders, bookings, and enrollments
      const usersWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [ordersRes, bookingsRes, enrollmentsRes] = await Promise.all([
            supabase
              .from("orders")
              .select("id, total, status, created_at")
              .eq("user_id", profile.id)
              .order("created_at", { ascending: false })
              .limit(5),
            supabase
              .from("bookings")
              .select("id, booking_date, booking_time, status, services(name)")
              .eq("user_id", profile.id)
              .order("booking_date", { ascending: false })
              .limit(5),
            supabase
              .from("course_enrollments")
              .select("id, enrolled_at, progress_percent, courses(title)")
              .eq("user_id", profile.id)
              .order("enrolled_at", { ascending: false }),
          ]);

          return {
            ...profile,
            orders: ordersRes.data || [],
            bookings: bookingsRes.data || [],
            enrollments: enrollmentsRes.data || [],
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.includes(search) ||
      u.phone?.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8" />
            مدیریت کاربران
          </h1>
          <p className="text-muted-foreground mt-1">
            {users.length} کاربر ثبت‌نام شده
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="جستجوی نام یا شماره تماس..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">در حال بارگذاری...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>نام</TableHead>
                <TableHead>شماره تماس</TableHead>
                <TableHead>سفارشات</TableHead>
                <TableHead>رزروها</TableHead>
                <TableHead>دوره‌ها</TableHead>
                <TableHead>تاریخ عضویت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <Collapsible
                  key={user.id}
                  open={expandedUser === user.id}
                  onOpenChange={(open) => setExpandedUser(open ? user.id : null)}
                  asChild
                >
                  <>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {expandedUser === user.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.full_name || "بدون نام"}
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          {user.orders.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.bookings.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {user.enrollments.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                            locale: faIR,
                          })}
                        </span>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <tr>
                        <td colSpan={7} className="bg-muted/30 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Orders */}
                            <div className="bg-card rounded-xl p-4 border border-border">
                              <h3 className="font-bold mb-3 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-primary" />
                                سفارشات اخیر
                              </h3>
                              {user.orders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">سفارشی ندارد</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.orders.map((order) => (
                                    <div
                                      key={order.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <Badge variant="outline" className="text-xs">
                                        {STATUS_LABELS[order.status] || order.status}
                                      </Badge>
                                      <span className="font-medium">
                                        {formatPrice(order.total)} تومان
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bookings */}
                            <div className="bg-card rounded-xl p-4 border border-border">
                              <h3 className="font-bold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                رزروهای اخیر
                              </h3>
                              {user.bookings.length === 0 ? (
                                <p className="text-sm text-muted-foreground">رزروی ندارد</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.bookings.map((booking) => (
                                    <div
                                      key={booking.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span>{booking.services?.name || "-"}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {STATUS_LABELS[booking.status] || booking.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Enrollments */}
                            <div className="bg-card rounded-xl p-4 border border-border">
                              <h3 className="font-bold mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                دوره‌های ثبت‌نام شده
                              </h3>
                              {user.enrollments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">دوره‌ای ندارد</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.enrollments.map((enrollment) => (
                                    <div
                                      key={enrollment.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="truncate flex-1">
                                        {enrollment.courses?.title || "-"}
                                      </span>
                                      <Badge variant="secondary" className="text-xs mr-2">
                                        {enrollment.progress_percent || 0}%
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
