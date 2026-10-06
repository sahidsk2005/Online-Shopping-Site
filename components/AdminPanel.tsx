"use client";
import { useEffect, useRef, useState } from "react";
import { LogIn, Plus, Trash2, Pencil, LogOut, X, Save, Loader2, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  IMAGE_BUCKET,
  PLACEHOLDER_IMAGE,
  externalUrl,
  friendlyDbError,
  looksLikeLocalFilePath,
  normalizeImageUrl
} from "@/lib/utils";
import type { Product, ProductCondition } from "@/types";

const empty = { name: "", price: "", image_url: "", buy_url: "", condition: "Brand new" as ProductCondition, stock: "", specifications: "" };

/** Swaps a broken <img> for the built-in placeholder (only once per element). */
function fallbackImage(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset.fallback === "1") return;
  img.dataset.fallback = "1";
  img.src = PLACEHOLDER_IMAGE;
}

/** Shows the picture the shop owner just pasted / uploaded, or explains why it cannot load. */
function ImagePreview({ url }: { url: string }) {
  const [state, setState] = useState<"checking" | "ok" | "broken">("checking");
  useEffect(() => { setState("checking") }, [url]);
  if (!url) return null;
  return <div className="image-preview">
    <img src={url} alt="Product preview" onLoad={() => setState("ok")} onError={() => setState("broken")} />
    <div className="image-status">
      {state === "checking" && <span className="muted">Checking the image…</span>}
      {state === "ok" && <span className="ok"><CheckCircle2 size={14} /> Image loads correctly</span>}
      {state === "broken" && <span className="warn"><AlertTriangle size={14} /> This link does not show an image. Use <b>Upload from device</b>, or paste a direct link that ends in .jpg / .png / .webp (the file must be shared publicly).</span>}
    </div>
  </div>;
}

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>(empty); const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe()
  }, []);
  useEffect(() => { if (session) load() }, [session]);

  async function load() {
    const { data, error: dbError } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setLoadError(dbError ? friendlyDbError(dbError.message) : "");
    setProducts(data || [])
  }
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message); setBusy(false)
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(""); setMessage("");
    const image = normalizeImageUrl(form.image_url);
    if (!image) { setError("Please add a product image (upload a file or paste an image link)."); setBusy(false); return }
    if (looksLikeLocalFilePath(form.image_url)) {
      setError("That looks like a file on your phone/computer, which the website cannot read. Use \"Upload from device\" instead.");
      setBusy(false); return
    }
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      image_url: image,
      buy_url: externalUrl(form.buy_url),
      condition: form.condition,
      stock: Number(form.stock),
      specifications: form.specifications.trim()
    };
    const result = editing ? await supabase.from("products").update(payload).eq("id", editing) : await supabase.from("products").insert(payload);
    if (result.error) setError(friendlyDbError(result.error.message));
    else { setForm(empty); setEditing(null); await load(); setMessage(editing ? "Product updated." : "Product added.") }
    setBusy(false)
  }
  async function uploadImage(file: File) {
    setError(""); setMessage("");
    if (!file.type.startsWith("image/")) { setError("Please choose an image file (jpg, png, webp, gif)."); return }
    if (file.size > 5 * 1024 * 1024) { setError("That image is larger than 5 MB. Please choose a smaller one."); return }
    setUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-") || "product.jpg";
    const path = `${Date.now()}-${safeName}`;
    const { error: upError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
    if (upError) setError(friendlyDbError(upError.message));
    else {
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      setForm((f: any) => ({ ...f, image_url: data.publicUrl }));
      setMessage("Image uploaded to Supabase Storage.");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }
  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error: dbError } = await supabase.from("products").delete().eq("id", id);
    if (dbError) setError(friendlyDbError(dbError.message)); else load()
  }
  function edit(p: Product) {
    setEditing(p.id); setError(""); setMessage("");
    setForm({ name: p.name, price: String(p.price), image_url: p.image_url, buy_url: p.buy_url, condition: p.condition || "Brand new", stock: String(p.stock || 0), specifications: p.specifications || "" });
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!isSupabaseConfigured) return <main className="admin-shell"><div className="login glass"><div className="admin-logo">L</div><h1>Setup needed</h1><p>Supabase is not configured.</p><small className="warn"><AlertTriangle size={14} /> Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (locally) or to your Vercel environment variables, then restart the site.</small></div></main>;

  if (!session) return <main className="admin-shell"><form className="login glass" onSubmit={login}><div className="admin-logo">L</div><h1>Admin access</h1><p>Private product management</p><input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /><input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /><button className="primary" disabled={busy}>{busy ? <Loader2 className="spin" /> : <LogIn size={17} />} Sign in</button>{error && <small className="error">{error}</small>}</form></main>;

  return <main className="admin-shell"><header className="admin-head"><div><span className="muted">LUMA / ADMIN</span><h1>Products</h1></div><button className="ghost" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Sign out</button></header>
    <section className="admin-grid">
      <form className="form glass" onSubmit={save}>
        <div className="form-title"><h2>{editing ? "Edit product" : "Add product"}</h2>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); setError(""); setMessage("") }}><X /></button>}</div>
        <label>Product name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
        <label>Product image
          <div className="image-row">
            <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://... or upload →" required />
            <button type="button" className="upload" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="spin" size={16} /> : <Upload size={16} />} Upload
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }} />
        </label>
        <ImagePreview url={normalizeImageUrl(form.image_url)} />
        <label>Buy Now URL<input value={form.buy_url} onChange={e => setForm({ ...form, buy_url: e.target.value })} placeholder="https://... (link, upi:, whatsapp:)" required /></label>
        <label>Product condition
          <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as ProductCondition })}>
            <option>Sealed</option><option>Brand new</option><option>One time use</option>
          </select>
        </label>
        <label>Stock quantity<input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label>
        <label>Specifications<textarea value={form.specifications} onChange={e => setForm({ ...form, specifications: e.target.value })} placeholder="Material, size, color, or other details" /></label>
        <button className="primary" disabled={busy || uploading}>{busy ? <Loader2 className="spin" /> : editing ? <Save size={17} /> : <Plus size={17} />} {editing ? "Update product" : "Add product"}</button>
        {error && <small className="error"><AlertTriangle size={14} /> {error}</small>}
        {message && <small className="ok"><CheckCircle2 size={14} /> {message}</small>}
      </form>
      <section className="list">
        {loadError && <div className="notice glass"><AlertTriangle size={15} /> {loadError}</div>}
        {!loadError && products.length === 0 && <div className="empty glass">No products yet.</div>}
        {products.map(p => <article className="row glass" key={p.id}>
          <img src={normalizeImageUrl(p.image_url) || PLACEHOLDER_IMAGE} alt={p.name} onError={fallbackImage} />
          <div><strong>{p.name}</strong><span>₹{Number(p.price).toLocaleString("en-IN")}</span><small>{p.condition || "Brand new"} · {Number(p.stock || 0)} in stock</small></div>
          <button onClick={() => edit(p)} aria-label={`Edit ${p.name}`}><Pencil size={17} /></button>
          <button className="danger" onClick={() => remove(p.id)} aria-label={`Delete ${p.name}`}><Trash2 size={17} /></button>
        </article>)}
      </section>
    </section>
  </main>
}
