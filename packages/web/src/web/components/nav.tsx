import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "motion/react";
import { pages } from "../config/content";
import { useContent } from "../context/content";
import { resolveIcon } from "../config/social-icons";

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { profile, socials } = useContent();

  // Close on route change and on escape.
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const current = pages.find((p) => p.path === location);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-4 sm:px-8"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6,6,6,0.92), rgba(6,6,6,0))",
          }}
        >
          <Link
            to="/"
            className="display text-lg tracking-tight text-white transition-opacity hover:opacity-70"
          >
            Aryan
          </Link>

          <div className="flex items-center gap-5">
            <span className="slug hidden sm:inline">
              {current ? `${current.index} / ${current.label}` : "Studio"}
            </span>

            {/* Hamburger. Two rules that become an X. */}
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="group relative flex h-10 w-10 items-center justify-center border transition-colors"
              style={{
                borderColor: open ? "var(--edge-hi)" : "var(--edge)",
                background: open ? "var(--ink-3)" : "transparent",
              }}
            >
              <span className="relative block h-3 w-5">
                <motion.span
                  className="absolute left-0 block h-px w-full"
                  style={{ background: "var(--white)" }}
                  animate={open ? { top: 6, rotate: 45 } : { top: 2, rotate: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                />
                <motion.span
                  className="absolute left-0 block h-px w-full"
                  style={{ background: "var(--white)" }}
                  animate={
                    open ? { top: 6, rotate: -45 } : { top: 10, rotate: 0 }
                  }
                  transition={{ duration: 0.35, ease: EASE }}
                />
              </span>
            </button>
          </div>
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
                background: "rgba(6,6,6,0.94)",
                backdropFilter: "blur(18px)",
              }}
            />

            <motion.nav
              className="relative mx-auto flex h-full max-w-[1180px] flex-col justify-center px-5 sm:px-8"
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
                            color: active ? "var(--white)" : "var(--grey-hi)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--white)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = active
                              ? "var(--white)"
                              : "var(--grey-hi)";
                          }}
                        >
                          {page.label}
                        </span>
                        {active ? (
                          <span className="slug ml-auto self-center">
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
                          className="transition-colors duration-300 hover:!text-white"
                        >
                          <Icon size={17} />
                        </a>
                      );
                    })}
                </div>
                <a
                  href={`mailto:${profile.email}`}
                  className="slug link-underline"
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
