# Design system

A five page personal site, fully monochrome, built on the Runable managed
template (Bun, Vite, React, Hono, Drizzle). Everything visual is decided by
contrast, type weight and spacing. There is no hue anywhere in the interface.

## Principles

1. **No colour in the chrome.** Greys only. The single exception is imagery, and
   only on hover, which makes colour an event rather than decoration.
2. **Type does the shouting.** Archivo at 700/800 with tight negative tracking
   for anything large, Tinos (Times metrics) for reading, Geist Mono for labels.
3. **Hairlines, not boxes.** Blocks are separated by 1px rules and 1px gaps
   between panels, never by shadows or fills that read as chrome. Corners are
   softened, not bubbled: 6 to 12px, enough to take the blade off an edge and
   no more. See "Radius" below.
4. **Motion is one gesture.** Everything enters once, upward, on the same easing
   curve. Nothing loops except the backdrop dither and the film grain.
5. **No em dashes.** Anywhere. Commas, full stops, or the word "to".

## Palette

| Token       | Value     | Use                                  |
| ----------- | --------- | ------------------------------------ |
| `--ink`     | `#060606` | Page background, grainy near black   |
| `--ink-2`   | `#0c0c0c` | Panels and cards                     |
| `--ink-3`   | `#131313` | Panel hover, inputs, active nav      |
| `--ink-4`   | `#1c1c1c` | Badges                               |
| `--edge`    | `#262626` | Default border                       |
| `--edge-hi` | `#3a3a3a` | Hover border, focus ring             |
| `--grey`    | `#6f6f6f` | Mono labels, icons at rest           |
| `--grey-hi` | `#8f8f8f` | Inactive nav items, secondary icons  |
| `--silver`  | `#b4b4b4` | Body copy                            |
| `--white`   | `#fafafa` | Headlines, active state, hover state  |

The contributions graph uses five steps between `--ink-3` and `--white`, which
is the only place a scale of greys carries data.

### The accent

| Token        | Value     | Use                              |
| ------------ | --------- | -------------------------------- |
| `--mark`     | `#5b8cff` | Marked phrases, icon hover, thumbnail hover border |
| `--mark-dim` | `#3f6bd6` | Reserved, unused so far          |

One cool electric blue, and it is the **only** hue in the system besides the
rule that photographs and posters sit greyscale and go colour on hover. It was
added deliberately, not decoratively: an all-grey page gives the eye nothing to
land on, so the blue marks the handful of phrases that should be read first.

Where it is permitted:

- marked phrases in prose (see below)
- a skill tile's icon on hover
- a proof-of-work thumbnail's border on hover

Where it is not: surfaces, default borders, headings, nav, buttons, any block
of colour. If more than a few words on a screen are blue, it has been overused
— one or two marks per paragraph is the ceiling.

**Careful:** the shadcn `--accent` token was already taken (it maps to
`--ink-4`, used by template UI components). The blue is `--mark`. Do not
repoint `--accent`.

### Marked phrases

Wrap a phrase in `**double asterisks**` in any content string and
`components/marked.tsx` renders it in `--mark` at the same weight and size, so
the sentence keeps its rhythm. Colour only: no background, no bold.

This is a typing convention rather than a code change on purpose — content is
edited from `/studio`, so the owner can add and remove highlights without
touching the codebase. Currently parsed in: `bio`, experience `points`,
project blurbs, and `sharpening`.

## Type

- **Display**: Archivo 700 (`.display`) and 800 (`.display-tight`), tracking
  `-0.035em` to `-0.05em`, line height 0.9 to 0.98. Used for the name, page
  titles, section headlines and nav items.
- **Body**: Tinos, 1.125rem, line height 1.72, max 70ch. Serif body against a
  grotesque display is what stops the page reading like a dashboard.
- **Labels**: Geist Mono, 0.6875rem, uppercase, tracking 0.2em (`.slug`). Every
  index number, tag, meta line and button label.

## Radius

