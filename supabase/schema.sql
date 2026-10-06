-- ============================================================================
-- LUMA store — Supabase setup
-- Run this whole file in Supabase → SQL Editor → New query → Run.
-- It is safe to run more than once (it re-creates the policies/bucket).
-- ============================================================================

-- 1. Products table -----------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  image_url text not null,
  buy_url text not null,
  condition text not null default 'Brand new',
  stock integer not null default 0,
  specifications text not null default '',
  created_at timestamptz not null default now()
);

-- Ensure all columns exist (for tables created by an older version).
alter table public.products
  add column if not exists condition text not null default 'Brand new';

alter table public.products
  add column if not exists stock integer not null default 0;

alter table public.products
  add column if not exists specifications text not null default '';

alter table public.products enable row level security;

-- Public users can only read products.
drop policy if exists "public can view products" on public.products;
create policy "public can view products"
on public.products for select
to anon, authenticated
using (true);

-- Only authenticated admin users can add/edit/delete.
drop policy if exists "admins can insert products" on public.products;
create policy "admins can insert products"
on public.products for insert
to authenticated
with check (true);

drop policy if exists "admins can update products" on public.products;
create policy "admins can update products"
on public.products for update
to authenticated
using (true)
with check (true);

drop policy if exists "admins can delete products" on public.products;
create policy "admins can delete products"
on public.products for delete
to authenticated
using (true);

-- 2. Image storage -----------------------------------------------------------
-- Public bucket that keeps the pictures uploaded from the /admin form
-- ("Upload" button). Files are served from:
--   https://<project>.supabase.co/storage/v1/object/public/product-images/<file>
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "admins can upload product images" on storage.objects;
create policy "admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

drop policy if exists "admins can update product images" on storage.objects;
create policy "admins can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');

drop policy if exists "admins can delete product images" on storage.objects;
create policy "admins can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');

-- If the statements above were rejected because you are not the storage owner,
-- create the bucket by hand instead: Supabase → Storage → New bucket →
-- name "product-images" → enable "Public bucket" → create, then re-run the
-- four storage policies above.

-- 3. Admin account -----------------------------------------------------------
-- Supabase → Authentication → Users → Add user.
-- Create the ONE admin email/password you use to sign in at /admin.

-- IMPORTANT
-- * The public site can only read products; only signed-in users can write.
-- * Never put a service_role key in this website or in .env files.
--
-- Troubleshooting
-- * "column 'condition' not found" → your table is from the old version:
--   re-running this file adds the missing columns. Then reload the page.
--   Still failing? Supabase → Settings → API → "Reload schema cache".
-- * "bucket not found" / uploads fail → section 2 above was not run yet.
