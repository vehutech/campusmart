import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Users, BookOpen, Laptop, Shirt, Utensils, Package } from "lucide-react";

const categories = [
  { name: "Books",       icon: BookOpen, count: "200+", slug: "books",       color: "#00d4ff" },
  { name: "Electronics", icon: Laptop,   count: "150+", slug: "electronics", color: "#00e5a0" },
  { name: "Fashion",     icon: Shirt,    count: "300+", slug: "fashion",     color: "#ff7d3b" },
  { name: "Food",        icon: Utensils, count: "80+",  slug: "food",        color: "#ff4d6d" },
  { name: "Accessories", icon: Package,  count: "120+", slug: "accessories", color: "#a78bfa" },
];

const features = [
  { icon: ShieldCheck, title: "Verified Students Only",  desc: "Every account is tied to a FULokoja student or staff identity — no anonymous sellers.", color: "#00e5a0" },
  { icon: Zap,         title: "Instant Connection",      desc: "Message sellers directly, negotiate prices, and arrange campus pickup in minutes.",    color: "#00d4ff" },
  { icon: Users,       title: "Campus Community",        desc: "Buy and sell within a trusted community of 10,000+ students and vendors.",             color: "#ff7d3b" },
];

export default function HomePage() {
  return (
    <>
      <style>{`
        .page-wrap   { min-height: 100vh; background: var(--bg); color: var(--text); }
        .container   { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .section     { padding: 72px 0; border-top: 1px solid var(--border-muted); }
        .section-alt { background: var(--bg-card); }

        /* Hero */
        .hero        { padding: 96px 0 80px; text-align: center; position: relative; overflow: hidden; }
        .hero-glow   { position: absolute; inset: 0; pointer-events: none;
                       background: radial-gradient(ellipse 700px 400px at 50% 0%, rgba(0,212,255,0.07) 0%, transparent 70%); }
        .hero-pill   { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px;
                       border-radius: 999px; border: 1px solid rgba(0,212,255,0.25);
                       background: rgba(0,212,255,0.06); color: var(--accent);
                       font-size: 12px; font-weight: 500; margin-bottom: 28px; }
        .hero-dot    { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: pulse 2s infinite; }
        .hero h1     { font-size: clamp(2.6rem, 7vw, 5rem); font-weight: 900; line-height: 1.08;
                       letter-spacing: -0.03em; margin-bottom: 24px; }
        .hero h1 em  { font-style: normal; color: var(--accent); }
        .hero p      { font-size: 1.1rem; color: var(--text-muted); max-width: 480px;
                       margin: 0 auto 40px; line-height: 1.7; }
        .hero-btns   { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { display: inline-flex; align-items: center; gap: 8px;
                       padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600;
                       background: var(--accent); color: #0a0f1e; text-decoration: none;
                       box-shadow: 0 0 24px rgba(0,212,255,0.3); transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.88; }
        .btn-outline { display: inline-flex; align-items: center; gap: 8px;
                       padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600;
                       border: 1.5px solid var(--accent); color: var(--accent); text-decoration: none;
                       transition: background 0.2s; }
        .btn-outline:hover { background: rgba(0,212,255,0.08); }
        .hero-stats  { display: flex; justify-content: center; gap: 48px;
                       margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--border-muted); }
        .stat-num    { font-size: 1.6rem; font-weight: 900; color: var(--accent); }
        .stat-lbl    { font-size: 11px; color: var(--text-subtle); margin-top: 2px; }

        /* Section header */
        .section-hdr      { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; }
        .section-hdr h2   { font-size: 1.25rem; font-weight: 700; }
        .section-hdr p    { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
        .section-hdr a    { font-size: 13px; color: var(--accent); text-decoration: none; display: flex; align-items: center; gap: 4px; }
        .section-hdr a:hover { text-decoration: underline; }

        /* Category grid */
        .cat-grid  { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        @media (max-width: 900px) { .cat-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px) { .cat-grid { grid-template-columns: repeat(2, 1fr); } }
        .cat-card  { display: flex; flex-direction: column; align-items: center; gap: 12px;
                     padding: 24px 16px; border-radius: 12px; text-decoration: none;
                     border: 1px solid var(--border-muted); background: var(--bg-card);
                     text-align: center; transition: border-color 0.2s, background 0.2s; }
        .cat-card:hover { border-color: var(--border); background: var(--bg-elevated); }
        .cat-icon  { width: 48px; height: 48px; border-radius: 10px;
                     display: flex; align-items: center; justify-content: center; }
        .cat-name  { font-size: 13px; font-weight: 600; color: var(--text); }
        .cat-count { font-size: 11px; color: var(--text-subtle); margin-top: 2px; }

        /* Features */
        .feat-title { text-align: center; margin-bottom: 40px; }
        .feat-title h2 { font-size: 1.25rem; font-weight: 700; }
        .feat-title p  { font-size: 13px; color: var(--text-muted); margin-top: 6px; }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 700px) { .feat-grid { grid-template-columns: 1fr; } }
        .feat-card { padding: 28px; border-radius: 12px; background: var(--bg-elevated);
                     border: 1px solid var(--border-muted); }
        .feat-icon { width: 44px; height: 44px; border-radius: 10px;
                     display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .feat-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
        .feat-card p  { font-size: 13px; color: var(--text-muted); line-height: 1.65; }

        /* CTA */
        .cta { text-align: center; }
        .cta h2 { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; margin-bottom: 12px; }
        .cta p  { color: var(--text-muted); font-size: 15px; margin-bottom: 32px; }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      <div className="page-wrap">

        {/* ── Hero ── */}
        <section className="hero">
          <div className="hero-glow" />
          <div className="container" style={{position:"relative"}}>
            <div className="hero-pill">
              <span className="hero-dot" />
              Federal University Lokoja · Campus Marketplace
            </div>
            <h1>
              Buy &amp; Sell on Campus,<br />
              <em>Effortlessly.</em>
            </h1>
            <p>
              The trusted marketplace built for FULokoja students. Find textbooks,
              electronics, fashion, and more — from people you actually know.
            </p>
            <div className="hero-btns">
              <Link href="/products" className="btn-primary">
                Browse Products <ArrowRight size={16} />
              </Link>
              <Link href="/register?role=VENDOR" className="btn-outline">
                Start Selling
              </Link>
            </div>
            <div className="hero-stats">
              {[["10K+","Students"],["500+","Products"],["200+","Vendors"]].map(([n,l]) => (
                <div key={l} style={{textAlign:"center"}}>
                  <div className="stat-num">{n}</div>
                  <div className="stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="section">
          <div className="container">
            <div className="section-hdr">
              <div>
                <h2>Shop by Category</h2>
                <p>Find exactly what you need</p>
              </div>
              <Link href="/categories">View all <ArrowRight size={13} /></Link>
            </div>
            <div className="cat-grid">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="cat-card">
                    <div className="cat-icon" style={{background:`${cat.color}18`, color:cat.color}}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="cat-name">{cat.name}</div>
                      <div className="cat-count">{cat.count} items</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section section-alt">
          <div className="container">
            <div className="feat-title">
              <h2>Why CampusMart?</h2>
              <p>Designed for the FULokoja campus community</p>
            </div>
            <div className="feat-grid">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="feat-card">
                    <div className="feat-icon" style={{background:`${f.color}18`, color:f.color}}>
                      <Icon size={20} />
                    </div>
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section cta">
          <div className="container">
            <h2>Ready to start selling?</h2>
            <p>Join hundreds of student vendors already earning on CampusMart.</p>
            <Link href="/register?role=VENDOR" className="btn-primary" style={{display:"inline-flex"}}>
              Create Vendor Account <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}