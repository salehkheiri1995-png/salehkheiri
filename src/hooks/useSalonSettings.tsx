import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SalonSettings {
  id: string;
  salon_name: string;
  logo_url: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  whatsapp: string | null;
  working_hours: string | null;
  about_text: string | null;
  hero_badge_text: string | null;
  hero_title: string | null;
  hero_highlight: string | null;
  hero_description: string | null;
  home_services_title: string | null;
  home_services_subtitle: string | null;
  home_specialists_title: string | null;
  home_specialists_subtitle: string | null;
  home_courses_title: string | null;
  home_courses_subtitle: string | null;
  home_products_title: string | null;
  home_products_subtitle: string | null;
  home_booking_title: string | null;
  home_booking_subtitle: string | null;
  shipping_cost: number | null;
  free_shipping_threshold: number | null;
  section_services_enabled: boolean | null;
  section_portfolio_enabled: boolean | null;
  section_specialists_enabled: boolean | null;
  section_courses_enabled: boolean | null;
  section_shop_enabled: boolean | null;
  section_booking_enabled: boolean | null;
}

export function useSalonSettings() {
  return useQuery({
    queryKey: ["salon-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salon_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as SalonSettings | null;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
