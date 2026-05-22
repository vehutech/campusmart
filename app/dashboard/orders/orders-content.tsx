// app/dashboard/orders/orders-content.tsx

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, Clock, XCircle, Truck } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string; status: string; totalAmount: number; note: string | null; createdAt: string;
  buyer:  { id: string; name: string; email: string; phone: string | null };
  vendor: { id: string; name: string; email: string; phone: string | null };
  items: {
    id: string; quantity: number; price: number;
    product: { id: string; title: string; images: string[] };
  }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING:   { label: "Pending",   color: "#ff7d3b", icon: Clock       },
  CONFIRMED: { label: "Confirmed", color: "#00d4ff", icon: Truck       },
  COMPLETED: { label: "Completed", color: "#00e5a0", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "#ff4d6d", icon: XCircle     },
};

export function OrdersContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const justOrdered  = searchParams.get("success") === "true";
  const isVendor     = session?.user.role === "VENDOR";

  const [orders,  setOrders]  = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("ALL");

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/orders").then(r => r.json()).then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    }
  }, [status]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter(o => o.status === filter);

  return (
    <>
      <style>{`
        .orders-page  { min-height: calc(100vh - 64px); background: var(--bg); padding: 32px 24px; }
        .orders-inner { max-width: 900px; margin: 0 auto; }
        .orders-back  { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);
                        font-size: 13px; text-decoration: none; margin-bottom: 20px; transition: color 0.15s; }
        .orders-back:hover { color: var(--text); }
        .orders-hdr   { display: flex; align-items: center; justify-content: space-between;
                        margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
        .orders-hdr h1 { font-size: 1.4rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }

        .success-banner { padding: 14px 18px; border-radius: 12px; margin-bottom: 20px;
                          background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2);
                          color: var(--green); font-size: 14px; font-weight: 500;
                          display: flex; align-items: center; gap: 10px; }

        .filter-tabs  { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .filter-tab   { padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
                        border: 1px solid var(--border-muted); background: none; cursor: pointer;
                        color: var(--text-muted); transition: all 0.15s; font-family: inherit; }
        .filter-tab:hover  { border-color: var(--border); color: var(--text); }
        .filter-tab.active { background: var(--accent); border-color: var(--accent); color: #0a0f1e; }

        .order-card   { background: var(--bg-card); border: 1px solid var(--border-muted);
                        border-radius: 14px; overflow: hidden; margin-bottom: 14px; }
        .order-hdr    { display: flex; align-items: center; justify-content: space-between;
                        padding: 16px 20px; border-bottom: 1px solid var(--border-muted); flex-wrap: wrap; gap: 10px; }
        .order-id     { font-size: 12px; font-weight: 600; color: var(--text-subtle); font-family: monospace; }
        .order-date   { font-size: 12px; color: var(--text-subtle); }
        .status-pill  { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
                        border-radius: 999px; font-size: 12px; font-weight: 600; }

        .order-items  { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
        .order-item   { display: flex; align-items: center; gap: 12px; }
        .oi-img       { width: 48px; height: 48px; border-radius: 8px; background: var(--bg-elevated);
                        overflow: hidden; display: flex; align-items: center; justify-content: center;
                        font-size: 1.2rem; flex-shrink: 0; }
        .oi-img img   { width: 100%; height: 100%; object-fit: cover; }
        .oi-title     { font-size: 13px; font-weight: 600; color: var(--text); }
        .oi-meta      { font-size: 12px; color: var(--text-subtle); margin-top: 2px; }
        .oi-price     { font-size: 13px; font-weight: 700; color: var(--accent); margin-left: auto; flex-shrink: 0; }

        .order-footer { display: flex; align-items: center; justify-content: space-between;
                        padding: 14px 20px; background: var(--bg-elevated); flex-wrap: wrap; gap: 10px; }
        .order-total  { font-size: 15px; font-weight: 800; color: var(--text); }
        .order-total span { color: var(--accent); }
        .order-party  { font-size: 12px; color: var(--text-subtle); }

        .action-btns  { display: flex; gap: 8px; flex-wrap: wrap; }
        .act-btn      { padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer;
                        font-size: 12px; font-weight: 600; transition: all 0.15s; font-family: inherit; }
        .act-confirm  { background: rgba(0,212,255,0.1); color: var(--accent); border: 1px solid rgba(0,212,255,0.2); }
        .act-confirm:hover { background: rgba(0,212,255,0.2); }
        .act-complete { background: rgba(0,229,160,0.1); color: var(--green); border: 1px solid rgba(0,229,160,0.2); }
        .act-complete:hover { background: rgba(0,229,160,0.2); }
        .act-cancel   { background: rgba(255,77,109,0.08); color: var(--red); border: 1px solid rgba(255,77,109,0.2); }
        .act-cancel:hover { background: rgba(255,77,109,0.15); }

        .empty-state  { text-align: center; padding: 72px 24px; }
        .empty-state .icon { font-size: 3rem; margin-bottom: 14px; }
        .empty-state h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .empty-state p  { font-size: 14px; color: var(--text-muted); }

        .spinner { width: 20px; height: 20px; border: 2px solid var(--border);
                   border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 80px auto; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="orders-page">
        <div className="orders-inner">
          <Link href="/dashboard" className="orders-back"><ChevronLeft size={16} /> Dashboard</Link>

          <div className="orders-hdr">
            <h1>{isVendor ? "Incoming Orders" : "My Orders"}</h1>
          </div>

          {justOrdered && (
            <div className="success-banner">
              <CheckCircle size={16} /> Order placed successfully! The seller will confirm shortly.
            </div>
          )}

          <div className="filter-tabs">
            {["ALL","PENDING","CONFIRMED","COMPLETED","CANCELLED"].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}>
                {f === "ALL" ? `All (${orders.length})` : `${STATUS_CONFIG[f].label} (${orders.filter(o => o.status === f).length})`}
              </button>
            ))}
          </div>

          {loading ? <div className="spinner" /> : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">📦</div>
              <h3>{filter === "ALL" ? "No orders yet" : `No ${STATUS_CONFIG[filter]?.label} orders`}</h3>
              <p>{isVendor ? "Orders from buyers will appear here." : "Your orders will appear here after checkout."}</p>
            </div>
          ) : (
            filtered.map(order => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              const Icon = sc.icon;
              return (
                <div key={order.id} className="order-card">
                  <div className="order-hdr">
                    <div>
                      <div className="order-id">#{order.id.slice(-8).toUpperCase()}</div>
                      <div className="order-date">{formatDate(order.createdAt)}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span className="status-pill"
                        style={{background:`${sc.color}15`, color:sc.color, border:`1px solid ${sc.color}30`}}>
                        <Icon size={12} /> {sc.label}
                      </span>
                      <div className="action-btns">
                        {isVendor && order.status === "PENDING" && (
                          <button className="act-btn act-confirm" onClick={() => updateStatus(order.id, "CONFIRMED")}>
                            Confirm
                          </button>
                        )}
                        {isVendor && order.status === "CONFIRMED" && (
                          <button className="act-btn act-complete" onClick={() => updateStatus(order.id, "COMPLETED")}>
                            Mark Complete
                          </button>
                        )}
                        {!isVendor && order.status === "PENDING" && (
                          <button className="act-btn act-cancel" onClick={() => updateStatus(order.id, "CANCELLED")}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map(item => (
                      <div key={item.id} className="order-item">
                        <div className="oi-img">
                          {item.product.images?.[0]
                            ? <img src={item.product.images[0]} alt={item.product.title} />
                            : "🛍️"}
                        </div>
                        <div>
                          <Link href={`/products/${item.product.id}`} style={{textDecoration:"none"}}>
                            <div className="oi-title">{item.product.title}</div>
                          </Link>
                          <div className="oi-meta">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                        </div>
                        <div className="oi-price">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                    {order.note && (
                      <div style={{padding:"10px 12px",background:"var(--bg-elevated)",borderRadius:8,fontSize:12,color:"var(--text-muted)"}}>
                        📝 {order.note}
                      </div>
                    )}
                  </div>

                  <div className="order-footer">
                    <div className="order-party">
                      {isVendor ? `Buyer: ${order.buyer.name}` : `Seller: ${order.vendor.name}`}
                      {(isVendor ? order.buyer.phone : order.vendor.phone) &&
                        ` · ${isVendor ? order.buyer.phone : order.vendor.phone}`}
                    </div>
                    <div className="order-total">
                      Total: <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}