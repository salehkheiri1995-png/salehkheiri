import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "چگونه می‌توانم نوبت رزرو کنم؟",
    answer: "برای رزرو نوبت، ابتدا وارد حساب کاربری خود شوید، سپس از منوی اصلی گزینه رزرو نوبت را انتخاب کنید. سرویس و متخصص مورد نظر را انتخاب کرده و تاریخ و ساعت دلخواه خود را مشخص کنید."
  },
  {
    question: "آیا امکان لغو نوبت وجود دارد؟",
    answer: "بله، شما می‌توانید تا ۲۴ ساعت قبل از زمان نوبت، از طریق پنل کاربری خود نوبت را لغو کنید. در صورت لغو دیرتر، ممکن است هزینه‌ای از شما کسر شود."
  },
  {
    question: "روش‌های پرداخت چیست؟",
    answer: "ما پرداخت آنلاین از طریق درگاه‌های بانکی معتبر، کارت به کارت و پرداخت حضوری را پشتیبانی می‌کنیم."
  },
  {
    question: "آیا محصولات ضمانت دارند؟",
    answer: "بله، تمامی محصولات فروشگاه ما اصل بوده و دارای ضمانت اصالت هستند. در صورت وجود هرگونه مشکل، می‌توانید محصول را ظرف ۷ روز مرجوع کنید."
  },
  {
    question: "هزینه ارسال چقدر است؟",
    answer: "هزینه ارسال بسته به روش ارسال و مقصد متفاوت است. برای سفارش‌های بالای ۵۰۰ هزار تومان، ارسال رایگان است."
  },
  {
    question: "چگونه می‌توانم در دوره‌های آموزشی ثبت‌نام کنم؟",
    answer: "برای ثبت‌نام در دوره‌های آموزشی، به بخش آموزش مراجعه کرده و دوره مورد نظر خود را انتخاب کنید. پس از پرداخت هزینه، دسترسی فوری به محتوای دوره خواهید داشت."
  },
  {
    question: "آیا گواهی پایان دوره صادر می‌شود؟",
    answer: "بله، پس از اتمام کامل هر دوره آموزشی و گذراندن آزمون نهایی، گواهی معتبر پایان دوره برای شما صادر می‌شود."
  },
  {
    question: "ساعات کاری سالن چیست؟",
    answer: "سالن ما از شنبه تا پنجشنبه از ساعت ۹ صبح تا ۹ شب و جمعه‌ها از ساعت ۱۰ صبح تا ۶ عصر فعال است."
  }
];

export default function FAQ() {
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
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">سوالات متداول</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              پاسخ سوالات رایج شما درباره خدمات، محصولات و دوره‌های آموزشی
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl border px-6"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-6">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
