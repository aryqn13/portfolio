# Round 7: portrait frame back to 4:5 + fitted, then a real mobile pass

User's asks:
1. "I don't like the square, the tall one was much better. A few, but not very
   tall, should be decent enough. The image should fit inside of the whole
   avatar box. It's fine if it is not zoomed in and cropped like that."
2. "Make this entire portfolio really very good for mobile responsiveness... it
   should feel like it was almost designed for mobile."

## 1. Portrait frame — DONE
- [x] frame `aspect-square` -> `aspect-[4/5]` (tall, but not very tall)
- [x] `object-cover` -> `object-contain`, centred: the whole photo sits inside
      the card, nothing cropped, nothing zoomed
- [x] removed the per-photo crop model entirely (`focus`/`zoom` off `Photo`,
      off `content.ts`, sliders out of `photo-editor.tsx`), since fitting the
      picture makes a focal crop meaningless
- [x] studio thumbnail is now 4:5 + contain, matching the card
- [x] stripped `focus`/`zoom` from the saved DB override
- [x] typecheck 3/3, build, pm2 restart, verified at 1440 and 390

## 2. Mobile pass — IN PROGRESS

### Tooling notes (important)
- `mb` cannot hold a viewport; `--width/--height` only resize for one shot.
  So mobile work is driven by Playwright against the installed Chrome at
  `/opt/google/chrome/chrome`, script at `/home/user/audit/mobile_audit.py`.
- A tall viewport (390x2600) distorts `min-h-screen` sections — do not use it
  to judge spacing.
- **Full-page screenshots come out mostly empty**: this site reveals sections
  on scroll, and `full_page` never fires them. Must scroll in viewport steps
  and capture each step — `/home/user/audit/mobile_shots.py <outdir>` does it.

### Mobile pass — DONE (round 7)
Audit at 390x844 (`python3 /home/user/audit/mobile_audit.py 390 <shotdir>`,
stdout is the report; the old `report-390.json` on disk is stale) now returns
**zero** small tap targets, **zero** sub-11px text and `scrollWidth == 390` on
all five routes. Fixes shipped:
- nav becomes an opaque blurred surface past `scrollY > 8` (was a gradient only,
  and the wordmark collided with body copy on a phone)
- every icon link `-m-2.5 inline-flex h-10 w-10`; every inline/email link
  `-my-2 py-2 min-h-10` — padding only, desktop layout unchanged
- contributions month labels 9px -> 11px
- `html { overflow-x: clip }` kills the 15px sideways scroll on `/` caused by
  the decorative glow (body already had `overflow-x: hidden`, which was not
  enough at the document level); also contains the /writing decorative svg
Stepped screenshots re-captured at `/home/user/shots/m390b/` (31) and reviewed:
home, work (incl. nav-over-text case), interests, elsewhere all read correctly.
Remaining `overflow` entries in the report are intentional and clipped: the
glows, the contributions grid inside its own scroller, the writing svg.

### Portrait frame — DONE (round 7)
`aspect-[4/5]` + `object-contain`, whole photo inside the card, no zoom, no
crop. The per-photo `focus`/`zoom` model was deleted end to end (interface,
defaults, component, studio sliders, saved DB override). `design.md` rewritten
to match, and it now says not to reintroduce a crop model without asking.


### Favicon and share image — DONE (round 8)
- Favicon is the wordmark "A": Archivo 800, `--white` on `--ink`, rendered
  through headless Chrome with the real Google font rather than drawn by hand,
  then trimmed and re-padded so the glyph is optically centred at ~66% of the
  tile. Shipped as `favicon.ico` (48/32/16), `icon-512.png` and
  `apple-touch-icon.png` (180); `index.html` links all three. Checked at 16px:
  still reads as an A.
- `og-image.png` is now the live front page, not the template default. Captured
  at 1440x756 (the OG ratio at a true desktop width) then downscaled to
  1200x630. Rendering at 1200 wide, or zooming the page, made the CV buttons
  wrap onto a second row. The Runable badge is hidden for the capture only, via
  a runtime style on the anchor; it stays in the app. 6.5MB -> 836KB.
- Regenerate with `/tmp/favicon.py` + `/tmp/og.py` if either needs a redo.


### Portrait frame, again + lowercase handles — DONE (round 9)
- The fitted 4:5 frame was rejected: a square source sat between two empty
  bands. The card now **measures the front photo and takes its own aspect
  ratio** (`object-cover`, so it fills edge to edge), clamped 0.62-1.35, 4:5
  until the file loads. No crop, no bands. Consequence stated in design.md: a
  square file gives a square card, so a tall card needs a tall photograph.
- `.slug` uppercases everything, which was shouting handles and email
  addresses. Added `normal-case` to the handle/username/email/URL instances
  only (socials rows x2, writing, music, nav email, both footers, the GitHub
  username link, the Letterboxd URL). Section labels, dates, periods and
  locations stay uppercase, which is the design.
- typecheck + build + pm2 restart done, shots in /home/user/shots/v10/.