Corners used to be near zero by design. They now carry a small curve, because
at this density a hard 1px corner on every tile read as unfinished rather than
severe. Four tokens, in `styles.css`, and nothing should invent a fifth:

| Token      | Value  | Use                                    |
| ---------- | ------ | -------------------------------------- |
| `--r-chip` | `6px`  | Tags, buttons, inputs, icon buttons    |
| `--r-tile` | `8px`  | Skill tiles, thumbnails, small cards   |
| `--r-card` | `12px` | Panels and full cards                  |
| `--r-img`  | `10px` | Image cards, posters, lightbox media   |

The shadcn `--radius` scale was raised to match (`6/8/12/16px`) so template
components do not fall out of step. The photo deck keeps its own `20px`, the one
documented exception, because it has to read as a physical print.

## Texture

Two layers, and the split matters. The dither backdrop is now the primary
texture; grain is a trace on top of it.

- **Dither plates.** `components/dither/dither-panel.tsx` is a WebGL2 shader
  bounded to a single block. The signal is drifting fbm plus a vertical falloff
  plus a soft dome that follows the pointer with a critically damped ease,
  quantised through a **Bayer 4x4** threshold sampled in device pixels, not UV,
  so the pattern never smears with layout. Settings are `dot 1`, `levels 6`,
  `lift 0.34`.

  **The rule is that the dither marks openings, and nothing else.** One plate
  behind the home page's opening block (`sections/hero.tsx`) and one behind
  every other page's masthead (`page-shell.tsx`). Body copy, cards and lists
  sit on clean ground.

  This replaced a single fixed full-viewport field, and the reason is worth
  keeping: a field that covers everything stops being a material and becomes
  wallpaper. It sat behind body copy it had nothing to do with, it could never
  be paused because it was always on screen, and it flattened the difference
  between the parts of a page meant to be loud and the parts meant to be quiet.
  - **It is edge masked, not cropped**, which is what keeps it from breaking
    the "hairlines, not boxes" rule. The mask is strongest at the top left,
    where the index, label and headline sit, and dissolves to nothing before
    the panel's edges, so there is no visible boundary. The rounded corners are
    only a fallback for a browser without mask support. No border, no fill.
  - Plates are positioned with negative insets so the field is established
    slightly before the headline and gone before the first card.
  - **Cost control, because a fragment shader is the most expensive thing on
    the site.** DPR is capped, and plates override the cap to
    **1** (`dprCap` prop): cost is quadratic in DPR, and six
    quantised levels of near black gain nothing from a second sample per CSS
    pixel. Redraws are capped at **30fps** (`fps` prop), which is invisible on
    a field drifting at 0.06x real time, and the pointer follow is corrected
    for elapsed time so it feels identical at any ceiling. The noise is
    multiply-only rather than `fract(sin(dot(p, k)))`, three octaves not four,
    and the pointer warp reuses the field instead of evaluating a third fbm on
    every fragment for a dome that is ~0 almost everywhere. An
    `IntersectionObserver` pauses offscreen and `prefers-reduced-motion`
    freezes both time and the dome.
  - Because a plate scrolls out of view, unlike the `fixed` layer it replaced,
    the shader's `IntersectionObserver` can now actually pause it. Nothing on
    the site renders GL once you are past the opening.
  - Smaller tiles keep the defaults (1.5 coarse pointer, 2 desktop), where the
    fill rate is small enough not to matter.
  - Cleanup must **never** call `loseContext()`. It kills the context
    permanently and is keyed to the canvas element, which React reuses across
    remounts, so every later mount renders black.
- **Grain** is a fixed fractal noise layer at **5%** opacity, stepped in five
  frames over six seconds, above content and below the badge. It carries the
  texture everywhere the dither does not, which is most of the page. The value
  has moved twice and the history explains it: 7.5% when it was the only
  texture, 2.2% while a full screen dither covered everything and two competing
  noise fields read as mud, and 5% now that the dither is bounded to the
  openings. One line in `styles.css`.
