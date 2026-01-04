import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThemeSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  foreground_color: string;
  muted_color: string;
  card_color: string;
  font_family: string;
  heading_font_family: string;
  base_font_size: string;
  heading_scale: number;
  border_radius: string;
}

const defaultTheme: Omit<ThemeSettings, "id"> = {
  primary_color: "15 60% 65%",
  secondary_color: "350 40% 92%",
  accent_color: "38 70% 55%",
  background_color: "30 30% 98%",
  foreground_color: "20 20% 15%",
  muted_color: "35 30% 94%",
  card_color: "30 25% 97%",
  font_family: "Vazirmatn",
  heading_font_family: "Vazirmatn",
  base_font_size: "16px",
  heading_scale: 1.25,
  border_radius: "0.75rem",
};

// Google Fonts that support Persian/Arabic
export const availableFonts = [
  { name: "Vazirmatn", value: "Vazirmatn" },
  { name: "Sahel", value: "Sahel" },
  { name: "Samim", value: "Samim" },
  { name: "Shabnam", value: "Shabnam" },
  { name: "Yekan Bakh", value: "Yekan Bakh" },
  { name: "Dana", value: "Dana" },
  { name: "IRANSans", value: "IRANSans" },
];

export const fontSizes = [
  { label: "کوچک", value: "14px" },
  { label: "معمولی", value: "16px" },
  { label: "بزرگ", value: "18px" },
  { label: "خیلی بزرگ", value: "20px" },
];

export const borderRadiusOptions = [
  { label: "بدون گردی", value: "0" },
  { label: "کم", value: "0.375rem" },
  { label: "متوسط", value: "0.75rem" },
  { label: "زیاد", value: "1rem" },
  { label: "خیلی زیاد", value: "1.5rem" },
];

export function useThemeSettings() {
  const queryClient = useQueryClient();

  const { data: theme, isLoading } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as ThemeSettings | null;
    },
  });

  const updateTheme = useMutation({
    mutationFn: async (newTheme: Partial<ThemeSettings>) => {
      if (!theme?.id) {
        const { error } = await supabase
          .from("theme_settings")
          .insert({ ...defaultTheme, ...newTheme });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("theme_settings")
          .update(newTheme)
          .eq("id", theme.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
    },
  });

  return {
    theme: theme || defaultTheme,
    isLoading,
    updateTheme,
  };
}

// Apply theme to CSS variables
export function applyTheme(theme: Partial<ThemeSettings>) {
  const root = document.documentElement;
  
  if (theme.primary_color) {
    root.style.setProperty("--primary", theme.primary_color);
    root.style.setProperty("--ring", theme.primary_color);
    root.style.setProperty("--rose-gold", theme.primary_color);
    root.style.setProperty("--sidebar-primary", theme.primary_color);
    root.style.setProperty("--sidebar-ring", theme.primary_color);
  }
  
  if (theme.secondary_color) {
    root.style.setProperty("--secondary", theme.secondary_color);
    root.style.setProperty("--blush", theme.secondary_color);
  }
  
  if (theme.accent_color) {
    root.style.setProperty("--accent", theme.accent_color);
    root.style.setProperty("--gold", theme.accent_color);
  }
  
  if (theme.background_color) {
    root.style.setProperty("--background", theme.background_color);
    root.style.setProperty("--sidebar-background", theme.background_color);
  }
  
  if (theme.foreground_color) {
    root.style.setProperty("--foreground", theme.foreground_color);
    root.style.setProperty("--card-foreground", theme.foreground_color);
    root.style.setProperty("--popover-foreground", theme.foreground_color);
    root.style.setProperty("--sidebar-foreground", theme.foreground_color);
    root.style.setProperty("--charcoal", theme.foreground_color);
  }
  
  if (theme.muted_color) {
    root.style.setProperty("--muted", theme.muted_color);
    root.style.setProperty("--cream", theme.muted_color);
    root.style.setProperty("--sidebar-accent", theme.muted_color);
  }
  
  if (theme.card_color) {
    root.style.setProperty("--card", theme.card_color);
    root.style.setProperty("--popover", theme.card_color);
  }
  
  if (theme.border_radius) {
    root.style.setProperty("--radius", theme.border_radius);
  }
  
  if (theme.base_font_size) {
    root.style.setProperty("font-size", theme.base_font_size);
  }
  
  if (theme.font_family) {
    root.style.setProperty("--font-body", `${theme.font_family}, system-ui, sans-serif`);
    document.body.style.fontFamily = `${theme.font_family}, system-ui, sans-serif`;
  }
  
  if (theme.heading_font_family) {
    root.style.setProperty("--font-heading", `${theme.heading_font_family}, system-ui, sans-serif`);
  }
}

// Hook to apply theme on load
export function useApplyTheme() {
  const { theme, isLoading } = useThemeSettings();

  useEffect(() => {
    if (!isLoading && theme) {
      applyTheme(theme);
    }
  }, [theme, isLoading]);
}
