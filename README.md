# Bee Yappers (working name)

App shell: Supabase auth + a protected dashboard that creates and lists `sites`.
This pass exists to prove auth and RLS work end to end against the schema.

## Setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create your env file from the example and fill in two values from the
   Supabase dashboard (Project Settings > Data API):

   ```powershell
   Copy-Item .env.local.example .env.local
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` = your project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = the `sb_publishable_...` key

   Only the publishable key is needed now. The `sb_secret_...` key is not used
   anywhere in this shell and should not be added yet.

3. Make sure email auth is on in Supabase (Authentication > Providers > Email).
   For fast local testing you can turn off "Confirm email" so signup logs you
   straight in; turn it back on before launch.

4. Run it:

   ```powershell
   npm run dev
   ```

   Open http://localhost:3000

## What to verify

- Sign up, then sign in. You land on `/dashboard`.
- Add a site. It appears in the list with a generated `wk_...` widget key and a
  `pending` status.
- Visiting `/dashboard` while signed out redirects to `/login`.
- In the Supabase table editor, confirm the new `sites` row has your `user_id`.

If all of that works, RLS and the owner-scoped policies are doing their job.

## Not built yet (next steps)

- Crawl pipeline (fetch pages, chunk, embed, store vectors)
- Widget config editor (brand colors, logo, greeting)
- The embeddable widget script and its server query route
