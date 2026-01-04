import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Scissors, 
  Users, 
  Package, 
  GraduationCap, 
  Calendar, 
  ShoppingCart,
  Truck,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  MessageSquare,
  UserCircle,
  BookOpen,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "داشبورد", href: "/admin" },
  { icon: UserCircle, label: "کاربران", href: "/admin/users" },
  { icon: Scissors, label: "خدمات", href: "/admin/services" },
  { icon: Users, label: "متخصصان", href: "/admin/specialists" },
  { icon: Package, label: "محصولات", href: "/admin/products" },
  { icon: GraduationCap, label: "دوره‌ها", href: "/admin/courses" },
  { icon: BookOpen, label: "ثبت‌نام دوره‌ها", href: "/admin/enrollments" },
  { icon: Camera, label: "نمونه‌کارها", href: "/admin/portfolio" },
  { icon: Calendar, label: "رزروها", href: "/admin/bookings" },
  { icon: ShoppingCart, label: "سفارشات", href: "/admin/orders" },
  { icon: Truck, label: "روش‌های ارسال", href: "/admin/shipping" },
  { icon: MessageSquare, label: "نظرات", href: "/admin/reviews" },
  { icon: Settings, label: "تنظیمات", href: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside className="w-64 bg-card border-l border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-foreground block">سالن زیبایی</span>
            <span className="text-xs text-muted-foreground">پنل مدیریت</span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/admin" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">خروج</span>
        </button>
      </div>
    </aside>
  );
}
