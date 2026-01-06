import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface StatsData {
  totalOrders: number;
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalCourses: number;
  totalProducts: number;
  pendingOrders: number;
  pendingBookings: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  user?: { full_name: string | null };
}

interface RecentBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services?: { name: string } | null;
  user?: { full_name: string | null };
}

interface RecentUser {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  confirmed: "تایید شده",
  completed: "انجام شده",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData>({
    totalOrders: 0,
    totalRevenue: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalCourses: 0,
    totalProducts: 0,
    pendingOrders: 0,
    pendingBookings: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const [orders, bookings, users, courses, products] = await Promise.all([
        supabase.from("orders").select("id, total, status, created_at", { count: "exact" }),
        supabase.from("bookings").select("id, status", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }),
      ]);

      const totalRevenue = orders.data?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0;
      const pendingOrders = orders.data?.filter((o: any) => o.status === "pending").length || 0;
      const pendingBookings = bookings.data?.filter((b: any) => b.status === "pending").length || 0;

      setStats({
        totalOrders: orders.count || 0,
        totalRevenue,
        totalBookings: bookings.count || 0,
        totalUsers: users.count || 0,
        totalCourses: courses.count || 0,
        totalProducts: products.count || 0,
        pendingOrders,
        pendingBookings,
      });

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentOrders(ordersData || []);

      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, booking_date, booking_time, status, services(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentBookings(bookingsData || []);

      // Fetch recent users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const statCards = [
    {
      title: "سفارشات",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      trend: "+۱۲%",
      isPositive: true,
    },
    {
      title: "درآمد کل",
      value: `${formatPrice(stats.totalRevenue)} تومان`,
      icon: DollarSign,
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
      trend: "+۲۳%",
      isPositive: true,
    },
    {
      title: "رزروها",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      trend: "-۵%",
      isPositive: false,
    },
    {
      title: "کاربران",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      trend: "+۳۵%",
      isPositive: true,
    },
    {
      title: "دوره‌ها",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
      trend: "+۸%",
      isPositive: true,
    },
    {
      title: "محصولات",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
      trend: "+۱۵%",
      isPositive: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">داشبورد</h1>
        <p className="text-muted-foreground mt-1 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          خوش آمدید! نمای کلی سالن زیبایی
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-xs flex items-center gap-1 ${
                      stat.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      {stat.isPositive ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3" />
                      )}
                      {stat.trend} نسبت به ماه قبل
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                آخرین سفارشات
              </CardTitle>
              <CardDescription>{stats.totalOrders} سفارش ثبت شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-4">سفارشی ندارد</p>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), {
                          addSuffix: true,
                          locale: faIR,
                        })}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(order.total)}
                      </p>
                      <Badge className={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                آخرین رزروها
              </CardTitle>
              <CardDescription>{stats.totalBookings} رزرو ثبت شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-4">رزروی ندارد</p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {booking.services?.name || "خدمت"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.booking_date} - {booking.booking_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={STATUS_COLORS[booking.status]}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                کاربران جدید
              </CardTitle>
              <CardDescription>{stats.totalUsers} کاربر ثبت‌نام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUsers.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-4">کاربری ندارد</p>
              ) : (
                recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {user.full_name || "بدون نام"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.phone || "-"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground text-left">
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: faIR,
                      })}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>عملیات سریع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/admin/users")}
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">کاربران</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/admin/orders")}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden md:inline">سفارشات</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/admin/bookings")}
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">رزروها</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/admin/courses")}
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden md:inline">دوره‌ها</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/admin/products")}
              >
                <Package className="w-4 h-4" />
                <span className="hidden md:inline">محصولات</span>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/admin/settings")}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden md:inline">تنظیمات</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}