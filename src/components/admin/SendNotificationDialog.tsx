import { useState, useEffect } from "react";
import { Bell, Send, Search, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface User {
  id: string;
  full_name: string | null;
  phone: string | null;
}

export function SendNotificationDialog() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<string>("info");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("خطا در دریافت کاربران");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.includes(search) ||
      u.phone?.includes(search)
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      setSelectAll(false);
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("لطفاً عنوان و متن پیام را وارد کنید");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("لطفاً حداقل یک کاربر را انتخاب کنید");
      return;
    }

    setSending(true);
    try {
      const notifications = selectedUsers.map((userId) => ({
        user_id: userId,
        title,
        message,
        type,
        link: link || null,
        is_read: false,
      }));

      const { error } = await supabase.from("notifications").insert(notifications);

      if (error) throw error;

      toast.success(`پیام به ${selectedUsers.length} کاربر ارسال شد`);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error sending notifications:", error);
      toast.error("خطا در ارسال پیام");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setType("info");
    setLink("");
    setSelectedUsers([]);
    setSelectAll(false);
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Bell className="w-4 h-4" />
          ارسال اعلان
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            ارسال اعلان به کاربران
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left: User Selection */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">انتخاب کاربران</span>
              {selectedUsers.length > 0 && (
                <span className="text-sm text-primary">
                  ({selectedUsers.length} انتخاب شده)
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی کاربر..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>

            <div className="flex items-center gap-2 px-2">
              <Checkbox
                id="select-all"
                checked={selectAll}
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                انتخاب همه
              </label>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[250px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      کاربری یافت نشد
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={(checked) =>
                            handleUserToggle(user.id, checked as boolean)
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {user.full_name || "بدون نام"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.phone || "-"}
                          </p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Right: Message Form */}
          <div className="flex flex-col gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">نوع اعلان</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">اطلاع‌رسانی</SelectItem>
                    <SelectItem value="success">موفقیت</SelectItem>
                    <SelectItem value="warning">هشدار</SelectItem>
                    <SelectItem value="error">خطا</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">عنوان *</label>
                <Input
                  placeholder="عنوان اعلان..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">متن پیام *</label>
                <Textarea
                  placeholder="متن اعلان را بنویسید..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">لینک (اختیاری)</label>
                <Input
                  placeholder="/dashboard"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  dir="ltr"
                />
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={sending || selectedUsers.length === 0}
              className="w-full gap-2 mt-auto"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              ارسال به {selectedUsers.length} کاربر
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
