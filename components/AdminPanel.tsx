"use client";
import { useEffect, useState } from "react";
import { LogIn, Plus, Trash2, Pencil, LogOut, X, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product, ProductCondition } from "@/types";

const empty = { name: "", price: "", image_url: "", buy_url: "", condition: "Brand new" as ProductCondition, stock: "", specifications: "" };

export default function AdminPanel() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>(empty); const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe()
  }, []);
  useEffect(() => { if (session) load() }, [session]);

  async function load() { const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }); setProducts(data || []) }
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message); setBusy(false)
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    const payload = { name: form.name.trim(), price: Number(form.price), image_url: form.image_url.trim(), buy_url: form.buy_url.trim(), condition: form.condition, stock: Number(form.stock), specifications: form.specifications.trim() };
    const result = editing ? await supabase.from("products").update(payload).eq("id", editing) : await supabase.from("products").insert(payload);
    if (result.error) setMessage(result.error.message); else { setForm(empty); setEditing(null); await load(); setMessage("Saved successfully."); }
    setBusy(false)
  }
  async function remove(id: string) { if (!confirm("Delete this product?")) return; const { error } = await supabase.from("products").delete().eq("id", id); if (error) setMessage(error.message); else load() }
  function edit(p: Product) { setEditing(p.id); setForm({ name: p.name, price: String(p.price), image_url: p.image_url, buy_url: p.buy_url, condition: p.condition || "Brand new", stock: String(p.stock || 0), specifications: p.specifications || "" }); window.scrollTo({ top: 0, behavior: "smooth" }) }
  if (!session) return <main className="admin-shell"><form className="login glass" onSubmit={login}><div className="admin-logo">L</div><h1>Admin access</h1><p>Private product management</p><input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required /><input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /><button className="primary" disabled={busy}>{busy ? <Loader2 className="spin" /> : <LogIn size={17} />} Sign in</button>{message && <small className="error">{message}</small>}</form></main>;
  return <main className="admin-shell"><header className="admin-head"><div><span className="muted">LUMA / ADMIN</span><h1>Products</h1></div><button className="ghost" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Sign out</button></header>
    <section className="admin-grid">
      <form className="form glass" onSubmit={save}><div className="form-title"><h2>{editing ? "Edit product" : "Add product"}</h2>{editing && <button type="button" onClick={() => { setEditing(null); setForm(empty) }}><X /></button>}</div>
        <label>Product name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Price (₹)<input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label>
        <label>Image URL<input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." required /></label>
        <label>Buy Now URL<input value={form.buy_url} onChange={e => setForm({ ...form, buy_url: e.target.value })} placeholder="https://..." required /></label>
        <label>Product condition
          <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as ProductCondition })}>
            <option>Sealed</option><option>Brand new</option><option>One time use</option>
          </select>
        </label>
        <label>Stock quantity<input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label>
        <label>Specifications<textarea value={form.specifications} onChange={e => setForm({ ...form, specifications: e.target.value })} placeholder="Material, size, color, or other details" /></label>
        <button className="primary" disabled={busy}>{busy ? <Loader2 className="spin" /> : editing ? <Save size={17} /> : <Plus size={17} />} {editing ? "Update product" : "Add product"}</button>
        {message && <small>{message}</small>}
      </form>
      <section className="list">{products.map(p => <article className="row glass" key={p.id}><img src={p.image_url} /><div><strong>{p.name}</strong><span>₹{Number(p.price).toLocaleString("en-IN")}</span><small>{p.condition || "Brand new"} · {Number(p.stock || 0)} in stock</small></div><button onClick={() => edit(p)}><Pencil size={17} /></button><button className="danger" onClick={() => remove(p.id)}><Trash2 size={17} /></button></article>)}</section>
    </section>
  </main>
}