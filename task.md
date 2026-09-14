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

- [x] og-image.png regenerated against the current home page with /tmp/og.py,
      downscaled to 1200x630. The dist copy is smaller than the public source
      because vite optimizes the PNG on build; that is not a stale file, the
      served bytes were checked by eye.
- [x] rounds 11 and 12 pushed to github.com/aryqn13/portfolio as `35a2a17`,
      one commit because the two rounds touch the same files and a split would
      have produced an intermediate commit that does not build. DEPLOY.pdf left
      untracked as a generated artifact of DEPLOY.md. `.env` still untracked.

## Round 13 — dither backdrop, softened corners, merged Runable

- [x] **Portrait dither made almost invisible.** The lab version was far too
      strong for a face. The hero portrait now takes `DitherOverlay` (canvas
      only, `mix-blend-mode: overlay`) laid over the existing `<img>` at 0.12
      opacity, fading to zero on hover with the greyscale. Not the full
      `DitherImage`, because the photo deck's `<img>` already owns its sizing,
      its `onMeasure` and its hover filter.
- [x] **Backdrop shipped with the settings he picked in the lab**: `dot 1`,
      `levels 6`, `lift 0.34`. Flavour is **Bayer 4x4** — he never named one,
      so this is my recommendation and the lab default. One word to flip in
      `site-backdrop.tsx` if he wanted blue noise or Bayer 8x8.
- [x] **Backdrop is site wide, not a hero effect.** Mounted once above
      `<Switch>` in `app.tsx` so routing never rebuilds the GL context, with
      the `<Switch>` wrapped in `relative z-[1]` so page content stays above
      the fixed canvas. Verified at 1440: `fallback: 0`, one canvas, zero
      console errors, cursor bloom visible.
- [x] **Real bug found and fixed**: the shader cleanup originally called
      `WEBGL_lose_context.loseContext()`. That is permanent and keyed to the
      canvas element, which React reuses across remounts, so every mount after
      the first rendered black (`lost: true, err: 37442`). A comment in the
      cleanup says never re-add it.
- [x] **Grain pulled back from 7.5% to 2.2%** rather than deleted. The dither
      carries the texture now and two noise fields at full strength read as
      mud. One line in `styles.css` to revert.
- [x] **Rounding pass, complete.** Four tokens (`--r-chip` 6, `--r-tile` 8,
      `--r-card` 12, `--r-img` 10) and the shadcn `--radius` scale raised to
      `6/8/12/16px`. Applied across skills grid, section tags, films, music,
      writing, previews, contact, guestbook, contributions, lightbox, hero
      buttons, nav button, work thumbnails and all of `/studio`. Photo deck
      keeps its documented 20px.
- [x] **Work section names Runable once.** `groupByCompany()` merges
      consecutive same-company entries; the company shows the role count and
      the combined span (oldest start, newest end), each role sits on a
      vertical rail with a dot. Grouping is at render time, so `experience`
      stays a flat JSON list in `/studio` and a third role needs no code.
- [x] typecheck 3/3, build clean, all six routes 200.
- [x] Screenshots at 1440 (`shots/v13`) and 390 (`shots/m390f`). Runable merge
      renders correctly; backdrop reads as texture without fighting text.
- [x] Mobile audit re-run: `scrollWidth == 390` on all five pages, zero
      sub-11px text, zero small tap targets, only the three known-intentional
      overflows (hero glow, contributions scroller, `/writing` svg).
- [x] The faint sliver under the mobile portrait was checked against the round
      12 shot and is identical — pre-existing deck geometry, not a regression.

## Round 14 — performance, IN PROGRESS

Reported symptom: "slightly laggy". Measured, did not guess.

Findings, in order of actual cost:
1. **The lag was a round 13 bug of mine.** `dither-image.tsx` `render()` sized
   the working canvas from `src.naturalWidth`, so his two portraits (4160x3110
   and 2802x3599) allocated 12.9M and 10.1M pixel canvases and ran a sequential
   JS dither over every pixel, to fill a 332px box. ~23M pixels of main thread
   work per load, ~99% of it discarded by the downscale.
2. **The deck dithered all four cards**, not just the visible top one.
3. **Backdrop was 2880x1800 = 5.2M fragments/frame** (dprCap 2) with a
   sin-based hash: ~48 transcendental calls per fragment, ~250M per frame.
4. **947 kB single JS bundle**, no splitting, with owner-only `/studio` and the
   scratch `/dither-lab` both eagerly imported.
5. **5.4 MB of photographs** on the home page (1.43 MB + 1.30 MB, each also
   forcing a ~50 MB bitmap decode). Needs his call, they are his uploads.

- [x] canvas now sized from the laid out box x capped DPR, capped at 1400px on
      the long side, never above the source. ~30x less work.
- [x] only the top card of the deck gets a dither pass
- [x] shader: multiply-only hash instead of fract(sin(dot)), 4 octaves to 3,
      and the dome warp no longer costs a third full fbm evaluation
- [x] `dprCap` and `fps` props on DitherShader, pointer follow time corrected
      so 30fps feels identical to 60
- [x] backdrop passes `dprCap 1` and `fps 30`
- [x] `/studio` lazy loaded into its own 56 kB chunk; `/dither-lab` deleted
      (page and route), the settings are picked so the scratch route was only
      costing bundle size
- [x] typecheck 3/3, build clean, all six routes 200, zero console errors

Measured after, same probe, 1440x900 at DPR 2:
- total canvas pixels **28.9M -> 1.56M** (18x). The two multi-megapixel
  portrait canvases are gone; one 512x512 remains, and it is 512 rather than
  690 because the guard refuses to work above the source resolution.
- backdrop buffer **2880x1800 -> 1440x900** (4x fewer fragments), each
  fragment ~2.5x cheaper, at half the redraws
- main bundle **947 kB -> 882 kB** plus a split 56 kB studio chunk
- sandbox frame numbers improved ~5x but they are SwiftShader software
  rendering, so they are a relative signal only, not his frame rate

