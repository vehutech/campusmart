"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, ShoppingCart, MessageSquare, MapPin, Eye, ChevronLeft,
         Package, Calendar, CheckCircle, AlertCircle } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

interface Product {
  id: string; title: string; description: string; price: number;
  images: string[]; condition: string; stock: number; location: string | null;
  viewCount: number; createdAt: string; isActive: boolean;
  vendor: { id: string; name: string; avatar: string | null; phone: string | null; createdAt: string };
  category: { id: string; name: string; slug: string };
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { data: session } = useSession();

  const [product,    setProduct]    = useState<Product | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeImg,  setActiveImg]  = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [cartAdding, setCartAdding] = useState(false);
  const [toast,      setToast]      = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));

    if (session) {
      fetch(`/api/wishlist?productId=${id}`)
        .then(r => r.json())
        .then(d => setWishlisted(d.wishlisted));
    }
  }, [id, session]);

  const handleAddToCart = async () => {
    if (!session) { router.push("/login"); return; }
    setCartAdding(true);
    const res = await fetch("/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, quantity: 1 }),
    });
    setCartAdding(false);
    if (res.ok) showToast("Added to cart!");
    else showToast("Failed to add to cart");
  };

  const handleWishlist = async () => {
    if (!session) { router.push("/login"); return; }
    const res = await fetch("/api/wishlist", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id }),
    });
    const data = await res.json();
    setWishlisted(data.wishlisted);
    showToast(data.wishlisted ? "Saved to wishlist" : "Removed from wishlist");
  };

  if (loading) return (
    <div style={{minHeight:"calc(100vh-64px)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <div style={{color:"var(--text-muted)"}}>Loading...</div>
    </div>
  );

  if (!product) return (
    <div style={{minHeight:"calc(100vh-64px)", background:"var(--bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12}}>
      <AlertCircle size={40} style={{color:"var(--text-subtle)"}} />
      <p style={{color:"var(--text-muted)"}}>Product not found.</p>
      <Link href="/products" style={{color:"var(--accent)", fontSize:14}}>Back to products</Link>
    </div>
  );

  const isOwner = session?.user.id === product.vendor.id;
  const condColors: Record<string, string> = { NEW: "#00e5a0", USED: "#ff7d3b", REFURBISHED: "#a78bfa" };

  return (
    <>
      <style>{`
        .pd-page    { min-height: calc(100vh - 64px); background: var(--bg); padding: 28px 24px; }
        .pd-inner   { max-width: 1100px; margin: 0 auto; }
        .pd-back    { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);
                      font-size: 13px; text-decoration: none; margin-bottom: 24px; transition: color 0.15s; }
        .pd-back:hover { color: var(--text); }

        .pd-layout  { display: grid; grid-template-columns: 1fr 420px; gap: 32px; align-items: start; }
        @media (max-width: 860px) { .pd-layout { grid-template-columns: 1fr; } }

        /* Images */
        .pd-images  { }
        .pd-main-img { aspect-ratio: 4/3; background: var(--bg-card); border: 1px solid var(--border-muted);
                       border-radius: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .pd-main-img img { width: 100%; height: 100%; object-fit: cover; }
        .pd-main-placeholder { font-size: 4rem; }
        .pd-thumbs  { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .pd-thumb   { width: 72px; height: 72px; border-radius: 10px; overflow: hidden; cursor: pointer;
                      border: 2px solid var(--border-muted); transition: border-color 0.15s;
                      display: flex; align-items: center; justify-content: center; background: var(--bg-card); }
        .pd-thumb.active { border-color: var(--accent); }
        .pd-thumb img { width: 100%; height: 100%; object-fit: cover; }

        /* Info panel */
        .pd-info    { position: sticky; top: 80px; }
        .pd-cat-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .pd-cat-tag { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
                      color: var(--text-subtle); }
        .pd-cond    { padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 700; }
        .pd-title   { font-size: 1.5rem; font-weight: 800; color: var(--text); line-height: 1.2;
                      letter-spacing: -0.02em; margin-bottom: 12px; }
        .pd-price   { font-size: 2rem; font-weight: 900; color: var(--accent); margin-bottom: 20px; }
        .pd-stats   { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .pd-stat    { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-subtle); }

        .pd-actions { display: flex; gap: 10px; margin-bottom: 24px; }
        .btn-cart   { flex: 1; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
                      background: var(--accent); color: #0a0f1e; font-size: 14px; font-weight: 700;
                      display: flex; align-items: center; justify-content: center; gap: 8px;
                      box-shadow: 0 0 20px rgba(0,212,255,0.25); transition: opacity 0.15s; font-family: inherit; }
        .btn-cart:hover { opacity: 0.88; }
        .btn-cart:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-wish   { width: 48px; height: 48px; border-radius: 12px; border: 1px solid var(--border);
                      background: var(--bg-elevated); cursor: pointer; display: flex;
                      align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
        .btn-wish.active { background: rgba(255,77,109,0.1); border-color: var(--red); color: var(--red); }
        .btn-wish:hover  { border-color: var(--red); color: var(--red); }

        .pd-divider { height: 1px; background: var(--border-muted); margin: 20px 0; }

        .pd-desc-title { font-size: 13px; font-weight: 600; color: var(--text-muted);
                         text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .pd-desc    { font-size: 14px; color: var(--text-muted); line-height: 1.75; white-space: pre-wrap; }

        /* Seller card */
        .seller-card { background: var(--bg-card); border: 1px solid var(--border-muted);
                       border-radius: 14px; padding: 18px; margin-top: 20px; }
        .seller-top  { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .seller-avatar { width: 44px; height: 44px; border-radius: 50%; background: rgba(0,212,255,0.1);
                         border: 2px solid rgba(0,212,255,0.2); display: flex; align-items: center;
                         justify-content: center; font-size: 16px; font-weight: 700; color: var(--accent); flex-shrink: 0; }
        .seller-name { font-size: 14px; font-weight: 600; color: var(--text); }
        .seller-since { font-size: 11px; color: var(--text-subtle); margin-top: 2px; }
        .btn-message { width: 100%; padding: 11px; border-radius: 10px; border: 1px solid var(--border);
                       background: var(--bg-elevated); color: var(--text); font-size: 13px; font-weight: 600;
                       display: flex; align-items: center; justify-content: center; gap: 8px;
                       cursor: pointer; font-family: inherit; text-decoration: none; transition: all 0.15s; }
        .btn-message:hover { border-color: var(--accent); color: var(--accent); }

        .owner-actions { display: flex; gap: 8px; }
        .btn-edit   { flex: 1; padding: 10px; border-radius: 10px; text-align: center; font-size: 13px;
                      font-weight: 600; text-decoration: none; border: 1px solid var(--border);
                      background: var(--bg-elevated); color: var(--text); transition: all 0.15s; }
        .btn-edit:hover { border-color: var(--accent); color: var(--accent); }

        /* Toast */
        .toast      { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px;
                      background: var(--bg-elevated); border: 1px solid var(--border);
                      border-radius: 12px; font-size: 13px; font-weight: 500; color: var(--text);
                      display: flex; align-items: center; gap: 8px; z-index: 100;
                      box-shadow: 0 8px 24px rgba(0,0,0,0.4); animation: slideUp 0.2s ease; }
        @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }

        .spinner    { width: 16px; height: 16px; border: 2px solid currentColor;
                      border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="pd-page">
        <div className="pd-inner">
          <Link href="/products" className="pd-back">
            <ChevronLeft size={16} /> Back to products
          </Link>

          <div className="pd-layout">
            {/* Images */}
            <div className="pd-images">
              <div className="pd-main-img">
                {product.images?.[activeImg]
                  ? <img src={product.images[activeImg]} alt={product.title} />
                  : <span className="pd-main-placeholder">🛍️</span>
                }
              </div>
              {product.images.length > 1 && (
                <div className="pd-thumbs">
                  {product.images.map((img, i) => (
                    <div key={i} className={`pd-thumb ${activeImg === i ? "active" : ""}`}
                      onClick={() => setActiveImg(i)}>
                      <img src={img} alt={`${product.title} ${i+1}`} />
                    </div>
                  ))}
                </div>
              )}

              {/* Description below images on desktop */}
              <div style={{marginTop:24}}>
                <div className="pd-desc-title">Description</div>
                <p className="pd-desc">{product.description}</p>
              </div>
            </div>

            {/* Info panel */}
            <div className="pd-info">
              <div className="pd-cat-row">
                <span className="pd-cat-tag">{product.category.name}</span>
                <span className="pd-cond"
                  style={{background:`${condColors[product.condition]}18`, color:condColors[product.condition]}}>
                  {product.condition}
                </span>
              </div>

              <h1 className="pd-title">{product.title}</h1>
              <div className="pd-price">{formatPrice(product.price)}</div>

              <div className="pd-stats">
                {product.location && (
                  <span className="pd-stat"><MapPin size={12} />{product.location}</span>
                )}
                <span className="pd-stat"><Eye size={12} />{product.viewCount} views</span>
                <span className="pd-stat"><Package size={12} />{product.stock} in stock</span>
                <span className="pd-stat"><Calendar size={12} />{formatDate(product.createdAt)}</span>
              </div>

              {/* Actions */}
              {isOwner ? (
                <div className="owner-actions">
                  <Link href={`/dashboard/vendor/products/${product.id}/edit`} className="btn-edit">
                    Edit Product
                  </Link>
                </div>
              ) : (
                <div className="pd-actions">
                  <button className="btn-cart" onClick={handleAddToCart} disabled={cartAdding || product.stock === 0}>
                    {cartAdding ? <span className="spinner" /> : <ShoppingCart size={16} />}
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button className={`btn-wish ${wishlisted ? "active" : ""}`} onClick={handleWishlist}>
                    <Heart size={18} fill={wishlisted ? "currentColor" : "none"} />
                  </button>
                </div>
              )}

              <div className="pd-divider" />

              {/* Seller */}
              <div className="seller-card">
                <div className="seller-top">
                  <div className="seller-avatar">{product.vendor.name[0]?.toUpperCase()}</div>
                  <div>
                    <div className="seller-name">{product.vendor.name}</div>
                    <div className="seller-since">Member since {formatDate(product.vendor.createdAt)}</div>
                  </div>
                </div>
                {!isOwner && (
                  <Link href={`/messages?vendorId=${product.vendor.id}&productId=${product.id}`}
                    className="btn-message">
                    <MessageSquare size={15} /> Message Seller
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <CheckCircle size={15} style={{color:"var(--green)"}} /> {toast}
        </div>
      )}
    </>
  );
}