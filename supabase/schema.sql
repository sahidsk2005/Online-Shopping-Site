-- 1. Run this entire SQL in Supabase > SQL Editor.
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

alter table public.products
  add column if not exists condition text not null default 'Brand new';

alter table public.products
  add column if not exists stock integer not null default 0;

alter table public.products
  add column if not exists specifications text not null default '';

alter table public.products enable row level security;

-- Public users can only read products.
create policy "public can view products"
on public.products for select
to anon, authenticated
using (true);

-- Only authenticated admin users can add/edit/delete.
create policy "admins can insert products"
on public.products for insert
to authenticated
with check (true);

create policy "admins can update products"
on public.products for update
to authenticated
using (true)
with check (true);

create policy "admins can delete products"
on public.products for delete
to authenticated
using (true);

-- IMPORTANT:
-- In a real store, create ONE admin account in Supabase Authentication.
-- Do not expose the service_role key in this website.
-- For a single-admin mini site, the authenticated account is the only admin account you create.