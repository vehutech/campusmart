// app/cart/cart-content.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft, Loader } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  id: string; quantity: number;
  product: {
    id: string; title: string; price: number; images: string[];
    stock: number; condition: string;
    vendor: { id: string; name: string };
    category: { name: string };
  };
}

export function CartContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items,    setItems]    = useState<CartItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [placing,  setPlacing]  = useState(false);
  const [note,     setNote]     = useState("");
  const [toast,    setToast]    = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch("/api/cart").then(r => r.json()).then(data => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    }
  }, [status, router]);

  const updateQty = async (productId: string, quantity: number) => {
    const res = await fetch("/api/cart", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (quantity < 1) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      const updated = await res.json();
      setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: updated.quantity } : i));
    }
  };

  const removeItem = async (productId: string) => {
    await fetch("/api/cart", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems(prev => prev.filter(i => i.product.id !== productId));
    showToast("Item removed");
  };

  const placeOrder = async () => {
    setPlacing(true);
    const orderItems = items.map(i => ({
      productId: i.product.id,
      quantity:  i.quantity,
      price:     i.product.price,
      vendorId:  i.product.vendor.id,
    }));

    const res = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: orderItems, note }),
    });

    setPlacing(false);
    if (res.ok) {
      setItems([]);
      router.push("/dashboard/orders?success=true");
    } else {
      const j = await res.json();
      showToast(j.error || "Failed to place order");
    }
  };

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  if (loading) return (
    <div style={{minHeight:"calc(100vh-64px)",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <Loader size={24} style={{color:"var(--text-muted)",animation:"spin 1s linear infinite"}} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <>
      <style>{`
        .cart-page  { min-height: calc(100vh - 64px); background: var(--bg); padding: 32px 24px; }
        .cart-inner { max-width: 1000px; margin: 0 auto; }
        .cart-back  { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);
                      font-size: 13px; text-decoration: none; margin-bottom: 24px; transition: color 0.15s; }
        .cart-back:hover { color: var(--text); }
        .cart-title { font-size: 1.4rem; font-weight: 800; color: var(--text);
                      letter-spacing: -0.02em; margin-bottom: 24px; }

        .cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
        @media (max-width: 760px) { .cart-layout { grid-template-columns: 1fr; } }

        .cart-items { display: flex; flex-direction: column; gap: 12px; }
        .cart-item  { display: flex; gap: 14px; padding: 16px; background: var(--bg-card);
                      border: 1px solid var(--border-muted); border-radius: 14px; align-items: center; }
        .item-img   { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; flex-shrink: 0;
                      background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .item-img img { width: 100%; height: 100%; object-fit: cover; }
        .item-info  { flex: 1; min-width: 0; }
        .item-title { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap;
                      overflow: hidden; text-overflow: ellipsis; }
        .item-meta  { font-size: 12px; color: var(--text-subtle); margin-top: 3px; }
        .item-price { font-size: 15px; font-weight: 800; color: var(--accent); margin-top: 6px; }

        .qty-control { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
        .qty-btn    { width: 28px; height: 28px; border-radius: 7px; border: 1px solid var(--border);
                      background: var(--bg-elevated); color: var(--text-muted); cursor: pointer;
                      display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
        .qty-btn:hover { border-color: var(--accent); color: var(--accent); }
        .qty-num    { font-size: 13px; font-weight: 600; color: var(--text); min-width: 20px; text-align: center; }
        .remove-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: none;
                      cursor: pointer; color: var(--text-subtle); display: flex; align-items: center;
                      justify-content: center; margin-left: auto; transition: all 0.15s; flex-shrink: 0; }
        .remove-btn:hover { background: rgba(255,77,109,0.1); color: var(--red); }

        .summary-card { background: var(--bg-card); border: 1px solid var(--border-muted);
                        border-radius: 14px; padding: 22px; position: sticky; top: 80px; }
        .summary-title { font-size: 13px; font-weight: 700; text-transform: uppercase;
                         letter-spacing: 0.07em; color: var(--text-subtle); margin-bottom: 18px; }
        .summary-row { display: flex; justify-content: space-between; align-items: center;
                       font-size: 13px; color: var(--text-muted); margin-bottom: 10px; }
        .summary-total { display: flex; justify-content: space-between; align-items: center;
                         padding-top: 14px; border-top: 1px solid var(--border-muted); margin-top: 4px; }
        .summary-total span:first-child { font-size: 14px; font-weight: 600; color: var(--text); }
        .summary-total span:last-child  { font-size: 1.2rem; font-weight: 900; color: var(--accent); }

        .note-field { margin: 16px 0; }
        .note-field label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 6px; }
        .note-field textarea { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border);
                               border-radius: 10px; padding: 10px 12px; font-size: 13px; color: var(--text);
                               outline: none; font-family: inherit; resize: none; transition: border-color 0.15s; }
        .note-field textarea:focus { border-color: var(--accent); }

        .btn-order  { width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer;
                      background: var(--accent); color: #0a0f1e; font-size: 14px; font-weight: 700;
                      display: flex; align-items: center; justify-content: center; gap: 8px;
                      box-shadow: 0 0 20px rgba(0,212,255,0.25); transition: opacity 0.15s; font-family: inherit; }
        .btn-order:hover { opacity: 0.88; }
        .btn-order:disabled { opacity: 0.5; cursor: not-allowed; }

        .empty-cart { text-align: center; padding: 72px 24px; }
        .empty-cart .icon { font-size: 3.5rem; margin-bottom: 16px; }
        .empty-cart h2 { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .empty-cart p  { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
        .btn-browse { display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
                      border-radius: 10px; background: var(--accent); color: #0a0f1e;
                      font-size: 14px; font-weight: 700; text-decoration: none;
                      box-shadow: 0 0 16px rgba(0,212,255,0.2); }

        .spinner { width: 16px; height: 16px; border: 2px solid currentColor;
                   border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
        .toast  { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px;
                  background: var(--bg-elevated); border: 1px solid var(--border);
                  border-radius: 12px; font-size: 13px; font-weight: 500; color: var(--text);
                  z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                  animation: slideUp 0.2s ease; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      <div className="cart-page">
        <div className="cart-inner">
          <Link href="/products" className="cart-back"><ChevronLeft size={16} /> Continue shopping</Link>
          <h1 className="cart-title">My Cart {items.length > 0 && `(${items.length})`}</h1>

          {items.length === 0 ? (
            <div className="empty-cart">
              <div className="icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Browse products and add items to your cart.</p>
              <Link href="/products" className="btn-browse">
                Browse Products <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Items */}
              <div className="cart-items">
                {items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-img">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.title} />
                        : "🛍️"}
                    </div>
                    <div className="item-info">
                      <Link href={`/products/${item.product.id}`} style={{textDecoration:"none"}}>
                        <div className="item-title">{item.product.title}</div>
                      </Link>
                      <div className="item-meta">{item.product.category.name} · {item.product.vendor.name}</div>
                      <div className="item-price">{formatPrice(item.product.price)}</div>
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => updateQty(item.product.id, item.quantity - 1)}>
                          <Minus size={12} />
                        </button>
                        <span className="qty-num">{item.quantity}</span>
                        <button className="qty-btn"
                          onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}>
                          <Plus size={12} />
                        </button>
                        <span style={{fontSize:11,color:"var(--text-subtle)",marginLeft:4}}>
                          {item.product.stock} in stock
                        </span>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,flexShrink:0}}>
                      <span style={{fontSize:14,fontWeight:800,color:"var(--text)"}}>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button className="remove-btn" onClick={() => removeItem(item.product.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="summary-card">
                <div className="summary-title">Order Summary</div>
                <div className="summary-row">
                  <span>Items ({items.reduce((s,i) => s + i.quantity, 0)})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span style={{color:"var(--green)"}}>Campus Pickup</span>
                </div>
                <div className="summary-total">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="note-field">
                  <label>Add a note (optional)</label>
                  <textarea rows={2} placeholder="Any special instructions..."
                    value={note} onChange={e => setNote(e.target.value)} />
                </div>

                <button className="btn-order" onClick={placeOrder} disabled={placing}>
                  {placing ? <span className="spinner" /> : <ShoppingBag size={16} />}
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}