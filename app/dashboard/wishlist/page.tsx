// app/dashboard/wishlist/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ChevronLeft, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface WishlistItem {
  id: string;
  product: {
    id: string; title: string; price: number; images: string[];
    condition: string;
    vendor: { name: string };
    category: { name: string };
  };
}

export default function WishlistPage() {
  const [items,   setItems]   = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch("/api/wishlist").then(r => r.json()).then(data => {
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const remove = async (productId: string) => {
    await fetch("/api/wishlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setItems(prev => prev.filter(i => i.product.id !== productId));
    showToast("Removed from wishlist");
  };

  const addToCart = async (productId: string) => {
    const res = await fetch("/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    showToast(res.ok ? "Added to cart!" : "Failed to add to cart");
  };

  return (
    <>
      <style>{`
        .wl-page    { min-height: calc(100vh - 64px); background: var(--bg); padding: 32px 24px; }
        .wl-inner   { max-width: 900px; margin: 0 auto; }
        .wl-back    { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);
                      font-size: 13px; text-decoration: none; margin-bottom: 20px; transition: color 0.15s; }
        .wl-back:hover { color: var(--text); }
        .wl-title   { font-size: 1.4rem; font-weight: 800; color: var(--text);
                      letter-spacing: -0.02em; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; }
        .wl-grid    { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        @media (max-width: 700px) { .wl-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 460px) { .wl-grid { grid-template-columns: 1fr; } }

        .wl-card    { background: var(--bg-card); border: 1px solid var(--border-muted);
                      border-radius: 14px; overflow: hidden; }
        .wl-img     { aspect-ratio: 4/3; background: var(--bg-elevated); overflow: hidden;
                      display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .wl-img img { width: 100%; height: 100%; object-fit: cover; }
        .wl-body    { padding: 14px; }
        .wl-cat     { font-size: 10px; font-weight: 600; text-transform: uppercase;
                      letter-spacing: 0.06em; color: var(--text-subtle); }
        .wl-name    { font-size: 13px; font-weight: 600; color: var(--text); margin: 4px 0;
                      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .wl-price   { font-size: 1rem; font-weight: 800; color: var(--accent); margin-bottom: 12px; }
        .wl-actions { display: flex; gap: 8px; }
        .wl-cart    { flex: 1; padding: 8px; border-radius: 8px; border: none; cursor: pointer;
                      background: var(--accent); color: #0a0f1e; font-size: 12px; font-weight: 700;
                      display: flex; align-items: center; justify-content: center; gap: 6px;
                      font-family: inherit; transition: opacity 0.15s; }
        .wl-cart:hover { opacity: 0.88; }
        .wl-remove  { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
                      background: var(--bg-elevated); cursor: pointer; display: flex;
                      align-items: center; justify-content: center; color: var(--text-subtle); transition: all 0.15s; }
        .wl-remove:hover { background: rgba(255,77,109,0.1); color: var(--red); border-color: var(--red); }

        .empty-state { text-align: center; padding: 72px 24px; }
        .empty-state .icon { font-size: 3rem; margin-bottom: 14px; }
        .empty-state h3 { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        .empty-state p  { font-size: 14px; color: var(--text-muted); margin-bottom: 24px; }
        .btn-browse { display: inline-flex; align-items: center; gap: 8px; padding: 11px 22px;
                      border-radius: 10px; background: var(--accent); color: #0a0f1e;
                      font-size: 13px; font-weight: 700; text-decoration: none; }

        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px;
                 background: var(--bg-elevated); border: 1px solid var(--border);
                 border-radius: 12px; font-size: 13px; color: var(--text);
                 z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.4); animation: slideUp 0.2s ease; }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }

        .skeleton { background: linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 50%,var(--bg-card) 75%);
                    background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 14px; }
        .skeleton-img { aspect-ratio: 4/3; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      <div className="wl-page">
        <div className="wl-inner">
          <Link href="/dashboard" className="wl-back"><ChevronLeft size={16} /> Dashboard</Link>
          <h1 className="wl-title">
            <Heart size={20} style={{color:"var(--red)"}} fill="var(--red)" />
            Wishlist {!loading && `(${items.length})`}
          </h1>

          {loading ? (
            <div className="wl-grid">
              {Array.from({length:3}).map((_,i) => (
                <div key={i} className="skeleton skeleton-img" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="icon">💔</div>
              <h3>Your wishlist is empty</h3>
              <p>Save products you like by tapping the heart icon.</p>
              <Link href="/products" className="btn-browse">Browse Products</Link>
            </div>
          ) : (
            <div className="wl-grid">
              {items.map(item => (
                <div key={item.id} className="wl-card">
                  <Link href={`/products/${item.product.id}`} style={{textDecoration:"none"}}>
                    <div className="wl-img">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.title} />
                        : "🛍️"}
                    </div>
                  </Link>
                  <div className="wl-body">
                    <div className="wl-cat">{item.product.category.name}</div>
                    <div className="wl-name">{item.product.title}</div>
                    <div className="wl-price">{formatPrice(item.product.price)}</div>
                    <div className="wl-actions">
                      <button className="wl-cart" onClick={() => addToCart(item.product.id)}>
                        <ShoppingCart size={13} /> Add to Cart
                      </button>
                      <button className="wl-remove" onClick={() => remove(item.product.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}