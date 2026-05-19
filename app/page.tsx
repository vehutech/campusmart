import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Users, BookOpen, Laptop, Shirt, Utensils, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  { name: "Books", icon: BookOpen, count: "200+", slug: "books", color: "#00d4ff" },
  { name: "Electronics", icon: Laptop, count: "150+", slug: "electronics", color: "#00e5a0" },
  { name: "Fashion", icon: Shirt, count: "300+", slug: "fashion", color: "#ff7d3b" },
  { name: "Food", icon: Utensils, count: "80+", slug: "food", color: "#ff4d6d" },
  { name: "Accessories", icon: Package, count: "120+", slug: "accessories", color: "#a78bfa" },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified Students Only",
    desc: "Every account is tied to a FULokoja student or staff identity — no anonymous sellers.",
    color: "#00e5a0",
  },
  {
    icon: Zap,
    title: "Instant Connection",
    desc: "Message sellers directly, negotiate prices, and arrange campus pickup in minutes.",
    color: "#00d4ff",
  },
  {
    icon: Users,
    title: "Campus Community",
    desc: "Buy and sell within a trusted community of 10,000+ students and vendors.",
    color: "#ff7d3b",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-28 text-center">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--accent)] opacity-5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-[var(--green)] opacity-5 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(0,212,255,0.2)] bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-medium mb-6 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Federal University Lokoja · Campus Marketplace
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 fade-up-delay-1">
            Buy & Sell on
            <br />
            <span className="text-[var(--accent)]">Campus,</span>
            <span className="text-[var(--text-muted)]"> Effortlessly.</span>
          </h1>

          <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto mb-10 fade-up-delay-2">
            The trusted marketplace built for FULokoja students. Find textbooks, electronics, fashion, and more — from people you actually know.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 fade-up-delay-3">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Products <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register?role=VENDOR">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Start Selling
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-16 pt-8 border-t border-[var(--border-muted)] fade-up-delay-3">
            {[["10K+", "Students"], ["500+", "Products"], ["200+", "Vendors"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-extrabold text-[var(--accent)]">{num}</div>
                <div className="text-xs text-[var(--text-subtle)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-4 py-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Shop by Category</h2>
            <p className="text-[var(--text-muted)] text-sm mt-1">Find exactly what you need</p>
          </div>
          <Link href="/categories" className="text-[var(--accent)] text-sm hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group p-5 rounded bg-[var(--bg-card)] border border-[var(--border-muted)] hover:border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-all duration-200 flex flex-col items-center gap-3 text-center"
              >
                <div
                  className="w-12 h-12 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-[var(--text)] transition-colors">{cat.name}</p>
                  <p className="text-xs text-[var(--text-subtle)] mt-0.5">{cat.count} items</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-[var(--bg-card)] border-y border-[var(--border-muted)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold">Why CampusMart?</h2>
            <p className="text-[var(--text-muted)] text-sm mt-2">Designed for the FULokoja campus community</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded bg-[var(--bg-elevated)] border border-[var(--border-muted)]">
                  <div
                    className="w-10 h-10 rounded-sm flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to start selling?</h2>
          <p className="text-[var(--text-muted)] mb-8">
            Join hundreds of student vendors already earning on CampusMart.
          </p>
          <Link href="/register?role=VENDOR">
            <Button size="lg">
              Create Vendor Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
