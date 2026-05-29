import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, BarChart3, ShoppingBag, Users, Tag, Store, Shield, Megaphone, MessageSquare, FileText, Bell, Crown, Radio, Power, Key, FileBarChart } from "lucide-react";
import AdminApiKeys from "@/components/admin/AdminApiKeys";
import AdminReports from "@/components/admin/AdminReports";
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
import AdminDriverStatus from "@/components/admin/AdminDriverStatus";
import AdminServiceStatus from "@/components/admin/AdminServiceStatus";
import ThemeToggle from "@/components/ThemeToggle";

const AdminDashboard = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen mesh-bg" onClick={unlockAudio}>
      <div className="particle w-4 h-4 bg-primary/10 top-28 left-[5%]" style={{ animationDelay: '1s' }} />
      <div className="particle w-2 h-2 bg-accent/15 top-56 right-[10%]" style={{ animationDelay: '3s' }} />

      <header className="bg-navy dark:bg-secondary/95 backdrop-blur-xl border-b border-navy/20 dark:border-white/10 safe-top sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 safe-x flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-7 sm:h-8 w-auto" />
            <span className="font-display font-bold text-base sm:text-lg text-navy-foreground dark:text-white">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={signOut} className="text-navy-foreground/70 hover:text-navy-foreground dark:text-white/70 dark:hover:text-white text-xs sm:text-sm px-2 sm:px-3">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl relative">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy dark:text-white mb-4 sm:mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="analytics" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 scrollbar-hide">
            <TabsList className="inline-flex w-max sm:flex sm:flex-wrap sm:w-full bg-card/80 dark:bg-white/5 backdrop-blur-sm border border-navy/10 dark:border-white/10 rounded-2xl p-1 gap-0.5 sm:gap-1">
              <TabsTrigger value="analytics" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Analytics
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-success data-[state=active]:text-success-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Radio className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Live
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Orders
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Invoices
              </TabsTrigger>
              <TabsTrigger value="stores" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Stores
              </TabsTrigger>
              <TabsTrigger value="drivers" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Drivers
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Users
              </TabsTrigger>
              <TabsTrigger value="promos" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Promos
              </TabsTrigger>
              <TabsTrigger value="banners" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Megaphone className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Banners
              </TabsTrigger>
              <TabsTrigger value="testimonials" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Reviews
              </TabsTrigger>
              <TabsTrigger value="promotions" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Notify
              </TabsTrigger>
              <TabsTrigger value="leadership" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Crown className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Team
              </TabsTrigger>
              <TabsTrigger value="reports" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <FileBarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Reports
              </TabsTrigger>
              <TabsTrigger value="api" className="gap-1 sm:gap-1.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 sm:py-2 whitespace-nowrap">
                <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> API
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics">
            <div className="space-y-4 sm:space-y-6">
              <AdminServiceStatus />
              <AdminAnalytics />
            </div>
          </TabsContent>
          <TabsContent value="live"><AdminDriverStatus /></TabsContent>
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
          <TabsContent value="api"><AdminApiKeys /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