Visual check: before/after crops of the backdrop are the same character, same
cell size, same tonal range. On a retina display the weave is now one cell per
CSS pixel instead of per device pixel, so it is marginally coarser there. At
34% lift on near black it should be imperceptible, but it is the one change
with a visible surface, so he should confirm. Revert path if he wants the finer
retina weave: `dprCap 2` with `fps 30`, still 2x cheaper than round 13.

## Round 15 — dither scoped to openings

His call, and the right one: "instead of making entire background dither let us
focus on certain sections". The full viewport field was wallpaper.

- [x] `components/dither/dither-panel.tsx`, a bounded plate. Edge masked rather
      than cropped (strongest top left, dissolved to nothing before its own
      edges) so it has no visible boundary and does not become a box. No
      border, no fill.
- [x] **The rule: the dither marks openings, nothing else.** One plate behind
      the home opening (`hero.tsx`), one behind every other page's masthead
      (`page-shell.tsx`). Body copy, cards and lists sit on clean ground.
- [x] `site-backdrop.tsx` deleted, removed from `app.tsx` along with the
      `relative z-[1]` wrapper that only existed to escape it
- [x] **grain back up to 0.05** from 0.022. It was cut because the full screen
      dither was carrying the texture; with the dither bounded, the body of
      every page would otherwise have had no texture at all.
- [x] typecheck 3/3, build clean, six routes 200, zero console errors
- [x] verified: home plate 1254x602 and one 512x512 portrait overlay, 1.02M
      canvas pixels total (28.9M at the start of round 14), and **zero fixed
      canvases**, so the IntersectionObserver can finally pause the shader.
      Nothing renders GL once you scroll past the opening.
- [x] eyeballed home and /work openings plus a mid-page shot: texture on the
      openings, clean ground below

### Next
- [ ] **the home page work preview still prints "Runable" twice.** Round 13
      fixed the /work experience section, but `sections/previews.tsx` is a
      separate compact index table on the home page and was not touched. It is
      arguably correct as a table, so ask before grouping it.
- [ ] photos: **leave them alone, his decision.** Quality over load time. Do
      not recompress the 1.43 MB and 1.30 MB uploads.
- [ ] he has not yet confirmed the lag is actually gone on his machine, or
      looked at the retina weave
- [ ] regenerate og-image.png, the home page changed again
- [ ] rounds 13, 14 and 15 are all still uncommitted

### Superseded
- [ ] ~~his call: 5.4 MB of photographs on the home page.~~ Two uploads at
      1.43 MB and 1.30 MB, natural sizes 4160x3110 and 2802x3599, which also
      cost a ~50 MB bitmap decode each. FCP is 1.28s and this is why. They are
      his uploads in the Tigris bucket, so recompressing means downscaling to
      ~1600px and re-uploading through the presign flow, replacing the
      originals. Not doing that unless he says so.
- [ ] regenerate og-image.png, the home page changed again

### Next
- [ ] decide whether to delete `/dither-lab` (page, route and import in
      `app.tsx`) now that the settings are picked; it is scratch and unlinked
- [ ] regenerate og-image.png with /tmp/og.py, the backdrop and rounding
      changed the home page it was shot from
- [ ] round 13 is uncommitted; commit as Aryan once he has seen it
- [ ] user uploads his new PDFs via /studio -> Resumes -> Replace PDF
- [ ] the Vercel deploy has still never been verified from outside this
      sandbox; likeliest failure is @vercel/node bundling the root function's
      relative import into packages/web/src/api, fallback is setting Vercel's
      Root Directory to packages/web
- [ ] the interactive tickable version of the deploy guide still needs a new
      chat, since app_init refuses a second app in this one


## Round 16 — colour (in progress)

Outside feedback: "the website looks very much black and white and nobody is
going to read it", plus the round 15 dither plate "feels a little bit weird".
Diagnosis first, and it reframed the job: every image on the site was forced to
greyscale at rest and only found colour on hover, so the reviewers were being
literal. The accent was also in only 4 files, and every grey sat at exactly
zero saturation, which is what a dev default looks like.

His decisions: images in full colour at rest with the chrome staying
monochrome, accent is neon magenta (a Fallen Angels nod), confident level of
colour, and work on exactly three things — motion and reward, a stronger
opening, typography and hierarchy. He explicitly did NOT pick pull quotes or a
what-changed strip. Do not build those.

