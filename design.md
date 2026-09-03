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
   between panels, never by rounded cards or shadows.
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

## Imagery

- The portrait is `grayscale(1)` at rest and `grayscale(0)` on hover, with a
  0.7s transition and a label that changes to "In colour". It is a button, so
  it also works on touch and keyboard.
- Film stills and posters follow the same rule, so the whole page can be brought
  into colour a piece at a time.

## Content model

Compiled defaults live in `config/content.ts` and `config/socials.ts`. The
`content` table stores per block JSON overrides written from `/studio`, and
`context/content.tsx` merges them over the defaults one block at a time, so a
malformed block can only break itself. Every component reads `useContent()`.

Adding a social link is one object in the socials block: `id`, `label`,
`handle`, `url`, `icon` (a key in `config/social-icons.ts`), plus optional
`note`, `wide` and `featured`.

## Auth

Single owner, no user table. `ADMIN_PASSWORD` from the root `.env` is exchanged
for an HMAC signed token with a 12 hour TTL, stored in localStorage and sent as
`authorization: Bearer`. Every write procedure sits on the `adminOnly` base.

## Live data

- `letterboxd.recent` parses the public RSS feed. Profile HTML is 403 for bots,
  so favourite films are stored content, not scraped.
- `github.contributions` reads a public mirror of the contribution calendar and
  derives totals and streaks. `github.overview` reads the REST API.
- Last.fm has no API integration. The site is 406 to scrapers, so music is two
  links rather than a broken widget.
- All feeds fail soft: an `ok: false` payload renders a link to the source
  instead of an error.
