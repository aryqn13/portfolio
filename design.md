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
   between panels, never by rounded cards or shadows. One deliberate exception:
   the home page photo deck is a 22px radius, because it has to read as a
   physical stack of prints rather than another panel.
4. **Motion is one gesture.** Everything enters once, upward, on the same easing
   curve. Nothing loops except the film grain.
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

## Type

- **Display**: Archivo 700 (`.display`) and 800 (`.display-tight`), tracking
  `-0.035em` to `-0.05em`, line height 0.9 to 0.98. Used for the name, page
  titles, section headlines and nav items.
- **Body**: Tinos, 1.125rem, line height 1.72, max 70ch. Serif body against a
  grotesque display is what stops the page reading like a dashboard.
- **Labels**: Geist Mono, 0.6875rem, uppercase, tracking 0.2em (`.slug`). Every
  index number, tag, meta line and button label.

## Texture

- `.grain` is a fixed fractal noise layer at 7.5% opacity, stepped in five
  frames over six seconds. It sits above the content and below the badge.
- `.vignette` is a radial darkening from 42% outward, which keeps attention
  centred without a border.
- `.glow` is a single 130px blurred white wash at 4.5% opacity, used once on the
  home hero.
- Both texture layers are disabled under `prefers-reduced-motion`.

## Structure

| Page         | Route        | Contents                                          |
| ------------ | ------------ | ------------------------------------------------- |
| Home         | `/`          | Hero, bio in full, index of the other pages       |
| Work         | `/work`      | Contributions graph, experience, projects, toolkit |
| Interests    | `/interests` | Favourite films, live Letterboxd, music links     |
| Writing      | `/writing`   | Substack and Medium panels                        |
| Elsewhere    | `/elsewhere` | Socials grid, guestbook, contact                  |
| Studio       | `/studio`    | Owner only content editor                         |

The GitHub contributions graph deliberately does not appear on the home page.
Every page ends with a "Next" link, so the site reads as a sequence.

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

Photographs uploaded from the studio go to Tigris over the S3 API. The browser
never sends bytes through the API server: `upload.presign` (owner only, images
only, 8MB cap) returns a presigned PUT, the file goes straight to the bucket,
and the block stores `/api/files/<key>`. That path is a small streaming Hono
route which reads the object back and caches it hard, so stored content never
holds a presigned URL that would expire a week later.

## Live data

- `letterboxd.recent` parses the public RSS feed. Profile HTML is 403 for bots,
  so favourite films are stored content, not scraped.
- `github.contributions` reads a public mirror of the contribution calendar and
  derives totals and streaks. `github.overview` reads the REST API.
- Last.fm has no API integration. The site is 406 to scrapers, so music is two
  links rather than a broken widget.
- All feeds fail soft: an `ok: false` payload renders a link to the source
  instead of an error.
