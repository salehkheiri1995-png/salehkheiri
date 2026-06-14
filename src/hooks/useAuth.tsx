import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface BackendUser {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  backendUser: BackendUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });

      if (!error) {
        setIsAdmin(data === true);
      }
    } catch (err) {
      console.error("Error checking admin role:", err);
      setIsAdmin(false);
    }
  };

  // Login با بک‌اند (Express) بدون وابستگی به تأیید ایمیل Supabase
  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { error: new Error(data.error || "Login failed") };
      }

      localStorage.setItem("auth_token", data.token);
      setBackendUser(data.user as BackendUser);

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // Signup: اول کاربر را در بک‌اند می‌سازد، بعد (در صورت نیاز) در Supabase
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: fullName }),
      });

      let data: any = null;
      let raw: string | null = null;

      try {
        raw = await res.text();
        data = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        console.error("Signup response is not valid JSON:", raw);
        if (!res.ok) {
          return {
            error: new Error("خطا در ثبت‌نام (پاسخ نامعتبر از سرور)"),
          };
        }
      }

      if (!res.ok) {
        const message = data?.error || data?.message || "Signup failed";
        return { error: new Error(message) };
      }

      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      return { error: error ?? null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setBackendUser(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        backendUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
