import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CustomerDashboard from "./pages/CustomerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Marketplace from "./pages/Marketplace";
import StorePage from "./pages/StorePage";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/AboutUs";
import Support from "./pages/Support";
import OurValues from "./pages/OurValues";
import BusinessPlan from "./pages/BusinessPlan";
import RiderAgreement from "./pages/RiderAgreement";
import Portfolio from "./pages/Portfolio";
import WomensDay from "./pages/WomensDay";
import ErrandServices from "./pages/ErrandServices";
import ErrandCategory from "./pages/ErrandCategory";
import SupportChatWidget from "./components/support/SupportChatWidget";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/support" element={<Support />} />
              <Route path="/our-values" element={<OurValues />} />
              <Route
                path="/business-plan"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <BusinessPlan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rider-agreement"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <RiderAgreement />
                  </ProtectedRoute>
                }
              />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/womens-day" element={<WomensDay />} />
              <Route path="/store/:storeId" element={<StorePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={["driver"]}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SupportChatWidget />
            
          </AuthProvider>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
