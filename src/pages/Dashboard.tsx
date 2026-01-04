import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  ShoppingBag, 
  BookOpen, 
  User, 
  Clock, 
  ChevronLeft,
  Phone,
  Mail,
  Edit,
  Check,
  X,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          phone: data.phone || "",
        });
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["user-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services:service_id(name, price, duration_minutes),
          specialists:specialist_id(full_name, avatar_url)
        `)
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user enrolled courses
  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["user-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(`
          *,
          course:course_id(id, title, image_url, duration_hours, instructor_name)
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          shipping_methods(name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
        })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "پروفایل به‌روزرسانی شد",
        description: "اطلاعات شما با موفقیت ذخیره شد.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره اطلاعات پیش آمد.",
        variant: "destructive",
      });
    },
  });

  // Cancel booking mutation
  const cancelBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "رزرو لغو شد",
        description: "نوبت شما با موفقیت لغو گردید.",
      });
      queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
    },
    onError: () => {
      toast({
        title: "خطا",
        description: "مشکلی در لغو رزرو پیش آمد.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fa-IR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">در انتظار تأیید</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500">تأیید شده</Badge>;
      case "cancelled":
        return <Badge variant="destructive">لغو شده</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">انجام شده</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Separate bookings
  const upcomingBookings = bookings?.filter(
    (b) => b.status !== "cancelled" && b.status !== "completed" && new Date(b.booking_date) >= new Date()
  ) || [];
  
  const pastBookings = bookings?.filter(
    (b) => b.status === "completed" || new Date(b.booking_date) < new Date()
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              سلام، <span className="gradient-text">{profile?.full_name || "کاربر عزیز"}</span>
            </h1>
            <p className="text-muted-foreground">
              از پنل کاربری خود می‌توانید رزروها و اطلاعات خود را مدیریت کنید.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                <p className="text-sm text-muted-foreground">رزرو آینده</p>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-4 text-center">
                <Check className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold">{pastBookings.length}</p>
                <p className="text-sm text-muted-foreground">نوبت انجام شده</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 border-secondary">
              <CardContent className="p-4 text-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
                <p className="text-sm text-muted-foreground">سفارش</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary/50 border-secondary">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{enrolledCourses?.length || 0}</p>
                <p className="text-sm text-muted-foreground">دوره</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="bookings" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="bookings" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden md:inline">رزروها</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden md:inline">سفارشات</span>
                </TabsTrigger>
                <TabsTrigger value="courses" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden md:inline">دوره‌ها</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">پروفایل</span>
                </TabsTrigger>
              </TabsList>

              {/* Bookings Tab */}
              <TabsContent value="bookings" className="space-y-6">
                {/* Upcoming Bookings */}
                <div>
                  <h2 className="text-lg font-bold mb-4">رزروهای آینده</h2>
                  {bookingsLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                      ))}
                    </div>
                  ) : upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              <div className="bg-primary/5 p-4 md:w-40 flex flex-col items-center justify-center text-center">
                                <p className="text-2xl font-bold text-primary">
                                  {new Date(booking.booking_date).toLocaleDateString("fa-IR", { day: "numeric" })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(booking.booking_date).toLocaleDateString("fa-IR", { month: "long" })}
                                </p>
                                <p className="text-sm font-medium mt-1">{booking.booking_time}</p>
                              </div>
                              <div className="p-4 flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-bold">{booking.services?.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {booking.specialists?.full_name}
                                    </p>
                                  </div>
                                  {getStatusBadge(booking.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {booking.services?.duration_minutes} دقیقه
                                  </span>
                                  <span className="text-primary font-medium">
                                    {formatPrice(Number(booking.services?.price || 0))} تومان
                                  </span>
                                </div>
                                {booking.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => cancelBooking.mutate(booking.id)}
                                    disabled={cancelBooking.isPending}
                                  >
                                    <X className="w-4 h-4 ml-1" />
                                    لغو رزرو
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">رزرو آینده‌ای ندارید</p>
                      <Button asChild>
                        <Link to="/booking">رزرو نوبت جدید</Link>
                      </Button>
                    </Card>
                  )}
                </div>

                {/* Past Bookings */}
                {pastBookings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold mb-4">رزروهای گذشته</h2>
                    <div className="space-y-4">
                      {pastBookings.slice(0, 5).map((booking) => (
                        <Card key={booking.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">{booking.services?.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(booking.booking_date)} - {booking.booking_time}
                                </p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders">
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                  </div>
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">کد سفارش</p>
                              <p className="font-bold">{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            {(() => {
                              const status = order.status;
                              switch (status) {
                                case "pending":
                                  return <Badge variant="secondary">در انتظار</Badge>;
                                case "confirmed":
                                  return <Badge className="bg-green-500">تایید شده</Badge>;
                                case "processing":
                                  return <Badge className="bg-blue-500">در حال آماده‌سازی</Badge>;
                                case "shipped":
                                  return <Badge className="bg-purple-500">ارسال شده</Badge>;
                                case "delivered":
                                  return <Badge className="bg-emerald-500">تحویل داده شده</Badge>;
                                case "cancelled":
                                  return <Badge variant="destructive">لغو شده</Badge>;
                                default:
                                  return <Badge>{status}</Badge>;
                              }
                            })()}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">تاریخ</p>
                              <p>{new Date(order.created_at).toLocaleDateString("fa-IR")}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">تعداد اقلام</p>
                              <p>{order.order_items?.length || 0} محصول</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">روش ارسال</p>
                              <p>{order.shipping_methods?.name || "نامشخص"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">مبلغ کل</p>
                              <p className="font-bold text-primary">{formatPrice(order.total)} تومان</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">سفارشی ثبت نشده است</p>
                    <Button asChild variant="outline">
                      <Link to="/shop">مشاهده فروشگاه</Link>
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                {coursesLoading ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                  </div>
                ) : enrolledCourses && enrolledCourses.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {enrolledCourses.map((enrollment: any) => (
                      <Card key={enrollment.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex">
                            <div className="w-32 h-24 flex-shrink-0">
                              <img
                                src={enrollment.course?.image_url || "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=150&fit=crop"}
                                alt={enrollment.course?.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4 flex-1">
                              <h3 className="font-bold mb-1 line-clamp-1">
                                {enrollment.course?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                مدرس: {enrollment.course?.instructor_name}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {enrollment.progress_percent || 0}% پیشرفت
                                </span>
                                <Button asChild size="sm" variant="outline">
                                  <Link to={`/courses/${enrollment.course?.id}`}>
                                    ادامه
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">دوره‌ای خریداری نشده است</p>
                    <Button asChild variant="outline">
                      <Link to="/courses">مشاهده دوره‌ها</Link>
                    </Button>
                  </Card>
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>اطلاعات شخصی</CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        ویرایش
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateProfile.mutate()}
                          disabled={updateProfile.isPending}
                        >
                          <Check className="w-4 h-4 ml-1" />
                          ذخیره
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              full_name: profile?.full_name || "",
                              phone: profile?.phone || "",
                            });
                          }}
                        >
                          انصراف
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {profileLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName">نام و نام خانوادگی</Label>
                            {isEditing ? (
                              <Input
                                id="fullName"
                                value={profileData.full_name}
                                onChange={(e) =>
                                  setProfileData({ ...profileData, full_name: e.target.value })
                                }
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-muted-foreground">
                                {profile?.full_name || "تنظیم نشده"}
                              </p>
                            )}
                          </div>
                          <div>
                            <Label htmlFor="phone">شماره تماس</Label>
                            {isEditing ? (
                              <Input
                                id="phone"
                                value={profileData.phone}
                                onChange={(e) =>
                                  setProfileData({ ...profileData, phone: e.target.value })
                                }
                                className="mt-1"
                                dir="ltr"
                              />
                            ) : (
                              <p className="mt-1 text-muted-foreground" dir="ltr">
                                {profile?.phone || "تنظیم نشده"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>ایمیل</Label>
                          <p className="mt-1 text-muted-foreground" dir="ltr">
                            {user?.email}
                          </p>
                        </div>
                        <div>
                          <Label>تاریخ عضویت</Label>
                          <p className="mt-1 text-muted-foreground">
                            {profile?.created_at && formatDate(profile.created_at)}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
