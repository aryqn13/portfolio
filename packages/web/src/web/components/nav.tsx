import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "motion/react";
import { pages } from "../config/content";
import { useContent } from "../context/content";
import { resolveIcon } from "../config/social-icons";

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  // The bar is transparent over the top of a page and becomes an opaque
  // surface the moment anything scrolls under it. Without this the wordmark
  // collides with body text on a phone, where the column runs full width.
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { profile, socials } = useContent();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change and on escape.
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // `overflow: hidden` alone does not reliably block touch scroll on iOS
  // Safari — the page can still rubber-band behind the fixed takeover, so by
  // the time it closes the site has silently scrolled and the header/hero
  // reads as broken. Locking the body to a fixed position at its current
  // offset, then restoring exactly that scroll position on close, is the
  // version that actually holds still on a phone.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { body } = document;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const current = pages.find((p) => p.path === location);

  return (
    <>
      {/*
        One floating island instead of a full-width strip: the whole bar —
        wordmark, links, hamburger — lives inside a single rounded glass
        card that sits clear of the viewport edges, with the page visible
        around it. The hamburger is always rendered now, at every width,
        alongside the pill links on desktop — a second, deliberate way
        into the same full-screen index. The thing that actually caused
        the old overlap was not two nav styles coexisting, it was the
        takeover having no top clearance of its own: its first list item
        rendered vertically centered and could land at the same height as
        the still-visible header. That is fixed at the takeover itself
        (`pt-24 sm:pt-28` + `overflow-y-auto` below), so showing the
        hamburger everywhere is safe again.
      */}
      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:top-5">
        <div
          className="glass-nav inline-flex items-center gap-1 rounded-full py-1.5 pl-4 pr-4 transition-[background,box-shadow] duration-300 sm:gap-1.5"
          style={
            scrolled
              ? {
                  background: "rgba(13,11,19,0.72)",
                  boxShadow:
                    "0 10px 34px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
                }
              : undefined
          }
        >
          <Link
            to="/"
            className="display -my-2 mr-1 inline-flex min-h-9 items-center py-2 text-base tracking-tight text-white transition-opacity hover:opacity-70 sm:mr-2 sm:text-lg"
          >
            Aryan
          </Link>

          {/*
            Each link carries a slash — the one piece of syntax on the whole
            site, a small nod to it being a developer's own address book —
            and the active one sits inside a pill that is a single shared
            element: motion's layoutId animates it sliding from wherever it
            was to wherever the route now is, instead of two pills cutting
            and popping.
          */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {pages.map((page) => {
              const active = page.path === location;
              return (
                <Link
                  key={page.path}
                  to={page.path}
                  className="nav-link relative -my-2 inline-flex min-h-9 items-center gap-[0.15em] rounded-full px-3.5 py-2 transition-colors"
                  style={{ color: active ? "var(--white)" : "var(--grey-hi)" }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = "var(--white)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = "var(--grey-hi)";
                  }}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(250,247,253,0.1)" }}
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  ) : null}
                  <span className="relative" style={{ color: active ? "var(--mark)" : "var(--grey)" }}>
                    /
                  </span>
                  <span className="relative">{page.label.toLowerCase()}</span>
                </Link>
              );
            })}
          </nav>

          {/* Same context, kept for the viewports the links above are
              hidden on: it still needs to say where you are on a phone. */}
          <span className="slug ml-2 hidden sm:inline md:hidden">
            {current ? `${current.index} / ${current.label}` : "Studio"}
          </span>

          {/* Hamburger. Present at every width now, including alongside the
              pill links on desktop — a second way into the full-screen
              index, not just a below-md fallback. Three lines morph into
              an X on open; hover just brightens them, no glow or fill of
              its own since it sits inside the glass pill's own border. */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="group relative ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300"
            style={{ background: open ? "rgba(250,247,253,0.1)" : "transparent" }}
            onMouseEnter={(e) => {
              if (open) return;
              e.currentTarget.style.background = "rgba(250,247,253,0.06)";
            }}
            onMouseLeave={(e) => {
              if (open) return;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span className="relative block h-4 w-4">
              {/* Top and bottom lines rotate to meet at centre and form
                  the X; the middle line just fades, which reads cleaner
                  at this size than folding three lines into two. */}
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full transition-colors group-hover:!bg-[var(--white)]"
                style={{ background: "var(--grey-hi)" }}
                animate={open ? { top: 7, rotate: 45 } : { top: 0, rotate: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full transition-colors group-hover:!bg-[var(--white)]"
                style={{ background: "var(--grey-hi)" }}
                animate={{ top: 7, opacity: open ? 0 : 1, scale: open ? 0.3 : 1 }}
                transition={{ duration: 0.2, ease: EASE }}
              />
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full transition-colors group-hover:!bg-[var(--white)]"
                style={{ background: "var(--grey-hi)" }}
                animate={open ? { top: 7, rotate: -45 } : { top: 14, rotate: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full"
              style={{
                background: "rgba(7,6,11,0.94)",
                backdropFilter: "blur(18px)",
              }}
            />

            <motion.nav
              className="relative mx-auto flex h-full max-w-[1180px] flex-col justify-center overflow-y-auto px-5 pt-24 pb-10 sm:px-8 sm:pt-28"
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <ul>
                {pages.map((page, i) => {
                  const active = page.path === location;
                  return (
                    <motion.li
                      key={page.path}
                      initial={{ y: 22, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.06 + i * 0.055,
                        ease: EASE,
                      }}
                    >
                      <Link
                        to={page.path}
                        className="group flex items-baseline gap-5 border-b py-4 sm:py-5"
                        style={{ borderColor: "var(--edge)" }}
                      >
                        <span className="slug w-8 shrink-0">{page.index}</span>
                        <span
                          className="display-tight text-[clamp(2.4rem,7vw,4.6rem)] transition-colors duration-300"
                          style={{
                            color: active ? "var(--mark)" : "var(--grey-hi)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = active
                              ? "var(--mark)"
                              : "var(--white)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = active
                              ? "var(--mark)"
                              : "var(--grey-hi)";
                          }}
                        >
                          {page.label}
                        </span>
                        {active ? (
                          <span className="slug ml-auto self-center" style={{ color: "var(--mark)" }}>
                            Current
                          </span>
                        ) : null}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div
                className="mt-10 flex flex-wrap items-center justify-between gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="flex flex-wrap items-center gap-5">
                  {socials
                    .filter((s) => s.featured)
                    .map((s) => {
                      const Icon = resolveIcon(s.icon);
                      return (
                        <a
                          key={s.id}
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={s.label}
                          title={s.label}
                          style={{ color: "var(--grey)" }}
                          className="-m-2.5 inline-flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:!text-white"
                        >
                          <Icon size={17} />
                        </a>
                      );
                    })}
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  className="slug link-underline -my-2 inline-flex min-h-10 items-center py-2 normal-case"
                  style={{ color: "var(--silver)" }}
                >
                  {profile.email}
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
