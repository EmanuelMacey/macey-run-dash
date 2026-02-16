import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Users, ShoppingBag, DollarSign, Tag } from "lucide-react";

const AdminDashboard = () => {
  const { signOut } = useAuth();

  const stats = [
    { label: "Total Users", value: "0", icon: Users },
    { label: "Total Orders", value: "0", icon: ShoppingBag },
    { label: "Revenue", value: "$0 GYD", icon: DollarSign },
    { label: "Active Promos", value: "0", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-secondary border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-lg text-secondary-foreground">Admin</span>
          </div>
          <Button variant="ghost" onClick={signOut} className="text-muted-foreground">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5">
              <Icon className="h-5 w-5 text-primary mb-2" />
              <p className="text-2xl font-display font-bold text-card-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold text-card-foreground mb-4">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">No activity yet.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
