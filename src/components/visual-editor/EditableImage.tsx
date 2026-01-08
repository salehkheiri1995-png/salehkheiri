import { useState, useRef, ImgHTMLAttributes } from "react";
import { useVisualEditor } from "@/hooks/useVisualEditor";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditableImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  pageKey: string;
  contentKey: string;
  defaultSrc: string;
}

export function EditableImage({
  pageKey,
  contentKey,
  defaultSrc,
  alt = "",
  className,
  ...props
}: EditableImageProps) {
  const { isEditMode, getContent, updateContent } = useVisualEditor();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const savedValue = getContent(pageKey, contentKey, defaultSrc);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "خطا",
        description: "فقط فایل تصویری مجاز است",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطا",
        description: "حجم تصویر باید کمتر از ۵ مگابایت باشد",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `visual-editor/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      updateContent(pageKey, contentKey, publicUrl, "image");

      toast({
        title: "آپلود شد",
        description: "تصویر با موفقیت آپلود شد",
      });
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  if (!isEditMode) {
    return <img src={savedValue} alt={alt} className={className} {...props} />;
  }

  return (
    <div className="relative group/image">
      <img src={savedValue} alt={alt} className={cn("transition-all", className)} {...props} />
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity cursor-pointer rounded",
          isUploading && "opacity-100"
        )}
      >
        {isUploading ? (
          <div className="flex items-center gap-2 text-white">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>در حال آپلود...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-white">
            <ImagePlus className="w-8 h-8" />
            <span className="text-sm">تغییر تصویر</span>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
