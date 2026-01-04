import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Check, X, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  product_id: string | null;
  service_id: string | null;
  products?: { name: string } | null;
  services?: { name: string } | null;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products(name),
          services(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("خطا در دریافت نظرات");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, approve: boolean) => {
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ is_approved: approve })
        .eq("id", id);

      if (error) throw error;
      toast.success(approve ? "نظر تایید شد" : "نظر رد شد");
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("خطا در بروزرسانی");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این نظر اطمینان دارید؟")) return;

    try {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
      toast.success("نظر حذف شد");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("خطا در حذف نظر");
    }
  };

  const filteredReviews = reviews.filter(
    (r) =>
      r.comment?.includes(search) ||
      r.products?.name?.includes(search) ||
      r.services?.name?.includes(search)
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مدیریت نظرات</h1>
          <p className="text-muted-foreground mt-1">
            {reviews.length} نظر • {reviews.filter((r) => !r.is_approved).length} در انتظار تایید
          </p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder="جستجو..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-12">در حال بارگذاری...</div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نوع</TableHead>
                <TableHead>امتیاز</TableHead>
                <TableHead>نظر</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="font-medium">
                      {review.products?.name || review.services?.name || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {review.product_id ? "محصول" : "خدمت"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
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
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 max-w-xs">
                      {review.comment || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={review.is_approved ? "default" : "secondary"}
                    >
                      {review.is_approved ? "تایید شده" : "در انتظار"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: faIR,
                      })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!review.is_approved && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleApprove(review.id, true)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {review.is_approved && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleApprove(review.id, false)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(review.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  );
}