### Self-hosting on GitHub + Vercel — round 10
Goal: user stops paying Runable credits to host. Everything stays working
(studio, guestbook, uploads, live feeds), so the DB and bucket must become the
user's own.

Done:
- Repo was already renamed on GitHub to **aryqn13/portfolio** (the old
  portfolio-2268 remote redirects). Local remote re-pointed to the new URL.
  All work committed and pushed; `.env` stays gitignored.
- `vercel.json` at root: bun install, `bun run build:web`, output
  `packages/web/dist`, `/api/(.*)` -> the function, everything else ->
  index.html (Vercel checks the filesystem before rewrites, so static assets
  still win).
- `api/index.ts` at root: `handle(app)` from `hono/vercel`, importing the same
  Hono app the Bun server uses. One API, two hosts.
- Added `hono` to ROOT package.json deps — bun does not hoist, so a root-level
  function could not resolve `hono/vercel` otherwise.
- Verified: `bun build --target=node api/index.ts` bundles 381 modules clean,
  typecheck 3/3, `bun run build` fine, pm2 site + /api/health still 200,
  konsistent shows only the known pre-existing mobile error.
- `DEPLOY.md` committed: 12 sections, every command explained, written for
  someone shaky with git. Covers Turso (free, 5GB) + Tigris (free, 5GB,
  endpoint https://t3.storage.dev — same as Runable uses), env var table for
  Vercel, badge removal, content re-entry, custom domain, daily git loop,
  troubleshooting.

NOT verified (cannot be, from the sandbox): the actual Vercel deploy. Most
likely failure point is @vercel/node bundling `api/index.ts`'s relative import
into `packages/web/src/api` — if it fails, the fallback is setting Vercel's
Root Directory to packages/web and moving the function there.

Blocked: the interactive tickable checklist the user also asked for needs
`app_init`, which refuses a second app in this chat. Needs a new chat.

## Notes — carried forward
- **Port 4200 is pm2 serving the BUILT output** (`bun run start`). Code changes
  are invisible until `bun run build`. `bun run dev` is plain vite on 5173.
- `mb drag` is too synthetic for motion's pan session; dispatch PointerEvents
  by hand if the deck needs testing again.
- deck order check: compare `img.src`, not `aria-label` ("photo {depth+1}"
  reads the same whatever the order).
- lint broken pre-existing (mobile `_layout.tsx`) — use typecheck + build.
- oRPC payloads wrap in {"json":{...}}; `content.save` takes a JSON *string*.


## Round 11: shorter bio, accent marks, skills logos, proof of work, home previews, footer socials

Six asks, all in this round:
1. shorten "The long version"  2. colour key phrases  3. screenshots on experience
4. previews of every subsection on the first page  5. skills section with logos
6. all socials as small icons in the footer

Decisions confirmed with the user before building:
- accent is cool electric blue `#5b8cff`, the only sanctioned break from
  monochrome besides the existing greyscale->colour image hover
- skills logos on BOTH home and /work
- growth skills get drawn monoline icons (lucide), tech gets real brand marks
- home: light previews for most, a proper preview for Work
- experience screenshots: thumbnail strip -> full size lightbox

### Built
- [x] `--mark` / `--mark-dim` tokens + `.mark` class in styles.css. NOTE: the
      shadcn `--accent` token was already taken (it is `--ink-4`), so the blue
      is `--mark`, not `--accent`. Do not repoint `--accent`.
- [x] `components/marked.tsx` — `**phrase**` renders in the accent. Chosen so
      the owner can add highlights from /studio without touching code.
      Applied to bio, experience points, project blurbs, `sharpening`.
- [x] bio cut 5 paragraphs -> 3, with marks
- [x] `Shot` interface + `shots?` on `Experience`
- [x] `config/skill-icons.tsx` — lowercased skill name -> icon, generic
      fallback. `SiCss3` does not exist; HTML/CSS uses `SiHtml5`.
- [x] `components/sections/skills-grid.tsx` — shared by home and /work,
      `compact` for home. `stack.tsx` now uses it.
- [x] `components/lightbox.tsx` — portalled, z-[200] so it clears the grain
      (60) and vignette (55) fixed overlays. Esc + arrow keys.
- [x] `work.tsx` — "Proof of work" thumbnail strip under the bullets
- [x] `components/sections/previews.tsx` — `SkillsPreview`, `WorkPreview`,
      `PagePreview`, `FooterSocials`
- [x] home reordered: Hero 01, About 02, Capability 03, Work 04, Index 05.
      /work is out of the index list since it has its own preview block.
- [x] `FooterSocials` in both footers (home + page-shell)
- [x] `components/studio/shots-editor.tsx` — per-job uploader sitting above the
      experience JSON textarea, reads/writes that same JSON string
- [x] typecheck 3/3, build clean, pm2 restarted, / and /api/health both 200

### IMPORTANT: the live site runs on DB overrides, not the compiled defaults
`content/get` shows overrides for: bio, education, photos, positioning,
quickFacts. The user has edited these in /studio, so editing `config/content.ts`
alone changes NOTHING on screen. The DB bio differed from defaults only in
"I work in growth at Runable" (defaults said "I run"). Shortened THEIR text,
kept their phrasing, saved over the `bio` block via the admin API, and aligned
the compiled default to match. Left education/quickFacts/positioning alone.

RPC over curl: `POST /api/rpc/content/get` with `{"json":{}}` — note the SLASH,
`content.get` 404s. Login at `admin/login`, then `authorization: Bearer <tok>`.

### Verified
- [x] re-screenshot 1440 (`/home/user/shots/v11/`) and 390
      (`/home/user/shots/m390d/`); reveals fire, home is 3954px at 1440
- [x] bio marks thinned: the first pass put six marks in one paragraph and it
      read like a wall of hyperlinks. Ceiling is one or two per paragraph.
- [x] lightbox proven end to end with a temporary experience override
      (thumbnail -> full size, caption, 01/02 counter, arrows, Escape), then
      `content/reset` on `experience` so the override is gone. Confirmed the
      overrides are back to the user's five: bio, education, photos,
      positioning, quickFacts.
- [x] mobile audit clean on all five routes: scrollWidth 390, zero sub-11px
      text, zero small tap targets. One regression was caught and fixed: the
      restructured index row collapsed the "Interests" link to a 30px target,
      fixed with `-my-2 py-2 min-h-10`.
- [x] design.md: accent + where it is permitted, marked phrases, the home page
      rule, skills grid, proof of work, footer
- [x] typecheck 3/3, build clean, all five routes 200

### Next
- [ ] await feedback, then commit + push to github.com/aryqn13/portfolio

## Round 12 — CV hierarchy + replaceable PDFs

Ask: growth CV becomes the main resume, engineering CV becomes an optional side
cut, and the PDFs must be replaceable from `/studio` without a redeploy. The
user uploads the new PDFs himself once the studio works, so no new PDF files
were sourced here.

### Decision
Order is meaning: `resumes[0]` is the main CV, the rest are optional cuts.
Chosen over a `primary?: boolean` flag because an ordered list cannot enter an
invalid state (two primaries, or none), the studio already has move up/down
arrows, and it matches the photo deck convention. Growth was already first in
the defaults, so no content data change was needed. Documented in the `Resume`
docblock in `config/content.ts` and in design.md under Content model / CVs.

### Changed
- `api/routes/upload.ts`: `ALLOWED` split into `IMAGES` and
  `DOCUMENTS = ["application/pdf"]`. Key prefix follows the type — PDFs to
  `resumes/`, images stay in `photos/`. `/api/files/*` needed no change, it
  echoes back the stored `ContentType`.
- `sections/hero.tsx`: `const [main, ...alternates] = resumes`. Main CV is a
  bordered button beside "See the work"; alternates moved to their own line
  below behind an `Also` slug.
- `sections/contact.tsx`: main CV is a full bordered panel badged `Main CV` in
  `--mark`; alternates are quiet rows under "Also available". Label went from
  "Resume, two cuts" to "Resume".
- `components/studio/resume-editor.tsx` (new): per row label + note, a
  "Replace PDF" presigned upload that rewrites that row's `href` in place,
  "Open current", the raw path in mono, move up/down, delete, add. Row 0 badged
  `Main CV`. Client guards: `application/pdf` only, 10MB.
- `pages/studio.tsx`: `Kind` gained `"resumes"`, the resumes block moved off
  `kind: "records"` onto the new editor.

### Verified
- [x] PDF upload proven end to end over the API: presign with
      `application/pdf` -> PUT 200 -> GET back through `/api/files/...` returns
      200, `content-type: application/pdf`, byte length identical (140746),
      body starts `%PDF-`. An `application/x-msdownload` presign was rejected.
      Left one stray unreferenced object at `resumes/1788778075990-test-cv.pdf`.
- [x] screenshots at 1440 and 390 (`/home/user/shots/v12b/`). Two defects found
      by eye and fixed: the hero's `Also` line rendered label and link in the
      same grey with a hover-only underline, so it read as one flat mono string
      and the link did not look clickable — dimmed the slug to `--grey`, took
      the link to `--silver` and added an 11px download icon. And the studio
      block printed its hint twice, once from the BlockDef and once inside the
      editor — removed the in-editor copy.
- [x] mobile hero checked at 390: the two buttons stack cleanly, no awkward
      wrap now that the alternates have their own line.
- [x] mobile audit clean on all five routes (`/home/user/shots/m390e/`):
      scrollWidth 390, zero sub-11px text, zero small tap targets. Only the
      three known-intentional overflows (hero glow, contributions scroller,
      `/writing` svg).
- [x] typecheck 3/3, build clean, all five routes 200

### Next
- [ ] user uploads his new PDFs via /studio -> Resumes -> Replace PDF
- [ ] rounds 11 and 12 are both still uncommitted; commit + push to
      github.com/aryqn13/portfolio once he is happy
- [ ] og-image.png still shows the pre-round-11 home layout, worth
      regenerating with /tmp/og.py before he shares the link
