import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MultiImageUploadProps {
  featuredImage: string;
  galleryImages: string[];
  onFeaturedChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
  folder?: string;
}

export function MultiImageUpload({
  featuredImage,
  galleryImages,
  onFeaturedChange,
  onGalleryChange,
  folder = "general",
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024;

    const validFiles = Array.from(files).filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "خطا",
          description: `فایل ${file.name} پشتیبانی نمی‌شود`,
        });
        return false;
      }
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "خطا",
          description: `فایل ${file.name} بیش از ۵ مگابایت است`,
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // If no featured image, set the first uploaded as featured
      if (!featuredImage && uploadedUrls.length > 0) {
        onFeaturedChange(uploadedUrls[0]);
        onGalleryChange([...galleryImages, ...uploadedUrls.slice(1)]);
      } else {
        onGalleryChange([...galleryImages, ...uploadedUrls]);
      }

      toast({
        title: "موفق",
        description: `${uploadedUrls.length} تصویر آپلود شد`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "خطا در آپلود",
        description: error.message || "مشکلی در آپلود تصویر پیش آمد",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleRemoveFeatured = () => {
    // Move first gallery image to featured if exists
    if (galleryImages.length > 0) {
      onFeaturedChange(galleryImages[0]);
      onGalleryChange(galleryImages.slice(1));
    } else {
      onFeaturedChange("");
    }
  };

  const handleRemoveGallery = (index: number) => {
    const newGallery = galleryImages.filter((_, i) => i !== index);
    onGalleryChange(newGallery);
  };

  const handleSetAsFeatured = (index: number) => {
    const newFeatured = galleryImages[index];
    const newGallery = galleryImages.filter((_, i) => i !== index);
    if (featuredImage) {
      newGallery.unshift(featuredImage);
    }
    onFeaturedChange(newFeatured);
    onGalleryChange(newGallery);
  };

  return (
    <div className="space-y-4">
      {/* Featured Image Section */}
      <div>
        <label className="text-sm font-medium mb-2 block">تصویر شاخص</label>
        {featuredImage ? (
          <div className="relative inline-block">
            <img
              src={featuredImage}
              alt="تصویر شاخص"
              className="w-32 h-32 rounded-xl object-cover border-2 border-primary"
            />
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <button
              type="button"
              onClick={handleRemoveFeatured}
              className="absolute -top-2 -left-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-xs">بدون تصویر</span>
          </div>
        )}
      </div>

      {/* Gallery Images Section */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          گالری تصاویر ({galleryImages.length})
        </label>
        <div className="flex flex-wrap gap-3">
          {galleryImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`تصویر ${index + 1}`}
                className="w-24 h-24 rounded-lg object-cover border border-border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => handleSetAsFeatured(index)}
                  className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  title="تنظیم به عنوان شاخص"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveGallery(index)}
                  className="w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  title="حذف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Upload placeholder */}
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">آپلود</span>
              </>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
        multiple
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="gap-2"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        انتخاب تصاویر
      </Button>
    </div>
  );
}
