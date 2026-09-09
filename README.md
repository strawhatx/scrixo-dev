# Scrixo

Browser PDF signer. Open a PDF, fill existing form fields, place a signature, and download. No account required for the guest path. Files stay in the browser for the session.

Live product: [scrixo.com](https://scrixo.com)

## What it does

- Sign by drawing, typing, or uploading
- Fill existing AcroForm fields on whatever PDF is uploaded (text, date, signature, checkbox, radio)
- Keep those fields fillable in Preview, Chrome, and other PDF readers after download
- Place extra text, date, signature, checkbox, and radio fields when the file has none
- Guest mode: upload → edit → download. Nothing is saved to a backend this iteration

Phase 5 tools (draw, image, merge, split, rotate, reorder) still exist in the codebase but are hidden from the v1 nav.

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- PDF.js for on-page rendering
- pdf-lib for form fill and export

## Local setup

```sh
npm i
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Upload a PDF from the landing page to hit `/edit`.

Useful scripts:

```sh
npm run typecheck
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local`.

**Waitlist** (Google Sheet webhook, same pattern as other Scrixo properties):

- `GOOGLE_SHEETS_WEBHOOK_URL`
- `WAITLIST_PROJECT=Scrixo`
- `WAITLIST_SECRET`

Deploy the Apps Script as a web app: Execute as Me, Who has access = Anyone. After changing access, ship a new deployment version.

**Supabase** vars are still listed in `.env.example` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Auth, cloud save, and saved signatures are **off this iteration** (`isSupabaseConfigured` is hard-false). Guest signing does not need them.

## Form filling (any PDF)

Import does not assume field names. On open it:

1. Reads the AcroForm catalog
2. Scans every page widget (including signature boxes that never made it into the catalog)
3. Classifies each widget from PDF type and flags (`/Tx`, `/Sig`, `/Btn`, radio vs checkbox)

Export writes values back into those widgets and leaves the form intact, so the downloaded file stays editable. Signatures that were drawn onto a signature widget are embedded as images over that box.

## Project layout

```
src/app/            # Landing, SEO pages, /edit/[id]
src/components/     # Editor, PDF viewer, signature pad, marketing
src/hooks/          # useEditor, upload/download
src/lib/            # acroform import, pdf-lib export, waitlist helpers
public/assets/      # Brand icons, logo, OG image
```
