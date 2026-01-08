import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteContent {
  id: string;
  page_key: string;
  content_key: string;
  content_type: string;
  content_value: string | null;
}

interface VisualEditorContextType {
  isEditMode: boolean;
  setEditMode: (mode: boolean) => void;
  isAdmin: boolean;
  content: Map<string, string>;
  getContent: (pageKey: string, contentKey: string, defaultValue: string) => string;
  updateContent: (pageKey: string, contentKey: string, value: string, type?: string) => void;
  saveAllChanges: () => void;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

const VisualEditorContext = createContext<VisualEditorContextType | null>(null);

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, { pageKey: string; contentKey: string; value: string; type: string }>>(new Map());

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
        setIsEditMode(false);
      }
    };
    checkAdmin();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch all site content
  const { data: siteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*");
      if (error) throw error;
      return data as SiteContent[];
    },
  });

  // Create content map
  const content = new Map<string, string>();
  siteContent?.forEach((item) => {
    content.set(`${item.page_key}::${item.content_key}`, item.content_value || "");
  });

  const getContent = (pageKey: string, contentKey: string, defaultValue: string): string => {
    const key = `${pageKey}::${contentKey}`;
    // First check pending changes
    if (pendingChanges.has(key)) {
      return pendingChanges.get(key)!.value;
    }
    // Then check saved content
    if (content.has(key)) {
      return content.get(key)!;
    }
    return defaultValue;
  };

  const updateContent = (pageKey: string, contentKey: string, value: string, type: string = "text") => {
    const key = `${pageKey}::${contentKey}`;
    setPendingChanges((prev) => {
      const next = new Map(prev);
      next.set(key, { pageKey, contentKey, value, type });
      return next;
    });
  };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const changes = Array.from(pendingChanges.values());
      
      for (const change of changes) {
        const { error } = await supabase
          .from("site_content")
          .upsert({
            page_key: change.pageKey,
            content_key: change.contentKey,
            content_value: change.value,
            content_type: change.type,
          }, {
            onConflict: "page_key,content_key",
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setPendingChanges(new Map());
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({
        title: "ذخیره شد",
        description: "تغییرات با موفقیت ذخیره شد.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveAllChanges = () => {
    if (pendingChanges.size > 0) {
      saveMutation.mutate();
    }
  };

  const setEditMode = (mode: boolean) => {
    if (mode && !isAdmin) {
      toast({
        title: "دسترسی محدود",
        description: "فقط مدیران می‌توانند از حالت ویرایش استفاده کنند.",
        variant: "destructive",
      });
      return;
    }
    if (!mode && pendingChanges.size > 0) {
      if (window.confirm("تغییرات ذخیره نشده دارید. آیا مطمئن هستید؟")) {
        setPendingChanges(new Map());
        setIsEditMode(false);
      }
    } else {
      setIsEditMode(mode);
    }
  };

  return (
    <VisualEditorContext.Provider
      value={{
        isEditMode,
        setEditMode,
        isAdmin,
        content,
        getContent,
        updateContent,
        saveAllChanges,
        hasUnsavedChanges: pendingChanges.size > 0,
        isSaving: saveMutation.isPending,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
}

export function useVisualEditor() {
  const context = useContext(VisualEditorContext);
  if (!context) {
    throw new Error("useVisualEditor must be used within VisualEditorProvider");
  }
  return context;
}
