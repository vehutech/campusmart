"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, LogOut, Search, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <>
      <style>{`
        .nav          { position: sticky; top: 0; z-index: 50;
                        border-bottom: 1px solid var(--border-muted);
                        background: rgba(10,15,30,0.92); backdrop-filter: blur(12px); }
        .nav-inner    { max-width: 1100px; margin: 0 auto; padding: 0 24px;
                        height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .nav-logo     { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
        .nav-logo-icon{ width: 32px; height: 32px; border-radius: 8px; background: var(--accent);
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 0 14px rgba(0,212,255,0.35); font-size: 13px;
                        font-weight: 900; color: #0a0f1e; }
        .nav-logo-txt { font-size: 15px; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
        .nav-logo-txt span { color: var(--accent); }

        .nav-links    { display: flex; align-items: center; gap: 2px; }
        .nav-link     { padding: 7px 14px; border-radius: 8px; font-size: 14px;
                        color: var(--text-muted); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { background: var(--bg-elevated); color: var(--text); }

        .nav-right    { display: flex; align-items: center; gap: 6px; }
        .nav-icon-btn { width: 36px; height: 36px; border-radius: 8px; border: none; background: none;
                        display: flex; align-items: center; justify-content: center;
                        color: var(--text-muted); cursor: pointer; transition: all 0.15s; }
        .nav-icon-btn:hover { background: var(--bg-elevated); color: var(--text); }
        .nav-icon-btn.danger:hover { background: rgba(255,77,109,0.1); color: var(--red); }

        .nav-divider  { width: 1px; height: 24px; background: var(--border); margin: 0 4px; }

        .nav-user     { display: flex; align-items: center; gap: 8px; padding: 5px 10px;
                        border-radius: 8px; text-decoration: none; transition: background 0.15s; }
        .nav-user:hover { background: var(--bg-elevated); }
        .nav-avatar   { width: 28px; height: 28px; border-radius: 50%;
                        border: 1px solid rgba(0,212,255,0.3); background: rgba(0,212,255,0.08);
                        display: flex; align-items: center; justify-content: center;
                        font-size: 12px; font-weight: 700; color: var(--accent); }
        .nav-uname    { font-size: 13px; color: var(--text-muted); }

        .nav-btn      { padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
                        text-decoration: none; transition: all 0.15s; cursor: pointer; border: none; }
        .nav-btn-ghost{ background: none; color: var(--text-muted); }
        .nav-btn-ghost:hover { background: var(--bg-elevated); color: var(--text); }
        .nav-btn-primary { background: var(--accent); color: #0a0f1e;
                           box-shadow: 0 0 14px rgba(0,212,255,0.25); }
        .nav-btn-primary:hover { opacity: 0.88; }

        .nav-hamburger { display: none; }

        /* Mobile */
        @media (max-width: 768px) {
          .nav-links, .nav-right { display: none; }
          .nav-hamburger { display: flex; }
        }

        .mobile-menu  { display: none; border-top: 1px solid var(--border-muted);
                        background: var(--bg-card); padding: 16px 24px; flex-direction: column; gap: 4px; }
        .mobile-menu.open { display: flex; }
        .mobile-link  { padding: 10px 12px; border-radius: 8px; font-size: 14px;
                        color: var(--text-muted); text-decoration: none; transition: all 0.15s; }
        .mobile-link:hover { background: var(--bg-elevated); color: var(--text); }
        .mobile-divider { height: 1px; background: var(--border-muted); margin: 8px 0; }
        .mobile-sign-out { background: none; border: none; padding: 10px 12px; border-radius: 8px;
                           font-size: 14px; color: var(--red); cursor: pointer; text-align: left; width: 100%; }
        .mobile-sign-out:hover { background: rgba(255,77,109,0.08); }
        .mobile-btns  { display: flex; gap: 8px; padding-top: 4px; }
        .mobile-btns a { flex: 1; text-align: center; }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <div className="nav-logo-icon">C</div>
            <span className="nav-logo-txt">Campus<span>Mart</span></span>
          </Link>

          {/* Desktop centre */}
          <div className="nav-links">
            <Link href="/products" className="nav-link">Browse</Link>
            <Link href="/categories" className="nav-link">Categories</Link>
            {session?.user.role === "VENDOR" && (
              <Link href="/dashboard/vendor" className="nav-link">My Shop</Link>
            )}
          </div>

          {/* Desktop right */}
          <div className="nav-right">
            <Link href="/products" className="nav-icon-btn" title="Search">
              <Search size={16} />
            </Link>

            {session ? (
              <>
                {session.user.role === "BUYER" && (
                  <Link href="/cart" className="nav-icon-btn" title="Cart">
                    <ShoppingCart size={16} />
                  </Link>
                )}
                <div className="nav-divider" />
                <Link href="/dashboard" className="nav-user">
                  <div className="nav-avatar">
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="nav-uname">{session.user.name?.split(" ")[0]}</span>
                </Link>
                <button
                  className="nav-icon-btn danger"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="nav-btn nav-btn-ghost">Login</Link>
                <Link href="/register" className="nav-btn nav-btn-primary">Get Started</Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="nav-hamburger nav-icon-btn" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${open ? "open" : ""}`}>
          <Link href="/products" className="mobile-link" onClick={() => setOpen(false)}>Browse Products</Link>
          <Link href="/categories" className="mobile-link" onClick={() => setOpen(false)}>Categories</Link>
          {session?.user.role === "VENDOR" && (
            <Link href="/dashboard/vendor" className="mobile-link" onClick={() => setOpen(false)}>My Shop</Link>
          )}
          <div className="mobile-divider" />
          {session ? (
            <>
              <Link href="/dashboard" className="mobile-link" onClick={() => setOpen(false)}>Dashboard</Link>
              <button className="mobile-sign-out" onClick={() => { signOut(); setOpen(false); }}>
                Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-btns">
              <Link href="/login" className="nav-btn nav-btn-ghost" onClick={() => setOpen(false)} style={{textAlign:"center"}}>Login</Link>
              <Link href="/register" className="nav-btn nav-btn-primary" onClick={() => setOpen(false)} style={{textAlign:"center"}}>Register</Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}