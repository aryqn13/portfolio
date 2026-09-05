/**
 * ─────────────────────────────────────────────────────────────
 *  SOCIALS. One file, one object per link.
 * ─────────────────────────────────────────────────────────────
 *
 *  To add one, append an object below (or edit the socials block in /studio,
 *  which overrides this list at runtime):
 *
 *    {
 *      id: "threads",
 *      label: "Threads",
 *      handle: "@aryqn",
 *      url: "https://...",
 *      icon: "threads",        // key from ICONS in ./social-icons.ts
 *      note: "shitposting",
 *      featured: true,         // also shown in the compact header row
 *    }
 *
 *  If the icon key is missing, add it once to ICONS in ./social-icons.ts.
 */

export interface Social {
  id: string;
  label: string;
  handle: string;
  url: string;
  icon: string;
  note?: string;
  featured?: boolean;
}

export const defaultSocials: Social[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "aryqn13",
    url: "https://github.com/aryqn13",
    icon: "github",
    note: "Engines, backends and papers rebuilt from scratch",
    featured: true,
  },
  {
    id: "x",
    label: "X",
    handle: "@aryqn_13",
    url: "https://x.com/aryqn_13",
    icon: "x",
    note: "Growth notes and half formed takes",
    featured: true,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "in/aryqn",
    url: "https://linkedin.com/in/aryqn",
    icon: "linkedin",
    note: "The professional cut",
    featured: true,
  },
  {
    id: "letterboxd",
    label: "Letterboxd",
    handle: "aryqn13",
    url: "https://letterboxd.com/aryqn13/",
    icon: "letterboxd",
    note: "Everything I watch, logged and over analysed",
    featured: true,
  },
  {
    id: "lastfm",
    label: "Last.fm",
    handle: "aryan_91",
    url: "https://www.last.fm/user/aryan_91",
    icon: "lastfm",
    note: "The listening record I cannot edit",
    featured: true,
  },
  {
    id: "spotify",
    label: "Spotify",
    handle: "Listen along",
    url: "https://open.spotify.com/user/vk7vpuwhgmtqd1sb4ees0gx8q?si=c3fe5509351d453e",
    icon: "spotify",
    note: "Playlists, mostly hip hop and film scores",
    featured: true,
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "run.totheotherside",
    url: "https://instagram.com/run.totheotherside",
    icon: "instagram",
    note: "Photos, gigs, Bengaluru",
    featured: true,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    handle: "aryqn13",
    url: "https://pinterest.com/aryqn13",
    icon: "pinterest",
    note: "Frames, type, interiors, moodboards",
  },
  {
    id: "substack",
    label: "Substack",
    handle: "@aryqn",
    url: "https://substack.com/@aryqn",
    icon: "substack",
    note: "Longer thinking, sent to inboxes",
  },
  {
    id: "medium",
    label: "Medium",
    handle: "@aryangrajput13",
    url: "https://medium.com/@aryangrajput13",
    icon: "medium",
    note: "Older technical writing",
  },
  {
    id: "email",
    label: "Email",
    handle: "aryangrajput13@gmail.com",
    url: "mailto:aryangrajput13@gmail.com",
    icon: "mail",
    note: "The fastest way to reach me",
    featured: true,
  },
];
