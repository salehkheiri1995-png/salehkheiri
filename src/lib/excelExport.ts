import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const formatOrdersForExport = (orders: any[]) => {
  return orders.map((order) => ({
    'نام مشتری': order.customer_name,
    'شماره تماس': order.customer_phone,
    'ایمیل': order.customer_email || '-',
    'آدرس': order.address,
    'تعداد اقلام': order.order_items?.length || 0,
    'جمع اقلام': order.subtotal,
    'هزینه ارسال': order.shipping_cost,
    'مبلغ کل': order.total,
    'روش ارسال': order.shipping_methods?.name || '-',
    'وضعیت': getOrderStatusLabel(order.status),
    'تاریخ': new Date(order.created_at).toLocaleDateString('fa-IR'),
    'یادداشت': order.notes || '-',
  }));
};

export const formatBookingsForExport = (bookings: any[]) => {
  return bookings.map((booking) => ({
    'نام مشتری': booking.customer_name,
    'شماره تماس': booking.customer_phone,
    'ایمیل': booking.customer_email || '-',
    'خدمت': booking.services?.name || '-',
    'متخصص': booking.specialists?.full_name || '-',
    'تاریخ رزرو': booking.booking_date,
    'ساعت رزرو': booking.booking_time,
    'وضعیت': getBookingStatusLabel(booking.status),
    'تاریخ ثبت': new Date(booking.created_at).toLocaleDateString('fa-IR'),
    'یادداشت': booking.notes || '-',
  }));
};

export const formatEnrollmentsForExport = (enrollments: any[]) => {
  return enrollments.map((enrollment) => ({
    'نام کاربر': enrollment.profiles?.full_name || '-',
    'شماره تماس': enrollment.profiles?.phone || '-',
    'عنوان دوره': enrollment.courses?.title || '-',
    'قیمت دوره': enrollment.courses?.price || 0,
    'وضعیت پرداخت': getPaymentStatusLabel(enrollment.payment_status),
    'پیشرفت (%)': enrollment.progress_percent || 0,
    'تکمیل شده': enrollment.completed_at ? 'بله' : 'خیر',
    'تاریخ ثبت‌نام': new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR'),
  }));
};

const getOrderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'در انتظار',
    confirmed: 'تایید شده',
    processing: 'در حال آماده‌سازی',
    shipped: 'ارسال شده',
    delivered: 'تحویل داده شده',
    cancelled: 'لغو شده',
  };
  return labels[status] || status;
};

const getBookingStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'در انتظار',
    confirmed: 'تایید شده',
    cancelled: 'لغو شده',
    completed: 'انجام شده',
  };
  return labels[status] || status;
};

const getPaymentStatusLabel = (status: string | null): string => {
  const labels: Record<string, string> = {
    completed: 'پرداخت شده',
    pending: 'در انتظار پرداخت',
    failed: 'ناموفق',
  };
  return labels[status || 'pending'] || 'نامشخص';
};
