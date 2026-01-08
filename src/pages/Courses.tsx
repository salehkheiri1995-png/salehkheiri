import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Star, Play, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EditableSection } from "@/components/visual-editor/EditableSection";
import { EditableText } from "@/components/visual-editor/EditableText";

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null;
  price: number;
  original_price: number | null;
  duration_hours: number | null;
  students_count: number | null;
  rating: number | null;
  level: string | null;
  image_url: string | null;
  is_new: boolean | null;
  is_active: boolean;
}

export default function Courses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('خطا در دریافت دوره‌ها:', error);
        toast({
          title: "خطا",
          description: "ناموفق در دریافت دوره‌ها",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <EditableSection pageKey="courses" contentKey="header_section" defaultBg="transparent" className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <EditableText
                pageKey="courses"
                contentKey="page_label"
                defaultValue="دوره‌های آموزشی"
                as="span"
                className="text-primary font-medium mb-4 block"
              />
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                <EditableText
                  pageKey="courses"
                  contentKey="page_title"
                  defaultValue="آموزش"
                  as="span"
                />{" "}
                <span className="gradient-text">
                  <EditableText
                    pageKey="courses"
                    contentKey="page_title_highlight"
                    defaultValue="حرفه‌ای"
                    as="span"
                  />
                </span>{" "}
                <EditableText
                  pageKey="courses"
                  contentKey="page_title_suffix"
                  defaultValue="زیبایی"
                  as="span"
                />
              </h1>
              <EditableText
                pageKey="courses"
                contentKey="page_description"
                defaultValue="با دوره‌های تخصصی ما، مهارت‌های زیبایی خود را ارتقا دهید"
                as="p"
                className="text-muted-foreground max-w-2xl mx-auto"
              />
            </motion.div>
          </EditableSection>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-card rounded-2xl overflow-hidden shadow-card hover-lift cursor-pointer"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.image_url || "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {course.is_new && (
                        <Badge className="bg-accent text-accent-foreground">جدید</Badge>
                      )}
                      <Badge variant="secondary">{course.level || 'مبتدی'}</Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2 line-clamp-1">{course.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      مدرس: {course.instructor_name || "نامشخص"}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration_hours || 0} ساعت
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students_count || 0} دانشجو
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        {(course.rating || 0).toFixed(1)}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(course.price)} تومان
                        </span>
                        {course.original_price && course.original_price > course.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(course.original_price)}
                          </span>
                        )}
                      </div>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}>
                        مشاهده دوره
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EditableSection pageKey="courses" contentKey="empty_section" defaultBg="transparent">
              <div className="text-center py-16">
                <GraduationCap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <EditableText
                  pageKey="courses"
                  contentKey="empty_title"
                  defaultValue="هنوز دوره‌ای اضافه نشده است"
                  as="p"
                  className="text-muted-foreground text-lg"
                />
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/">بازگشت به خانه</Link>
                </Button>
              </div>
            </EditableSection>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
