// app/dashboard/page.tsx

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShoppingBag, Package, MessageSquare, Heart, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const isVendor = session.user.role === "VENDOR";

  // Fetch real stats
  const [cartCount, orderCount, wishlistCount, productCount, pendingOrders, totalSales] =
    await Promise.all([
      !isVendor ? prisma.cartItem.count({ where: { userId: session.user.id } }) : Promise.resolve(0),
      prisma.order.count({ where: isVendor ? { vendorId: session.user.id } : { buyerId: session.user.id } }),
      !isVendor ? prisma.wishlist.count({ where: { userId: session.user.id } }) : Promise.resolve(0),
      isVendor  ? prisma.product.count({ where: { vendorId: session.user.id } }) : Promise.resolve(0),
      isVendor  ? prisma.order.count({ where: { vendorId: session.user.id, status: "PENDING" } }) : Promise.resolve(0),
      isVendor  ? prisma.order.aggregate({ where: { vendorId: session.user.id, status: "COMPLETED" }, _sum: { totalAmount: true } }) : Promise.resolve(null),
    ]);

  const vendorStats = [
    { label: "Total Products", value: String(productCount),   icon: Package,       color: "#00d4ff", href: "/dashboard/vendor/products" },
    { label: "Pending Orders", value: String(pendingOrders),  icon: ShoppingBag,   color: "#ff7d3b", href: "/dashboard/orders" },
    { label: "Total Orders",   value: String(orderCount),     icon: TrendingUp,    color: "#00e5a0", href: "/dashboard/orders" },
    { label: "Total Earned",   value: formatPrice((totalSales as any)?._sum?.totalAmount || 0), icon: TrendingUp, color: "#a78bfa", href: "/dashboard/orders" },
  ];
  const buyerStats = [
    { label: "Cart Items",  value: String(cartCount),    icon: ShoppingBag,   color: "#00d4ff", href: "/cart" },
    { label: "My Orders",   value: String(orderCount),   icon: Package,       color: "#00e5a0", href: "/dashboard/orders" },
    { label: "Messages",    value: "0",                  icon: MessageSquare, color: "#ff7d3b", href: "/dashboard/messages" },
    { label: "Wishlist",    value: String(wishlistCount),icon: Heart,         color: "#ff4d6d", href: "/dashboard/wishlist" },
  ];
  const stats = isVendor ? vendorStats : buyerStats;

  const vendorLinks = [
    { href: "/dashboard/vendor/products/new", icon: Plus,          title: "List New Product",  desc: "Add a product to your shop",        color: "#00d4ff" },
    { href: "/dashboard/vendor/products",     icon: Package,       title: "Manage Products",   desc: "Edit or remove your listings",      color: "#00e5a0" },
    { href: "/dashboard/orders",              icon: ShoppingBag,   title: "View Orders",       desc: "Track and confirm incoming orders", color: "#ff7d3b" },
    { href: "/dashboard/messages",            icon: MessageSquare, title: "Messages",          desc: "Respond to buyer enquiries",        color: "#a78bfa" },
  ];
  const buyerLinks = [
    { href: "/products",           icon: Package,       title: "Browse Products", desc: "Discover campus deals",             color: "#00d4ff" },
    { href: "/cart",               icon: ShoppingBag,   title: "My Cart",         desc: "Review and checkout items",         color: "#00e5a0" },
    { href: "/dashboard/orders",   icon: TrendingUp,    title: "My Orders",       desc: "Track your purchase history",       color: "#ff7d3b" },
    { href: "/dashboard/wishlist", icon: Heart,         title: "Wishlist",        desc: "Products you saved for later",      color: "#ff4d6d" },
  ];
  const links = isVendor ? vendorLinks : buyerLinks;

  return (
    <>
      <style>{`
        .dash         { min-height: calc(100vh - 64px); background: var(--bg); padding: 40px 24px; }
        .dash-inner   { max-width: 1100px; margin: 0 auto; }
        .dash-header  { display: flex; align-items: flex-start; justify-content: space-between;
                        margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
        .dash-greeting h1 { font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; }
        .dash-greeting p  { font-size: 14px; color: var(--text-muted); margin-top: 4px; }
        .role-badge   { display: inline-flex; align-items: center; padding: 3px 10px;
                        border-radius: 999px; font-size: 11px; font-weight: 600; margin-left: 10px;
                        background: rgba(0,212,255,0.1); color: var(--accent);
                        border: 1px solid rgba(0,212,255,0.2); vertical-align: middle; }
        .btn-new      { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px;
                        border-radius: 10px; background: var(--accent); color: #0a0f1e;
                        font-size: 13px; font-weight: 600; text-decoration: none;
                        box-shadow: 0 0 14px rgba(0,212,255,0.2); transition: opacity 0.15s; }
        .btn-new:hover { opacity: 0.88; }
        .stats-grid   { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 32px; }
        @media (max-width: 800px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
        .stat-card    { background: var(--bg-card); border: 1px solid var(--border-muted);
                        border-radius: 14px; padding: 20px; text-decoration: none; transition: border-color 0.15s; }
        .stat-card:hover { border-color: var(--border); }
        .stat-top     { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .stat-lbl     { font-size: 12px; color: var(--text-subtle); }
        .stat-icon    { width: 34px; height: 34px; border-radius: 9px;
                        display: flex; align-items: center; justify-content: center; }
        .stat-val     { font-size: 1.75rem; font-weight: 800; color: var(--text); }
        .links-grid   { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        @media (max-width: 600px) { .links-grid { grid-template-columns: 1fr; } }
        .quick-card   { display: flex; align-items: center; gap: 16px; padding: 20px;
                        background: var(--bg-card); border: 1px solid var(--border-muted);
                        border-radius: 14px; text-decoration: none; transition: all 0.2s; }
        .quick-card:hover { border-color: var(--border); background: var(--bg-elevated); }
        .quick-icon   { width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
                        display: flex; align-items: center; justify-content: center; }
        .quick-text strong { font-size: 14px; font-weight: 600; color: var(--text); display: block; }
        .quick-text span   { font-size: 12px; color: var(--text-subtle); margin-top: 2px; display: block; }
        .quick-arrow  { color: var(--text-subtle); transition: transform 0.2s; margin-left: auto; flex-shrink: 0; }
        .quick-card:hover .quick-arrow { transform: translateX(4px); color: var(--accent); }
      `}</style>

      <div className="dash">
        <div className="dash-inner">
          <div className="dash-header">
            <div className="dash-greeting">
              <h1>
                Hello, {session.user.name?.split(" ")[0]} 👋
                <span className="role-badge">{session.user.role}</span>
              </h1>
              <p>Welcome to your CampusMart dashboard</p>
            </div>
            {isVendor && (
              <Link href="/dashboard/vendor/products/new" className="btn-new">
                <Plus size={15} /> List Product
              </Link>
            )}
          </div>

          <div className="stats-grid">
            {stats.map(({ label, value, icon: Icon, color, href }) => (
              <Link key={label} href={href} className="stat-card">
                <div className="stat-top">
                  <span className="stat-lbl">{label}</span>
                  <div className="stat-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={16} />
                  </div>
                </div>
                <div className="stat-val">{value}</div>
              </Link>
            ))}
          </div>

          <div className="links-grid">
            {links.map(({ href, icon: Icon, title, desc, color }) => (
              <Link key={href} href={href} className="quick-card">
                <div className="quick-icon" style={{ background: `${color}18`, color }}>
                  <Icon size={18} />
                </div>
                <div className="quick-text">
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
                <ArrowRight size={16} className="quick-arrow" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}