### Done — the colour foundation
- [x] palette retokenised. The ink family carries a blue-violet cast
      (--ink #07060b through --edge-hi #423a52, --silver #cfc7d9), and --mark
      moved from blue #5b8cff to neon magenta #ff2e9a with --mark-hi and
      --mark-dim either side. --mark on --ink is ~6.1:1.
- [x] --color-mark-hi and --color-mark-dim exposed to Tailwind
- [x] accent spread to resting states, not just hover: the section index in
      `section.tsx` (the one mark that repeats down every page), the "Now"
      badge on the current role, the primary "See the work" CTA, and the active
      page in the nav overlay
- [x] accent on interaction: ::selection, scrollbar thumb hover,
      `.link-underline` now draws in --mark rather than currentColor
- [x] **images to colour at rest**, all 8 greyscale usages gone: film posters
      and stills (`films.tsx`), the photo deck (`photo-stack.tsx`), project
      thumbnails (`previews.tsx`), proof-of-work shots (`work.tsx`), and the
      original under `dither-image.tsx`
- [x] **hover reward reworked**, because colour-on-hover was the reward and it
      no longer exists. Images now lean forward instead: saturation and light
      lift on the posters and the photo deck, opacity plus a 1.04 scale on the
      proof-of-work grid.
- [x] body measure 70ch -> 64ch. Contrast was never the readability problem
      (the old --silver was already ~9.3:1), measure and rhythm were.
- [x] hardcoded rgba(6,6,6,...) in `nav.tsx` repointed to the new ink
- [x] typecheck 3/3, build clean, five routes 200, shots in v16a and v16b

### Still to do in round 16
- [ ] **dither -> duotone.** Replace the round 15 bounded plate with a
      continuous full-bleed duotone field (ink -> neon) with scroll-driven
      intensity, so it has no edges. This is what answers "the card feels
      weird" and "it's too black and white" in one move. `dither-shader.tsx`
      currently outputs `vec3(clamp(q,0,1) * uLift)`; duotone means two colour
      uniforms and `mix(ink, accent, q)`. Keep the pointer dome. `dprCap 1`.
- [ ] stronger opening: say who he is and why to care, faster
- [ ] typography and hierarchy beyond the measure change: scannability
- [ ] more motion and reward on scroll
- [ ] **rewrite design.md, do not patch it.** Principle 1 currently reads "No
      colour in the chrome. Greys only.", the Palette section documents
      zero-saturation greys and the blue --mark as "the single sanctioned break
      from monochrome", and the Imagery section documents greyscale-at-rest as
      the rule. All three are now false.
- [ ] regenerate og-image.png once the opening is settled


## Round 16 -- follow-up: dither, home length, navbar (done)

Three concrete complaints, addressed directly:

- [x] "dither only on the card feels really off but I want to use it
      somehow." Killed the bounded, edge-masked plate entirely. DitherPanel
      now bleeds full viewport width (the left-1/2 w-screen -translate-x-1/2
      trick, which cancels out to 0 exactly because every ancestor is
      horizontally centered) with only a top/bottom linear fade back into the
      page's own ink, no rectangle anywhere for "the card" reading to attach
      to. It is also no longer static: DitherShader gained a uScroll uniform,
      fed from getBoundingClientRect() once per drawn frame (scrollReactive
      prop), which drifts the field's own coordinate space and slides its
      vertical falloff band, so scrolling through an opening visibly moves the
      weave rather than sliding a frozen texture underneath you. And the
      shader is now the duotone colour vehicle itself: mix(uInk, uAccent,
      q * uLift) in place of the old greyscale vec3(q * uLift), defaulting to
      --ink -> --mark. GLSL verified compiling and linking clean via
      glsl_compile.py before any browser round trip. dprCap stays 1.
- [x] home page length. Skills preview was printing every tag (24 growth,
      21 engineering) in two full cards, the single biggest offender.
      Capped to 7 per column with a "+N more" chip linking to /work#stack
      (new SkillPreviewColumn in previews.tsx; full detail was already one
      click away, the preview only has to prove range). Work preview trimmed
      3 recent roles to 2. Section vertical padding on skills, work-preview
      and the home index tightened via className overrides on Section
      (cn/twMerge makes this a clean override, does not touch any other
      page). Desktop 1440 height: 3981px -> 3666px.
- [x] navbar felt blank. Added real inline page links (Work, Interests,
      Writing, Elsewhere) between the wordmark and the hamburger, visible
      md+ only, active page in --mark. Below md the bar is unchanged,
      wordmark and hamburger, no room for more and the takeover already works
      well there. The takeover itself is untouched: still the way into
      socials, email, and the full page list with previews. Bar goes from
      flex justify-between to flex md:grid md:grid-cols-[auto_1fr_auto]
      so the links sit genuinely centered rather than wherever a 3-child
      justify-between happens to land them.
- [x] typecheck 3/3, build clean, GLSL compile check clean, five routes 200,
      desktop shots in v16c, mobile shots + audit in m16 (clean, only the
      pre-existing decorative-svg/chart overflow flags that overflow-x: clip
      already handles)

### Still open from round 16
- [ ] stronger opening: say who he is and why to care, faster
- [ ] typography and hierarchy beyond the measure change: scannability
- [ ] more motion and reward on scroll (dither now reacts to scroll; the rest
      of the page mostly does not yet)
- [ ] rewrite design.md, Principles, Palette, Texture and Imagery sections
      are all now wrong (still says monochrome, greyscale-at-rest, bounded
      plate)
- [ ] regenerate og-image.png once the opening is settled
- [ ] decide: second neon (cyan) for the Fallen Angels duality, or stay one
      accent. Leaning one.
- [ ] rounds 13 through 16 are all still uncommitted

## Round 17 (colour-pivot feedback: nav font, hamburger, home length, /work bug)

- [x] /work GitHub-link-buried bug (screenshot confirmed). Root cause: the
      page header is `relative isolate pt-32 ...` (a positioned box with
      z-index:auto) and the very next sibling (Contributions block) was a
      plain non-positioned div. Non-positioned boxes paint before positioned
      ones in the same stacking context regardless of DOM order, so the
      header — including its DitherPanel bled 150% past its own bottom edge
      on purpose — painted on top of the Contributions card's intro text and
      GitHub link. Fix: wrap `{children}` in page-shell.tsx in a
      `relative z-10` div, which paints above the header's z-index:auto bleed
      on every page. The bleed itself is untouched — verified via screenshot,
      "Last twelve months, pulled live from GitHub." and "aryqn13 ↗" now
      fully legible on both desktop and mobile.
- [x] nav link font. The round 16 inline links used .slug (Geist Mono,
      uppercase, 0.2em tracking) — a terminal-tag treatment that clashed next
      to the Archivo wordmark. New .nav-link class in styles.css: Archivo
      (var(--font-display), which already falls back to Helvetica Neue),
      600 weight, -0.01em tracking, 0.94rem, normal case. No new typeface
      introduced.
- [x] hamburger redesign. Was a plain two-line-morphs-to-X icon. Now a 2x2
      dot grid at rest — ties it to the site's own dither/dot visual
      language instead of a generic icon — cross-fading via AnimatePresence
      to the existing X mark when open. Hover: border and a soft magenta
      box-shadow glow (imperative onMouseEnter/onMouseLeave style writes,
      matching the rest of the codebase's convention for CSS-var-driven
      hover states, since inline styles can't be beaten by a stylesheet
      hover rule), dots turn --mark with a staggered scale pulse
      (group-hover, 45ms stagger per dot). Verified rest/hover/open states
      with a one-off Playwright script (audit/nav_states.py).
- [x] home page length / restructure, several pieces:
  - New /about page (pages/about.tsx, PageShell index "02"). Carries the
    full bio (all 3 paragraphs) plus Education, now a single compact line
    at the foot instead of a boxed aside card: "{degree} — {school}" with
    period/detail as a slug on the trailing edge. No boxed-card treatment.
  - Home's About section (components/sections/about.tsx) cut from bio (3
    paragraphs) + Education aside + Footnotes aside down to bio[0] alone
    (the existing opening line, not new copy) plus a "The long version ->"
    link to /about. Title changed "The long version." -> "The short
    version." to match what it now actually is.
  - Footnotes (quickFacts) removed from the public site entirely — it only
    ever rendered in the old About aside. The data field, DB block and
    /studio editor are untouched (out of scope), so a past visitor's
    /studio edits are not lost, it just has nowhere it renders anymore.
  - pages array in content.ts gained /about at position 02, pushing
    Work/Interests/Writing/Elsewhere to 03-06. Renumbered the hardcoded
    index="0N" prop in each of those four page files. Registered the new
    route in app.tsx. Home's own "rest" index (Interests/Writing/Elsewhere
    strip) now also excludes /about, same as it already excluded /work,
    since About has its own teaser block above it.
  - Skills preview "+N more" chip (round 16 pass 2) removed outright per
    explicit "even worse" feedback — it was turning a quiet preview card
    into another exit door to /work mid-scroll. Replaced with a flat cap of
    6 tags per column and no overflow chip at all; the full stack already
    lives on /work for anyone who wants it.
  - Experience grouping: work.tsx's groupByCompany/groupPeriod "N roles"
    stepped-multi-role branch removed outright. Every group now renders
    only group.jobs[0] (the lead/newest role) through the single-role Role
    component — Runable prints once, as one role, not "2 roles" stacked.
    groupByCompany + KIND_LABEL extracted to a new lib/experience.ts shared
    by work.tsx and previews.tsx.
  - previews.tsx's WorkPreview bug fixed in the same pass: it was slicing
    the raw flat `experience` array (0, 2), which is why "Runable" printed
    twice on the home preview (its two consecutive entries). Now groups by
    company first, takes the first 2 groups, renders each group's lead job
    — Runable once, Horizontal Integration India once.
  - Desktop 1440 home height: 3666px (round 16) -> 3296px.
