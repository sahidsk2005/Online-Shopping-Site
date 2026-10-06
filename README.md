# LUMA — Mini Glass Product Store

A minimalist mobile-first product storefront built with Next.js + Supabase.

## Features
- Public product catalogue
- Buy Now → opens the product's own Buy Now URL
- Ask on Instagram → opens Instagram DM with product name + price
- Separate `/admin` login
- Add / edit / delete products
- Product photos: upload a file from your phone/computer (stored in Supabase
  Storage) **or** paste an image link — the admin form shows a preview and warns
  you when a link cannot be displayed
- Products stored in Supabase
- Vercel-ready

## 1. Create Supabase project
1. Go to https://supabase.com and create a project.
2. Open SQL Editor.
3. Paste and run `supabase/schema.sql` (creates the `products` table, the
   permissions, and the public `product-images` storage bucket used by the
   upload button). Re-run it any time — it is safe to run more than once.
4. Go to Authentication → Users → Add user.
5. Create the one admin email/password you will use for `/admin`.

## 2. Configure locally
Copy `.env.example` to `.env.local` and fill:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_INSTAGRAM_USERNAME=...

The URL and anon key are in Supabase → Project Settings → API.

## 3. Run
```bash
npm install
npm run dev
```
Open http://localhost:3000
Admin: http://localhost:3000/admin

## 4. Put it on GitHub
Create a new GitHub repository, then:
```bash
git init
git add .
git commit -m "Initial LUMA store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do NOT commit `.env.local`.

## 5. Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub.
3. Add New Project → import this repository.
4. Framework: Next.js (auto-detected).
5. Add these Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - NEXT_PUBLIC_INSTAGRAM_USERNAME
6. Deploy.

You will receive a `*.vercel.app` live URL.

## 6. Add your first product
Open:
`https://YOUR-DOMAIN.vercel.app/admin`

Sign in with your Supabase admin account and add:
- Product name
- Price
- Product image (press **Upload** or paste an image URL)
- Buy Now URL (any link: website, UPI, WhatsApp…)

### Product images
In the admin form you have two options:

1. **Upload from device (recommended)** — press *Upload*, pick a photo from
   your phone/computer (max 5 MB). It is stored in the Supabase Storage bucket
   `product-images` and the public URL is filled in automatically. Requires
   section 2 of `supabase/schema.sql` to have been run once.
2. **Paste an image link** — the link must be a *direct* image file
   (`https://.../photo.jpg`, `.png`, `.webp`) on a public host. Google Drive and
   Dropbox share links are converted automatically (the file must be shared with
   "anyone with the link").

The form shows a live preview: a green "Image loads correctly" or an orange
warning when the link cannot be displayed. The storefront never shows a broken
image — if a link is dead it falls back to the built-in placeholder.

### Instagram
Set `NEXT_PUBLIC_INSTAGRAM_USERNAME` to your Instagram username without `@`.
The Ask button creates a message like:
"Hi! I have a query about PRODUCT NAME priced at ₹PRICE."

## Troubleshooting

**The image I pasted does not appear**
- The link is not a direct image file (share pages, Google Photos, WhatsApp
  images, `data:` blobs and files sitting on your hard disk cannot be used).
  Press **Upload** in the admin form instead — that always works.
- Google Drive/Dropbox files must be shared publicly ("Anyone with the link").
- Tip: open the image link in a new browser tab. If a whole web page with menus
  opens instead of just the picture, the link is wrong.

**"bucket not found" when uploading**
Run `supabase/schema.sql` again (section 2 creates the `product-images` bucket).
Or create it by hand: Supabase → Storage → New bucket → `product-images` →
enable *Public bucket* → create, then re-run the storage policies.

**Products do not load on the storefront**
Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
(locally in `.env.local`, on Vercel in Project → Settings → Environment
Variables, followed by a redeploy).

## Security note
The public site can read products. Only authenticated Supabase users can write. For this one-admin setup, simply create only your own admin user. Never put a Supabase `service_role` key in `.env` or frontend code.
