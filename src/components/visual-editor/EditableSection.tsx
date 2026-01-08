import { useState, ReactNode } from "react";
import { useVisualEditor } from "@/hooks/useVisualEditor";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditableSectionProps {
  pageKey: string;
  contentKey: string;
  defaultBg?: string;
  children: ReactNode;
  className?: string;
}

const presetColors = [
  { label: "شفاف", value: "transparent" },
  { label: "پیش‌فرض", value: "bg-background" },
  { label: "کارت", value: "bg-card" },
  { label: "خاکستری", value: "bg-muted/30" },
  { label: "خاکستری تیره", value: "bg-muted/50" },
  { label: "اصلی روشن", value: "bg-primary/5" },
  { label: "اصلی", value: "bg-primary/10" },
  { label: "ثانویه", value: "bg-secondary/20" },
  { label: "اکسنت", value: "bg-accent/10" },
  { label: "گرادیان ۱", value: "bg-gradient-to-br from-primary/10 via-background to-accent/10" },
  { label: "گرادیان ۲", value: "bg-gradient-to-r from-primary/5 to-secondary/10" },
];

export function EditableSection({
  pageKey,
  contentKey,
  defaultBg = "transparent",
  children,
  className,
}: EditableSectionProps) {
  const { isEditMode, getContent, updateContent } = useVisualEditor();
  const [isOpen, setIsOpen] = useState(false);

  const savedBg = getContent(pageKey, `${contentKey}_bg`, defaultBg);

  if (!isEditMode) {
    return <section className={cn(savedBg, className)}>{children}</section>;
  }

  return (
    <section className={cn(savedBg, "relative group/section", className)}>
      {children}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="absolute top-4 left-4 z-30 bg-primary text-primary-foreground rounded-full p-2 opacity-0 group-hover/section:opacity-100 transition-opacity shadow-lg hover:scale-110"
            title="تغییر پس‌زمینه"
          >
            <Palette className="w-4 h-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <div className="space-y-3">
            <h4 className="font-medium text-sm">رنگ پس‌زمینه</h4>
            <div className="grid grid-cols-3 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    updateContent(pageKey, `${contentKey}_bg`, color.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "h-12 rounded-lg border-2 transition-all text-xs flex items-end justify-center pb-1",
                    color.value,
                    savedBg === color.value ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="bg-background/80 px-1 rounded text-[10px]">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </section>
  );
}
