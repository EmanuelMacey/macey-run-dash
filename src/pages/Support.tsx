import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/support-chat`;

const QUICK_ACTIONS = [
  { label: "🚚 How to order", msg: "How do I place a delivery order?" },
  { label: "⭐ Loyalty rewards", msg: "How does the loyalty program work?" },
  { label: "🏃 Become a driver", msg: "How do I become a MaceyRunners driver?" },
  { label: "💰 Pricing info", msg: "What are your delivery and errand fees?" },
  { label: "📱 Install the app", msg: "How do I install MaceyRunners as an app on my phone?" },
  { label: "🎁 Referral program", msg: "How does the referral program work?" },
];

const Support = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages.length]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "" || !line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again! 🙏" }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                <span className="gradient-text">Support</span> Center
              </h1>
              <p className="text-muted-foreground">Chat with our AI assistant for instant help with anything MaceyRunners</p>
            </div>

            {/* Chat container */}
            <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-xl">
              {/* Header */}
              <div className="gradient-primary px-5 py-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-primary-foreground">MaceyRunners AI Assistant</h3>
                  <p className="text-[11px] text-primary-foreground/70">{isLoading ? "Typing..." : "Online • Instant replies"}</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[400px] px-4 py-4">
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                        <p className="text-sm text-foreground">
                          Welcome to MaceyRunners Support! 👋 I can help you with orders, account questions, our loyalty program, and much more. What would you like to know?
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-1">
                      {QUICK_ACTIONS.map((q) => (
                        <button
                          key={q.label}
                          onClick={() => sendMessage(q.msg)}
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-3 py-2.5 transition-colors font-medium text-left"
                        >
                          {q.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center shrink-0 mt-1">
                          <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-tl-md"
                        )}
                      >
                        <p className="break-words whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center shrink-0 mt-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <form
                className="px-4 py-3 border-t border-border/50 flex items-center gap-2 bg-card"
                onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about MaceyRunners..."
                  className="h-10 text-sm rounded-full"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-full" disabled={!input.trim() || isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Support;
