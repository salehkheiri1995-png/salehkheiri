import { motion, AnimatePresence } from "framer-motion";
import { useVisualEditor } from "@/hooks/useVisualEditor";
import { Save, X, Loader2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorToolbar() {
  const { isEditMode, setEditMode, isAdmin, hasUnsavedChanges, saveAllChanges, isSaving } = useVisualEditor();

  if (!isAdmin) return null;

  return (
    <AnimatePresence>
      {isEditMode ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 bg-card border shadow-2xl rounded-full px-4 py-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Edit3 className="w-4 h-4 text-primary" />
              <span>حالت ویرایش فعال</span>
            </div>
            
            <div className="w-px h-6 bg-border" />
            
            {hasUnsavedChanges && (
              <span className="text-xs text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">
                تغییرات ذخیره نشده
              </span>
            )}
            
            <Button
              size="sm"
              onClick={saveAllChanges}
              disabled={!hasUnsavedChanges || isSaving}
              className="rounded-full gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              ذخیره
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditMode(false)}
              className="rounded-full gap-2"
            >
              <X className="w-4 h-4" />
              خروج
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 z-50"
        >
          <Button
            onClick={() => setEditMode(true)}
            className="rounded-full gap-2 shadow-lg"
          >
            <Edit3 className="w-4 h-4" />
            ویرایش صفحه
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
