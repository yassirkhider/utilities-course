# Process Utilities & Auxiliary Support Systems Operation — Training Website

A production-ready training website for the 5-day / 40-hour instructor-led course **"Process Utilities & Auxiliary Support Systems Operation"**, built for ADNOC Technical Academy. Trainees get a fully navigable course site (schedule, topics, handouts, P&IDs, activities, quizzes, search); the instructor gets a protected admin dashboard to manage all of it without touching code.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- Lucide React icons
- Netlify Functions (serverless API, TypeScript)
- Netlify Blobs (persistent JSON content + uploaded files — no external database)
- `@dnd-kit` for drag-and-drop reordering in the admin dashboard
- `jose` (JWT sessions) + `bcryptjs` (password hashing) for admin auth
- `busboy` for multipart file upload parsing
- `dompurify` for sanitizing rich-text content before render

No Firebase, Supabase, or external database is required. Everything runs on Netlify.

## Project Structure

```
src/
  components/     Shared UI: cards, buttons, resource viewers, safety banners…
  pages/          Trainee-facing routes (Home, Day, Topic, Resources, Activities, Quiz, Search…)
  admin/          Admin dashboard: layout, editors, upload manager, backup
  layouts/        MainLayout (header/footer shell)
  hooks/          localStorage-backed trainee progress & quiz results
  services/       Typed fetch client for the API (src/services/api.ts)
  context/        React context: course data, auth, toasts, smartboard mode
  types/          Shared TypeScript types
  data/           Seed/default course content (16 topics, 5 days, activities, quizzes)

netlify/
  functions/      Serverless API endpoints (see "API Routes" below)
  lib/            Shared server-side helpers: auth, storage, upload validation

netlify.toml      Build config, SPA redirect, /api/* -> functions redirect
.env.example      Required environment variables (no real secrets committed)
```

## Local Development

```bash
npm install
cp .env.example .env
# Fill in ADMIN_PASSWORD_HASH and JWT_SECRET in .env (see "Admin Setup" below)
npm run dev          # Vite dev server only (frontend, no API)
```

To run the full stack locally (frontend + serverless functions + local Netlify Blobs emulation), use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This serves the site at `http://localhost:8888` with `/api/*` proxied to the local functions and a local Blobs emulator — no Netlify account required for local development.

> **Sandboxed/offline environments:** if your environment blocks outbound downloads, run `netlify dev --internal-disable-edge-functions` — this project uses no Edge Functions, so nothing is lost by disabling that subsystem locally.

### Type-checking & build

```bash
npm run typecheck   # tsc for the frontend + a separate pass for netlify/functions
npm run build        # tsc -b && vite build -> outputs to dist/
```

## Deployment to Netlify

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Netlify: **Add new site → Import an existing project**, and select the repository.
3. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **Environment variables** (Site configuration → Environment variables), set:
   - `ADMIN_PASSWORD_HASH` — see "Admin Setup" below
   - `JWT_SECRET` — a long random string
5. **Netlify Blobs** requires no manual setup or add-on — it's automatically available to any Netlify site and to Netlify Functions running on that site. Nothing to enable.
6. Deploy. On the very first request after deploy, the API automatically seeds the default 5-day course content (see "First Admin Setup" below) — subsequent deploys never overwrite existing content.

## Admin Setup

The admin password is never stored in the repository or in frontend code — only a bcrypt **hash** of it is stored as an environment variable, and it is verified server-side in a Netlify Function.

