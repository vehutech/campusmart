// app/dashboard/vendor/products/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export default async function VendorProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "VENDOR") redirect("/dashboard");

  const products = await prisma.product.findMany({
    where: { vendorId: session.user.id },
    include: { category: true, _count: { select: { orderItems: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <style>{`
        .vp-page    { min-height: calc(100vh - 64px); background: var(--bg); padding: 36px 24px; }
        .vp-inner   { max-width: 1100px; margin: 0 auto; }
        .vp-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
        .vp-header h1 { font-size: 1.4rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .vp-header p  { font-size: 13px; color: var(--text-muted); margin-top: 3px; }
        .btn-add    { display: inline-flex; align-items: center; gap: 7px; padding: 10px 18px;
                      border-radius: 10px; background: var(--accent); color: #0a0f1e;
                      font-size: 13px; font-weight: 700; text-decoration: none;
                      box-shadow: 0 0 14px rgba(0,212,255,0.2); transition: opacity 0.15s; }
        .btn-add:hover { opacity: 0.88; }

        .prod-table { background: var(--bg-card); border: 1px solid var(--border-muted); border-radius: 14px; overflow: hidden; }
        .prod-table-header { display: grid; grid-template-columns: 2fr 1fr 1fr 80px 80px 100px;
                             padding: 12px 20px; border-bottom: 1px solid var(--border-muted);
                             font-size: 11px; font-weight: 600; text-transform: uppercase;
                             letter-spacing: 0.06em; color: var(--text-subtle); }
        .prod-row   { display: grid; grid-template-columns: 2fr 1fr 1fr 80px 80px 100px;
                      padding: 16px 20px; border-bottom: 1px solid var(--border-muted);
                      align-items: center; transition: background 0.15s; }
        .prod-row:last-child { border-bottom: none; }
        .prod-row:hover { background: var(--bg-elevated); }
        @media (max-width: 768px) {
          .prod-table-header { display: none; }
          .prod-row { grid-template-columns: 1fr 1fr; gap: 8px; }
        }

        .prod-info  { display: flex; align-items: center; gap: 12px; }
        .prod-thumb { width: 44px; height: 44px; border-radius: 8px; background: var(--bg-elevated);
                      border: 1px solid var(--border-muted); overflow: hidden; display: flex;
                      align-items: center; justify-content: center; flex-shrink: 0; font-size: 1.2rem; }
        .prod-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .prod-name  { font-size: 13px; font-weight: 600; color: var(--text);
                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .prod-cat   { font-size: 11px; color: var(--text-subtle); margin-top: 2px; }
        .prod-price { font-size: 14px; font-weight: 700; color: var(--accent); }
        .prod-stock { font-size: 13px; color: var(--text-muted); }
        .status-badge { padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 600; display: inline-block; }
        .status-active   { background: rgba(0,229,160,0.1); color: var(--green); }
        .status-inactive { background: rgba(255,77,109,0.1); color: var(--red); }
        .row-actions { display: flex; align-items: center; gap: 6px; }
        .action-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-muted);
                      background: var(--bg-elevated); display: flex; align-items: center; justify-content: center;
                      color: var(--text-muted); text-decoration: none; transition: all 0.15s; cursor: pointer; }
        .action-btn:hover { border-color: var(--accent); color: var(--accent); }

        .empty-state { padding: 64px 20px; text-align: center; }
        .empty-state .icon { font-size: 3rem; margin-bottom: 12px; }
        .empty-state h3    { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .empty-state p     { font-size: 13px; color: var(--text-muted); }
      `}</style>

      <div className="vp-page">
        <div className="vp-inner">
          <div className="vp-header">
            <div>
              <h1>My Products</h1>
              <p>{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
            </div>
            <Link href="/dashboard/vendor/products/new" className="btn-add">
              <Plus size={15} /> Add Product
            </Link>
          </div>

          <div className="prod-table">
            {products.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📦</div>
                <h3>No products yet</h3>
                <p>Start by adding your first product listing.</p>
              </div>
            ) : (
              <>
                <div className="prod-table-header">
                  <span>Product</span><span>Price</span><span>Stock</span>
                  <span>Orders</span><span>Status</span><span>Actions</span>
                </div>
                {products.map((p: any) => (
                  <div key={p.id} className="prod-row">
                    <div className="prod-info">
                      <div className="prod-thumb">
                        {p.images?.[0] ? <img src={p.images[0]} alt={p.title} /> : "🛍️"}
                      </div>
                      <div>
                        <div className="prod-name">{p.title}</div>
                        <div className="prod-cat">{p.category.name} · {formatDate(p.createdAt)}</div>
                      </div>
                    </div>
                    <div className="prod-price">{formatPrice(p.price)}</div>
                    <div className="prod-stock">{p.stock} left</div>
                    <div className="prod-stock">{p._count.orderItems}</div>
                    <div>
                      <span className={`status-badge ${p.isActive ? "status-active" : "status-inactive"}`}>
                        {p.isActive ? "Active" : "Hidden"}
                      </span>
                    </div>
                    <div className="row-actions">
                      <Link href={`/products/${p.id}`} className="action-btn" title="View"><Eye size={14} /></Link>
                      <Link href={`/dashboard/vendor/products/${p.id}/edit`} className="action-btn" title="Edit"><Edit size={14} /></Link>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}