import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Ban,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive";
  joinedAt: string;
  avatar?: string;
}

// داده‌های نمونه - در پروژه واقعی از API دریافت می‌شود
const mockUsers: User[] = [
  {
    id: "1",
    name: "صالح خیری",
    email: "saleh@example.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "علی محمدی",
    email: "ali@example.com",
    role: "user",
    status: "active",
    joinedAt: "2024-02-20",
  },
  {
    id: "3",
    name: "مریم احمدی",
    email: "maryam@example.com",
    role: "user",
    status: "inactive",
    joinedAt: "2024-03-10",
  },
  {
    id: "4",
    name: "رضا کریمی",
    email: "reza@example.com",
    role: "user",
    status: "active",
    joinedAt: "2024-03-25",
  },
  {
    id: "5",
    name: "فاطمه رضایی",
    email: "fateme@example.com",
    role: "admin",
    status: "active",
    joinedAt: "2024-04-05",
  },
];

export const UsersTable = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // فیلتر کردن کاربران
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // محاسبه صفحه‌بندی
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // حذف کاربر
  const handleDeleteUser = () => {
    if (deleteUserId) {
      setUsers(users.filter((user) => user.id !== deleteUserId));
      toast({
        title: "کاربر حذف شد",
        description: "کاربر با موفقیت از سیستم حذف شد.",
      });
      setDeleteUserId(null);
    }
  };

  // تغییر نقش کاربر
  const handleChangeRole = (userId: string, newRole: "admin" | "user") => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
    toast({
      title: "نقش کاربر تغییر کرد",
      description: `نقش کاربر به ${newRole === "admin" ? "مدیر" : "کاربر عادی"} تغییر یافت.`,
    });
  };

  // تغییر وضعیت کاربر
  const handleChangeStatus = (
    userId: string,
    newStatus: "active" | "inactive"
  ) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    toast({
      title: "وضعیت کاربر تغییر کرد",
      description: `کاربر ${newStatus === "active" ? "فعال" : "غیرفعال"} شد.`,
    });
  };

  // ویرایش کاربر
  const handleEditUser = () => {
    if (editUser) {
      setUsers(
        users.map((user) => (user.id === editUser.id ? editUser : user))
      );
      toast({
        title: "اطلاعات ذخیره شد",
        description: "اطلاعات کاربر با موفقیت به‌روزرسانی شد.",
      });
      setIsEditDialogOpen(false);
      setEditUser(null);
    }
  };

  // باز کردن دیالوگ ویرایش
  const openEditDialog = (user: User) => {
    setEditUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="w-full space-y-6 p-4 md:p-6">
      {/* هدر و فیلترها */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">مدیریت کاربران</h2>
          <p className="text-sm text-muted-foreground">
            مشاهده و مدیریت کاربران سیستم
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <UserPlus className="ml-2 h-4 w-4" />
          افزودن کاربر جدید
        </Button>
      </div>

      {/* فیلترها و جستجو */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام یا ایمیل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="نقش" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه نقش‌ها</SelectItem>
            <SelectItem value="admin">مدیر</SelectItem>
            <SelectItem value="user">کاربر</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="inactive">غیرفعال</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* جدول کاربران */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-right font-semibold">نام کاربر</TableHead>
                <TableHead className="text-right font-semibold">ایمیل</TableHead>
                <TableHead className="text-center font-semibold">نقش</TableHead>
                <TableHead className="text-center font-semibold">وضعیت</TableHead>
                <TableHead className="text-center font-semibold">تاریخ عضویت</TableHead>
                <TableHead className="text-center font-semibold">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <p className="text-lg font-medium">کاربری یافت نشد</p>
                      <p className="text-sm">فیلترهای خود را تغییر دهید یا کاربر جدیدی اضافه کنید.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {user.name.charAt(0)}
                        </div>
                        <span className="truncate">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="truncate block max-w-[200px]">{user.email}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="min-w-[60px]"
                      >
                        {user.role === "admin" ? "مدیر" : "کاربر"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "destructive"
                        }
                        className={
                          user.status === "active"
                            ? "min-w-[70px] bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100"
                            : "min-w-[70px]"
                        }
                      >
                        {user.status === "active" ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="ml-2 h-4 w-4" />
                            <span>ویرایش اطلاعات</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeRole(
                                user.id,
                                user.role === "admin" ? "user" : "admin"
                              )
                            }
                          >
                            <Shield className="ml-2 h-4 w-4" />
                            <span>تغییر به {user.role === "admin" ? "کاربر" : "مدیر"}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleChangeStatus(
                                user.id,
                                user.status === "active" ? "inactive" : "active"
                              )
                            }
                          >
                            {user.status === "active" ? (
                              <>
                                <Ban className="ml-2 h-4 w-4" />
                                <span>غیرفعال کردن</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="ml-2 h-4 w-4" />
                                <span>فعال کردن</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteUserId(user.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            <span>حذف کاربر</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* صفحه‌بندی */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            نمایش <span className="font-medium">{startIndex + 1}</span> تا{" "}
            <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> از{" "}
            <span className="font-medium">{filteredUsers.length}</span> کاربر
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-9"
            >
              قبلی
            </Button>
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="h-9 w-9"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="h-9"
            >
              بعدی
            </Button>
          </div>
        </div>
      )}

      {/* دیالوگ حذف کاربر */}
      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>آیا مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              این عملیات قابل بازگشت نیست. این کاربر به طور دائم از سیستم حذف
              خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* دیالوگ ویرایش کاربر */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>ویرایش اطلاعات کاربر</DialogTitle>
            <DialogDescription className="text-right">
              اطلاعات کاربر را ویرایش کرده و تغییرات را ذخیره کنید.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-right">نام کاربر</Label>
                <Input
                  id="name"
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser({ ...editUser, name: e.target.value })
                  }
                  className="text-right"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-right">ایمیل</Label>
                <Input
                  id="email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) =>
                    setEditUser({ ...editUser, email: e.target.value })
                  }
                  className="text-left"
                  dir="ltr"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role" className="text-right">نقش</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value: "admin" | "user") =>
                    setEditUser({ ...editUser, role: value })
                  }
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">مدیر</SelectItem>
                    <SelectItem value="user">کاربر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-right">وضعیت</Label>
                <Select
                  value={editUser.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditUser({ ...editUser, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">فعال</SelectItem>
                    <SelectItem value="inactive">غیرفعال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              انصراف
            </Button>
            <Button onClick={handleEditUser}>ذخیره تغییرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
