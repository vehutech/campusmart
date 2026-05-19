"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border-muted)] bg-[rgba(10,15,30,0.9)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)]">
              <span className="text-[var(--bg)] font-black text-sm">C</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Campus<span className="text-[var(--accent)]">Mart</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/products" className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-sm hover:bg-[var(--bg-elevated)]">
              Browse
            </Link>
            <Link href="/categories" className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-sm hover:bg-[var(--bg-elevated)]">
              Categories
            </Link>
            {session?.user.role === "VENDOR" && (
              <Link href="/dashboard/vendor" className="px-3 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors rounded-sm hover:bg-[var(--bg-elevated)]">
                My Shop
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/products?search=" className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)] rounded-sm transition-all">
              <Search className="w-4 h-4" />
            </Link>

            {session ? (
              <>
                {session.user.role === "BUYER" && (
                  <Link href="/cart" className="p-2 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] rounded-sm transition-all relative">
                    <ShoppingCart className="w-4 h-4" />
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
                  <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-[var(--bg-elevated)] transition-all">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent-glow)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center">
                      <span className="text-[var(--accent)] text-xs font-bold">
                        {session.user.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">{session.user.name?.split(" ")[0]}</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="p-2 text-[var(--text-subtle)] hover:text-[var(--red)] hover:bg-[rgba(255,77,109,0.1)] rounded-sm transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-[var(--text-muted)]" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[var(--border-muted)] bg-[var(--bg-card)] px-4 py-4 flex flex-col gap-3">
          <Link href="/products" className="text-sm text-[var(--text-muted)] py-2">Browse Products</Link>
          <Link href="/categories" className="text-sm text-[var(--text-muted)] py-2">Categories</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm text-[var(--accent)] py-2">Dashboard</Link>
              <button onClick={() => signOut()} className="text-sm text-[var(--red)] text-left py-2">Sign Out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1"><Button variant="secondary" size="sm" className="w-full">Login</Button></Link>
              <Link href="/register" className="flex-1"><Button size="sm" className="w-full">Register</Button></Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
