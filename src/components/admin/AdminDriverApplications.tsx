import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, User, Mail, Phone, MapPin, Car, Clock, FileText, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const AdminDriverApplications = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["driver-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_applications" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("driver_applications" as any)
        .update({ status, admin_notes: notes || null, reviewed_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-applications"] });
      toast.success("Application updated");
      setExpandedId(null);
      setAdminNotes("");
    },
    onError: () => toast.error("Failed to update application"),
  });

  const pendingCount = applications.filter((a: any) => a.status === "pending").length;
  const approvedCount = applications.filter((a: any) => a.status === "approved").length;

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/apply-driver`);
    toast.success("Application link copied!");
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading applications...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent">{pendingCount} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">{approvedCount} Approved</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs" onClick={copyLink}>
          <Copy className="h-3.5 w-3.5" /> Copy Application Link
        </Button>
      </div>

      {applications.length === 0 ? (
        <Card className="p-10 text-center border-dashed">
          <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No applications yet</p>
          <p className="text-xs text-muted-foreground mt-1">Share the application link with potential drivers</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {applications.map((app: any, i: number) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className={`overflow-hidden transition-all ${app.status === "pending" ? "border-accent/30" : "border-border/50"}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-bold text-sm text-foreground">{app.full_name}</p>
                        <Badge
                          variant={app.status === "approved" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}
                          className="text-[10px]"
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{app.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{app.phone}</span>
                        {app.address && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{app.address}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Car className="h-3 w-3" />{app.vehicle_type}</span>
                        {app.license_plate && <span className="bg-foreground/10 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded">{app.license_plate}</span>}
                        <span>License: {app.has_license ? "Yes" : "No"}</span>
                        <span className="capitalize">{app.availability?.replace("_", " ")}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Applied {format(new Date(app.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>

                    {app.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="gradient-primary text-primary-foreground rounded-full text-xs gap-1 h-8"
                          onClick={() => updateStatus.mutate({ id: app.id, status: "approved" })}
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 rounded-full text-xs gap-1 h-8"
                          onClick={() => {
                            if (expandedId === app.id) {
                              updateStatus.mutate({ id: app.id, status: "rejected", notes: adminNotes });
                            } else {
                              setExpandedId(app.id);
                            }
                          }}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {(app.experience || app.why_join) && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      {app.experience && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Experience</p>
                          <p className="text-xs text-foreground mt-0.5">{app.experience}</p>
                        </div>
                      )}
                      {app.why_join && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Why Join</p>
                          <p className="text-xs text-foreground mt-0.5">{app.why_join}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Admin notes input for rejection */}
                  {expandedId === app.id && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Textarea
                        placeholder="Reason for rejection (optional)..."
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        rows={2}
                        className="text-xs"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="rounded-full text-xs"
                          onClick={() => updateStatus.mutate({ id: app.id, status: "rejected", notes: adminNotes })}
                        >
                          Confirm Rejection
                        </Button>
                        <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => setExpandedId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {app.admin_notes && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                      <p className="text-[10px] text-muted-foreground"><span className="font-semibold">Admin Notes:</span> {app.admin_notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDriverApplications;
