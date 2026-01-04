import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Package, 
  GraduationCap, 
  Users, 
  TrendingUp,
  DollarSign,
  Eye,
  Clock
} from "lucide-react";
import { StatsCard } from "@/components/admin/StatsCard";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  totalBookings: number;
  totalProducts: number;
  totalCourses: number;
  totalSpecialists: number;
  pendingBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalProducts: 0,
    totalCourses: 0,
    totalSpecialists: 0,
    pendingBookings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [bookings, products, courses, specialists] = await Promise.all([
        supabase.from("bookings").select("id, status", { count: "exact" }),
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("courses").select("id", { count: "exact" }),
        supabase.from("specialists").select("id", { count: "exact" }),
      ]);

      const pendingBookings = bookings.data?.filter(b => b.status === "pending").length || 0;

      setStats({
        totalBookings: bookings.count || 0,
        totalProducts: products.count || 0,
        totalCourses: courses.count || 0,
        totalSpecialists: specialists.count || 0,
        pendingBookings,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: "کل رزروها",
      value: stats.totalBookings,
      change: "+۱۲%",
      changeType: "positive" as const,
      icon: Calendar,
      iconColor: "bg-blue-100 text-blue-600",
    },
    {
      title: "رزروهای در انتظار",
      value: stats.pendingBookings,
      icon: Clock,
      iconColor: "bg-amber-100 text-amber-600",
    },
    {
      title: "محصولات",
      value: stats.totalProducts,
      change: "+۵",
      changeType: "positive" as const,
      icon: Package,
      iconColor: "bg-green-100 text-green-600",
    },
    {
      title: "دوره‌های آموزشی",
      value: stats.totalCourses,
      icon: GraduationCap,
      iconColor: "bg-purple-100 text-purple-600",
    },
    {
      title: "متخصصان",
      value: stats.totalSpecialists,
      icon: Users,
      iconColor: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">داشبورد</h1>
        <p className="text-muted-foreground mt-1">خوش آمدید! نمای کلی سالن زیبایی</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatsCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-card"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            آخرین رزروها
          </h2>
          <div className="space-y-4">
            {stats.totalBookings === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                هنوز رزروی ثبت نشده است
              </p>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {stats.totalBookings} رزرو ثبت شده
              </p>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-card"
        >
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            عملکرد سریع
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">۱,۲۳۴</p>
              <p className="text-sm text-muted-foreground">بازدید امروز</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">۵.۲M</p>
              <p className="text-sm text-muted-foreground">درآمد ماهانه</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