1. Choose an admin password and hash it:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD_HERE', 10))"
   ```
2. Set the resulting hash as `ADMIN_PASSWORD_HASH` in your Netlify site's environment variables (and in `.env` for local dev).
3. Set `JWT_SECRET` to a random 32+ character string (used to sign the admin session cookie).
4. Visit `/admin/login` on your deployed site and sign in with the plaintext password you chose in step 1.
5. To change the password later, generate a new hash and update the environment variable — no code changes required.

Admin sessions are stored in an `HttpOnly`, `SameSite=Strict` cookie (marked `Secure` in production) signed with `JWT_SECRET`. Every admin API route (`/api/admin/*`) independently verifies this cookie server-side — there is no client-side-only authorization anywhere in the app.

## How Uploaded Files Are Stored

Netlify Blobs is used as the persistence layer, in three logical stores:

- **`course-content`** — a single JSON document holding the course meta, all 5 days (including schedules), all 16 topics, activities and quizzes.
- **`course-resources`** — a single JSON document holding the metadata (title, type, day/topic assignment, file name, size, order…) for every handout, P&ID, video and other resource.
- **`course-uploads`** — the actual uploaded file binaries (PDF/PPTX/DOCX/XLSX/PNG/JPG/WEBP/MP4), each addressed by a random, unguessable blob key generated at upload time.

> **Design note:** the spec's example of per-entity blob keys (`days/day-1`, `topics/breathing-air`, …) is one valid layout; this project instead keeps content as two consolidated JSON documents for simpler, atomic read-modify-write semantics with Netlify Blobs' strong-consistency reads, while still keeping file binaries in their own store. Functionally this delivers the same add/edit/delete/reorder/upload capabilities described in the spec.

File uploads are validated server-side (in the Netlify Function, never trusting the client) for MIME type (PDF, PPTX, DOCX, XLSX, PNG, JPG, WEBP, MP4 only) and size (100 MB max), with sanitized file names and randomly generated storage keys so uploaded content can never overwrite or collide with another file or execute as a script.

## Header Logo — Using Your Real Logo

The header ships with a clean, generic academy mark by default (no proprietary graphics are embedded in this repository). To show your real logo instead:

1. Save your logo image as `logo.png` inside the `public/` folder (a roughly square PNG/SVG works best — it renders at ~44×44px with a little padding).
2. Rebuild and redeploy (`npm run build`, then push/redeploy on Netlify, or drag a new `dist/` if you deploy manually).

`src/components/Header.tsx` (the `AcademyLogo` component) automatically requests `/logo.png` first and only falls back to the generic mark if that file 404s — no code changes needed. To use an SVG instead, save it as `public/logo.svg` and change the single `src="/logo.png"` line in that component to `/logo.svg`.

The header uses a dark-navy background, white text and a teal accent line — a professional, brand-neutral palette that pairs well with an ADNOC-style logo without this repository reproducing any proprietary artwork itself.

## Troubleshooting: "Internal server error" on the deployed site

If the home page (or any page) shows **Internal server error** with a **Try again** button, the frontend built and deployed correctly, but a Netlify Function (most likely `/api/course`) threw an exception. The error box itself never shows the real reason by default (that's intentional, so the public API never leaks internals) — here's the fastest way to see the actual cause.

### Fastest option: turn on `DEBUG_ERRORS` (no dashboard log-digging required)

1. In the Netlify dashboard: **Site configuration → Environment variables → Add a variable** → key `DEBUG_ERRORS`, value `true`. Scope it to all contexts (or at least Production).
2. Trigger a new deploy (**Deploys → Trigger deploy → Clear cache and deploy site** is safest) so the running functions pick up the new variable.
3. Reload the site. The **Internal server error** box will now show the *actual* error message straight from the server (e.g. `Internal server error — MissingBlobsEnvironmentError: ...`), right there in the browser — no need to open the Netlify dashboard's function logs at all.
4. Once you've read the real cause (or shared it for a targeted fix), **delete the `DEBUG_ERRORS` variable again** (or set it to anything other than `true`) and redeploy — it's meant to be a temporary diagnostic switch, not left on permanently, since it does reveal internal error text to anyone hitting the public API while it's on.

### Or: read the function log directly

1. In the Netlify dashboard, open your site → **Logs → Functions**, click the failing function (e.g. `course`), and look at the most recent invocation — the actual error and stack trace are logged there via `console.error` regardless of the `DEBUG_ERRORS` setting.

### Common causes

- **Netlify Blobs not provisioned/reachable for this site** — this is the most likely cause if the Node version pin below didn't fix it. `@netlify/blobs`'s zero-config `getStore()` call relies on Netlify automatically injecting Blobs credentials into the function's environment at deploy time; this should be automatic on every Netlify site with no add-on needed, but if the error text (via `DEBUG_ERRORS` or the function log) says `MissingBlobsEnvironmentError` (or mentions `Blobs` generally), that confirms it. First try **Trigger deploy → Clear cache and deploy site** once — a stale build cache is the most common reason the automatic wiring doesn't reach a function. If that doesn't clear it, use the manual-credentials fallback below instead of waiting on Netlify support.
- **Missing/short `JWT_SECRET`** — only affects `/api/auth/*` and `/api/admin/*`, not `/api/course`, but set it anyway (Site configuration → Environment variables) since the admin dashboard needs it.
- **Node version mismatch** — this project pins `NODE_VERSION = "20"` in `netlify.toml` for the *build* step (added because `@netlify/blobs` and `jose` need a modern Node runtime); note this is separate from the Node runtime the deployed *functions* actually execute on, which Netlify controls independently — if the error persists after this pin, it's unlikely to be a Node-version issue and is more likely the Blobs cause above.
- **First deploy after changing build settings** — trigger a new deploy with "Clear cache and deploy site" so Netlify re-bundles the functions from scratch.

### Fallback: manual Netlify Blobs credentials (fixes `MissingBlobsEnvironmentError`)

If "Clear cache and deploy site" doesn't resolve a `MissingBlobsEnvironmentError`, skip Netlify's automatic Blobs wiring and supply credentials explicitly — this always works regardless of why the automatic path isn't reaching your functions.

1. **Get your Site ID**: in the Netlify dashboard, open this site → **Site configuration → General → Site details** → copy the **Site ID** (a UUID like `1a2b3c4d-...`).
2. **Create a Personal Access Token**: click your account avatar (top right) → **User settings → OAuth applications** (or **Applications**) → **Personal access tokens → New access token**. Give it any name (e.g. "putils-course-blobs") and copy the token immediately — Netlify only shows it once.
3. In this site's **Site configuration → Environment variables**, add:
   - `BLOBS_SITE_ID` = the Site ID from step 1
   - `BLOBS_TOKEN` = the token from step 2 (tick **Contains secret values** for this one)
4. Trigger a new deploy. The app will now use these explicit credentials instead of relying on automatic injection.

Once you have the exact error text (from `DEBUG_ERRORS` or the function log), that pinpoints the fix precisely — share it for a targeted diagnosis rather than continuing to guess.

## Backing Up Course Data

From **Admin → Backup**:

- **Export Course Data** downloads `course-backup.json` — every course/day/topic/activity/quiz/resource-metadata record (uploaded file binaries themselves live in Netlify Blobs and aren't embedded in this JSON; the export is a structural backup, not a full binary archive).
- **Import Course Data** restores from a previously exported file. You must explicitly confirm before anything is overwritten.

**Admin → Settings** also has a "Reset to Default Sample Data" action for restoring the original seeded course content.

## API Routes

All routes are exposed under `/api/*` (rewritten to Netlify Functions by `netlify.toml`).

**Public (read-only):**
| Method | Route | Description |
|---|---|---|
| GET | `/api/course` | Full course data (meta, days, topics, activities, quizzes, resources) |
| GET | `/api/days`, `/api/days/:id` | Day list / single day |
| GET | `/api/topics`, `/api/topics/:slugOrId` | Topic list / single topic |
| GET | `/api/activities`, `/api/activities/:id` | Activity list / single activity |
| GET | `/api/quizzes`, `/api/quizzes/:id` | Quiz list / single quiz |
| GET | `/api/resources?dayId=&topicId=&resourceType=` | Filtered resource metadata |
| GET | `/api/file/:resourceId` | Streams an uploaded file (view or `?download=1`) |

**Auth:**
| Method | Route |
|---|---|
| POST | `/api/auth/login` `{ password }` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/verify` |

**Admin (require a valid admin session cookie — all return 401 otherwise):**
| Method | Route |
|---|---|
| POST | `/api/admin/course` — update course meta |
| POST | `/api/admin/day` — update a day (details + schedule) |
| POST | `/api/admin/day/:dayId/topics-order` — reorder topics within a day |
| POST | `/api/admin/topic` — create/update a topic |
| DELETE | `/api/admin/topic/:id` |
| POST | `/api/admin/activity` — create/update an activity |
| DELETE | `/api/admin/activity/:id` |
| POST | `/api/admin/activities/reorder` `{ ids }` |
| POST | `/api/admin/quiz` — create/update a quiz (with questions) |
| DELETE | `/api/admin/quiz/:id` |
| POST | `/api/admin/resource` — create resource metadata (e.g. external URL) |
| PUT | `/api/admin/resource/:id` — edit/rename/reassign |
| DELETE | `/api/admin/resource/:id` — deletes metadata + underlying blob |
| POST | `/api/admin/resources/reorder` `{ ids }` |
| POST | `/api/admin/upload` — multipart file upload (`file`, `title`, `resourceType`, `dayId`, `topicId`, `description`) |
| POST | `/api/admin/upload/:resourceId/replace` — replace an existing file |
| GET / POST | `/api/admin/backup` — export / import (`{ data, confirm: true }`) |
| POST | `/api/admin/reset-seed` — reset to default sample data |

> Note on routing: some spec examples show nested admin paths like `POST /api/admin/day`; because Netlify Functions route by the first path segment after `/.netlify/functions/`, all `/api/admin/*` requests are handled by one function (`netlify/functions/admin.ts`) that dispatches internally — this is functionally equivalent to separate endpoints but keeps deployment simple (one Lambda per logical area, matching Netlify's routing model).

## Known Limitations & Suggested Hardening

- The rich-text editor in the admin dashboard uses `contentEditable` + `document.execCommand` for simplicity (headings, paragraphs, bold, bulleted/numbered lists, tables, links) — this is broadly supported but `execCommand` is a deprecated browser API. For a future iteration, consider swapping in a maintained library (e.g. Tiptap) behind the same `RichTextEditor` component interface. All rich-text output is sanitized with DOMPurify before being rendered anywhere.
- The login rate limiter in `netlify/lib/auth.ts` is an in-memory, best-effort guard against brute-forcing within a single warm function instance. For stronger protection in production, pair it with Netlify's rate-limiting / a WAF rule at the edge.
- Trainee progress and quiz results are stored in the browser's `localStorage` only (per the spec — no trainee login). Clearing browser data resets them.

## Test Checklist

- [x] `npm run typecheck` passes (frontend + Netlify Functions)
- [x] `npm run build` produces a production build with no errors
- [x] Every route renders (Home, Course Plan, all 5 Day pages, all 16 Topic pages, Handouts, P&IDs, Activities, Quiz list + player, Search, Admin login + all dashboard sections)
- [x] Mobile hamburger navigation opens/closes and links work
- [x] Admin authentication: wrong password rejected, correct password issues a session cookie, `/api/admin/*` rejects unauthenticated requests
- [x] Resource upload: valid file types accepted and stored in Netlify Blobs; disallowed types (e.g. `.exe`) rejected server-side
- [x] Resource deletion removes both the metadata and the underlying blob (verified: file is 404 after delete)
- [x] Data persistence: content written via the admin API is immediately visible on the public read API (Netlify Blobs strong consistency)
- [x] Backup export/import round-trip restores identical course data
- [x] Quiz flow: 4-option MCQs, answer hidden until submit, explanation shown after, score/percentage computed and stored locally
- [x] Local trainee progress bar updates as days are visited and persists across reloads
- [ ] PDF/P&ID/fullscreen viewers and full click-through admin UI — implemented and code-reviewed; verify visually in a real browser against your own uploaded PDFs/images before go-live, since this repository's automated verification exercised the API layer directly (see note below) rather than a full browser session.

**How this was verified in a sandboxed build environment:** the Netlify Functions (auth, CRUD, file upload/delete, backup import/export) were exercised end-to-end against a real local Netlify Blobs server with 30 automated checks (login/logout, admin authorization, topic create/delete, resource upload with MIME-type rejection, file retrieval, deletion, and backup round-trip) — all passed. The Netlify CLI's own `netlify dev` proxy could not be used for this in the sandbox due to an environment-injection quirk unrelated to this codebase; it is expected to work normally on a real machine or in Netlify's own build/deploy environment. Run through the checklist's last item yourself after your first deploy.

## First Admin Setup

On first deploy, the first request to any read endpoint automatically seeds the default course structure (5 days, 16 topics with full technical content, 15 activities, 7 quizzes, and placeholder resource entries for every topic). Later deploys never re-seed or erase existing data — only an explicit **Reset to Default Sample Data** action in Admin → Settings does that.
