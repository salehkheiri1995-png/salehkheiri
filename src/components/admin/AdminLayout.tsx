import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "./AdminSidebar";
import { Loader2, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("خطا در خروج:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">دسترسی غیرمجاز</h1>
          <p className="text-muted-foreground">شما اجازه دسترسی به این بخش را ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <AdminSidebar />
      <main className="flex-1 flex flex-col">
        {/* Admin Header */}
        <div className="bg-background/80 backdrop-blur-lg border-b border-border/50 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h2 className="text-lg font-semibold text-foreground">پنل مدیریتی</h2>
            <p className="text-sm text-muted-foreground">سالن زیبایی</p>
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{user.email?.split("@")[0] || "مدیر"}</span>
            </button>
            
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-xl"
                >
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">مدیر سالن</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <a
                      href="/dashboard"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4" />
                      عرفطو بینی حساب کاربری
                    </a>
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
        </div>
        
        {/* Page Content */}
        <div className="p-8 overflow-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}