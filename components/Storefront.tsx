"use client";
import { useEffect, useState } from "react";
import { Instagram, ArrowUpRight, Sparkles, Loader2, X, AlertTriangle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PLACEHOLDER_IMAGE, externalUrl, friendlyDbError, normalizeImageUrl } from "@/lib/utils";
import type { Product } from "@/types";

const insta = process.env.NEXT_PUBLIC_INSTAGRAM_USERNAME || "your_instagram_username";

/** Swaps a broken <img> for the built-in placeholder (only once per element). */
function fallbackImage(event: React.SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;
  if (img.dataset.fallback === "1") return;
  img.dataset.fallback = "1";
  img.src = PLACEHOLDER_IMAGE;
}

export default function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  async function load() {
    const { data, error: dbError } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (dbError) setError(friendlyDbError(dbError.message));
    setProducts(data || []);
    setLoading(false);
  }
  useEffect(() => { if (isSupabaseConfigured) load(); else setLoading(false) }, []);

  function ask(p: Product) {
    const text = encodeURIComponent(`Hi! I have a query about ${p.name} priced at ₹${p.price}.`);
    window.open(`https://ig.me/m/${insta}?text=${text}`, "_blank");
  }

  /** "Buy now" opens the link the owner saved for that product.
   *  If the product has no Buy Now URL, it falls back to Instagram. */
  function buy(p: Product) {
    const url = externalUrl(p.buy_url);
    if (!url) { ask(p); return }
    window.open(url, "_blank", "noopener,noreferrer");
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
        !isSupabaseConfigured ? <div className="notice glass grid-full"><AlertTriangle size={16} /> Supabase is not configured yet: add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (or to your Vercel environment variables) and restart the site.</div> :
          error ? <div className="notice glass grid-full"><AlertTriangle size={16} /> {error}</div> :
            products.length === 0 ? <div className="empty glass">No products yet.</div> :
              products.map(p => <article className="card glass" key={p.id} onClick={() => setSelectedProduct(p)}>
                <div className="image-wrap">
                  <img src={normalizeImageUrl(p.image_url) || PLACEHOLDER_IMAGE} alt={p.name} loading="lazy" onError={fallbackImage} />
                </div>
                <div className="card-body">
                  <div><h2>{p.name}</h2><div className="price">₹{Number(p.price).toLocaleString("en-IN")}</div></div>
                  <div className="condition">{p.condition || "Brand new"}</div>
                  <div className="stock-line">Stock: {Number(p.stock || 0)}</div>
                  <div className="actions" onClick={e => e.stopPropagation()}>
                    <button className="buy" onClick={() => buy(p)}>Buy now <ArrowUpRight size={17} /></button>
                    <button className="ask" onClick={() => ask(p)}><Instagram size={17} /> Ask on Instagram</button>
                  </div>
                </div>
              </article>)}
    </section>

    {selectedProduct && <div className="detail-backdrop" onMouseDown={() => setSelectedProduct(null)}>
      <section className="detail-panel glass" role="dialog" aria-modal="true" aria-labelledby="product-detail-title" onMouseDown={e => e.stopPropagation()}>
        <button className="detail-close" aria-label="Close product details" onClick={() => setSelectedProduct(null)}><X size={20} /></button>
        <img src={normalizeImageUrl(selectedProduct.image_url) || PLACEHOLDER_IMAGE} alt={selectedProduct.name} onError={fallbackImage} />
        <div className="detail-content">
          <span className="detail-label">Product specifications</span>
          <h2 id="product-detail-title">{selectedProduct.name}</h2>
          <div className="detail-meta"><span>₹{Number(selectedProduct.price).toLocaleString("en-IN")}</span><span>{selectedProduct.condition || "Brand new"}</span><span>{Number(selectedProduct.stock || 0)} in stock</span></div>
          <p>{selectedProduct.specifications || "No specifications have been added for this product yet."}</p>
          <div className="detail-actions">
            <button className="buy" onClick={() => buy(selectedProduct)}>Buy now <ArrowUpRight size={17} /></button>
            <button className="ask" onClick={() => ask(selectedProduct)}><Instagram size={17} /> Ask on Instagram</button>
          </div>
        </div>
      </section>
    </div>}

    <footer><span>© {new Date().getFullYear()} LUMA</span><a href={`https://instagram.com/${insta}`} target="_blank"><Instagram size={15} /> @ {insta}</a></footer>
  </main>
}
