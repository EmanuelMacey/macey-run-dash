import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface RatingDialogProps {
  orderId: string;
  driverId: string;
  autoOpen?: boolean;
}

const RatingDialog = ({ orderId, driverId, autoOpen = false }: RatingDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingRating, setExistingRating] = useState<number | null>(null);

  useEffect(() => {
    const checkExisting = async () => {
      const { data } = await supabase
        .from("driver_ratings")
        .select("rating")
        .eq("order_id", orderId)
        .maybeSingle();
      if (data) {
        setExistingRating(data.rating);
      } else if (autoOpen) {
        // Auto-open the dialog for unrated delivered orders
        setTimeout(() => setOpen(true), 1000);
      }
    };
    checkExisting();
  }, [orderId, autoOpen]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("driver_ratings").insert({
        order_id: orderId,
        customer_id: user.id,
        driver_id: driverId,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      toast.success("Rating submitted!");
      setExistingRating(rating);
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  // Already rated — show static stars
  if (existingRating !== null) {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-3.5 w-3.5",
              star <= existingRating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">Rated</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          <Star className="h-3.5 w-3.5" />
          Rate Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rate Your Driver</DialogTitle>
          <DialogDescription>
            How was your delivery experience?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Star picker */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    star <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {rating === 0
              ? "Tap a star"
              : rating <= 2
              ? "We're sorry to hear that"
              : rating <= 4
              ? "Thanks for your feedback!"
              : "Excellent! 🎉"}
          </p>

          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment (optional)"
            className="text-sm resize-none"
            rows={3}
            maxLength={500}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="w-full"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Star className="h-4 w-4 mr-2" />
            )}
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
