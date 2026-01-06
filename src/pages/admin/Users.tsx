import { UsersTable } from "@/components/admin/UsersTable";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function AdminUsers() {
  return (
    <AdminLayout>
      <UsersTable />
    </AdminLayout>
  );
}
