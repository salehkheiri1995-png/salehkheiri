export default function AdminSettings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">تنظیمات</h1>
        <p className="text-muted-foreground mt-1">تنظیمات عمومی سالن</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold mb-4">اطلاعات سالن</h2>
        <p className="text-muted-foreground">
          این بخش در حال توسعه است. به زودی امکان تغییر نام سالن، لوگو، اطلاعات تماس و سایر تنظیمات فراهم می‌شود.
        </p>
      </div>
    </div>
  );
}
