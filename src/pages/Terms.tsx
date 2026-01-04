import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Terms() {
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">قوانین و مقررات</h1>
            <p className="text-muted-foreground">
              لطفاً قبل از استفاده از خدمات، قوانین زیر را مطالعه فرمایید
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border p-8 space-y-8"
          >
            <section>
              <h2 className="text-xl font-bold mb-4">۱. شرایط استفاده از خدمات</h2>
              <p className="text-muted-foreground leading-relaxed">
                با استفاده از خدمات سالن زیبایی ما، شما موافقت خود را با تمامی قوانین و مقررات ذکر شده در این صفحه اعلام می‌دارید. استفاده از خدمات ما به منزله پذیرش کامل این شرایط است.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">۲. رزرو و لغو نوبت</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>رزرو نوبت پس از تأیید نهایی غیرقابل انتقال به فرد دیگر است.</li>
                <li>لغو نوبت باید حداقل ۲۴ ساعت قبل از زمان رزرو انجام شود.</li>
                <li>در صورت عدم حضور بدون اطلاع قبلی، ممکن است محدودیت‌هایی برای رزرو‌های آینده اعمال شود.</li>
                <li>سالن حق لغو یا تغییر زمان نوبت در شرایط اضطراری را برای خود محفوظ می‌دارد.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">۳. خرید محصولات</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>تمامی محصولات عرضه شده اصل و دارای ضمانت اصالت هستند.</li>
                <li>امکان مرجوع کردن محصولات پلمپ ظرف ۷ روز وجود دارد.</li>
                <li>محصولات باز شده یا استفاده شده قابل مرجوع نیستند.</li>
                <li>هزینه ارسال برای سفارش‌های زیر ۵۰۰ هزار تومان به عهده مشتری است.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">۴. دوره‌های آموزشی</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>دسترسی به دوره‌های آموزشی پس از پرداخت فوراً فعال می‌شود.</li>
                <li>اشتراک‌گذاری حساب کاربری یا محتوای دوره‌ها ممنوع است.</li>
                <li>وجه پرداختی برای دوره‌های آموزشی غیرقابل استرداد است.</li>
                <li>گواهی پایان دوره فقط پس از تکمیل کامل دوره صادر می‌شود.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">۵. مسئولیت‌ها</h2>
              <p className="text-muted-foreground leading-relaxed">
                سالن زیبایی در قبال آسیب‌های ناشی از عدم رعایت دستورالعمل‌های بهداشتی یا استفاده نادرست از محصولات مسئولیتی نخواهد داشت. مشتریان موظفند هرگونه حساسیت یا بیماری پوستی را قبل از دریافت خدمات اطلاع دهند.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">۶. حل اختلافات</h2>
              <p className="text-muted-foreground leading-relaxed">
                در صورت بروز هرگونه اختلاف، ابتدا از طریق مذاکره و گفتگو سعی در حل موضوع خواهد شد. در صورت عدم توافق، موضوع به مراجع قانونی ذیصلاح ارجاع داده می‌شود.
              </p>
            </section>

            <div className="pt-4 border-t text-sm text-muted-foreground">
              آخرین بروزرسانی: دی ماه ۱۴۰۴
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
