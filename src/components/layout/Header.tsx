import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingBag, Calendar, Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { supabase } from "@/integrations/supabase/client";

const allNavLinks = [
  { href: "/", label: "خانه", section: null },
  { href: "/services", label: "خدمات", section: "services" },
  { href: "/portfolio", label: "نمونه‌کارها", section: "portfolio" },
  { href: "/specialists", label: "متخصصان", section: "specialists" },
  { href: "/courses", label: "دوره‌های آموزشی", section: "courses" },
  { href: "/shop", label: "فروشگاه", section: "shop" },
  { href: "/booking", label: "رزرو نوبت", section: "booking" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { data: settings } = useSalonSettings();

  const navLinks = allNavLinks.filter(link => {
    if (!link.section) return true;
    const key = `section_${link.section}_enabled` as keyof typeof settings;
    return settings?.[key] !== false;
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("خطا در خروج:", error);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{settings?.salon_name || "سالن زیبایی"}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <NotificationBell />
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative" aria-label="سبد خرید">
              <Link to="/cart">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="منوی کاربر"
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex items-center gap-2"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium hidden md:inline">
                    {user.email?.split("@")[0] || "کاربر"}
                  </span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg"
                    >
                      <div className="p-4 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <User className="w-4 h-4" />
                          پنل کاربری
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <span className="text-xs">⚙️</span>
                            پنل مدیریت
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2 border-t border-border pt-3"
                        >
                          <LogOut className="w-4 h-4" />
                          خروج از حساب
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">ورود / ثبت‌نام</Link>
              </Button>
            )}
            <Button asChild variant="default" className="gap-2">
              <Link to="/booking">
                <Calendar className="w-4 h-4" />
                رزرو نوبت
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
            className="lg:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border"
          >
            <nav className="container py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  پنل مدیریت
                </Link>
              )}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 mt-2 border-t border-border pt-4"
                >
                  <LogOut className="w-4 h-4" />
                  خروج از حساب
                </button>
              )}
              <div className="flex gap-2 pt-4 border-t border-border mt-2">
                <Button asChild variant="outline" className="flex-1 gap-2">
                  <Link to={user ? "/dashboard" : "/auth"} onClick={() => setIsOpen(false)}>
                    <User className="w-4 h-4" />
                    {user ? "پنل کاربری" : "ورود"}
                  </Link>
                </Button>
                <Button asChild variant="default" className="flex-1 gap-2">
                  <Link to="/booking" onClick={() => setIsOpen(false)}>
                    <Calendar className="w-4 h-4" />
                    رزرو نوبت
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}