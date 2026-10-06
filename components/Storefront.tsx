"use client";
import { useEffect, useState } from "react";
import { Instagram, ArrowUpRight, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

const insta = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || "your_instagram_username";

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  async function load() {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }
  useEffect(() => { load() }, []);

  function ask(p: Product) {
    const text = encodeURIComponent(`Hi! I have a query about ${p.name} priced at ₹${p.price}.`);
    window.open(`https://ig.me/m/${insta}?text=${text}`, "_blank");
  }

  return <main className="shell">
    <nav className="nav glass">
      <div className="brand"><span className="logo">L</span><span>LUMA</span></div>
      <a className="nav-insta" href={`https://instagram.com/${insta}`} target="_blank"><Instagram size={17} /> Instagram</a>
    </nav>

    <section className="hero">
      <div className="eyebrow"><Sparkles size={15} /> CURATED FOR YOU</div>
      <h1>Simple things.<br /><i>Beautifully chosen.</i></h1>
      <p>Discover our latest pieces. Buy directly or message us on Instagram for any questions.</p>
    </section>

    <section className="products">
      {loading ? <div className="empty"><Loader2 className="spin" /> Loading products…</div> :
        products.length === 0 ? <div className="empty glass">No products yet.</div> :
          products.map(p => <article className="card glass" key={p.id} onClick={() => setSelectedProduct(p)}>
            <div className="image-wrap">
              <img src={p.image_url || "https://placehold.co/800x900/png?text=Product"} alt={p.name} />
            </div>
            <div className="card-body">
              <div><h2>{p.name}</h2><div className="price">₹{Number(p.price).toLocaleString("en-IN")}</div></div>
              <div className="condition">{p.condition || "Brand new"}</div>
              <div className="stock-line">Stock: {Number(p.stock || 0)}</div>
              <div className="actions" onClick={e => e.stopPropagation()}>
                <button className="buy" onClick={() => ask(p)}>Buy now <ArrowUpRight size={17} /></button>
                <button className="ask" onClick={() => ask(p)}><Instagram size={17} /> Ask on Instagram</button>
              </div>
            </div>
          </article>)}
    </section>

    {selectedProduct && <div className="detail-backdrop" onMouseDown={() => setSelectedProduct(null)}>
      <section className="detail-panel glass" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={e => e.stopPropagation()}>
        <button className="detail-close" aria-label="Close product details" onClick={() => setSelectedProduct(null)}><X size={20} /></button>
        <img src={selectedProduct.image_url || "https://placehold.co/800x900/png?text=Product"} alt={selectedProduct.name} />
        <div className="detail-content">
          <span className="detail-label">Product specifications</span>
          <h2 id="product-detail-title">{selectedProduct.name}</h2>
          <div className="detail-meta"><span>₹{Number(selectedProduct.price).toLocaleString("en-IN")}</span><span>{selectedProduct.condition || "Brand new"}</span><span>{Number(selectedProduct.stock || 0)} in stock</span></div>
          <p>{selectedProduct.specifications || "No specifications have been added for this product yet."}</p>
          <div className="detail-actions">
            <button className="buy" onClick={() => ask(selectedProduct)}>Buy now <ArrowUpRight size={17} /></button>
            <button className="ask" onClick={() => ask(selectedProduct)}><Instagram size={17} /> Ask on Instagram</button>
          </div>
        </div>
      </section>
    </div>}

    <footer><span>© {new Date().getFullYear()} LUMA</span><a href={`https://instagram.com/${insta}`} target="_blank"><Instagram size={15} /> @ {insta}</a></footer>
  </main>
}