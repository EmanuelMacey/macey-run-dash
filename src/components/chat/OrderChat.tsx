import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

interface OrderChatProps {
  orderId: string;
}

const OrderChat = ({ orderId }: OrderChatProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
    };
    fetchMessages();
  }, [orderId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, msg]);
          if (!wasOpen.current && msg.sender_id !== user?.id) {
            setUnread((u) => u + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, user?.id]);

  // Track open state and scroll
  useEffect(() => {
    wasOpen.current = open;
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user || sending) return;
    if (trimmed.length > 500) return;

    setSending(true);
    setInput("");
    const { error } = await supabase.from("chat_messages").insert({
      order_id: orderId,
      sender_id: user.id,
      message: trimmed,
    });
    if (error) {
      setInput(trimmed);
    }
    setSending(false);
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="relative gap-1.5 text-xs"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Chat
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 min-w-4 flex items-center justify-center px-1">
            {unread}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          Chat
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="h-48 px-3 py-2">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">
            No messages yet. Say hello!
          </p>
        )}
        <div className="space-y-2">
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3 py-1.5 text-xs",
                    isMine
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  <p className="break-words">{msg.message}</p>
                  <p className={cn("text-[10px] mt-0.5", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form
        className="flex items-center gap-2 px-3 py-2 border-t border-border"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="h-8 text-xs"
          maxLength={500}
          disabled={sending}
        />
        <Button type="submit" size="icon" className="h-8 w-8 shrink-0" disabled={!input.trim() || sending}>
          {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </form>
    </div>
  );
};

export default OrderChat;
