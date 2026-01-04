import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ReviewFormProps {
  productId?: string;
  serviceId?: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, serviceId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      return;
    }

    if (rating === 0) {
      toast.error("لطفاً امتیاز را انتخاب کنید");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        product_id: productId || null,
        service_id: serviceId || null,
        rating,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success("نظر شما با موفقیت ثبت شد و پس از تایید نمایش داده می‌شود");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("خطا در ثبت نظر");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <p className="text-muted-foreground">برای ثبت نظر لطفاً وارد حساب کاربری خود شوید</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border">
      <h3 className="font-bold mb-4">ثبت نظر</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">امتیاز شما</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">نظر شما (اختیاری)</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="نظر خود را بنویسید..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "در حال ثبت..." : "ثبت نظر"}
      </Button>
    </form>
  );
}