- `.vignette` is a radial darkening from 42% outward, which keeps attention
  centred without a border.
- `.glow` is a single 130px blurred white wash at 4.5% opacity, used once on the
  home hero.
- Imagery can take the same treatment. `components/dither/dither-image.tsx`
  exports `DitherImage` (a full tile) and `DitherOverlay` (canvas only,
  `mix-blend-mode: overlay`, for laying over an existing `<img>` that already
  owns its own sizing and hover filter). The hero portrait uses the overlay at
  **0.12** opacity, which is deliberately at the edge of perception, and fades
  to zero on hover with the greyscale. Floyd-Steinberg is the only mode that
  survives a human face; the ordered modes are for flat fields.
  - **The working canvas is sized from the laid out box, never from
    `src.naturalWidth`.** This is a CPU dither on the main thread, and sizing
    it off the source meant a 4160x3110 photograph allocated a 12.9 million
    pixel canvas and diffused error across all of it to fill a 332px box. A
    dither cell below one device pixel is invisible by definition, so working
    above the displayed size is always waste. Capped at 1400px on the long
    side and never above the source.
  - Only the **top card** of the photo deck gets an overlay. The cards behind
    it show a few millimetres of edge and each overlay is a full dither pass.
- Grain, vignette and shader motion are all disabled or frozen under
  `prefers-reduced-motion`.

## Structure

| Page         | Route        | Contents                                          |
| ------------ | ------------ | ------------------------------------------------- |
| Home         | `/`          | Hero, short bio, capability, work preview, index  |
| Work         | `/work`      | Contributions graph, experience, projects, toolkit |
| Interests    | `/interests` | Favourite films, live Letterboxd, music links     |
| Writing      | `/writing`   | Substack and Medium panels                        |
| Elsewhere    | `/elsewhere` | Socials grid, guestbook, contact                  |
| Studio       | `/studio`    | Owner only content editor                         |

The GitHub contributions graph deliberately does not appear on the home page.
Every page ends with a "Next" link, so the site reads as a sequence.

### Footer

Every footer on the site carries the same three things: the credit line, every
social as a small icon, and the email plus the view count. `FooterSocials` in
`components/sections/previews.tsx` renders the icon row, and both footers
(`pages/home.tsx` and `components/page-shell.tsx`) use it, so a social added in
`/studio` appears everywhere at once. Icons only, no labels, `--grey` at rest
and white on hover, each wrapped in a 40px tap target via negative margin.

### The home page carries everything

The rule: nothing important should need a second click. A first-time visitor
should understand what this person does, what they can operate, and where they
have worked, without leaving `/`. So the home page runs:

| Reel | Section    | What it does                                       |
| ---- | ---------- | -------------------------------------------------- |
| 01   | Opening    | Name, positioning, status, CVs, portrait deck      |
| 02   | About      | The short bio, education, footnotes                |
| 03   | Capability | Skill logo grid, both columns, compact             |
| 04   | Work       | Real preview: recent three roles, then the projects |
| 05   | Index      | Interests, Writing, Elsewhere, each with a preview |

Work gets a *proper* preview because it is what someone hiring came for; it is
pulled out of the index list for that reason. The other three get light strips
under their index row — film posters, publication names, social icons — enough
to prove there is something behind the link without rebuilding the page.

`components/sections/previews.tsx` owns all of it. The previews read the same
content blocks the real pages do, so they cannot drift.

### Skills

`components/sections/skills-grid.tsx` renders both the home grid (`compact`)
and the `/work` toolkit from one component, so the two never disagree.

Icons resolve through `config/skill-icons.tsx`, keyed on the lowercased skill
name. Skills stay plain strings in the content model, which keeps `/studio` a
text editor and means a saved override can never break the grid — an unknown
skill falls back to a generic glyph and still renders.

Tech gets its real brand mark from `react-icons/si`. Growth work has no brand
marks to borrow, so it gets drawn monoline icons from `lucide-react`, which sit
at the same visual weight. One texture across the grid, not two. Note
`SiCss3` does not exist; HTML/CSS uses `SiHtml5`.

