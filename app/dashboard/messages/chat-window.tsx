// app/dashboard/messages/chat-window.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Message {
  id: string; content: string; createdAt: string; isRead: boolean;
  senderId: string;
  sender:   { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
  product:  { id: string; title: string; images: string[]; price: number } | null;
}

interface ChatWindowProps {
  otherId:       string;
  otherName:     string;
  productId:     string | null;
  currentUserId: string;
  onNewConvo:    (convo: any) => void;
}

export function ChatWindow({ otherId, otherName, productId, currentUserId, onNewConvo }: ChatWindowProps) {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [other,     setOther]     = useState<{ id: string; name: string; role: string } | null>(null);
  const [product,   setProduct]   = useState<{ id: string; title: string; images: string[]; price: number } | null>(null);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Load conversation
  useEffect(() => {
    if (!otherId) return;
    setLoading(true);
    setMessages([]);

    const url = productId
      ? `/api/messages/${otherId}?productId=${productId}`
      : `/api/messages/${otherId}`;

    fetch(url).then(r => r.json()).then(data => {
      setMessages(data.messages || []);
      setOther(data.other);
      if (data.messages?.[0]?.product) setProduct(data.messages[0].product);
      setLoading(false);
    });
  }, [otherId, productId]);

  // Pusher real-time
  useEffect(() => {
    if (!currentUserId || !otherId) return;

    const key     = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    let pusher: any;
    let channel: any;

    import("pusher-js").then(({ default: Pusher }) => {
      pusher  = new Pusher(key, { cluster });
      const channelName = [currentUserId, otherId].sort().join("_");
      channel = pusher.subscribe(`chat-${channelName}`);

      channel.bind("new-message", (msg: Message) => {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    });

    return () => {
      channel?.unbind_all();
      pusher?.disconnect();
    };
  }, [currentUserId, otherId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    setSending(true);
    setInput("");

    const res = await fetch("/api/messages", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ receiverId: otherId, content, productId }),
    });

    setSending(false);

    if (res.ok) {
      const msg = await res.json();
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!product && msg.product) setProduct(msg.product);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const displayName = other?.name || otherName;

  return (
    <>
      <style>{`
        .chat-win     { display: flex; flex-direction: column; height: 100%; }

        .chat-header  { padding: 14px 18px; border-bottom: 1px solid var(--border-muted);
                        display: flex; align-items: center; gap: 12px; background: var(--bg-card); }
        .chat-avatar  { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
                        background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 14px; font-weight: 700; color: var(--accent); }
        .chat-hdr-name  { font-size: 14px; font-weight: 600; color: var(--text); }
        .chat-hdr-role  { font-size: 11px; color: var(--text-subtle); margin-top: 1px; }

        .product-banner { display: flex; align-items: center; gap: 10px; padding: 10px 16px;
                          background: rgba(0,212,255,0.04); border-bottom: 1px solid var(--border-muted); }
        .product-banner img { width: 36px; height: 36px; border-radius: 7px; object-fit: cover; }
        .product-banner .pb-placeholder { width: 36px; height: 36px; border-radius: 7px;
                          background: var(--bg-elevated); display: flex; align-items: center;
                          justify-content: center; font-size: 1rem; flex-shrink: 0; }
        .pb-title     { font-size: 12px; font-weight: 600; color: var(--text); }
        .pb-price     { font-size: 11px; color: var(--accent); }

        .chat-msgs    { flex: 1; overflow-y: auto; padding: 16px; display: flex;
                        flex-direction: column; gap: 10px; }

        .msg-bubble-wrap { display: flex; flex-direction: column; }
        .msg-bubble-wrap.mine  { align-items: flex-end; }
        .msg-bubble-wrap.theirs { align-items: flex-start; }

        .msg-bubble   { max-width: 68%; padding: 10px 14px; border-radius: 14px;
                        font-size: 13px; line-height: 1.55; word-break: break-word; }
        .msg-bubble.mine   { background: var(--accent); color: #0a0f1e; border-bottom-right-radius: 4px; }
        .msg-bubble.theirs { background: var(--bg-elevated); color: var(--text);
                             border: 1px solid var(--border-muted); border-bottom-left-radius: 4px; }
        .msg-time     { font-size: 10px; color: var(--text-subtle); margin-top: 3px; padding: 0 4px; }

        .chat-input-area { padding: 12px 16px; border-top: 1px solid var(--border-muted);
                           display: flex; gap: 10px; align-items: center; background: var(--bg-card); }
        .chat-input   { flex: 1; background: var(--bg-elevated); border: 1px solid var(--border);
                        border-radius: 10px; padding: 10px 14px; font-size: 14px; color: var(--text);
                        outline: none; font-family: inherit; transition: border-color 0.15s; }
        .chat-input::placeholder { color: var(--text-subtle); }
        .chat-input:focus { border-color: var(--accent); }
        .send-btn     { width: 40px; height: 40px; border-radius: 10px; border: none; cursor: pointer;
                        background: var(--accent); color: #0a0f1e; display: flex;
                        align-items: center; justify-content: center; transition: opacity 0.15s; flex-shrink: 0; }
        .send-btn:hover   { opacity: 0.85; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .chat-loading { display: flex; align-items: center; justify-content: center;
                        flex: 1; color: var(--text-subtle); }
        .spinner { width: 20px; height: 20px; border: 2px solid var(--border);
                   border-top-color: var(--accent); border-radius: 50%;
                   animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .empty-chat   { flex: 1; display: flex; flex-direction: column; align-items: center;
                        justify-content: center; color: var(--text-subtle); gap: 8px; padding: 32px; }
        .empty-chat p { font-size: 13px; color: var(--text-muted); text-align: center; }
      `}</style>

      <div className="chat-win">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-avatar">{displayName[0]?.toUpperCase()}</div>
          <div>
            <div className="chat-hdr-name">{displayName}</div>
            <div className="chat-hdr-role">{other?.role || "User"}</div>
          </div>
        </div>

        {/* Product context banner */}
        {product && (
          <div className="product-banner">
            {product.images?.[0]
              ? <img src={product.images[0]} alt={product.title} />
              : <div className="pb-placeholder"><Package size={16} /></div>
            }
            <div>
              <div className="pb-title">{product.title}</div>
              <div className="pb-price">{formatPrice(product.price)}</div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chat-msgs">
          {loading ? (
            <div className="chat-loading"><span className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div className="empty-chat">
              <span style={{fontSize:"2rem"}}>👋</span>
              <p>Start the conversation!<br />Ask about the product or make an offer.</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderId === currentUserId;
              const time   = new Date(msg.createdAt).toLocaleTimeString("en-NG", {
                hour: "2-digit", minute: "2-digit",
              });
              return (
                <div key={msg.id} className={`msg-bubble-wrap ${isMine ? "mine" : "theirs"}`}>
                  <div className={`msg-bubble ${isMine ? "mine" : "theirs"}`}>
                    {msg.content}
                  </div>
                  <span className="msg-time">{time}</span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            ref={inputRef}
            className="chat-input"
            placeholder={`Message ${displayName}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button className="send-btn" onClick={sendMessage} disabled={!input.trim() || sending}>
            {sending ? <span className="spinner" style={{width:16,height:16}} /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}