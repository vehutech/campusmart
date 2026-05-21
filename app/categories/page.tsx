"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Laptop, Shirt, Utensils, Package, Wrench, Tag } from "lucide-react";

interface Category { id: string; name: string; slug: string; icon: string | null; _count: { products: number } }

const iconMap: Record<string, any> = {
  books: BookOpen, electronics: Laptop, fashion: Shirt,
  food: Utensils, accessories: Package, services: Wrench,
};
const colorMap: Record<string, string> = {
  books: "#00d4ff", electronics: "#00e5a0", fashion: "#ff7d3b",
  food: "#ff4d6d", accessories: "#a78bfa", services: "#fbbf24",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(data => { setCategories(data); setLoading(false); });
  }, []);

  return (
    <>
      <style>{`
        .cats-page  { min-height: calc(100vh - 64px); background: var(--bg); padding: 40px 24px; }
        .cats-inner { max-width: 1100px; margin: 0 auto; }
        .cats-header { margin-bottom: 36px; }
        .cats-header h1 { font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .cats-header p  { font-size: 14px; color: var(--text-muted); margin-top: 6px; }

        .cats-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 800px) { .cats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .cats-grid { grid-template-columns: 1fr; } }

        .cat-card   { display: flex; align-items: center; gap: 16px; padding: 22px;
                      background: var(--bg-card); border: 1px solid var(--border-muted);
                      border-radius: 14px; text-decoration: none; transition: all 0.2s; }
        .cat-card:hover { border-color: var(--border); background: var(--bg-elevated); transform: translateY(-2px); }
        .cat-card:hover .cat-arrow { transform: translateX(4px); }
        .cat-icon   { width: 52px; height: 52px; border-radius: 12px; display: flex;
                      align-items: center; justify-content: center; flex-shrink: 0; }
        .cat-body   { flex: 1; min-width: 0; }
        .cat-name   { font-size: 15px; font-weight: 700; color: var(--text); }
        .cat-count  { font-size: 12px; color: var(--text-muted); margin-top: 3px; }
        .cat-arrow  { color: var(--text-subtle); transition: transform 0.2s; }

        .skeleton-cat { display: flex; align-items: center; gap: 16px; padding: 22px;
                        background: var(--bg-card); border: 1px solid var(--border-muted); border-radius: 14px; }
        .skel-icon  { width: 52px; height: 52px; border-radius: 12px;
                      background: linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 50%,var(--bg-card) 75%);
                      background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink:0; }
        .skel-line  { height: 13px; border-radius: 6px; background: linear-gradient(90deg,var(--bg-card) 25%,var(--bg-elevated) 50%,var(--bg-card) 75%);
                      background-size: 200% 100%; animation: shimmer 1.5s infinite; margin-bottom: 6px; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      <div className="cats-page">
        <div className="cats-inner">
          <div className="cats-header">
            <h1>All Categories</h1>
            <p>Browse everything available on the FULokoja campus marketplace</p>
          </div>

          <div className="cats-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton-cat">
                    <div className="skel-icon" />
                    <div style={{flex:1}}>
                      <div className="skel-line" style={{width:"60%"}} />
                      <div className="skel-line" style={{width:"40%"}} />
                    </div>
                  </div>
                ))
              : categories.map(cat => {
                  const Icon = iconMap[cat.slug] || Tag;
                  const color = colorMap[cat.slug] || "#00d4ff";
                  return (
                    <Link key={cat.id} href={`/products?category=${cat.slug}`} className="cat-card">
                      <div className="cat-icon" style={{background:`${color}18`, color}}>
                        <Icon size={22} />
                      </div>
                      <div className="cat-body">
                        <div className="cat-name">{cat.name}</div>
                        <div className="cat-count">{cat._count.products} product{cat._count.products !== 1 ? "s" : ""}</div>
                      </div>
                      <ArrowRight size={16} className="cat-arrow" />
                    </Link>
                  );
                })
            }
          </div>
        </div>
      </div>
    </>
  );
}