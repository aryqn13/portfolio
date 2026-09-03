import type { IconType } from "react-icons";
import {
  SiGithub,
  SiX,
  SiLetterboxd,
  SiLastdotfm,
  SiSpotify,
  SiInstagram,
  SiPinterest,
  SiSubstack,
  SiMedium,
  SiDiscord,
  SiReddit,
  SiYoutube,
  SiThreads,
  SiTelegram,
  SiSteam,
  SiGoodreads,
  SiSoundcloud,
  SiBandcamp,
  SiFigma,
  SiNotion,
  SiStrava,
  SiTiktok,
  SiBluesky,
} from "react-icons/si";
import { FaLinkedinIn } from "react-icons/fa6";
import { Mail, Link as LinkIcon, Globe, Rss } from "lucide-react";

/**
 * Icon registry. `icon` in socials.ts is a key here.
 * Adding a new platform = add one line. Unknown keys fall back to a link glyph.
 */
export const ICONS: Record<string, IconType> = {
  github: SiGithub,
  x: SiX,
  twitter: SiX,
  linkedin: FaLinkedinIn,
  letterboxd: SiLetterboxd,
  lastfm: SiLastdotfm,
  spotify: SiSpotify,
  instagram: SiInstagram,
  pinterest: SiPinterest,
  substack: SiSubstack,
  medium: SiMedium,
  discord: SiDiscord,
  reddit: SiReddit,
  youtube: SiYoutube,
  threads: SiThreads,
  telegram: SiTelegram,
  steam: SiSteam,
  goodreads: SiGoodreads,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  figma: SiFigma,
  notion: SiNotion,
  strava: SiStrava,
  tiktok: SiTiktok,
  bluesky: SiBluesky,
  mail: Mail as unknown as IconType,
  email: Mail as unknown as IconType,
  website: Globe as unknown as IconType,
  rss: Rss as unknown as IconType,
  link: LinkIcon as unknown as IconType,
};

export const resolveIcon = (key: string): IconType =>
  ICONS[key] ?? (LinkIcon as unknown as IconType);