- [x] typecheck clean, build clean, all 6 routes (incl. new /about) return
      200, desktop 1440 shots in shots/v17, nav rest/hover/open states in
      shots/nav17, mobile shots in shots/m17 + mobile_audit.py clean (only
      the same pre-existing decorative-svg/contributions-grid overflow
      flags that overflow-x: clip already handles, present before this
      round too).

### Round 18 (nav.tsx, previews.tsx, styles.css, work.tsx)
User feedback on round 17: hamburger icon "looks really bad" and doesn't
read as a menu; skills preview still "pretty weird"; Work section design
"feels very bad", specifically the filled magenta "Now" pill.

- [x] Hamburger rewritten (nav.tsx): dropped the round-17 dot-grid icon,
      AnimatePresence dots<->X cross-fade, and the magenta box-shadow glow
      on hover. Now a plain three-line hamburger (16x16, 1.5px lines,
      var(--grey-hi)) that morphs to an X: top/bottom lines rotate 45deg
      and recenter, middle line scales/fades out. Hover just brightens the
      lines to var(--white) (group-hover + !important, no glow, no
      shadow) plus the existing chip border-color transition already used
      everywhere else. Verified rest/hover/open at desktop 1440
      (shots/nav18) and mobile 390 (shots/v18/mobile_nav_open.png) — reads
      as a clear menu icon at rest, clean X on open, no leftover dot-grid.
- [x] Skills preview rebuilt as a self-scrolling marquee (previews.tsx +
      styles.css). SkillPreviewColumn (capped tags + "+N more") removed
      entirely. New MarqueeRow renders one label + one row of the FULL
      flattened skill list (no cap — length no longer matters, the row
      just scrolls), duplicated back-to-back and animated exactly -50% so
      the loop has no seam. SkillsPreview is one narrow card (max-w-440px,
      so it does not run the width of the row) with two rows, Growth
      scrolling one direction and Engineering the other (reverse), a
      hairline between them, plus a "The full toolkit ->" link to
      /work#stack. New CSS: .marquee-edge (mask-image edge fade),
      .marquee-track (the scroll keyframe), .marquee-track-reverse,
      .group:hover .marquee-track pauses on card hover, and a
      prefers-reduced-motion override that kills the animation outright
      (verified via Playwright emulate_media — animation-name resolves to
      "none"). Full /work Stack section (skills-grid.tsx) untouched, still
      the exhaustive list.
- [x] Work section "Now" badge (work.tsx): the filled
      background:var(--mark)/color:var(--ink) pill removed — it was the
      one real chrome-fill violation of design.md's "no colour in the
      chrome, hairlines not boxes" principle (previews.tsx's own home
      "Now" chip already used a neutral ink-4 fill and was left alone).
      Replaced with a small var(--mark) dot + plain var(--mark) "Now" text,
      no background, mirroring the unstyled "Current" tag already used in
      nav.tsx's mobile takeover. Also added the same row hover-tint
      (background: var(--ink-2) on mouseenter, matching WorkPreview's
      existing pattern) to each Experience article, so the section picks
      up the same hover-reward language used everywhere else on the site.
      No structural layout change beyond that — flagged to the user as a
      narrow read of "the entire design feels bad," open to further
      iteration if they wanted something more drastic.
- [x] Caught and fixed a leftover duplicate `);\n}` in previews.tsx (stray
      from the marquee rewrite) that broke esbuild's build despite tsc
      passing clean — tsc did not error on it, vite build did. Lesson:
      typecheck passing does not guarantee the build will; always run the
      full build before calling a round done.
- [x] typecheck clean, build clean, all 6 routes 200. Desktop 1440 shots in
      shots/v18 (home_skills, home_skills_2 showing the marquee mid-scroll,
      work_now_rest/hover). Mobile 390 shots in shots/v18
      (mobile_skills, mobile_work_now, mobile_nav_open) + full mobile_shots
      + mobile_audit pass across all 5 routes: no new horizontal overflow
      at the document level (scrollWidth == 390 everywhere); the only
      per-element overflow flags are the marquee's own track (intentionally
      wider than its overflow-hidden wrapper) and the same pre-existing
      contributions-grid/decorative-svg flags from round 17, already
      contained by html { overflow-x: clip }.

