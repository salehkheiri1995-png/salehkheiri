import { useQuery } from "@tanstack/react-query";
import { Star, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface ReviewsListProps {
  productId?: string;
  serviceId?: string;
}

export function ReviewsList({ productId, serviceId }: ReviewsListProps) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", productId, serviceId],
    queryFn: async () => {
      let query = supabase
        .from("reviews")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (productId) {
        query = query.eq("product_id", productId);
      } else if (serviceId) {
        query = query.eq("service_id", serviceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-muted/50 rounded-xl p-8 text-center">
        <p className="text-muted-foreground">هنوز نظری ثبت نشده است</p>
      </div>
    );
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
        <div className="text-center">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-muted-foreground">
          از {reviews.length} نظر
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-card rounded-xl p-4 border border-border"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: faIR,
                    })}
                  </div>
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-foreground/80 mt-3">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
