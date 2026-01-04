import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  ShoppingCart, 
  Calendar, 
  GraduationCap,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Loader2,
  Edit,
  Trash2,
  Filter
} from "lucide-react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

interface UserOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

interface UserBooking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  services?: { name: string } | null;
}

interface UserEnrollment {
  id: string;
  enrolled_at: string;
  progress_percent: number | null;
  courses?: { title: string } | null;
}

interface UserRole {
  role: 'admin' | 'moderator' | 'user';
}

interface UserWithDetails extends UserProfile {
  orders: UserOrder[];
  bookings: UserBooking[];
  enrollments: UserEnrollment[];
  role: 'admin' | 'moderator' | 'user';
}

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  processing: "در حال پردازش",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
  confirmed: "تایید شده",
  completed: "انجام شده",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "ادمین",
  moderator: "مدیر محتوا",
  user: "کاربر عادی",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  moderator: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
};

interface AddUserForm {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin' | 'moderator';
}

interface EditUserForm {
  full_name: string;
  phone: string;
  role: 'user' | 'admin' | 'moderator';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  // Add user dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [formData, setFormData] = useState<AddUserForm>({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'user'
  });
  
  // Edit user dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDetails | null>(null);
  const [editFormData, setEditFormData] = useState<EditUserForm>({
    full_name: '',
    phone: '',
    role: 'user'
  });
  const [updatingUser, setUpdatingUser] = useState(false);
  
  // Delete user dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithDetails | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Create role map
      const roleMap = new Map<string, 'admin' | 'moderator' | 'user'>();
      roles?.forEach(r => {
        roleMap.set(r.user_id, r.role as 'admin' | 'moderator' | 'user');
      });

      // For each profile, get their orders, bookings, and enrollments
      const usersWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          const [ordersRes, bookingsRes, enrollmentsRes] = await Promise.all([
            supabase
              .from("orders")
              .select("id, total, status, created_at")
              .eq("user_id", profile.id)
              .order("created_at", { ascending: false })
              .limit(5),
            supabase
              .from("bookings")
              .select("id, booking_date, booking_time, status, services(name)")
              .eq("user_id", profile.id)
              .order("booking_date", { ascending: false })
              .limit(5),
            supabase
              .from("course_enrollments")
              .select("id, enrolled_at, progress_percent, courses(title)")
              .eq("user_id", profile.id)
              .order("enrolled_at", { ascending: false }),
          ]);

          return {
            ...profile,
            orders: ordersRes.data || [],
            bookings: bookingsRes.data || [],
            enrollments: enrollmentsRes.data || [],
            role: roleMap.get(profile.id) || 'user',
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fa-IR").format(price);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.full_name?.includes(search) || u.phone?.includes(search);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    if (!formData.email || !formData.password) {
      toast.error('ایمیل و رمز عبور الزامی است');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    setAddingUser(true);
    try {
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          role: formData.role
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'خطا در ایجاد کاربر');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('کاربر با موفقیت ایجاد شد');
      setAddDialogOpen(false);
      setFormData({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        role: 'user'
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'خطا در ایجاد کاربر');
    } finally {
      setAddingUser(false);
    }
  };

  const openEditDialog = (user: UserWithDetails) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setUpdatingUser(true);
    try {
      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'update',
          user_id: editingUser.id,
          full_name: editFormData.full_name || null,
          phone: editFormData.phone || null,
          role: editFormData.role
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'خطا در به‌روزرسانی کاربر');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('کاربر با موفقیت به‌روزرسانی شد');
      setEditDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'خطا در به‌روزرسانی کاربر');
    } finally {
      setUpdatingUser(false);
    }
  };

  const openDeleteDialog = (user: UserWithDetails) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(true);
    try {
      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'delete',
          user_id: userToDelete.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'خطا در حذف کاربر');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success('کاربر با موفقیت حذف شد');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'خطا در حذف کاربر');
    } finally {
      setDeletingUser(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8" />
            مدیریت کاربران
          </h1>
          <p className="text-muted-foreground mt-1">
            {users.length} کاربر ثبت‌نام شده
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              افزودن کاربر
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>افزودن کاربر جدید</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">ایمیل *</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">رمز عبور *</label>
                <Input
                  type="password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">نام کامل</label>
                <Input
                  placeholder="نام و نام خانوادگی"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">شماره تماس</label>
                <Input
                  placeholder="09123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">نقش</label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'user' | 'admin' | 'moderator') => 
                    setFormData({ ...formData, role: value })
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
                onClick={handleAddUser} 
                disabled={addingUser}
                className="w-full gap-2"
              >
                {addingUser ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                ایجاد کاربر
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="جستجوی نام یا شماره تماس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-48 gap-2">
            <Filter className="w-4 h-4" />
            <SelectValue placeholder="فیلتر نقش" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه نقش‌ها</SelectItem>
            <SelectItem value="admin">ادمین</SelectItem>
            <SelectItem value="moderator">مدیر محتوا</SelectItem>
            <SelectItem value="user">کاربر عادی</SelectItem>
          </SelectContent>
        </Select>
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
                <TableHead className="w-12"></TableHead>
                <TableHead>نام</TableHead>
                <TableHead>شماره تماس</TableHead>
                <TableHead>نقش</TableHead>
                <TableHead>سفارشات</TableHead>
                <TableHead>رزروها</TableHead>
                <TableHead>دوره‌ها</TableHead>
                <TableHead>تاریخ عضویت</TableHead>
                <TableHead className="w-24">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <Collapsible
                  key={user.id}
                  open={expandedUser === user.id}
                  onOpenChange={(open) => setExpandedUser(open ? user.id : null)}
                  asChild
                >
                  <>
                    <TableRow className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {expandedUser === user.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.full_name || "بدون نام"}
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Badge className={ROLE_COLORS[user.role]}>
                          {ROLE_LABELS[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          {user.orders.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.bookings.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {user.enrollments.length}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(user.created_at), {
                            addSuffix: true,
                            locale: faIR,
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(user);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(user);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <tr>
                        <td colSpan={9} className="bg-muted/30 p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Orders */}
                            <div className="bg-card rounded-xl p-4 border border-border">
                              <h3 className="font-bold mb-3 flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-primary" />
                                سفارشات اخیر
                              </h3>
                              {user.orders.length === 0 ? (
                                <p className="text-sm text-muted-foreground">سفارشی ندارد</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.orders.map((order) => (
                                    <div
                                      key={order.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <Badge variant="outline" className="text-xs">
                                        {STATUS_LABELS[order.status] || order.status}
                                      </Badge>
                                      <span className="font-medium">
                                        {formatPrice(order.total)} تومان
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Bookings */}
                            <div className="bg-card rounded-xl p-4 border border-border">
                              <h3 className="font-bold mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                رزروهای اخیر
                              </h3>
                              {user.bookings.length === 0 ? (
                                <p className="text-sm text-muted-foreground">رزروی ندارد</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.bookings.map((booking) => (
                                    <div
                                      key={booking.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span>{booking.services?.name || "-"}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {STATUS_LABELS[booking.status] || booking.status}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Enrollments */}
                            <div className="bg-card rounded-xl p-4 border border-border">
                              <h3 className="font-bold mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                دوره‌های ثبت‌نام شده
                              </h3>
                              {user.enrollments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">دوره‌ای ندارد</p>
                              ) : (
                                <div className="space-y-2">
                                  {user.enrollments.map((enrollment) => (
                                    <div
                                      key={enrollment.id}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span>{enrollment.courses?.title || "-"}</span>
                                      <Badge variant="outline" className="text-xs">
                                        {enrollment.progress_percent || 0}%
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش کاربر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">نام کامل</label>
              <Input
                placeholder="نام و نام خانوادگی"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">شماره تماس</label>
              <Input
                placeholder="09123456789"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">نقش</label>
              <Select
                value={editFormData.role}
                onValueChange={(value: 'user' | 'admin' | 'moderator') => 
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
              onClick={handleUpdateUser} 
              disabled={updatingUser}
              className="w-full gap-2"
            >
              {updatingUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
              ذخیره تغییرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید کاربر «{userToDelete?.full_name || 'بدون نام'}» را حذف کنید؟
              این عمل قابل بازگشت نیست و تمام اطلاعات کاربر حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deletingUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deletingUser ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              حذف کاربر
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
