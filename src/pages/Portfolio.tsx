import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EditableText } from "@/components/visual-editor/EditableText";
import { EditableSection } from "@/components/visual-editor/EditableSection";
import { 
  Camera, X, Play, Star, Heart, Eye, MessageSquare, 
  Send, ChevronLeft, ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  category: string | null;
  views_count: number;
  likes_count: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  is_active: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["portfolio-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_categories")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: portfolioItems, isLoading } = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("is_active", true)
        .order("order_index");
      if (error) throw error;
      return data as PortfolioItem[];
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["portfolio-reviews", selectedItem?.id],
    queryFn: async () => {
      if (!selectedItem) return [];
      const { data, error } = await supabase
        .from("portfolio_reviews")
        .select("*")
        .eq("portfolio_id", selectedItem.id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!selectedItem,
  });

  const incrementViewMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: current } = await supabase
        .from("portfolio")
        .select("views_count")
        .eq("id", id)
        .single();
      await supabase
        .from("portfolio")
        .update({ views_count: (current?.views_count || 0) + 1 })
        .eq("id", id);
    },
  });

  const submitReviewMutation = useMutation({
    mutationFn: async ({ portfolioId, rating, comment }: { portfolioId: string; rating: number; comment: string }) => {
      const { error } = await supabase.from("portfolio_reviews").insert([{
        portfolio_id: portfolioId,
        user_id: user?.id,
        rating,
        comment,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-reviews"] });
      toast({ title: "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود" });
      setNewComment("");
      setNewRating(5);
    },
    onError: () => {
      toast({ title: "خطا در ثبت نظر", variant: "destructive" });
    },
  });

  const openItemDetail = (item: PortfolioItem) => {
    setSelectedItem(item);
    incrementViewMutation.mutate(item.id);
  };

  const allCategories = [{ id: "all", name: "همه", slug: "all", color: "#6366f1", is_active: true }, ...categories];

  const filteredItems = portfolioItems?.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  const getCategoryInfo = (slug: string | null) => {
    return categories.find((c) => c.slug === slug) || { name: slug || "", color: "#6366f1" };
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast({ title: "برای ثبت نظر باید وارد شوید", variant: "destructive" });
      return;
    }
    if (!selectedItem) return;
    submitReviewMutation.mutate({
      portfolioId: selectedItem.id,
      rating: newRating,
      comment: newComment,
    });
  };

  const navigateItem = (direction: 'prev' | 'next') => {
    if (!selectedItem || !filteredItems) return;
    const currentIndex = filteredItems.findIndex(item => item.id === selectedItem.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = filteredItems.length - 1;
    if (newIndex >= filteredItems.length) newIndex = 0;
    openItemDetail(filteredItems[newIndex]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <EditableSection pageKey="portfolio" contentKey="hero" className="pb-8">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                <EditableText
                  pageKey="portfolio"
                  contentKey="title"
                  defaultValue="نمونه‌کارها"
                  as="span"
                />
              </h1>
              <EditableText
                pageKey="portfolio"
                contentKey="subtitle"
                defaultValue="مجموعه‌ای از بهترین کارهای انجام شده توسط متخصصین ما"
                as="p"
                multiline
                className="text-muted-foreground max-w-2xl mx-auto"
              />
            </motion.div>

            {/* Category Filter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {allCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.slug)}
                  className="rounded-full gap-2"
                  style={selectedCategory === category.slug ? {
                    backgroundColor: category.color,
                    borderColor: category.color,
                  } : {}}
                >
                  {category.slug !== "all" && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedCategory === category.slug ? "#fff" : category.color }}
                    />
                  )}
                  {category.name}
                </Button>
              ))}
            </motion.div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            )}

            {/* Portfolio Grid */}
            {!isLoading && (
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                <AnimatePresence>
                  {filteredItems?.map((item, index) => {
                    const categoryInfo = getCategoryInfo(item.category);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted"
                        onClick={() => openItemDetail(item)}
                      >
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=500&fit=crop"}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&h=500&fit=crop";
                          }}
                        />
                        
                        {item.video_url && (
                          <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        )}

                        <div className="absolute top-3 left-3">
                          <Badge 
                            style={{ 
                              backgroundColor: `${categoryInfo.color}dd`,
                              color: "#fff",
                            }}
                          >
                            {categoryInfo.name}
                          </Badge>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-sm mb-1">{item.title}</h3>
                            {item.description && (
                              <p className="text-white/80 text-xs line-clamp-2 mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-white/70 text-xs">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {item.views_count || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />
                                {item.likes_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && (!filteredItems || filteredItems.length === 0) && (
              <div className="text-center py-16">
                <Camera className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  <EditableText
                    pageKey="portfolio"
                    contentKey="empty_title"
                    defaultValue="نمونه‌کاری یافت نشد"
                    as="span"
                  />
                </h3>
                <p className="text-muted-foreground">
                  {selectedCategory === "all"
                    ? "هنوز نمونه‌کاری اضافه نشده است"
                    : "در این دسته‌بندی نمونه‌کاری وجود ندارد"}
                </p>
              </div>
            )}
          </div>
        </EditableSection>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-none max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <div className="relative">
              <button
                onClick={() => setSelectedItem(null)}
                aria-label="بستن"
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigateItem('prev')}
                aria-label="نمونه‌کار قبلی"
                className="absolute left-4 top-1/3 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateItem('next')}
                aria-label="نمونه‌کار بعدی"
                className="absolute right-4 top-1/3 z-20 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="relative aspect-video bg-black">
                {selectedItem.video_url ? (
                  <video
                    src={selectedItem.video_url}
                    poster={selectedItem.image_url || undefined}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.image_url || ""}
                    alt={selectedItem.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge 
                      className="mb-2"
                      style={{ 
                        backgroundColor: `${getCategoryInfo(selectedItem.category).color}20`,
                        color: getCategoryInfo(selectedItem.category).color,
                      }}
                    >
                      {getCategoryInfo(selectedItem.category).name}
                    </Badge>
                    <h2 className="text-2xl font-bold">{selectedItem.title}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {selectedItem.views_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {selectedItem.likes_count || 0}
                    </span>
                  </div>
                </div>

                {selectedItem.description && (
                  <p className="text-muted-foreground mb-6">{selectedItem.description}</p>
                )}

                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    نظرات ({reviews.length})
                  </h3>

                  {user && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm">امتیاز شما:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  star <= newRating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="نظر خود را بنویسید..."
                          className="flex-1"
                          rows={2}
                        />
                        <Button 
                          onClick={handleSubmitReview}
                          disabled={submitReviewMutation.isPending}
                          size="icon"
                          className="h-auto"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-muted/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString("fa-IR")}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      هنوز نظری ثبت نشده است
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