### One company, many roles

Two roles at the same employer used to print the company name twice, which read
as two unrelated jobs instead of a progression. `components/sections/work.tsx`
now groups **consecutive** entries that share a company: the name appears once
on the left with a role count and the combined span (start from the oldest role,
end from the newest), and each role's title, period and location sit on the
right against a vertical rail with a dot per role. A single-role group renders
exactly as it did before, so nothing else on the page moved.

The grouping happens **at render time, not in the content model.** `experience`
stays a flat newest-first list, which keeps `/studio` a plain JSON editor and
means a third role at the same company needs no code change at all.

### Proof of work

Each experience entry takes an optional `shots` array. They render as a
thumbnail strip under the bullets, greyscale at rest and colour on hover like
every other image on the site, and open full size in `components/lightbox.tsx`
with arrow-key and Escape support.

The lightbox is portalled to `document.body` at `z-[200]`, because the grain
(60) and vignette (55) overlays are `position: fixed` and would otherwise sit
on top of it.

Uploads happen in `/studio`. The experience block is edited as raw JSON, which
is hopeless for images, so `components/studio/shots-editor.tsx` sits above that
textarea and gives each job a visual strip; it reads and writes the same JSON
string, so the two editors can never disagree.

## Navigation

A fixed header with the wordmark, the current page index, and a hamburger that
animates two rules into an X. Opening it fades in a blurred full screen overlay
carrying the five pages at display scale, the featured socials, and the email
address. Escape closes it, route changes close it, and body scroll is locked
while it is open.

Every navigation starts at the top of the page. `components/scroll-top.tsx`
resets the window scroll on each wouter location change and sets
`history.scrollRestoration = "manual"`, because otherwise a click on the "Next"
link at the foot of one page lands you at the foot of the next one.

## Mobile

The phone is not a narrower desktop and the desktop is not a stretched phone.
Both are first class, and the rules that keep them that way:

**Nothing scrolls sideways.** `html` carries `overflow-x: clip` rather than
`hidden`, so the decorative glows can sit outside the column (they are placed
with negative offsets on purpose) without ever producing a horizontal scroll,
and nothing becomes a scroll container in the process. Anything genuinely wider
than the screen, like the contributions graph, lives in its own
`overflow-x-auto` and scrolls on its own terms.

**The header becomes a surface the moment anything moves.** Over the top of a
page the bar is a transparent gradient. Past `scrollY > 8` it switches to
`rgba(6,6,6,0.86)` with a 14px backdrop blur and an `--edge` bottom rule. On a
desktop the gradient alone was enough; on a phone the text column runs the full
width and the wordmark sat directly on top of body copy. The blur is the fix,
and it only appears when it is earning its keep.

**Every target is at least 40px.** Achieved with padding, never with larger
type: icon links are `-m-2.5 inline-flex h-10 w-10 items-center justify-center`,
inline and email links are `-my-2 py-2 min-h-10 inline-flex items-center`. The
negative margin cancels the visual effect, so the desktop layout is pixel
identical and the phone gets a hit area that a thumb can actually land on.

**Nothing is under 11px.** The contributions month labels were 9px, which is
below the point where a mono face resolves on a phone. There is no other
sub-11px text on the site and there should not be.

**Layout comes from the DOM order, not from reordering.** The hero is three grid
children so the portrait falls between the positioning lines and the status row
on a phone, and beside both on a desktop, without a single `order-*` utility.
Anything that needs a different sequence on mobile should be restructured the
same way.

**Verifying.** `mb` cannot hold a viewport, so mobile checks run through
Playwright against the installed Chrome. `audit/mobile_audit.py <width>` reports
document overflow, sub-11px text and sub-40px targets per route;
`audit/mobile_shots.py <dir>` captures each page in viewport steps with a pause
per step, because the sections reveal on scroll and a `full_page` screenshot
fires none of them and comes out empty.

