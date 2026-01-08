import { useState, useRef, useEffect, HTMLAttributes } from "react";
import { useVisualEditor } from "@/hooks/useVisualEditor";
import { cn } from "@/lib/utils";
import { Pencil } from "lucide-react";

interface EditableTextProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  pageKey: string;
  contentKey: string;
  defaultValue: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  multiline?: boolean;
}

export function EditableText({
  pageKey,
  contentKey,
  defaultValue,
  as: Component = "span",
  multiline = false,
  className,
  ...props
}: EditableTextProps) {
  const { isEditMode, getContent, updateContent } = useVisualEditor();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const savedValue = getContent(pageKey, contentKey, defaultValue);

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

  if (!isEditMode) {
    return <Component className={className} {...props}>{savedValue}</Component>;
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
            className
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
          className
        )}
        style={{ font: "inherit" }}
      />
    );
  }

  return (
    <Component
      className={cn(
        "relative cursor-pointer group/editable",
        "outline outline-2 outline-dashed outline-transparent hover:outline-primary/50 transition-all rounded",
        className
      )}
      onClick={() => setIsEditing(true)}
      {...props}
    >
      {savedValue}
      <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 opacity-0 group-hover/editable:opacity-100 transition-opacity shadow-lg">
        <Pencil className="w-3 h-3" />
      </span>
    </Component>
  );
}
