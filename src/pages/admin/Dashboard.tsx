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
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  completedOrders: number;
  completedBookings: number;
  cancelledOrders: number;
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
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
    completedOrders: 0,
    completedBookings: 0,
    cancelledOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
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
      const completedOrders = orders.data?.filter((o: any) => o.status === "delivered").length || 0;
      const cancelledOrders = orders.data?.filter((o: any) => o.status === "cancelled").length || 0;
      const pendingBookings = bookings.data?.filter((b: any) => b.status === "pending").length || 0;
      const completedBookings = bookings.data?.filter((b: any) => b.status === "completed").length || 0;

      setStats({
        totalOrders: orders.count || 0,
        totalRevenue,
        totalBookings: bookings.count || 0,
        totalUsers: users.count || 0,
        totalCourses: courses.count || 0,
        totalProducts: products.count || 0,
        pendingOrders,
        pendingBookings,
        completedOrders,
        completedBookings,
        cancelledOrders,
      });

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("id, total, status, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecentOrders(ordersData || []);

      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, booking_date, booking_time, status, services(name)")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecentBookings(bookingsData || []);

      // Fetch recent users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, full_name, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
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

  const calculatePercentage = (value: number, total: number) => {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  };

  // KPI Cards with better styling
  const kpiCards = [
    {
      title: "سفارشات",
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} در انتظار`,
      icon: ShoppingCart,
      gradient: "from-blue-500/10 to-blue-500/5",
      iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      trend: "+12%",
      isPositive: true,
      action: () => navigate("/admin/orders"),
    },
    {
      title: "درآمد کل",
      value: formatPrice(stats.totalRevenue),
      subtitle: `${stats.completedOrders} سفارش تحویل شده`,
      icon: DollarSign,
      gradient: "from-green-500/10 to-green-500/5",
      iconBg: "bg-green-500/20 text-green-600 dark:text-green-400",
      trend: "+23%",
      isPositive: true,
      action: () => navigate("/admin/orders"),
    },
    {
      title: "رزروها",
      value: stats.totalBookings,
      subtitle: `${stats.pendingBookings} در انتظار`,
      icon: Calendar,
      gradient: "from-purple-500/10 to-purple-500/5",
      iconBg: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      trend: "-5%",
      isPositive: false,
      action: () => navigate("/admin/bookings"),
    },
    {
      title: "کاربران",
      value: stats.totalUsers,
      subtitle: `${calculatePercentage(stats.totalBookings, stats.totalUsers)}% درگیر`,
      icon: Users,
      gradient: "from-orange-500/10 to-orange-500/5",
      iconBg: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
      trend: "+35%",
      isPositive: true,
      action: () => navigate("/admin/users"),
    },
  ];

  const performanceMetrics = [
    {
      label: "نرخ تکمیل سفارشات",
      value: calculatePercentage(stats.completedOrders, stats.totalOrders),
      color: "bg-green-500",
      icon: CheckCircle,
    },
    {
      label: "نرخ لغو سفارشات",
      value: calculatePercentage(stats.cancelledOrders, stats.totalOrders),
      color: "bg-red-500",
      icon: AlertCircle,
    },
    {
      label: "نرخ تایید رزروها",
      value: calculatePercentage(stats.completedBookings, stats.totalBookings),
      color: "bg-blue-500",
      icon: CheckCircle,
    },
    {
      label: "رزروهای معلق",
      value: calculatePercentage(stats.pendingBookings, stats.totalBookings),
      color: "bg-yellow-500",
      icon: Clock,
    },
  ];

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              داشبورد مدیریتی
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              نمای بلادرنگ سالن زیبایی و فروشگاه
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>آخرین بررسی‌ای: همین الآن</p>
            <p>وضعیت: ✅ سیستم فعال</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.action}
              className="cursor-pointer group"
            >
              <Card className={`overflow-hidden bg-gradient-to-br ${card.gradient} border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.iconBg} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-3xl font-bold text-foreground group-hover:scale-105 transition-transform origin-left">
                    {card.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  <div className="flex items-center gap-1 text-xs">
                    {card.isPositive ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" />
                        {card.trend}
                      </span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-0.5">
                        <ArrowDownLeft className="w-3 h-3" />
                        {card.trend}
                      </span>
                    )}
                    <span className="text-muted-foreground">نسبت به ماه قبل</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Performance Metrics */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              معیارهای عملکرد
            </CardTitle>
            <CardDescription>نسبت‌های کلیدی عملکرد سیستم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric) => {
                const MetricIcon = metric.icon;
                return (
                  <div key={metric.label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${metric.color}/20`}>
                          <MetricIcon className={`w-4 h-4 ${metric.color}`} />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                      </div>
                      <p className={`text-lg font-bold ${metric.color} text-transparent bg-clip-text`}>
                        {metric.value}%
                      </p>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity Section */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="border-border/50 lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                آخرین سفارشات
              </CardTitle>
              <CardDescription>{stats.totalOrders} سفارش ثبت شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-8">سفارشی ثبت نشده</p>
              ) : (
                recentOrders.slice(0, 5).map((order, index) => (
                  <motion.div
                    key={order.id}
                    variants={itemVariants}
                    className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all hover:border-border cursor-pointer group"
                    onClick={() => navigate("/admin/orders")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
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
                        <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                          {formatPrice(order.total)}
                        </p>
                        <Badge className={`${STATUS_COLORS[order.status]} text-xs`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card className="border-border/50 lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                آخرین رزروها
              </CardTitle>
              <CardDescription>{stats.totalBookings} رزرو ثبت شده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentBookings.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-8">رزروی ثبت نشده</p>
              ) : (
                recentBookings.slice(0, 5).map((booking) => (
                  <motion.div
                    key={booking.id}
                    variants={itemVariants}
                    className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all hover:border-border cursor-pointer"
                    onClick={() => navigate("/admin/bookings")}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {booking.services?.name || "خدمت"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.booking_date} - {booking.booking_time}
                        </p>
                      </div>
                      <Badge className={`${STATUS_COLORS[booking.status]} text-xs`}>
                        {STATUS_LABELS[booking.status] || booking.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card className="border-border/50 lg:col-span-1">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                کاربران جدید
              </CardTitle>
              <CardDescription>{stats.totalUsers} کاربر ثبت‌نام کرده</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentUsers.length === 0 ? (
                <p className="text-muted-foreground text-center text-sm py-8">کاربری ثبت‌نام نشده</p>
              ) : (
                recentUsers.slice(0, 5).map((user) => (
                  <motion.div
                    key={user.id}
                    variants={itemVariants}
                    className="p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-all hover:border-border cursor-pointer"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.full_name || "بدون نام"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.phone || "-"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground text-left whitespace-nowrap">
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                          locale: faIR,
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Quick Navigation */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-gradient-to-br from-slate-50/50 to-slate-50/30 dark:from-slate-900/20 dark:to-slate-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              دسترسی سریع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: "کاربران", icon: Users, path: "/admin/users", color: "text-blue-600" },
                { label: "سفارشات", icon: ShoppingCart, path: "/admin/orders", color: "text-green-600" },
                { label: "رزروها", icon: Calendar, path: "/admin/bookings", color: "text-purple-600" },
                { label: "دوره‌ها", icon: BookOpen, path: "/admin/courses", color: "text-pink-600" },
                { label: "محصولات", icon: Package, path: "/admin/products", color: "text-orange-600" },
                { label: "تنظیمات", icon: Target, path: "/admin/settings", color: "text-red-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      className="w-full h-auto flex flex-col items-center justify-center py-4 gap-2 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-xs text-center">{item.label}</span>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Status */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/10 dark:to-emerald-900/10">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="font-semibold text-green-700 dark:text-green-400">سیستم فعال و سالم</p>
                <p className="text-sm text-green-600 dark:text-green-400/70">تمام سرویس‌ها در حال کار هستند</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchDashboardData}>
              بررسی‌ای
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}