import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, BarChart3, ShoppingBag, Users, Tag } from "lucide-react";
import { unlockAudio } from "@/lib/notifications";
import logo from "@/assets/logo.png";
import NotificationBell from "@/components/customer/NotificationBell";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminDrivers from "@/components/admin/AdminDrivers";
import AdminPromoCodes from "@/components/admin/AdminPromoCodes";

const AdminDashboard = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background" onClick={unlockAudio}>
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="MaceyRunners" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-secondary-foreground">Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <Button variant="ghost" onClick={signOut} className="text-secondary-foreground/70 hover:text-secondary-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Admin Dashboard</h1>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics" className="gap-1.5">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5">
              <ShoppingBag className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="drivers" className="gap-1.5">
              <Users className="h-4 w-4" /> Drivers
            </TabsTrigger>
            <TabsTrigger value="promos" className="gap-1.5">
              <Tag className="h-4 w-4" /> Promos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics"><AdminAnalytics /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="drivers"><AdminDrivers /></TabsContent>
          <TabsContent value="promos"><AdminPromoCodes /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
