import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Trash2,
  Edit2,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  ShoppingCart,
  Calendar,
  BookOpen,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  orders_count?: number;
  bookings_count?: number;
  enrollments_count?: number;
  role?: 'admin' | 'moderator' | 'user';
}

const STATUS_LABELS: Record<string, string> = {
  admin: "ادمین",
  moderator: "مدیر محتوا",
  user: "کاربر عادی",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/20 text-red-700 dark:text-red-400",
  moderator: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
  user: "bg-gray-500/20 text-gray-700 dark:text-gray-400",
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete options state
  const [deleteOptions, setDeleteOptions] = useState({
    orders: true,
    bookings: true,
    enrollments: true,
    reviews: true,
  });

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "user" as 'user' | 'admin' | 'moderator',
  });

  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    role: "user" as 'user' | 'admin' | 'moderator',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const roleMap = new Map<string, string>();
      rolesData?.forEach((r) => roleMap.set(r.user_id, r.role));

      // Fetch counts for each user
      const usersWithCounts = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [{ count: ordersCount }, { count: bookingsCount }, { count: enrollmentsCount }] = await Promise.all([
            supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
            supabase.from("bookings").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
            supabase.from("course_enrollments").select("id", { count: "exact", head: true }).eq("user_id", profile.id),
          ]);

          return {
            ...profile,
            orders_count: ordersCount || 0,
            bookings_count: bookingsCount || 0,
            enrollments_count: enrollmentsCount || 0,
            role: (roleMap.get(profile.id) || "user") as 'admin' | 'moderator' | 'user',
          };
        })
      );

      setUsers(usersWithCounts);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطا در دریافت اطلاعات کاربران");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
  );

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) {
      toast.error("ایمیل و رمز عبور الزامی هستند");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke("create-user", {
        body: formData,
      });

      if (response.error) throw new Error(response.error.message);

      toast.success("کاربر با موفقیت ایجاد شد");
      setAddDialogOpen(false);
      setFormData({ email: "", password: "", full_name: "", phone: "", role: "user" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "خطا در ایجاد کاربر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke("manage-user", {
        body: {
          action: "update",
          user_id: selectedUser.id,
          ...editFormData,
        },
      });

      if (response.error) throw new Error(response.error.message);

      toast.success("کاربر با موفقیت به‌روزرسانی شد");
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "خطا در به‌روزرسانی کاربر");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke("manage-user", {
        body: {
          action: "delete",
          user_id: selectedUser.id,
          delete_options: deleteOptions,
        },
      });

      if (response.error) throw new Error(response.error.message);

      toast.success("کاربر با موفقیت حذف شد");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setDeleteOptions({ orders: true, bookings: true, enrollments: true, reviews: true });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "خطا در حذف کاربر");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Users className="w-6 h-6" />
              مدیریت کاربران
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} کاربر ثبت‌نام شده
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                افزودن کاربر
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن کاربر جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block text-right mb-2">ایمیل *</label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block text-right mb-2">رمز عبور *</label>
                  <Input
                    type="password"
                    placeholder="حداقل 6 کاراکتر"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block text-right mb-2">نام کامل</label>
                  <Input
                    placeholder="نام و نام خانوادگی"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block text-right mb-2">شماره تماس</label>
                  <Input
                    placeholder="09123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block text-right mb-2">نقش</label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">کاربر عادی</SelectItem>
                      <SelectItem value="moderator">مدیر محتوا</SelectItem>
                      <SelectItem value="admin">ادمین</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  className="w-full gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  ایجاد کاربر
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام یا شماره تماس..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">کاربری یافت نشد</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50 border-y border-border">
                <th className="w-10 text-center p-3"></th>
                <th className="text-right p-3 border-r border-border min-w-[150px] text-sm font-semibold text-foreground">نام</th>
                <th className="text-right p-3 border-r border-border min-w-[130px] text-sm font-semibold text-foreground">شماره تماس</th>
                <th className="text-right p-3 border-r border-border min-w-[100px] text-sm font-semibold text-foreground">نقش</th>
                <th className="text-center p-3 border-r border-border min-w-[80px] text-sm font-semibold text-foreground">سفارشات</th>
                <th className="text-center p-3 border-r border-border min-w-[80px] text-sm font-semibold text-foreground">رزروها</th>
                <th className="text-center p-3 border-r border-border min-w-[80px] text-sm font-semibold text-foreground">دوره‌ها</th>
                <th className="text-right p-3 border-r border-border min-w-[140px] text-sm font-semibold text-foreground">تاریخ عضویت</th>
                <th className="text-center p-3 border-r border-border text-sm font-semibold text-foreground">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <>
                  <tr
                    key={user.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? "bg-background" : "bg-muted/10"
                    }`}
                  >
                    <td className="text-center p-3">
                      <button
                        onClick={() =>
                          setExpandedUser(
                            expandedUser === user.id ? null : user.id
                          )
                        }
                        className="hover:bg-muted rounded p-1"
                      >
                        {expandedUser === user.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="text-right p-3 border-r border-border text-sm font-medium">
                      {user.full_name || "بدون نام"}
                    </td>
                    <td className="text-right p-3 border-r border-border text-sm">
                      {user.phone || "-"}
                    </td>
                    <td className="text-right p-3 border-r border-border">
                      <Badge className={`${ROLE_COLORS[user.role || "user"]} border-none`}>
                        {STATUS_LABELS[user.role || "user"]}
                      </Badge>
                    </td>
                    <td className="text-center p-3 border-r border-border">
                      <Badge variant="outline" className="gap-1 justify-center w-full">
                        <ShoppingCart className="w-3 h-3" />
                        {user.orders_count || 0}
                      </Badge>
                    </td>
                    <td className="text-center p-3 border-r border-border">
                      <Badge variant="outline" className="gap-1 justify-center w-full">
                        <Calendar className="w-3 h-3" />
                        {user.bookings_count || 0}
                      </Badge>
                    </td>
                    <td className="text-center p-3 border-r border-border">
                      <Badge variant="outline" className="gap-1 justify-center w-full">
                        <BookOpen className="w-3 h-3" />
                        {user.enrollments_count || 0}
                      </Badge>
                    </td>
                    <td className="text-right p-3 border-r border-border text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(user.created_at), {
                        addSuffix: true,
                        locale: faIR,
                      })}
                    </td>
                    <td className="text-center p-3 border-r border-border">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          title="مشاهده جزئیات"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditFormData({
                              full_name: user.full_name || "",
                              phone: user.phone || "",
                              role: (user.role as any) || "user",
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedUser === user.id && (
                    <tr className="bg-muted/20 border-b border-border">
                      <td colSpan={9} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Orders */}
                          <div className="border border-border rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                              <ShoppingCart className="w-4 h-4" />
                              سفارشات
                            </h4>
                            <p className="text-sm text-muted-foreground">تعداد: {user.orders_count || 0}</p>
                          </div>

                          {/* Bookings */}
                          <div className="border border-border rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                              <Calendar className="w-4 h-4" />
                              رزروها
                            </h4>
                            <p className="text-sm text-muted-foreground">تعداد: {user.bookings_count || 0}</p>
                          </div>

                          {/* Enrollments */}
                          <div className="border border-border rounded-lg p-4">
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                              <BookOpen className="w-4 h-4" />
                              دوره‌های ثبت‌نام شده
                            </h4>
                            <p className="text-sm text-muted-foreground">تعداد: {user.enrollments_count || 0}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block text-right mb-2">نام کامل</label>
              <Input
                placeholder="نام و نام خانوادگی"
                value={editFormData.full_name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, full_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium block text-right mb-2">شماره تماس</label>
              <Input
                placeholder="09123456789"
                value={editFormData.phone}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, phone: e.target.value })
                }
                dir="ltr"
                className="text-left"
              />
            </div>
            <div>
              <label className="text-sm font-medium block text-right mb-2">نقش</label>
              <Select
                value={editFormData.role}
                onValueChange={(value: any) =>
                  setEditFormData({ ...editFormData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">کاربر عادی</SelectItem>
                  <SelectItem value="moderator">مدیر محتوا</SelectItem>
                  <SelectItem value="admin">ادمین</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleEditUser}
              disabled={isSubmitting}
              className="w-full gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit2 className="w-4 h-4" />
              )}
              ذخیره تغییرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              حذف کاربر
            </AlertDialogTitle>
            <AlertDialogDescription>
              کاربر «{selectedUser?.full_name || "بدون نام"}» حذف خواهد شد. کدام اطلاعات حذف شوند؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="delete-orders" 
                checked={deleteOptions.orders}
                onCheckedChange={(checked) => setDeleteOptions({...deleteOptions, orders: !!checked})}
              />
              <label htmlFor="delete-orders" className="text-sm flex items-center gap-2 cursor-pointer">
                <ShoppingCart className="w-4 h-4" />
                سفارشات ({selectedUser?.orders_count || 0})
              </label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="delete-bookings" 
                checked={deleteOptions.bookings}
                onCheckedChange={(checked) => setDeleteOptions({...deleteOptions, bookings: !!checked})}
              />
              <label htmlFor="delete-bookings" className="text-sm flex items-center gap-2 cursor-pointer">
                <Calendar className="w-4 h-4" />
                رزروها ({selectedUser?.bookings_count || 0})
              </label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="delete-enrollments" 
                checked={deleteOptions.enrollments}
                onCheckedChange={(checked) => setDeleteOptions({...deleteOptions, enrollments: !!checked})}
              />
              <label htmlFor="delete-enrollments" className="text-sm flex items-center gap-2 cursor-pointer">
                <BookOpen className="w-4 h-4" />
                ثبت‌نام دوره‌ها ({selectedUser?.enrollments_count || 0})
              </label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="delete-reviews" 
                checked={deleteOptions.reviews}
                onCheckedChange={(checked) => setDeleteOptions({...deleteOptions, reviews: !!checked})}
              />
              <label htmlFor="delete-reviews" className="text-sm flex items-center gap-2 cursor-pointer">
                ⭐ نظرات
              </label>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            💡 موارد تیک‌نخورده حفظ می‌شوند ولی ارتباط با کاربر قطع می‌شود
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              حذف کاربر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}