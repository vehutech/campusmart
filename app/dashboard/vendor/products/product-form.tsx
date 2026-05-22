"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronLeft, Loader } from "lucide-react";
import { ImageUpload } from "@/components/shared/image-upload";

interface Category { id: string; name: string; slug: string }

const CONDITIONS = [
  { value: "NEW",         label: "New",         desc: "Brand new, never used" },
  { value: "USED",        label: "Used",         desc: "Previously owned, good condition" },
  { value: "REFURBISHED", label: "Refurbished",  desc: "Restored to working condition" },
];

export function ProductForm({ mode }: { mode: "create" | "edit" }) {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const { data: session } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(mode === "edit");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  const [form, setForm] = useState({
    title: "", description: "", price: "", categoryId: "",
    condition: "NEW", stock: "1", location: "", images: [] as string[],
  });

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
    if (mode === "edit" && params?.id) {
      fetch(`/api/products/${params.id}`)
        .then(r => r.json())
        .then(p => {
          setForm({
            title: p.title, description: p.description, price: String(p.price),
            categoryId: p.categoryId, condition: p.condition,
            stock: String(p.stock), location: p.location || "", images: p.images || [],
          });
          setLoading(false);
        });
    }
  }, [mode, params?.id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      setError("Please fill in all required fields.");
      return;
    }
    setSaving(true);

    const url    = mode === "create" ? "/api/vendor/products" : `/api/products/${params?.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock) }),
    });

    setSaving(false);
    if (res.ok) router.push("/dashboard/vendor/products");
    else { const j = await res.json(); setError(j.error || "Failed to save product"); }
  };

  if (loading) return (
    <div style={{minHeight:"calc(100vh-64px)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
      <Loader size={24} style={{color:"var(--text-muted)", animation:"spin 1s linear infinite"}} />
    </div>
  );

  return (
    <>
      <style>{`
        .pf-page    { min-height: calc(100vh - 64px); background: var(--bg); padding: 32px 24px; }
        .pf-inner   { max-width: 760px; margin: 0 auto; }
        .pf-back    { display: inline-flex; align-items: center; gap: 6px; color: var(--text-muted);
                      font-size: 13px; text-decoration: none; margin-bottom: 24px; transition: color 0.15s; }
        .pf-back:hover { color: var(--text); }
        .pf-title   { font-size: 1.4rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 24px; }

        .pf-form    { display: flex; flex-direction: column; gap: 20px; }
        .pf-card    { background: var(--bg-card); border: 1px solid var(--border-muted); border-radius: 14px; padding: 24px; }
        .pf-section-title { font-size: 12px; font-weight: 600; text-transform: uppercase;
                            letter-spacing: 0.07em; color: var(--text-subtle); margin-bottom: 16px; }

        .field      { display: flex; flex-direction: column; gap: 6px; }
        .field label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
        .field label span { color: var(--red); margin-left: 2px; }
        .field input, .field textarea, .field select {
          background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 10px;
          padding: 11px 14px; font-size: 14px; color: var(--text); outline: none; font-family: inherit;
          transition: border-color 0.15s; width: 100%; }
        .field input::placeholder, .field textarea::placeholder { color: var(--text-subtle); }
        .field input:focus, .field textarea:focus, .field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,212,255,0.08); }
        .field textarea { resize: vertical; min-height: 120px; line-height: 1.6; }
        .field-hint { font-size: 11px; color: var(--text-subtle); }

        .two-col    { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }

        .cond-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 500px) { .cond-grid { grid-template-columns: 1fr; } }
        .cond-option { border: 1.5px solid var(--border); border-radius: 10px; padding: 12px;
                       cursor: pointer; transition: all 0.15s; text-align: left; background: var(--bg-elevated); }
        .cond-option.selected { border-color: var(--accent); background: rgba(0,212,255,0.06); }
        .cond-option strong { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
        .cond-option span   { font-size: 11px; color: var(--text-subtle); margin-top: 3px; display: block; }


        .alert-error { padding: 12px 14px; border-radius: 10px; font-size: 13px;
                       background: rgba(255,77,109,0.08); border: 1px solid rgba(255,77,109,0.2); color: var(--red); }

        .pf-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .btn-cancel { padding: 12px 24px; border-radius: 10px; border: 1px solid var(--border);
                      background: var(--bg-elevated); color: var(--text-muted); font-size: 14px;
                      font-weight: 600; text-decoration: none; transition: all 0.15s; }
        .btn-cancel:hover { color: var(--text); }
        .btn-save   { padding: 12px 28px; border-radius: 10px; border: none; cursor: pointer;
                      background: var(--accent); color: #0a0f1e; font-size: 14px; font-weight: 700;
                      display: flex; align-items: center; gap: 8px;
                      box-shadow: 0 0 16px rgba(0,212,255,0.25); transition: opacity 0.15s; font-family: inherit; }
        .btn-save:hover { opacity: 0.88; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
        .spinner    { width: 15px; height: 15px; border: 2px solid currentColor;
                      border-top-color: transparent; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="pf-page">
        <div className="pf-inner">
          <Link href="/dashboard/vendor/products" className="pf-back">
            <ChevronLeft size={16} /> Back to products
          </Link>
          <h1 className="pf-title">{mode === "create" ? "List New Product" : "Edit Product"}</h1>

          <form className="pf-form" onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}

            {/* Basic info */}
            <div className="pf-card">
              <div className="pf-section-title">Product Info</div>
              <div style={{display:"flex", flexDirection:"column", gap:16}}>
                <div className="field">
                  <label>Title <span>*</span></label>
                  <input placeholder="e.g. Engineering Mathematics Textbook"
                    value={form.title} onChange={e => set("title", e.target.value)} />
                </div>
                <div className="field">
                  <label>Description <span>*</span></label>
                  <textarea placeholder="Describe your product — condition, features, reason for selling..."
                    value={form.description} onChange={e => set("description", e.target.value)} />
                </div>
                <div className="two-col">
                  <div className="field">
                    <label>Price (₦) <span>*</span></label>
                    <input type="number" min="1" placeholder="e.g. 5000"
                      value={form.price} onChange={e => set("price", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Quantity in Stock <span>*</span></label>
                    <input type="number" min="1" placeholder="1"
                      value={form.stock} onChange={e => set("stock", e.target.value)} />
                  </div>
                </div>
                <div className="two-col">
                  <div className="field">
                    <label>Category <span>*</span></label>
                    <select value={form.categoryId} onChange={e => set("categoryId", e.target.value)}>
                      <option value="">Select a category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Pickup Location</label>
                    <input placeholder="e.g. Block D Hostel, Faculty of Science"
                      value={form.location} onChange={e => set("location", e.target.value)} />
                    <span className="field-hint">Where buyers can collect the item</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="pf-card">
              <div className="pf-section-title">Condition</div>
              <div className="cond-grid">
                {CONDITIONS.map(c => (
                  <button key={c.value} type="button"
                    className={`cond-option ${form.condition === c.value ? "selected" : ""}`}
                    onClick={() => set("condition", c.value)}>
                    <strong>{c.label}</strong>
                    <span>{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className="pf-card">
              <div className="pf-section-title">Product Images</div>
              <ImageUpload
                images={form.images}
                onChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                maxImages={4}
              />
            </div>

            <div className="pf-actions">
              <Link href="/dashboard/vendor/products" className="btn-cancel">Cancel</Link>
              <button type="submit" className="btn-save" disabled={saving}>
                {saving && <span className="spinner" />}
                {mode === "create" ? "List Product" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}