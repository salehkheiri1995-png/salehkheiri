import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function Privacy() {
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">حریم خصوصی</h1>
            <p className="text-muted-foreground">
              ما به حفظ حریم خصوصی شما متعهد هستیم
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border p-8 space-y-8"
          >
            <section>
              <h2 className="text-xl font-bold mb-4">جمع‌آوری اطلاعات</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما اطلاعات شخصی شما را فقط در صورت نیاز جمع‌آوری می‌کنیم. این اطلاعات شامل نام، شماره تلفن، آدرس ایمیل و آدرس پستی (برای ارسال سفارشات) می‌شود. این اطلاعات فقط برای ارائه خدمات بهتر به شما استفاده می‌شود.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">استفاده از اطلاعات</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>پردازش سفارشات و ارسال محصولات</li>
                <li>مدیریت رزرو نوبت و یادآوری‌ها</li>
                <li>ارسال اطلاعیه‌های مهم درباره سفارشات یا نوبت‌ها</li>
                <li>بهبود خدمات و تجربه کاربری</li>
                <li>ارسال پیشنهادات ویژه (در صورت رضایت شما)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">حفاظت از اطلاعات</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما از روش‌های امنیتی پیشرفته برای محافظت از اطلاعات شما استفاده می‌کنیم. تمامی اطلاعات حساس شما با استفاده از پروتکل‌های امن (SSL) رمزنگاری می‌شود. دسترسی به اطلاعات شخصی شما فقط برای کارکنان مجاز امکان‌پذیر است.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">اشتراک‌گذاری اطلاعات</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما اطلاعات شخصی شما را به هیچ شخص یا سازمان ثالثی نمی‌فروشیم یا اجاره نمی‌دهیم. اطلاعات شما فقط در موارد زیر ممکن است به اشتراک گذاشته شود:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside mt-2">
                <li>با رضایت صریح شما</li>
                <li>برای ارسال سفارشات (فقط آدرس و نام به شرکت پست)</li>
                <li>در صورت الزام قانونی</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">کوکی‌ها</h2>
              <p className="text-muted-foreground leading-relaxed">
                ما از کوکی‌ها برای بهبود تجربه کاربری شما استفاده می‌کنیم. کوکی‌ها به ما کمک می‌کنند تا ترجیحات شما را به خاطر بسپاریم و محتوای مرتبط‌تری نمایش دهیم. شما می‌توانید کوکی‌ها را در تنظیمات مرورگر خود غیرفعال کنید.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">حقوق شما</h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>دسترسی به اطلاعات شخصی ذخیره شده</li>
                <li>درخواست اصلاح اطلاعات نادرست</li>
                <li>درخواست حذف اطلاعات شخصی</li>
                <li>انصراف از دریافت پیام‌های تبلیغاتی</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-4">تماس با ما</h2>
              <p className="text-muted-foreground leading-relaxed">
                در صورت داشتن هرگونه سوال درباره سیاست حریم خصوصی ما، می‌توانید از طریق صفحه تماس با ما با ما در ارتباط باشید.
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
