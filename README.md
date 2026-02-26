# Recepti — Recipe Website (Serbian Market)

SEO-optimized recipe website built with Next.js, Supabase, and Vercel.

## Stack

- **Next.js 16** (App Router)
- **Supabase** (PostgreSQL, Auth)
- **Vercel** (Hosting — deploy last)
- **Tailwind CSS**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Create a Storage bucket: **Storage → New bucket** → name `recipe-images`, enable **Public bucket**. Add policy: allow authenticated users to insert, allow public read.
4. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Settings → API**
5. Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Add your first recipe

Go to `/admin/recepti/novo` (after Phase 7) or insert directly via Supabase Dashboard.

## Project Structure

- `src/app/` — Routes (homepage, recepti, kategorija, pretraga)
- `src/components/` — UI components
- `src/lib/` — Supabase client, queries, SEO helpers
- `supabase/schema.sql` — Database schema (run in Supabase SQL Editor)

## Deployment (Phase 14)

When ready to deploy:

1. Push to GitHub
2. Import project in Vercel
3. Add env vars in Vercel dashboard
4. Deploy

See `RECIPE-WEBSITE-BUILD-PLAN.md` for full build plan.
