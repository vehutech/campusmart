import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ShoppingBag, Package, MessageSquare, Heart, Plus, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isVendor = session.user.role === "VENDOR";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold">
              Hello, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <Badge variant={isVendor ? "info" : "success"}>
              {session.user.role}
            </Badge>
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            Welcome to your CampusMart dashboard
          </p>
        </div>
        {isVendor && (
          <Link href="/dashboard/vendor/products/new">
            <Button size="sm">
              <Plus className="w-4 h-4" /> List Product
            </Button>
          </Link>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {(isVendor
          ? [
              { label: "Total Products", value: "0", icon: Package, color: "#00d4ff" },
              { label: "Active Orders", value: "0", icon: ShoppingBag, color: "#00e5a0" },
              { label: "Messages", value: "0", icon: MessageSquare, color: "#ff7d3b" },
              { label: "Total Sales", value: "₦0", icon: TrendingUp, color: "#a78bfa" },
            ]
          : [
              { label: "Cart Items", value: "0", icon: ShoppingBag, color: "#00d4ff" },
              { label: "My Orders", value: "0", icon: Package, color: "#00e5a0" },
              { label: "Messages", value: "0", icon: MessageSquare, color: "#ff7d3b" },
              { label: "Wishlist", value: "0", icon: Heart, color: "#ff4d6d" },
            ]
        ).map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-muted)] rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-[var(--text-subtle)]">{stat.label}</p>
                <div
                  className="w-8 h-8 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-2 gap-4">
        {isVendor ? (
          <>
            <QuickCard
              href="/dashboard/vendor/products"
              icon={Package}
              title="Manage Products"
              desc="Add, edit, or remove your product listings"
              color="#00d4ff"
            />
            <QuickCard
              href="/dashboard/vendor/orders"
              icon={ShoppingBag}
              title="View Orders"
              desc="Track and manage incoming orders from buyers"
              color="#00e5a0"
            />
            <QuickCard
              href="/dashboard/messages"
              icon={MessageSquare}
              title="Messages"
              desc="Respond to buyer inquiries"
              color="#ff7d3b"
            />
            <QuickCard
              href="/products"
              icon={TrendingUp}
              title="Browse Marketplace"
              desc="See what other vendors are selling"
              color="#a78bfa"
            />
          </>
        ) : (
          <>
            <QuickCard
              href="/products"
              icon={Package}
              title="Browse Products"
              desc="Discover thousands of campus deals"
              color="#00d4ff"
            />
            <QuickCard
              href="/cart"
              icon={ShoppingBag}
              title="My Cart"
              desc="Review and checkout your selected items"
              color="#00e5a0"
            />
            <QuickCard
              href="/dashboard/orders"
              icon={TrendingUp}
              title="My Orders"
              desc="Track your purchase history"
              color="#ff7d3b"
            />
            <QuickCard
              href="/dashboard/messages"
              icon={MessageSquare}
              title="Messages"
              desc="Chat with sellers about products"
              color="#a78bfa"
            />
          </>
        )}
      </div>
    </div>
  );
}

function QuickCard({
  href, icon: Icon, title, desc, color,
}: {
  href: string;
  icon: any;
  title: string;
  desc: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-muted)] rounded hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-all duration-200"
    >
      <div
        className="w-12 h-12 rounded-sm flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm group-hover:text-[var(--accent)] transition-colors">{title}</p>
        <p className="text-xs text-[var(--text-subtle)] mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-[var(--text-subtle)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
