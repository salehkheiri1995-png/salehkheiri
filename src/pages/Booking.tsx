import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Sparkles, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
];

const steps = [
  { id: 1, title: "انتخاب خدمت", icon: Sparkles },
  { id: 2, title: "انتخاب متخصص", icon: User },
  { id: 3, title: "تاریخ و ساعت", icon: Calendar },
  { id: 4, title: "تأیید نهایی", icon: Check },
];

export default function Booking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["booking-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch specialists
  const { data: specialists, isLoading: specialistsLoading } = useQuery({
    queryKey: ["booking-specialists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("specialists")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch booked times for selected date and specialist
  const { data: bookedTimes, isLoading: bookedTimesLoading } = useQuery({
    queryKey: ["booked-times", selectedDate, selectedSpecialist],
    queryFn: async () => {
      if (!selectedDate || !selectedSpecialist) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("booking_date", selectedDate)
        .eq("specialist_id", selectedSpecialist)
        .in("status", ["pending", "confirmed"]);
      
      if (error) throw error;
      return data?.map(b => b.booking_time) || [];
    },
    enabled: !!selectedDate && !!selectedSpecialist,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!selectedDate || !selectedSpecialist) return;

    const channel = supabase
      .channel(`bookings:${selectedSpecialist}:${selectedDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `specialist_id=eq.${selectedSpecialist}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["booked-times", selectedDate, selectedSpecialist] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate, selectedSpecialist, queryClient]);

  useEffect(() => {
    const serviceIdParam = searchParams.get("service");
    const serviceNameParam = searchParams.get("serviceName");
    
    if (services) {
      let matchedService = null;
      
      if (serviceIdParam) {
        matchedService = services.find(s => s.id === serviceIdParam);
      } else if (serviceNameParam) {
        matchedService = services.find(s => s.name === serviceNameParam);
      }
      
      if (matchedService) {
        setSelectedService(matchedService.id);
        setCurrentStep(2);
      }
    }
  }, [searchParams, services]);

  useEffect(() => {
    const specialistIdParam = searchParams.get("specialist");
    const specialistNameParam = searchParams.get("specialistName");
    
    if (specialists) {
      let matchedSpecialist = null;
      
      if (specialistIdParam) {
        matchedSpecialist = specialists.find(s => s.id === specialistIdParam);
      } else if (specialistNameParam) {
        matchedSpecialist = specialists.find(s => s.full_name === specialistNameParam);
      }
      
      if (matchedSpecialist) {
        setSelectedSpecialist(matchedSpecialist.id);
        if (selectedService) {
          setCurrentStep(3);
        }
      }
    }
  }, [searchParams, specialists, selectedService]);

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async () => {
      const { data: existingBooking, error: checkError } = await supabase
        .from("bookings")
        .select("id")
        .eq("booking_date", selectedDate)
        .eq("booking_time", selectedTime)
        .eq("specialist_id", selectedSpecialist)
        .in("status", ["pending", "confirmed"])
        .single();
      
      if (checkError?.code !== "PGRST116" && existingBooking) {
        throw new Error("این ساعت قبلاً رزرو شده است");
      }

      const { error } = await supabase.from("bookings").insert({
        service_id: selectedService,
        specialist_id: selectedSpecialist,
        booking_date: selectedDate,
        booking_time: selectedTime,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        notes: customerInfo.notes || null,
        user_id: user?.id || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "رزرو موفق!",
        description: "نوبت شما با موفقیت ثبت شد. منتظر تأیید باشید.",
      });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booked-times"] });
      setCurrentStep(1);
      setSelectedService(null);
      setSelectedSpecialist(null);
      setSelectedDate("");
      setSelectedTime(null);
      setCustomerInfo({ name: "", phone: "", email: "", notes: "" });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error.message || "مشکلی در ثبت رزرو پیش آمد. لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const getSelectedServiceData = () => services?.find(s => s.id === selectedService);
  const getSelectedSpecialistData = () => specialists?.find(s => s.id === selectedSpecialist);

  const isTimeBooked = (time: string): boolean => {
    return bookedTimes?.includes(time) ?? false;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedService;
      case 2: return !!selectedSpecialist;
      case 3: return !!selectedDate && !!selectedTime && !isTimeBooked(selectedTime);
      case 4: return customerInfo.name && customerInfo.phone;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "اطلاعات ناقص",
        description: "لطفاً نام و شماره تماس را وارد کنید.",
        variant: "destructive",
      });
      return;
    }
    createBooking.mutate();
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("fa-IR", { weekday: "short", month: "short", day: "numeric" }),
      });
    }
    return dates;
  };

  const getAvailableSlotsCount = (date: string) => {
    if (date !== selectedDate || !bookedTimes) return null;
    const availableCount = timeSlots.length - (bookedTimes?.length || 0);
    return availableCount > 0 ? availableCount : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <span className="text-primary font-medium mb-4 block">رزرو آنلاین</span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              رزرو <span className="gradient-text">نوبت</span>
            </h1>
            <p className="text-muted-foreground">
              در چند مرحله ساده نوبت خود را رزرو کنید
            </p>
          </motion.div>

          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-2 md:gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full transition-all",
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <step.icon className="w-4 h-4" />
                    <span className="hidden md:inline text-sm font-medium">{step.title}</span>
                    <span className="md:hidden text-sm font-medium">{step.id}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-8 h-0.5 mx-1",
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="shadow-card">
            <CardContent className="p-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold mb-6">انتخاب خدمت</h2>
                  {servicesLoading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {services?.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedService === service.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <img
                            src={service.image_url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=80&h=80&fit=crop"}
                            alt={service.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{service.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {service.duration_minutes} دقیقه
                            </p>
                            <p className="text-primary font-medium">
                              {formatPrice(Number(service.price))} تومان
                            </p>
                          </div>
                          {selectedService === service.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold mb-6">انتخاب متخصص</h2>
                  {specialistsLoading ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {specialists?.map((specialist) => (
                        <div
                          key={specialist.id}
                          onClick={() => setSelectedSpecialist(specialist.id)}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            selectedSpecialist === specialist.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <img
                            src={specialist.avatar_url || "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop"}
                            alt={specialist.full_name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{specialist.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{specialist.title}</p>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-accent">★</span>
                              <span>{Number(specialist.rating).toFixed(1)}</span>
                              <span className="text-muted-foreground">
                                ({specialist.reviews_count} نظر)
                              </span>
                            </div>
                          </div>
                          {selectedSpecialist === specialist.id && (
                            <Check className="w-5 h-5 text-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold mb-6">انتخاب تاریخ و ساعت</h2>
                  
                  <div className="mb-8">
                    <Label className="mb-3 block">تاریخ</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {getAvailableDates().map((date) => {
                        const availableSlots = selectedDate === date.value ? getAvailableSlotsCount(date.value) : null;
                        return (
                          <button
                            key={date.value}
                            onClick={() => {
                              setSelectedDate(date.value);
                              setSelectedTime(null);
                            }}
                            className={cn(
                              "flex-shrink-0 px-4 py-3 rounded-xl border-2 text-center transition-all",
                              selectedDate === date.value
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <span className="text-sm font-medium">{date.label}</span>
                            {selectedDate === date.value && availableSlots !== null && (
                              <span className="text-xs text-muted-foreground block mt-1">
                                {availableSlots} ساعت آزاد
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">
                      ساعت {bookedTimesLoading && "(در حال بارگیری...)"}
                    </Label>
                    {bookedTimesLoading ? (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map((time) => (
                          <Skeleton key={time} className="h-16 rounded-lg" />
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {timeSlots.map((time) => {
                            const booked = isTimeBooked(time);
                            const selected = selectedTime === time;
                            
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() => {
                                  if (!booked) setSelectedTime(time);
                                }}
                                disabled={booked}
                                className={cn(
                                  "px-3 py-3 rounded-lg border-2 text-center transition-all font-medium text-sm min-h-20 flex flex-col items-center justify-center",
                                  booked
                                    ? "border-red-500 bg-red-100 text-red-700 cursor-not-allowed opacity-100 pointer-events-none"
                                    : selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-green-300 bg-green-50 text-gray-700 hover:border-green-500 hover:bg-green-100 cursor-pointer"
                                )}
                                title={booked ? "این ساعت رزرو شده است" : ""}
                              >
                                {booked ? (
                                  <>
                                    <X className="w-4 h-4 mb-0.5" />
                                    <span className="text-xs">{time}</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-4 h-4 mb-0.5" />
                                    <span className="text-sm">{time}</span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-green-50 border-2 border-green-300 rounded"></div>
                            <span className="text-gray-700 font-medium">ساعت آزاد</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-red-100 border-2 border-red-500 rounded"></div>
                            <span className="text-red-700 font-medium">رزرو شده</span>
                          </div>
                        </div>
                      </>
                    )}
                    {selectedDate && bookedTimes && bookedTimes.length > 0 && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        <strong>ساعت‌های اشغال شده:</strong> {bookedTimes.join(", ")}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-xl font-bold mb-6">اطلاعات تماس و تأیید</h2>
                  
                  <div className="bg-muted/50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold mb-3">خلاصه رزرو</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">خدمت:</span>
                        <span className="font-medium">{getSelectedServiceData()?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">متخصص:</span>
                        <span className="font-medium">{getSelectedSpecialistData()?.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تاریخ:</span>
                        <span className="font-medium">
                          {selectedDate && new Date(selectedDate).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ساعت:</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border">
                        <span className="text-muted-foreground">مبلغ:</span>
                        <span className="font-bold text-primary">
                          {formatPrice(Number(getSelectedServiceData()?.price || 0))} تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">نام و نام خانوادگی *</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                          placeholder="نام خود را وارد کنید"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">شماره تماس *</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          placeholder="09121234567"
                          className="mt-1"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">ایمیل (اختیاری)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        placeholder="email@example.com"
                        className="mt-1"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">توضیحات (اختیاری)</Label>
                      <Textarea
                        id="notes"
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                        placeholder="اگر توضیحات خاصی دارید اینجا بنویسید..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  مرحله قبل
                </Button>
                
                {currentStep < 4 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="gap-2"
                  >
                    مرحله بعد
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceed() || createBooking.isPending}
                    className="gap-2"
                  >
                    {createBooking.isPending ? "در حال ثبت..." : "ثبت رزرو"}
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}