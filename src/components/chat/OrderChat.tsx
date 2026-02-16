import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Send, X, Loader2, Check, CheckCheck } from "lucide-react";
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
  is_read: boolean;
}

interface OrderChatProps {
  orderId: string;
}

const TypingDots = () => (
  <div className="flex justify-start">
    <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-1">
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  </div>
);

const OrderChat = ({ orderId }: OrderChatProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const [otherTyping, setOtherTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout>>();
  const presenceChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Mark incoming messages as read when chat is open
  const markAsRead = useCallback(async () => {
    if (!user) return;
    await supabase
      .from("chat_messages")
      .update({ is_read: true })
      .eq("order_id", orderId)
      .neq("sender_id", user.id)
      .eq("is_read", false);
  }, [orderId, user]);

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

  // Realtime subscription for messages + updates (read receipts)
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
          // Auto-mark as read if chat is open and message is from other
          if (wasOpen.current && msg.sender_id !== user?.id) {
            supabase
              .from("chat_messages")
              .update({ is_read: true })
              .eq("id", msg.id);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, user?.id]);

  // Presence channel for typing indicators
  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(`typing-${orderId}`, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const someoneElseTyping = Object.keys(state).some(
          (key) => key !== user.id && (state[key] as any)?.[0]?.typing
        );
        setOtherTyping(someoneElseTyping);
      })
      .subscribe();

    presenceChannel.current = channel;

    return () => {
      supabase.removeChannel(channel);
      presenceChannel.current = null;
    };
  }, [orderId, user?.id]);

  // Broadcast typing state
  const broadcastTyping = useCallback(
    (typing: boolean) => {
      presenceChannel.current?.track({ typing });
    },
    []
  );

  const handleInputChange = (val: string) => {
    setInput(val);
    broadcastTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => broadcastTyping(false), 2000);
  };

  // Track open state, scroll, and mark as read
  useEffect(() => {
    wasOpen.current = open;
    if (open) {
      setUnread(0);
      markAsRead();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [open, messages.length, markAsRead]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !user || sending) return;
    if (trimmed.length > 500) return;

    setSending(true);
    setInput("");
    broadcastTyping(false);
    clearTimeout(typingTimeout.current);

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
          {otherTyping && (
            <span className="text-[10px] text-muted-foreground italic ml-1">typing...</span>
          )}
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="h-48 px-3 py-2">
        {messages.length === 0 && !otherTyping && (
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
                  <div className={cn("flex items-center gap-1 mt-0.5", isMine ? "justify-end" : "")}>
                    <span className={cn("text-[10px]", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {isMine && (
                      msg.is_read ? (
                        <CheckCheck className="h-3 w-3 text-primary-foreground/90" />
                      ) : (
                        <Check className="h-3 w-3 text-primary-foreground/50" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {otherTyping && <TypingDots />}
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
          onChange={(e) => handleInputChange(e.target.value)}
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
