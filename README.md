# LUMA — Mini Glass Product Store

A minimalist mobile-first product storefront built with Next.js + Supabase.

## Features
- Public product catalogue
- Buy Now → your custom URL
- Ask on Instagram → opens Instagram DM with product name + price
- Separate `/admin` login
- Add / edit / delete products
- Products stored in Supabase
- Vercel-ready

## 1. Create Supabase project
1. Go to https://supabase.com and create a project.
2. Open SQL Editor.
3. Paste and run `supabase/schema.sql`.
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
- Image URL
- Buy Now URL

### Image hosting
For this mini version, use an image URL (for example, a public image hosted by your preferred image/CDN service). The database stores the URL, not the image file.

### Instagram
Set `NEXT_PUBLIC_INSTAGRAM_USERNAME` to your Instagram username without `@`.
The Ask button creates a message like:
"Hi! I have a query about PRODUCT NAME priced at ₹PRICE."

## Security note
The public site can read products. Only authenticated Supabase users can write. For this one-admin setup, simply create only your own admin user. Never put a Supabase `service_role` key in `.env` or frontend code.