## Imagery

- The portrait is `grayscale(1)` at rest and `grayscale(0)` on hover, with a
  0.7s transition and no label. The behaviour is left to be discovered rather
  than advertised. It is a button, so it also works on touch and keyboard.
- Film stills and posters follow the same rule, so the whole page can be brought
  into colour a piece at a time.

### Photo deck

`components/photo-stack.tsx` renders the `photos` block as a deck of prints
with a 20px radius, capped at 15.5rem wide on a phone and taking the hero's
right hand columns on a desktop. The card's height comes from the photograph
rather than from the layout, see below. Frames sit behind the top card,
rotated in opposite directions, so the depth is visible before anything is
touched.

**The drag is meant to feel like holding a print, not operating a control.** The
top card follows the pointer one to one in both axes and leans up to 11 degrees
the way it is pushed. Let go past 64px of travel, in any direction, or above a
velocity of 380, and it keeps its momentum and slides *underneath* the pile
while the print below rises to meet the hand. Let go short of that and it
settles back. Nothing is ever thrown off screen, because a card leaving the
frame is what made the old version feel mechanical.

This needs two layers per card, and the split is the whole trick:

- the **outer** element owns the card's slot in the deck, animating `y`,
  `scale`, `rotate`, `opacity` and `zIndex` from a `SLOTS` table whenever the
  order changes, on a `stiffness: 260, damping: 30, mass: 0.9` spring;
- the **inner** element owns the drag, with `dragSnapToOrigin`,
  `dragElastic={1}` and `dragMomentum={false}`.

Composing the two is what makes a released card travel diagonally down into the
back of the stack rather than teleporting there. The order lives in an
`order: number[]` where `order[0]` is the print on top, and sending one back
rotates it. Rotate the *live* order rather than the stored one: photos arrive
from the studio after the first render, so the stored array can still be a
stale length, and rotating a one-element array silently does nothing.

A click cycles the deck too, for touch and keyboard. Under
`prefers-reduced-motion` the drag is off and the click cross fades instead.

One photo renders as a single card with no deck furniture, so the mechanism only
announces itself when there is something to cycle through.

**The frame takes the shape of the photograph.** The card measures the front
photo's own proportions as the file loads and sets its `aspect-ratio` to match,
so the image fills it edge to edge (`object-cover`) with nothing cropped and no
empty bands. The ratio is clamped to 0.62 to 1.35 so a panorama or an extreme
vertical cannot wreck the hero grid, and it falls back to 4:5 until the file has
loaded. Consequence worth knowing: a square source gives a square card. If the
card should read tall, the photograph itself has to be tall.

This was arrived at the long way round, and every dead end is worth knowing:

- A *portrait* frame with `object-cover` crops a square source on the **sides**
  only, so `object-top` does nothing at all and the subject reads small and low
  with the whole background still in shot.
- Per-photo crop controls (a `focus` position and a `zoom` scale, tuned with
  sliders in the studio) framed the subject well but meant every upload landed
  wrong until someone tuned it, and the crop hid parts of the photograph the
  photograph was chosen for. Removed on purpose. Do not reintroduce a crop
  model without asking: fitting the whole image is the stated preference.
- A *square* frame is the worst of both. It reads as an avatar, not a print.
- A fixed 4:5 frame with `object-contain` crops nothing, but a square source
  then sits between two bands of empty card, which reads as a mistake. Fixing
  the frame and fixing the fit are the same wish: the frame has to move.

Hover does the colour shift only. The framing never moves.

**Placement.** The hero is three grid children rather than two columns: headline
block, portrait, meta block. On a desktop the portrait takes columns 9 to 12 and
spans both rows with `md:self-start`, so its top edge meets the `01 / Opening`
hairline and its height then follows the photograph rather than being
stretched. Floating it centred read as an accident, and stretching it to the
full column height forced a crop, so the top edge is the one thing that stays
locked to the grid. On a phone the same DOM order
puts it between the positioning lines and the status row, which is where a
portrait belongs on a narrow screen. Note that the deck root sizes itself with
`ml-auto`, not `justify-self-end`: the latter makes the grid item shrink to
content width, and since every card is absolutely positioned the deck collapses
to nothing.

