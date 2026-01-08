import { useState, useRef, useEffect, HTMLAttributes } from "react";
import { useVisualEditor } from "@/hooks/useVisualEditor";
import { cn } from "@/lib/utils";
import { Pencil, Type } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EditableTextProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  pageKey: string;
  contentKey: string;
  defaultValue: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  multiline?: boolean;
  fontStyleKey?: string;
}

const fontOptions = [
  { value: "font-sans", label: "پیش‌فرض" },
  { value: "font-serif", label: "سریف" },
  { value: "font-mono", label: "مونو" },
];

const sizeOptions = [
  { value: "text-xs", label: "خیلی کوچک" },
  { value: "text-sm", label: "کوچک" },
  { value: "text-base", label: "معمولی" },
  { value: "text-lg", label: "بزرگ" },
  { value: "text-xl", label: "خیلی بزرگ" },
  { value: "text-2xl", label: "۲XL" },
  { value: "text-3xl", label: "۳XL" },
  { value: "text-4xl", label: "۴XL" },
  { value: "text-5xl", label: "۵XL" },
];

const weightOptions = [
  { value: "font-light", label: "سبک" },
  { value: "font-normal", label: "معمولی" },
  { value: "font-medium", label: "متوسط" },
  { value: "font-semibold", label: "نیمه‌ضخیم" },
  { value: "font-bold", label: "ضخیم" },
];

export function EditableText({
  pageKey,
  contentKey,
  defaultValue,
  as: Component = "span",
  multiline = false,
  fontStyleKey,
  className,
  ...props
}: EditableTextProps) {
  const { isEditMode, getContent, updateContent } = useVisualEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [isStyleOpen, setIsStyleOpen] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const savedValue = getContent(pageKey, contentKey, defaultValue);
  
  // Get saved styles
  const styleKey = fontStyleKey || `${contentKey}_style`;
  const savedFont = getContent(pageKey, `${styleKey}_font`, "font-sans");
  const savedSize = getContent(pageKey, `${styleKey}_size`, "");
  const savedWeight = getContent(pageKey, `${styleKey}_weight`, "");

  useEffect(() => {
    setLocalValue(savedValue);
  }, [savedValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue !== savedValue) {
      updateContent(pageKey, contentKey, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setLocalValue(savedValue);
      setIsEditing(false);
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleBlur();
    }
  };

  const styleClasses = cn(savedFont, savedSize, savedWeight);

  if (!isEditMode) {
    return <Component className={cn(className, styleClasses)} {...props}>{savedValue}</Component>;
  }

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full min-h-[60px] p-2 rounded border-2 border-primary bg-background text-foreground resize-y",
            className,
            styleClasses
          )}
          style={{ font: "inherit" }}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full p-1 rounded border-2 border-primary bg-background text-foreground",
          className,
          styleClasses
        )}
        style={{ font: "inherit" }}
      />
    );
  }

  return (
    <div className="relative inline-block group/editable">
      <Component
        className={cn(
          "cursor-pointer",
          "outline outline-2 outline-dashed outline-transparent hover:outline-primary/50 transition-all rounded",
          className,
          styleClasses
        )}
        onClick={() => setIsEditing(true)}
        {...props}
      >
        {savedValue}
      </Component>
      
      {/* Edit Icon */}
      <span 
        className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 opacity-0 group-hover/editable:opacity-100 transition-opacity shadow-lg cursor-pointer z-10"
        onClick={() => setIsEditing(true)}
      >
        <Pencil className="w-3 h-3" />
      </span>

      {/* Style Button */}
      <Popover open={isStyleOpen} onOpenChange={setIsStyleOpen}>
        <PopoverTrigger asChild>
          <span 
            className="absolute -top-2 -left-2 bg-secondary text-secondary-foreground rounded-full p-1 opacity-0 group-hover/editable:opacity-100 transition-opacity shadow-lg cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsStyleOpen(true);
            }}
          >
            <Type className="w-3 h-3" />
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">سبک متن</h4>
            
            <div className="space-y-2">
              <Label className="text-xs">فونت</Label>
              <Select
                value={savedFont}
                onValueChange={(value) => updateContent(pageKey, `${styleKey}_font`, value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">اندازه</Label>
              <Select
                value={savedSize || "default"}
                onValueChange={(value) => updateContent(pageKey, `${styleKey}_size`, value === "default" ? "" : value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="پیش‌فرض" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">پیش‌فرض</SelectItem>
                  {sizeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">وزن</Label>
              <Select
                value={savedWeight || "default"}
                onValueChange={(value) => updateContent(pageKey, `${styleKey}_weight`, value === "default" ? "" : value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="پیش‌فرض" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">پیش‌فرض</SelectItem>
                  {weightOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
