"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, MapPin, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

interface Product {
  id: string; title: string; description: string; price: number;
  images: string[]; condition: string; location: string | null;
  viewCount: number; createdAt: string;
  vendor: { id: string; name: string; avatar: string | null };
  category: { id: string; name: string; slug: string };
}

interface Category { id: string; name: string; slug: string; _count: { products: number } }

const CONDITIONS = ["NEW", "USED", "REFURBISHED"];

export function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);

  const search    = searchParams.get("search") || "";
  const category  = searchParams.get("category") || "";
  const condition = searchParams.get("condition") || "";
  const sort      = searchParams.get("sort") || "newest";
  const page      = parseInt(searchParams.get("page") || "1");

  const [searchInput, setSearchInput] = useState(search);

  const push = useCallback((updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    p.delete("page");
    router.push(`/products?${p.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search)    params.set("search", search);
    if (category)  params.set("category", category);
    if (condition) params.set("condition", condition);
    if (sort)      params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(data => { setProducts(data.products || []); setTotal(data.total || 0); })
      .finally(() => setLoading(false));
  }, [search, category, condition, sort, page]);

  const totalPages = Math.ceil(total / 12);
  const hasFilters = search || category || condition;

  return (
    <>
      <style>{`
        .pl-page    { min-height: calc(100vh - 64px); background: var(--bg); padding: 32px 24px; }
        .pl-inner   { max-width: 1100px; margin: 0 auto; }

        .pl-top     { margin-bottom: 28px; }
        .pl-top h1  { font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .pl-top p   { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        .pl-controls { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
        .search-wrap { position: relative; flex: 1; min-width: 220px; }
        .search-wrap input { width: 100%; background: var(--bg-card); border: 1px solid var(--border-muted);
                             border-radius: 10px; padding: 10px 14px 10px 38px; font-size: 14px;
                             color: var(--text); outline: none; font-family: inherit; transition: border-color 0.15s; }
        .search-wrap input::placeholder { color: var(--text-subtle); }
        .search-wrap input:focus { border-color: var(--accent); }
        .search-ico  { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-subtle); }
        .search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
                        background: none; border: none; cursor: pointer; color: var(--text-subtle);
                        padding: 2px; display: flex; }

        .filter-select { background: var(--bg-card); border: 1px solid var(--border-muted);
                         border-radius: 10px; padding: 10px 14px; font-size: 13px; color: var(--text);
                         outline: none; cursor: pointer; font-family: inherit; transition: border-color 0.15s; }
        .filter-select:focus { border-color: var(--accent); }

        .active-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; align-items: center; }
        .filter-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px;
                       border-radius: 999px; font-size: 12px; font-weight: 500;
                       background: rgba(0,212,255,0.1); color: var(--accent);
                       border: 1px solid rgba(0,212,255,0.2); }
        .chip-remove { background: none; border: none; cursor: pointer; color: currentColor;
                       display: flex; padding: 0; opacity: 0.7; }
        .chip-remove:hover { opacity: 1; }
        .clear-all   { font-size: 12px; color: var(--text-muted); background: none; border: none;
                       cursor: pointer; text-decoration: underline; }

        .pl-layout   { display: grid; grid-template-columns: 220px 1fr; gap: 24px; }
        @media (max-width: 768px) { .pl-layout { grid-template-columns: 1fr; } .pl-sidebar { display: none; } }

        .pl-sidebar  { }
        .sidebar-section { margin-bottom: 24px; }
        .sidebar-label { font-size: 11px; font-weight: 600; text-transform: uppercase;
                         letter-spacing: 0.08em; color: var(--text-subtle); margin-bottom: 10px; }
        .cat-item    { display: flex; align-items: center; justify-content: space-between;
                       padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: all 0.15s;
                       font-size: 13px; color: var(--text-muted); background: none; border: none;
                       width: 100%; text-align: left; font-family: inherit; }
        .cat-item:hover { background: var(--bg-elevated); color: var(--text); }
        .cat-item.active { background: rgba(0,212,255,0.1); color: var(--accent); }
        .cat-count   { font-size: 11px; color: var(--text-subtle); }
        .cond-item   { display: flex; align-items: center; gap: 8px; padding: 7px 10px;
                       border-radius: 8px; cursor: pointer; font-size: 13px; color: var(--text-muted);
                       background: none; border: none; width: 100%; font-family: inherit; transition: all 0.15s; }
        .cond-item:hover { background: var(--bg-elevated); color: var(--text); }
        .cond-item.active { color: var(--accent); }
        .cond-dot    { width: 8px; height: 8px; border-radius: 50%; border: 2px solid currentColor; flex-shrink: 0; }
        .cond-item.active .cond-dot { background: currentColor; }

        .pl-grid     { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .pl-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .pl-grid { grid-template-columns: 1fr; } }

        .prod-card   { background: var(--bg-card); border: 1px solid var(--border-muted);
                       border-radius: 14px; overflow: hidden; text-decoration: none;
                       display: flex; flex-direction: column; transition: all 0.2s; }
        .prod-card:hover { border-color: var(--border); transform: translateY(-2px);
                           box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .prod-img    { aspect-ratio: 4/3; background: var(--bg-elevated);
                       display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
        .prod-img img { width: 100%; height: 100%; object-fit: cover; }
        .prod-img-placeholder { font-size: 2rem; }
        .prod-cond   { position: absolute; top: 10px; left: 10px; padding: 3px 8px;
                       border-radius: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; }
        .cond-NEW    { background: rgba(0,229,160,0.15); color: var(--green); }
        .cond-USED   { background: rgba(255,125,59,0.15); color: var(--orange); }
        .cond-REFURBISHED { background: rgba(167,139,250,0.15); color: #a78bfa; }

        .prod-body   { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
        .prod-cat    { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-subtle); }
        .prod-title  { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.35;
                       display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .prod-price  { font-size: 1.1rem; font-weight: 800; color: var(--accent); margin-top: 4px; }
        .prod-meta   { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 8px;
                       border-top: 1px solid var(--border-muted); }
        .prod-vendor { font-size: 11px; color: var(--text-subtle); }
        .prod-views  { font-size: 11px; color: var(--text-subtle); display: flex; align-items: center; gap: 3px; }

        .pl-empty    { grid-column: 1/-1; text-align: center; padding: 60px 20px; }
        .pl-empty p  { color: var(--text-muted); font-size: 14px; margin-top: 8px; }

        .pagination  { display: flex; align-items: center; justify-content: center;
                       gap: 6px; margin-top: 32px; }
        .page-btn    { width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border-muted);
                       background: var(--bg-card); color: var(--text-muted); font-size: 13px; font-weight: 500;
                       cursor: pointer; display: flex; align-items: center; justify-content: center;
                       text-decoration: none; transition: all 0.15s; }
        .page-btn:hover { border-color: var(--accent); color: var(--accent); }
        .page-btn.active { background: var(--accent); border-color: var(--accent); color: #0a0f1e; font-weight: 700; }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .skeleton-card { background: var(--bg-card); border: 1px solid var(--border-muted); border-radius: 14px; overflow: hidden; }
        .skeleton-img  { aspect-ratio: 4/3; background: var(--bg-elevated); animation: shimmer 1.5s infinite;
                         background: linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 50%,var(--bg-card) 75%);
                         background-size: 200% 100%; }
        .skeleton-line { height: 12px; border-radius: 6px; margin: 14px 14px 6px;
                         background: linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 50%,var(--bg-card) 75%);
                         background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .skeleton-line.short { width: 60%; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        .results-bar { display: flex; align-items: center; justify-content: space-between;
                       margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
        .results-count { font-size: 13px; color: var(--text-muted); }
        .sort-select { background: var(--bg-card); border: 1px solid var(--border-muted);
                       border-radius: 8px; padding: 6px 12px; font-size: 13px; color: var(--text);
                       outline: none; cursor: pointer; font-family: inherit; }
      `}</style>

      <div className="pl-page">
        <div className="pl-inner">
          <div className="pl-top">
            <h1>Browse Products</h1>
            <p>Find what you need from the FULokoja campus community</p>
          </div>

          {/* Search + filters bar */}
          <div className="pl-controls">
            <div className="search-wrap">
              <Search size={15} className="search-ico" />
              <input
                placeholder="Search products..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && push({ search: searchInput })}
              />
              {searchInput && (
                <button className="search-clear" onClick={() => { setSearchInput(""); push({ search: "" }); }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <select className="filter-select" value={category}
              onChange={e => push({ category: e.target.value })}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
            <select className="filter-select" value={condition}
              onChange={e => push({ condition: e.target.value })}>
              <option value="">Any Condition</option>
              {CONDITIONS.map(c => <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>)}
            </select>
          </div>

          {/* Active filter chips */}
          {hasFilters && (
            <div className="active-filters">
              <SlidersHorizontal size={13} style={{color:"var(--text-subtle)"}} />
              {search && (
                <span className="filter-chip">
                  &ldquo;{search}&rdquo;
                  <button className="chip-remove" onClick={() => { setSearchInput(""); push({ search: "" }); }}><X size={10} /></button>
                </span>
              )}
              {category && (
                <span className="filter-chip">
                  {categories.find(c => c.slug === category)?.name || category}
                  <button className="chip-remove" onClick={() => push({ category: "" })}><X size={10} /></button>
                </span>
              )}
              {condition && (
                <span className="filter-chip">
                  {condition.charAt(0) + condition.slice(1).toLowerCase()}
                  <button className="chip-remove" onClick={() => push({ condition: "" })}><X size={10} /></button>
                </span>
              )}
              <button className="clear-all" onClick={() => { setSearchInput(""); router.push("/products"); }}>
                Clear all
              </button>
            </div>
          )}

          <div className="pl-layout">
            {/* Sidebar */}
            <aside className="pl-sidebar">
              <div className="sidebar-section">
                <div className="sidebar-label">Categories</div>
                <button className={`cat-item ${!category ? "active" : ""}`} onClick={() => push({ category: "" })}>
                  <span>All Products</span>
                  <span className="cat-count">{total}</span>
                </button>
                {categories.map(c => (
                  <button key={c.id} className={`cat-item ${category === c.slug ? "active" : ""}`}
                    onClick={() => push({ category: c.slug })}>
                    <span>{c.name}</span>
                    <span className="cat-count">{c._count.products}</span>
                  </button>
                ))}
              </div>

              <div className="sidebar-section">
                <div className="sidebar-label">Condition</div>
                {CONDITIONS.map(c => (
                  <button key={c} className={`cond-item ${condition === c ? "active" : ""}`}
                    onClick={() => push({ condition: condition === c ? "" : c })}>
                    <span className="cond-dot" />
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <div>
              <div className="results-bar">
                <span className="results-count">
                  {loading ? "Loading..." : `${total} product${total !== 1 ? "s" : ""} found`}
                </span>
                <select className="sort-select" value={sort} onChange={e => push({ sort: e.target.value })}>
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="popular">Most Viewed</option>
                </select>
              </div>

              <div className="pl-grid">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-card">
                      <div className="skeleton-img" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line short" />
                    </div>
                  ))
                ) : products.length === 0 ? (
                  <div className="pl-empty">
                    <div style={{fontSize:"2.5rem"}}>🔍</div>
                    <p>No products found. Try adjusting your filters.</p>
                  </div>
                ) : (
                  products.map(p => <ProductCard key={p.id} product={p} />)
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <Link key={n} href={`/products?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: String(n) })}`}
                      className={`page-btn ${page === n ? "active" : ""}`}>
                      {n}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const condClass = `cond-${p.condition}`;
  return (
    <Link href={`/products/${p.id}`} className="prod-card">
      <div className="prod-img">
        {p.images?.[0]
          ? <Image src={p.images[0]} alt={p.title} width={300} height={300} />
          : <span className="prod-img-placeholder">🛍️</span>
        }
        <span className={`prod-cond ${condClass}`}>{p.condition}</span>
      </div>
      <div className="prod-body">
        <span className="prod-cat">{p.category.name}</span>
        <h3 className="prod-title">{p.title}</h3>
        <div className="prod-price">{formatPrice(p.price)}</div>
        <div className="prod-meta">
          <span className="prod-vendor">
            {p.location ? <><MapPin size={10} style={{display:"inline",marginRight:2}} />{p.location}</> : p.vendor.name}
          </span>
          <span className="prod-views"><Eye size={10} /> {p.viewCount}</span>
        </div>
      </div>
    </Link>
  );
}