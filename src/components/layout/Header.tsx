import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ShoppingBag, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "خانه" },
  { href: "/services", label: "خدمات" },
  { href: "/specialists", label: "متخصصان" },
  { href: "/courses", label: "دوره‌های آموزشی" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/booking", label: "رزرو نوبت" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">سالن زیبایی</span>
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
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Link to="/shop">
                <ShoppingBag className="w-5 h-5" />
              </Link>
            </Button>
            {user ? (
              <>
                {isAdmin && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin">پنل مدیریت</Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Link to="/dashboard">
                    <User className="w-5 h-5" />
                  </Link>
                </Button>
              </>
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
