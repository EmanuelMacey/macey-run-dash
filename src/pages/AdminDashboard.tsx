import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, BarChart3, ShoppingBag, Users, Tag, Store, Shield, Megaphone, MessageSquare, FileText, Bell, Crown, CreditCard, ClipboardList, UserPlus, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import NotificationBell from "@/components/customer/NotificationBell";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminDrivers from "@/components/admin/AdminDrivers";
import AdminPromoCodes from "@/components/admin/AdminPromoCodes";
import AdminStores from "@/components/admin/AdminStores";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminBanners from "@/components/admin/AdminBanners";
import AdminTestimonials from "@/components/admin/AdminTestimonials";
import AdminInvoices from "@/components/admin/AdminInvoices";
import AdminPromotions from "@/components/admin/AdminPromotions";
import AdminLeadership from "@/components/admin/AdminLeadership";
import AdminPaymentVerifications from "@/components/admin/AdminPaymentVerifications";
import AdminDriverApplications from "@/components/admin/AdminDriverApplications";
import ThemeToggle from "@/components/ThemeToggle";

const AdminDashboard = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen mesh-bg" onClick={unlockAudio}>
      <div className="particle w-4 h-4 bg-primary/10 top-28 left-[5%]" style={{ animationDelay: '1s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-56 right-[10%]" style={{ animationDelay: '3s' }} />

      <header className="bg-navy dark:bg-secondary/95 backdrop-blur-xl border-b border-navy/20 dark:border-white/10 safe-top">
        <div className="container mx-auto px-4 safe-x flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-navy-foreground dark:text-white">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-navy-foreground/70 hover:text-navy-foreground dark:text-white/70 dark:hover:text-white">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl relative">
        <h1 className="font-display text-3xl font-bold text-navy dark:text-white mb-4">Admin Dashboard</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link to="/admin/price-list">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <ClipboardList className="h-4 w-4" /> Price List
            </Button>
          </Link>
          <Link to="/admin/hiring">
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl">
              <UserPlus className="h-4 w-4" /> Hiring Flyer
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="flex flex-wrap w-full bg-card/80 dark:bg-white/5 backdrop-blur-sm border border-navy/10 dark:border-white/10 rounded-2xl p-1 gap-1">
            <TabsTrigger value="analytics" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <CreditCard className="h-4 w-4" /> <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <FileText className="h-4 w-4" /> <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Store className="h-4 w-4" /> <span className="hidden sm:inline">Stores</span>
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Users className="h-4 w-4" /> <span className="hidden sm:inline">Drivers</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="promos" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Tag className="h-4 w-4" /> <span className="hidden sm:inline">Promos</span>
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Megaphone className="h-4 w-4" /> <span className="hidden sm:inline">Banners</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Bell className="h-4 w-4" /> <span className="hidden sm:inline">Notify</span>
            </TabsTrigger>
            <TabsTrigger value="leadership" className="gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex-1 min-w-0">
              <Crown className="h-4 w-4" /> <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="payments"><AdminPaymentVerifications /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="invoices"><AdminInvoices /></TabsContent>
          <TabsContent value="stores"><AdminStores /></TabsContent>
          <TabsContent value="drivers"><AdminDrivers /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="promos"><AdminPromoCodes /></TabsContent>
          <TabsContent value="banners"><AdminBanners /></TabsContent>
          <TabsContent value="testimonials"><AdminTestimonials /></TabsContent>
          <TabsContent value="promotions"><AdminPromotions /></TabsContent>
          <TabsContent value="leadership"><AdminLeadership /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
