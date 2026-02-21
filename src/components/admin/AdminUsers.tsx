import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Search, Loader2, KeyRound, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserWithRole {
  user_id: string;
  full_name: string;
  phone: string | null;
  role: string;
  role_id: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone");
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (rErr) throw rErr;

      const merged: UserWithRole[] = (profiles || []).map((p) => {
        const r = (roles || []).find((r) => r.user_id === p.user_id);
        return {
          user_id: p.user_id,
          full_name: p.full_name || "Unnamed",
          phone: p.phone,
          role: r?.role || "customer",
          role_id: r?.id || "",
        };
      });

      setUsers(merged);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, roleId: string, newRole: string) => {
    setUpdating(userId);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole as any })
        .eq("id", roleId);
      if (error) throw error;

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Role Updated 🔑",
        message: `Your account role has been changed to ${newRole} by an administrator.`,
        type: "role_change",
      });

      toast.success(`Role updated to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    setUpdating(userId);
    try {
      // We need the user's email - fetch it from profiles or use a workaround
      // Since we can't get email from client, we notify user to use forgot-password
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Password Reset Required 🔐",
        message: "An administrator has requested you reset your password. Please use the 'Forgot Password' link on the login page.",
        type: "account",
      });
      toast.success(`Password reset notification sent to ${userName}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset notification");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setUpdating(userId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ target_user_id: userId }),
        }
      );
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(`${userName}'s account has been deleted`);
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search) ||
      u.role.includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Badge variant="secondary" className="shrink-0">
          {users.length} users
        </Badge>
      </div>

      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Change Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.user_id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={u.role === "admin" ? "default" : "secondary"}
                      className={u.role === "admin" ? "gradient-primary text-primary-foreground" : ""}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(val) => handleRoleChange(u.user_id, u.role_id, val)}
                      disabled={updating === u.user_id}
                    >
                      <SelectTrigger className="w-32 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        disabled={updating === u.user_id}
                        onClick={() => handleResetPassword(u.user_id, u.full_name)}
                        title="Send password reset"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={updating === u.user_id}
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete {u.full_name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this user's account, profile, and all associated data. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteUser(u.user_id, u.full_name)}
                            >
                              {updating === u.user_id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
