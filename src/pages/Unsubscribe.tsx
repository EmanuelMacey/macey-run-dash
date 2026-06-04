import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type Status = "validating" | "valid" | "invalid" | "already" | "submitting" | "done" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<Status>("validating");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } }
        );
        const json = await res.json();
        if (json.valid === false && json.reason === "already_unsubscribed") setStatus("already");
        else if (json.valid) setStatus("valid");
        else setStatus("invalid");
      } catch {
        setStatus("invalid");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setStatus("submitting");
    const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
      body: { token },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }
    if ((data as any)?.success || (data as any)?.reason === "already_unsubscribed") {
      setStatus("done");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 rounded-3xl space-y-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h1 className="font-display font-bold text-2xl">Email Preferences</h1>

        {status === "validating" && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Validating your link…</p>
          </div>
        )}

        {status === "valid" && (
          <>
            <p className="text-sm text-muted-foreground">
              Unsubscribe from MaceyRunners app emails? You will stop receiving notifications,
              receipts, and tip confirmations.
            </p>
            <Button onClick={confirm} className="w-full">Confirm Unsubscribe</Button>
          </>
        )}

        {status === "submitting" && (
          <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        )}

        {status === "done" && (
          <div className="space-y-2">
            <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
            <p className="text-sm text-muted-foreground">You've been unsubscribed. We're sorry to see you go.</p>
          </div>
        )}

        {status === "already" && (
          <div className="space-y-2">
            <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">This email is already unsubscribed.</p>
          </div>
        )}

        {(status === "invalid" || status === "error") && (
          <div className="space-y-2">
            <XCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">
              {errorMsg || "This unsubscribe link is invalid or has expired."}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Unsubscribe;