### Round 19 (nav.tsx, previews.tsx)
User feedback on round 18: home preview's Work section still has a weird
"Now" tag; skills card on home is too small/cramped for the design; opening
the hamburger and scrolling breaks the layout (title vanishes); desktop nav
should get a cooler pill/slash treatment like a reference screenshot.

- [x] Home "Now" tag (previews.tsx WorkPreview): this was the OTHER Now
      badge, still a filled `background: var(--ink-4)` chip — flagged as
      the "already consistent" pattern in round 18's notes but the user
      still called it out as weird. Fixed to match /work's round-18
      treatment: a var(--mark) dot + plain var(--mark) text, no fill.
      Now every "Now" indicator on the site (work.tsx, previews.tsx,
      nav.tsx's mobile "Current") uses the same unfilled convention.
- [x] Skills preview card (previews.tsx SkillsPreview): dropped the
      max-w-[440px] cap that made it float as a small orphan box. Now
      full width, matching the Work preview list's container width, laid
      out as two columns side by side on md+ (Growth & GTM | Engineering,
      divided by a vertical hairline) and stacked with a horizontal
      hairline on mobile. Each half is still the self-scrolling marquee
      from round 18 — full list, opposite directions, pauses on hover,
      respects reduced motion — just given real estate that matches the
      rest of the page instead of a cramped card.
- [x] Hamburger scroll-lock bug (nav.tsx): root cause was
      `document.body.style.overflow = "hidden"`, which does not reliably
      block touch scroll on iOS Safari — the page can rubber-band behind
      the fixed takeover, so by the time it closes the site has silently
      scrolled and the header/hero reads as broken ("home title vanished").
      Replaced with the standard robust lock: on open, capture
      `window.scrollY`, set `body.style.position = "fixed"` with
      `top: -${scrollY}px` (plus left/right/width), and on close restore
      the inline styles and `window.scrollTo` back to that exact offset.
      Verified with a Playwright repro: scrolled to y=1400, opened the
      menu, dragged inside the overlay (simulating a swipe), confirmed
      `window.scrollY` stayed at 0 while open (background did not move),
      then closed and confirmed the page landed back near the original
      scroll position with no visual break.
- [x] Desktop nav redesign (nav.tsx), based on the user's reference image:
      pill-style links, each rendered as a grey "/" plus the lowercased
      page label (was Title Case with no slash), Home restored to the row
      (previously filtered out — the reference includes /home). The active
      link's pill background is one shared `motion.span` with
      `layoutId="nav-active-pill"`, so switching routes slides the pill
      from wherever it was to the new position instead of two pills
      cutting in and out — the "something cool" ask, implemented as the
      one deliberate fill in the nav chrome since it is doing a job a
      hairline can't (showing motion, not just state). Verified rest,
      active-on-different-routes (home vs work), and hover (non-active
      link brightens to white, same as before) at desktop 1440.
- [x] typecheck clean, build clean, all 6 routes 200. Desktop 1440 shots in
      shots/v19 (nav_home/nav_work/nav_hover, home_skills, home_work_preview
      showing the fixed Now tag). Mobile 390 shots in shots/m19 +
      mobile_audit.py across all 5 routes: scrollWidth === 390 on every
      route (no page-level horizontal scroll), only the same
      already-contained per-element overflow (marquee track, contributions
      grid, decorative svg) as prior rounds, zero tiny-text or small-tap
      flags.

## Round 20 — nav overlap bug + glass-nav redesign + marquee direction fix

User reported (with two screenshots): the round-19 hamburger button had
no `md:hidden` class, so at md+ widths it existed in the DOM alongside
the always-visible pill nav; opening it dropped the full-screen takeover
underneath the still-visible header, and the takeover's centered "Home"
item visually collided with the pill nav row. User also asked for the
header to feel more like a floating glassmorphism pill (reference image
attached: logo + links + button inside one compact translucent rounded
bar with clear space around it), and reported the two skills-marquee
rows scrolling in opposite directions looking like a fight.

- [x] Skills marquee (previews.tsx): removed the `reverse` prop from the
      Engineering `MarqueeRow` call so both rows scroll the same
      direction. `reverse` left on the component itself, just unused.
      Verified visually: two screenshots of #skills a second apart show
      both rows' items exiting left and entering right identically.
- [x] Nav overlap bug (nav.tsx): added `md:hidden` to the hamburger
      button — this was the actual fix, the class was simply missing.
      Verified with a Playwright visibility sweep at 767/768/769/900/
      1024/1180px: hamburger and pill nav never both visible, clean
      cutover exactly at the 768px md breakpoint, no overlap range.
      900px (the exact width from the user's bug screenshot) now shows
      only the pill nav, no hamburger.
- [x] Glass-nav redesign (nav.tsx + styles.css): header rebuilt as a
      single centered, content-hugging `inline-flex` pill (`.glass-nav`:
      translucent dark fill, `backdrop-filter: blur(20px) saturate(160%)`,
      hairline border, soft shadow) floating with `top-4`/`top-5`
      clearance instead of a full-width bar flush to the viewport edge —
      matches the reference image's look. Background deepens slightly
      on scroll (inline style override), otherwise constant glass look.
      Active-pill fill changed from opaque `--ink-3` chip to a borderless
      `rgba(255,255,255,0.1)` glass-on-glass highlight. Hamburger lost
      its own border/chip (sits inside the pill's border now), keeps the
      three-line-to-X morph unchanged. Takeover nav got `pt-24 sm:pt-28`
      + `overflow-y-auto` as a second line of defense so the first item
      never lands under the header even on short viewports.
      This is a deliberate, user-requested exception to design.md's
      "no colour/fills that read as chrome" rule, same category as the
      round-18 continuous marquee exception — noted for the design.md
      rewrite.
- [x] typecheck clean, build clean, pm2 restarted, all 6 routes 200.
      Desktop 1440 shots (rest, scrolled, /work active-pill) and a 900px
      shot reproducing the exact bug viewport, plus mobile 390 rest/open
      shots, all in shots/v20 — reviewed, no collisions, active pill
      correct on both routes, mobile takeover has clear space below the
      header pill and no clipping.

## Round 21 — nav padding balance + hamburger on desktop too

User feedback: right-side padding in the glass pill looked tighter than
the left (wordmark had 16px, last item only had ~6px), and asked for the
hamburger to be back on desktop too (previously `md:hidden`, following
round 20's overlap fix by hiding it above the md breakpoint).

- [x] Padding (nav.tsx): pill's `pr-1.5` changed to `pr-4`, matching the
      `pl-4` on the wordmark side. Verified with bounding-box math at
      390/700/900/1024/1440px: left gap (wordmark to pill edge) and right
      gap (last visible element to pill edge) both exactly 17px at every
      width, before this round's change the right gap was ~7px.
- [x] Hamburger on desktop (nav.tsx): removed `md:hidden` from the
      button, so it now renders and is clickable at every width,
      alongside the pill links. This is safe now because the real fix
      for the round-20 overlap bug was giving the takeover its own top
      clearance (`pt-24 sm:pt-28` + `overflow-y-auto`, done last round),
      not hiding the hamburger — hiding it was a second belt-and-braces
      change on top of the real fix, and removing it does not bring the
      bug back. Updated the two stale code comments that described "only
      one of {pill nav, hamburger} in the DOM" as the fix.
      Verified: hamburger `is_visible()` true at 390/700/900/1024/1440px,
      padding still symmetric (17px both sides) with the button back in
      the flow. Opened the takeover at the original bug viewport (900px)
      and at full desktop (1440px) — header pill stays visible above,
      "Home" renders with clear space below it, no collision at either
      width. Mobile open state unaffected.
- [x] typecheck clean, build clean, pm2 restarted, all 6 routes 200.

### Still open
- rounds 13 through 21 are all still uncommitted
- rewrite design.md (Principles/Palette/Texture/Imagery sections still
  describe the pre-round-16 monochrome system, and now also the glass-nav
  / pill nav / marquee exceptions from rounds 18-20)
- regenerate og-image.png once the opening/home redesign settles
- stronger opening, typography/hierarchy pass, more scroll-reward motion
  (all carried over from round 16, untouched this round)
- full mobile horizontal-scroll audit (mobile_audit.py) not yet re-run
  against the round-20 header restructure — worth a pass before next
  round starts new work, low risk given 390px shots looked clean

## Round 22 — dither as page-transition wipe, kill the glow blob

User feedback: the radial gradient + dither behind bold type reads as
the single most common AI-generated-website look, asked for suggestions
to make the site distinctive enough for an awwwards-style showcase, then
said plainly they didn't follow most of the technical options and to
just build the one they could picture. From 6 proposed directions they
picked two: drop `.glow` outright, and turn the dither field itself into
the mechanism that performs page navigation — a bar sweeps across the
whole screen, the route swap happens invisibly the instant it's fully
covered, then the same sweep keeps travelling and uncovers the new page.
One gesture does both the hiding and the revealing, not a fade-then-swap.
The other 4 directions (type-born dither letterforms, halftone rosette
threshold, data-driven field from real GitHub/growth numbers, print-head
cursor trail) are parked, not rejected — worth resurfacing once this one
is live and the user has something concrete to react to instead of text.

- [x] Removed `.glow` entirely: the div in hero.tsx and the CSS rule in
      styles.css. It was the only usage site-wide (grepped for `\bglow\b`
      first). Confirmed visually gone in shots/v24/01_home_hero_no_glow.png
      — flat black around the hero photo, no blurred pink wash.
- [x] New packages/web/src/web/components/dither/dither-transition.tsx —
      `<DitherTransition />`, mounted once in app.tsx alongside the other
      globals. A capture-phase `document` click listener intercepts clicks
      on internal `<a href="/...">` links before wouter's own `Link`
      fires its bubble-phase handler (a bubble-phase attempt with an
      `e.defaultPrevented` guard never fired at all — wouter's `Link`
      already prevents-and-navigates from its own bubble handler first;
      capture phase + `stopPropagation()` was the actual fix, confirmed
      working after switching). State machine idle -> covering ->
      (navigate, invisibly, screen fully covered) -> revealing -> idle.
      Reuses the existing `DitherShader` unmodified, just bolder/graphic
      settings (`dot=3 levels=4 lift=1`) than the subtle opening plates,
      so the transition reads as its own distinct moment. `dprCap={1}`
      per the project's full-bleed-dither rule.
      Exclusions: reduced-motion, a transition already running, modifier-
      key/non-primary clicks, `_blank`/`download` links, non-root-relative
      or `//` hrefs, same-path clicks, and anything touching `/studio`
      (owner tool explicitly kept on instant nav, both directions).
- [x] app.tsx: imported and mounted `<DitherTransition />` next to
      `<ScrollTop />`, updated the top-of-file comment describing the
      dither mount points.
- [x] Functional verification (Playwright, `/opt/google/chrome/chrome`
      with the SwiftShader flags), 4 checks, all passed:
      1. `reduced_motion="reduce"` context — nav lands instantly, zero
         interception, no pageerrors.
      2. Rapid double-click mid-transition (`/work` then force-click
         `/interests`) — second click correctly swallowed by the
         `phase !== "idle"` guard, no stuck overlay, final url `/work`,
         exactly one idle->covering->navigate->revealing->idle cycle.
      3. Mobile (390px) hamburger takeover — clicking a link inside the
         full-screen overlay (had to scope the selector to `nav ul
         a[href=...]`, a first attempt matched the hidden desktop
         `nav-link` instead and hung on "element not visible") also
         triggers the wipe and lands on the right route, no pageerrors.
      4. `/elsewhere`'s `mailto:` links keep their real href, untouched
         by the interceptor.
      Debug-only `window.__ditherLog` timestamp instrumentation (added
      mid-session to prove event *order* is correct despite this
      sandbox's SwiftShader+CDP overhead making absolute durations
      unreliable — a single `.click()` call was measured taking 2.6s of
      real wall-clock time here) was removed afterward; typecheck and
      build re-confirmed clean with it gone.
- [x] typecheck clean, build clean (same pre-existing >500kB chunk
      warning, not new), pm2 restarted, all 6 routes 200.
- [x] Re-ran the mobile horizontal-scroll audit since this round touched
      global app-level chrome (`app.tsx`) wrapping every route:
      `scrollWidth === 390` on all 6 routes, zero tiny/small-tap flags.
      The listed "overflow" entries are the same pre-existing intentional
      ones as round 20's baseline (marquee track, contribution-graph
      horizontal scroll container, a decorative svg on /writing) — no
      new regression.
- [x] Final screenshots in shots/v24/: home hero with `.glow` confirmed
      gone, a mid-wipe frame (bold halftone duotone sweep, distinct from
      the subtle opening-plate texture), and the landed `/work` page
      post-transition.

### Still open
- rounds 13 through 22 are all still uncommitted
- rewrite design.md — now also needs to drop the `.glow` description and
  document the new transition wipe, on top of the pre-existing glass-nav
  / pill-nav / marquee backlog from rounds 18-20
- the other 4 proposed uniqueness directions (type-born dither
  letterforms, halftone rosette threshold, data-driven field from real
  GitHub/growth numbers, print-head cursor trail) — parked, worth
  revisiting with the user now that they have this one live to react to
- regenerate og-image.png once the opening/home redesign settles
- stronger opening, typography/hierarchy pass, more scroll-reward motion
  (carried over from round 16, untouched this round)

## Round 23 — status.sh terminal card beside the portrait

> **Superseded in round 24.** User's reaction on delivery: "To be very
> honest I don't like this at all and I want to change this entirely."
> `terminal-card.tsx` and every hookup below were deleted the same
> round — nothing described here is in the codebase anymore. Left in
> place as a record of what was tried and rejected, not as a current
> description of the site. See round 24 for what replaced it.

User feedback: the transition wipe landed well, but the home page itself
still feels generic — asked for a second, smaller element near the
avatar with real design care, specifically a terminal-style thing built
from actual data, calling it experimentation. Asked which fields to
read and confirmed: profile fields only (whoami/role/location/focus,
no external API), classic type-out boot-sequence animation that loops,
tucked as a small floating card beside/behind the photo, medium
prominence — a real second focal point, not a footnote.

- [x] New packages/web/src/web/components/terminal-card.tsx —
      `<TerminalCard />`. Real data only, sourced from `profile` (never
      DB-overridden, so always the compiled defaults): `whoami` ->
      profile.name, `role --current` -> statusLabel + company,
      `location` -> profile.location, `focus` -> profile.focus. A fifth
      line, `uptime --since`, is computed client-side from
      `profile.since` against the actual current time and ticks a real
      second via `setInterval`, gracefully omitted if the date fails to
      parse (`Number.isNaN` guard) rather than showing garbage.
      Boot-sequence animation: an async `while(alive)` driver types each
      line's prompt one character at a time (26ms/char), reveals its
      output, pauses, moves to the next line, then holds on the live
      uptime line for ~5.2s before clearing and looping — built as one
      cancellable async loop (`alive` flag) rather than chained timeouts,
      matching how easy it needs to be to reason about cleanup on
      unmount. `useReducedMotion` skips the type-out and the cursor
      blink entirely and renders the finished state directly; the
      uptime seconds still tick under reduced motion, since a live
      number is data refreshing, not a decorative animation — same
      distinction the project already draws elsewhere. Cursor blink is a
      new `.term-cursor` class (steps(1) blink, disabled again in the
      site's existing `prefers-reduced-motion` block as a second line of
      defense). Whole card is `aria-hidden="true"` — decorative, not
      informational, doesn't need to be in the a11y tree, doesn't
      announce mid-typing on a live region.
- [x] hero.tsx: wrapped the photo stack and the new card in one
      `relative` container inside the existing portrait grid cell.
      Mobile (below md): terminal renders in flow, centered, same
      `max-w-[15.5rem]` cap as the photo stack, stacked directly under
      it — no floating/overlap, since the grid's dead gutter column
      between the copy block and the portrait only exists at md+, and a
      negative offset on a narrow phone viewport would either collide
      with the photo or run off-screen. md+: `absolute`, `top-full`
      pulled up `-mt-7` so it overlaps only the bottom 28px of the photo
      (a deliberate small "peeking from behind" overlap, not burying the
      photo), shifted `left-[-4.25rem]` into the grid's existing empty
      column between the copy block (ends col 7) and the portrait
      (starts col 9) — computed that gutter at ~136px wide at the
      site's 1120px content cap, so a 196px-wide card offset 68px left
      sits entirely inside it, never touching the headline column.
      `-rotate-3` for a loose, physical "note" feel, matching the photo
      stack's own tilt language.
- [x] styles.css: added `@keyframes term-blink` + `.term-cursor`, and
      disabled it inside the existing `prefers-reduced-motion` block
      alongside `.grain::before` and `.marquee-track`.
- [x] typecheck clean, build clean (same pre-existing >500kB chunk
      warning), pm2 restarted, `/` still 200.
- [x] Verified with Playwright (`/opt/google/chrome/chrome`,
      SwiftShader flags), zero `pageerror`s in every context:
      - Desktop 1440: card renders bottom-left of the photo, correct
        rotation, all 4 lines + live uptime line visible, no collision
        with the meta row or button row beneath it (shots/v25/01-03).
      - Mobile 390: stacks cleanly below the photo, full width match,
        `scrollWidth` still 390, no overflow (shots/v25/04, 06).
      - `reduced_motion="reduce"`: renders the fully-typed state
        immediately, no rotation/opacity pop, cursor present but not
        blinking (shots/v25/05).
      - Re-ran the full mobile horizontal-scroll audit
        (`mobile_audit.py`) since this changes the home hero: all 6
        routes still `scrollWidth === 390`, zero tiny/small-tap flags,
        same pre-existing intentional overflow entries (marquee,
        contribution graph, one decorative svg) as every prior round.
- [x] Confirmed the live uptime line actually ticks in real time across
      screenshots taken ~1.2s apart (36s -> 39s), and that the value is
      computed from the real `profile.since` date, not a placeholder.

### Still open
- rounds 13 through 23 are all still uncommitted
- rewrite design.md — now also needs the terminal card and its
  `.term-cursor` rule, on top of the `.glow`-removal and glass-nav /
  pill-nav / marquee backlog from rounds 18-22
- the other 4 proposed uniqueness directions from round 22 (type-born
  dither letterforms, halftone rosette threshold, data-driven field from
  real GitHub/growth numbers, print-head cursor trail) — still parked
- possible follow-up the user may want next: swap or add a line in the
  terminal that pulls from the GitHub overview endpoint already fetched
  elsewhere on the site (public repos / stars / streak), since that data
  is already live-fetched for the Work page and wasn't in scope for this
  round only because the user asked for profile fields first
- regenerate og-image.png once the opening/home redesign settles
- stronger opening, typography/hierarchy pass, more scroll-reward motion
  (carried over from round 16, untouched this round)

## Round 24 — the terminal *is* the headline, not an accessory beside it

User rejected round 23 outright ("I don't like this at all and I want
to change this entirely"). New instructions: kill the small terminal
card beside the photo entirely; instead put the name and one-liner
*inside* a terminal, replacing the plain headline; theme it pink like
the rest of the site, not macOS ("don't use the Mac thing" — no
three-dot traffic lights); make it read like a customized/riced Linux
terminal, not a generic bordered code block.

- [x] Deleted `terminal-card.tsx` outright.
- [x] New `components/hero-terminal.tsx` — `<HeroTerminal />`. No
      traffic-light dots. Instead: a 3px solid pink gradient bar across
      the top of the card (the tiling-WM "focused window" border look),
      and a titlebar row below it with a `SquareTerminal` icon +
      `aryan@runable:~` on the left, a fake `zsh — 120×32` dimensions
      tag on the right. Body: pink border + layered box-shadow
      (including a soft outer glow), `var(--ink-2)` background, a very
      quiet CRT scanline overlay (`repeating-linear-gradient`, opacity
      0.05, `mix-blend-overlay`, `aria-hidden`).
      Content, typed once (not looped, since this is primary hero
      content now, not decorative flair): fake prompt + `whoami` ->
      real `<h1>{name}</h1>` (big, `display-tight`, white with a pink
      glow) -> fake prompt + `cat mission.txt` -> real `<p>` with the
      two positioning lines -> a permanent idle prompt with a blinking
      pink block cursor. The `<h1>`/`<p>` are always in the DOM with
      real text; only their CSS opacity is tied to reveal progress, so
      a screen reader or crawler gets the actual heading regardless of
      animation state — the two typed commands themselves are
      `aria-hidden`, decorative flourish around real content, not the
      other way round. `useReducedMotion` skips straight to the fully
      revealed end state, cursor present but static.
- [x] hero.tsx: removed the `TerminalCard` import/usage beside the
      photo (reverted to plain `<PhotoStack />`, no wrapper). Replaced
      the old `<h1>` + positioning `<p>` block with a single
      `<HeroTerminal name={profile.name} positioning={positioning} />`.
- [x] **Bug found and fixed, not just papered over**: on first load the
      typed `whoami` command got stuck after one character and never
      progressed — `<h1>`/`<p>` stayed at opacity 0 forever. Root cause
      traced (via temporary debug logging, since removed) to the root
      `.env` carrying `NODE_ENV=development` for the bun server's own
      runtime, which `vite.config.ts` was blindly copying into
      `process.env` during `vite build` — clobbering Vite's own
      production designation and shipping a development React bundle
      (Strict Mode's double-invoked mount/cleanup/remount included)
      even after a clean production build. Fixed by excluding
      `NODE_ENV` specifically from that copy in `vite.config.ts`, every
      other root env var still passes through untouched. Also rewrote
      `useTyped` to restart cleanly from zero on any effect re-run
      instead of guarding with a ref that blocks a restart — idiomatic
      and Strict-Mode-safe regardless, not just a workaround for this
      one bug.
- [x] Mobile audit caught the titlebar text (`aryan@runable:~` /
      `zsh — 120×32`) at 10.56px/9.6px, under the site's 11px floor —
      bumped both to `text-[0.7rem]` (11.2px). Re-ran the audit clean.
- [x] typecheck clean, build clean, pm2 restarted, all 6 routes 200.
- [x] Verified with Playwright (`/opt/google/chrome/chrome`,
      SwiftShader flags), zero `pageerror`s:
      - Desktop 1440: typed sequence genuinely progresses character by
        character (confirmed via live polling during typing, not just
        an end-state screenshot), both `h1` and the positioning
        paragraph reach `opacity: 1`, idle cursor blinks after
        (shots/v27/desktop_final.png).
      - `reduced_motion="reduce"`: both outputs at `opacity: 1`
        immediately, cursor present but `animationName: none`
        (shots/v27/desktop_reduced.png).
      - Mobile 390: `scrollWidth === 390`, zero tiny/small-tap flags
        after the titlebar font fix, card fits cleanly under the nav
        with no overflow (shots/v27/mobile_hero_viewport.png).
      - Full mobile horizontal-scroll audit re-run across all 6 routes:
        same pre-existing intentional marquee overflow as every prior
        round, nothing new from this component.

### Still open
- rounds 13 through 24 are all still uncommitted
- the pink "riced Linux terminal" visual direction itself has not been
  shown to the user yet — round 23's whole concept was rejected once
  already this session, so worth getting a direct reaction to the look
  (separate from "does it work") before treating this round as settled
- rewrite design.md — now also needs `hero-terminal.tsx` replacing the
  old plain headline, on top of the `.glow`-removal / glass-nav /
  pill-nav / marquee / transition-wipe backlog from rounds 18-23
- regenerate og-image.png once the opening/home redesign settles
- stronger opening, typography/hierarchy pass, more scroll-reward motion
  (carried over from round 16, untouched this round)
