// app/dashboard/messages/messages-content.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ChatWindow } from "./chat-window";

interface Conversation {
  key: string;
  otherId: string;
  other: { id: string; name: string; avatar: string | null };
  product: { id: string; title: string; images: string[]; price: number } | null;
  lastMsg: string;
  lastTime: string;
  unread: number;
}

export function MessagesContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router       = useRouter();

  const vendorId  = searchParams.get("vendorId");
  const productId = searchParams.get("productId");

  const [convos,     setConvos]     = useState<Conversation[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeKey,  setActiveKey]  = useState<string | null>(null);
  const [activeOther, setActiveOther] = useState<{ id: string; name: string } | null>(null);
  const [activeProduct, setActiveProduct] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/messages").then(r => r.json()).then(data => {
        setConvos(Array.isArray(data) ? data : []);
        setLoading(false);
      });

      // Auto-open conversation if coming from product page
      if (vendorId) {
        setActiveOther({ id: vendorId, name: "Seller" });
        setActiveProduct(productId);
        setActiveKey(`${vendorId}_${productId || "general"}`);
      }
    }
  }, [status, vendorId, productId, router]);

  const openConvo = (convo: Conversation) => {
    setActiveOther(convo.other);
    setActiveProduct(convo.product?.id || null);
    setActiveKey(convo.key);
    // Mark as read locally
    setConvos(prev => prev.map(c => c.key === convo.key ? { ...c, unread: 0 } : c));
  };

  const totalUnread = convos.reduce((s, c) => s + c.unread, 0);

  return (
    <>
      <style>{`
        .msg-page     { min-height: calc(100vh - 64px); background: var(--bg); display: flex; flex-direction: column; }
        .msg-inner    { max-width: 1100px; margin: 0 auto; width: 100%; padding: 32px 24px; flex: 1; display: flex; flex-direction: column; }
        .msg-back     { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);
                        font-size: 13px; text-decoration: none; margin-bottom: 20px; transition: color 0.15s; }
        .msg-back:hover { color: var(--text); }
        .msg-title    { font-size: 1.4rem; font-weight: 800; color: var(--text);
                        letter-spacing: -0.02em; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .unread-badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;
                        background: var(--accent); color: #0a0f1e; }

        .msg-layout   { display: grid; grid-template-columns: 300px 1fr; gap: 0;
                        background: var(--bg-card); border: 1px solid var(--border-muted);
                        border-radius: 16px; overflow: hidden; flex: 1; min-height: 500px; }
        @media (max-width: 700px) { .msg-layout { grid-template-columns: 1fr; } }

        /* Sidebar */
        .convo-list   { border-right: 1px solid var(--border-muted); overflow-y: auto; }
        .convo-header { padding: 16px; border-bottom: 1px solid var(--border-muted);
                        font-size: 12px; font-weight: 600; text-transform: uppercase;
                        letter-spacing: 0.07em; color: var(--text-subtle); }
        .convo-item   { display: flex; gap: 12px; padding: 14px 16px; cursor: pointer;
                        border-bottom: 1px solid var(--border-muted); transition: background 0.15s;
                        align-items: flex-start; }
        .convo-item:hover  { background: var(--bg-elevated); }
        .convo-item.active { background: rgba(0,212,255,0.06); border-left: 3px solid var(--accent); }
        .convo-avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
                        background: rgba(0,212,255,0.1); border: 1px solid rgba(0,212,255,0.2);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 15px; font-weight: 700; color: var(--accent); }
        .convo-body   { flex: 1; min-width: 0; }
        .convo-name   { font-size: 13px; font-weight: 600; color: var(--text); }
        .convo-product { font-size: 11px; color: var(--accent); margin-top: 1px;
                         white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .convo-last   { font-size: 12px; color: var(--text-subtle); margin-top: 3px;
                        white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .convo-meta   { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
        .convo-time   { font-size: 10px; color: var(--text-subtle); }
        .convo-unread { width: 18px; height: 18px; border-radius: 50%; background: var(--accent);
                        color: #0a0f1e; font-size: 10px; font-weight: 700;
                        display: flex; align-items: center; justify-content: center; }

        .empty-convos { padding: 48px 20px; text-align: center; }
        .empty-convos .icon { font-size: 2.5rem; margin-bottom: 12px; }
        .empty-convos p { font-size: 13px; color: var(--text-muted); }

        .chat-placeholder { display: flex; flex-direction: column; align-items: center;
                            justify-content: center; flex: 1; padding: 40px;
                            color: var(--text-subtle); gap: 12px; }
        .chat-placeholder p { font-size: 14px; color: var(--text-muted); }

        .spinner { width: 20px; height: 20px; border: 2px solid var(--border);
                   border-top-color: var(--accent); border-radius: 50%;
                   animation: spin 0.8s linear infinite; margin: 40px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="msg-page">
        <div className="msg-inner">
          <Link href="/dashboard" className="msg-back"><ChevronLeft size={16} /> Dashboard</Link>
          <h1 className="msg-title">
            Messages
            {totalUnread > 0 && <span className="unread-badge">{totalUnread}</span>}
          </h1>

          <div className="msg-layout">
            {/* Conversation list */}
            <div className="convo-list">
              <div className="convo-header">Conversations</div>
              {loading ? (
                <div className="spinner" />
              ) : convos.length === 0 && !vendorId ? (
                <div className="empty-convos">
                  <div className="icon">💬</div>
                  <p>No conversations yet.<br />Message a seller from any product page.</p>
                </div>
              ) : (
                convos.map(convo => (
                  <div
                    key={convo.key}
                    className={`convo-item ${activeKey === convo.key ? "active" : ""}`}
                    onClick={() => openConvo(convo)}
                  >
                    <div className="convo-avatar">
                      {convo.other.name[0]?.toUpperCase()}
                    </div>
                    <div className="convo-body">
                      <div className="convo-name">{convo.other.name}</div>
                      {convo.product && (
                        <div className="convo-product">📦 {convo.product.title}</div>
                      )}
                      <div className="convo-last">{convo.lastMsg}</div>
                    </div>
                    <div className="convo-meta">
                      <span className="convo-time">{formatDate(convo.lastTime)}</span>
                      {convo.unread > 0 && (
                        <span className="convo-unread">{convo.unread}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat window or placeholder */}
            {activeOther ? (
              <ChatWindow
                otherId={activeOther.id}
                otherName={activeOther.name}
                productId={activeProduct}
                currentUserId={session?.user.id || ""}
                onNewConvo={(convo) => {
                  setConvos(prev => {
                    const exists = prev.find(c => c.key === convo.key);
                    if (exists) return prev;
                    return [convo, ...prev];
                  });
                }}
              />
            ) : (
              <div className="chat-placeholder">
                <MessageSquare size={32} />
                <p>Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}