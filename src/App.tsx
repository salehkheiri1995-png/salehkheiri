import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { useApplyTheme } from "@/hooks/useThemeSettings";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import Courses from "./pages/Courses";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Specialists from "./pages/Specialists";
import SpecialistDetail from "./pages/SpecialistDetail";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminServices from "./pages/admin/Services";
import AdminProducts from "./pages/admin/Products";
import AdminSpecialists from "./pages/admin/Specialists";
import AdminCourses from "./pages/admin/Courses";
import AdminLessons from "./pages/admin/Lessons";
import AdminBookings from "./pages/admin/Bookings";
import AdminOrders from "./pages/admin/Orders";
import AdminShippingMethods from "./pages/admin/ShippingMethods";
import AdminReviews from "./pages/admin/Reviews";
import AdminUsers from "./pages/admin/Users";
import AdminEnrollments from "./pages/admin/Enrollments";
import AdminSettings from "./pages/admin/Settings";
import CourseDetail from "./pages/CourseDetail";

const queryClient = new QueryClient();

// Component to apply theme
function ThemeApplier({ children }: { children: React.ReactNode }) {
  useApplyTheme();
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <ThemeApplier>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/services" element={<Services />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/specialists" element={<Specialists />} />
              <Route path="/specialists/:id" element={<SpecialistDetail />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/dashboard" element={<Dashboard />} />
            
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="specialists" element={<AdminSpecialists />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:courseId/lessons" element={<AdminLessons />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="shipping" element={<AdminShippingMethods />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="enrollments" element={<AdminEnrollments />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeApplier>
    </CartProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