**Growing the deck.** Uploads happen in `/studio`, under Photo deck. The picker
takes several images at once, sends each straight to Tigris with a presigned
PUT, and appends it to the block. Rows can be reordered, renamed and deleted,
and the first row is the card on top. Each row shows the whole file as a
thumbnail, which is what you want when identifying a photo; the card on the page
takes that file's own proportions anyway, so the two agree. Saving this block replaces it wholesale.
Files can also be committed to
`packages/web/public/images/` and referenced by path if a photo should live in
the repo.

## Content model

Compiled defaults live in `config/content.ts` and `config/socials.ts`. The
`content` table stores per block JSON overrides written from `/studio`, and
`context/content.tsx` merges them over the defaults one block at a time, so a
malformed block can only break itself. Every component reads `useContent()`.

Adding a social link is one object in the socials block: `id`, `label`,
`handle`, `url`, `icon` (a key in `config/social-icons.ts`), plus optional
`note` and `featured`. `featured` also puts the icon in the compact rows in the
nav overlay, the hero and the contact block.

### CVs

Order is meaning. `resumes[0]` is the main CV and everything after it is an
optional cut. There is deliberately no `primary` flag: a flag can hold two
primaries or none, whereas an ordered list cannot enter an invalid state, the
studio already has move up/down arrows, and it matches the photo deck where
`photos[0]` is the card on top. Reordering the rows is what promotes a CV.

The hierarchy is carried by weight, not by colour. In the hero the main CV is a
real bordered button next to "See the work"; the alternates sit on their own
line below behind an `Also` slug, dim label against a `--silver` link so the
line reads as label plus link rather than one flat mono string. On `/elsewhere`
the main CV is a full bordered panel badged `Main CV` in `--mark` with the label
at display size, and the alternates are quiet borderless rows under an "Also
available" slug. That badge is one of the few sanctioned uses of the blue.

Socials render as an index, not as cards. One hairline row per account holding
a number, the logo, the name, the handle, the note and an arrow, all on a single
baseline, so eleven accounts scan in one pass instead of filling a screen with
boxes. Rows tint to `--ink-2` on hover and the name nudges right by half a pixel
step. On a phone the note drops out and the handle moves under the name, which
keeps the row height honest. This is the "hairlines, not boxes" rule applied to
the one page that was breaking it.

## Auth

Single owner, no user table. `ADMIN_PASSWORD` from the root `.env` is exchanged
for an HMAC signed token with a 12 hour TTL, stored in localStorage and sent as
`authorization: Bearer`. Every write procedure sits on the `adminOnly` base.

## Storage

Photographs and CV PDFs uploaded from the studio go to Tigris over the S3 API.
The browser never sends bytes through the API server: `upload.presign` (owner
only) returns a presigned PUT, the file goes straight to the bucket, and the
block stores `/api/files/<key>`. That path is a small streaming Hono route
which reads the object back and caches it hard, so stored content never holds a
presigned URL that would expire a week later.

`presign` accepts images (png, jpeg, webp, avif, gif) and `application/pdf`,
and the key prefix follows the type: images land under `photos/`, PDFs under
`resumes/`. `/api/files/*` echoes back the stored `ContentType`, so a PDF
serves as a PDF with no special casing. Nothing else is accepted.

## Live data

- `letterboxd.recent` parses the public RSS feed. Profile HTML is 403 for bots,
  so favourite films are stored content, not scraped.
- `github.contributions` reads a public mirror of the contribution calendar and
  derives totals and streaks. `github.overview` reads the REST API.
- Last.fm has no API integration. The site is 406 to scrapers, so music is two
  links rather than a broken widget.
- All feeds fail soft: an `ok: false` payload renders a link to the source
  instead of an error.
