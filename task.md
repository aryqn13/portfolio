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

## Notes — carried forward
- **Port 4200 is pm2 serving the BUILT output** (`bun run start`). Code changes
  are invisible until `bun run build`. `bun run dev` is plain vite on 5173.
- `mb drag` is too synthetic for motion's pan session; dispatch PointerEvents
  by hand if the deck needs testing again.
- deck order check: compare `img.src`, not `aria-label` ("photo {depth+1}"
  reads the same whatever the order).
- lint broken pre-existing (mobile `_layout.tsx`) — use typecheck + build.
- oRPC payloads wrap in {"json":{...}}; `content.save` takes a JSON *string*.
