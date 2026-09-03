import { useState } from "react";
import { Loader2, PenLine, ArrowUpRight } from "lucide-react";
import { Section } from "../section";
import { Reveal } from "../reveal";
import { useGuestbook, useSignGuestbook } from "../../queries/guestbook";
import { useContent } from "../../context/content";

const fmt = (date: Date | string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export function Guestbook() {
  const entries = useGuestbook();
  const sign = useSignGuestbook();
  const { guestbookIntro } = useContent();

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || message.trim().length < 2) return;
    sign.mutate(
      {
        name: name.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
      },
      {
        onSuccess: () => {
          setMessage("");
          setLink("");
          setDone(true);
        },
      },
    );
  };

  const inputStyle = {
    background: "var(--ink)",
    borderColor: "var(--edge)",
    color: "var(--white)",
  };
  const inputClass =
    "mt-2 w-full border px-3 py-2.5 font-mono text-sm outline-none transition-colors focus:border-[var(--edge-hi)]";

  return (
    <Section
      id="guestbook"
      reel="02"
      slug="Guestbook"
      title="Sign the print."
      lead={guestbookIntro}
    >
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <form
              onSubmit={submit}
              className="border p-5 md:p-6"
              style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
            >
              <label className="slug block" htmlFor="gb-name">
                Name
              </label>
              <input
                id="gb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Who is visiting"
                className={inputClass}
                style={inputStyle}
              />

              <label className="slug mt-5 block" htmlFor="gb-message">
                Message
              </label>
              <textarea
                id="gb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={280}
                rows={4}
                placeholder="Say something worth keeping"
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
              <p className="slug mt-1.5 text-right">{message.length}/280</p>

              <label className="slug mt-3 block" htmlFor="gb-link">
                Link (optional)
              </label>
              <input
                id="gb-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                maxLength={120}
                placeholder="yoursite.com"
                className={inputClass}
                style={inputStyle}
              />

              <button
                type="submit"
                disabled={
                  sign.isPending || !name.trim() || message.trim().length < 2
                }
                className="slug mt-6 flex w-full items-center justify-center gap-2 border px-4 py-3 transition-colors disabled:opacity-40"
                style={{
                  borderColor: "var(--edge-hi)",
                  color: "var(--white)",
                  background: "var(--ink-3)",
                }}
              >
                {sign.isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Signing
                  </>
                ) : (
                  <>
                    <PenLine size={13} /> Sign the guestbook
                  </>
                )}
              </button>

              {sign.isError ? (
                <p className="mt-3 text-sm" style={{ color: "var(--silver)" }}>
                  {sign.error instanceof Error
                    ? sign.error.message
                    : "Could not post that. Try again."}
                </p>
              ) : null}
              {done && !sign.isPending && !sign.isError ? (
                <p className="mt-3 text-sm" style={{ color: "var(--white)" }}>
                  Signed. Thanks for stopping by.
                </p>
              ) : null}
            </form>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          {entries.isLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse"
                  style={{ background: "var(--ink-2)" }}
                />
              ))}
            </div>
          ) : !entries.data?.length ? (
            <Reveal>
              <div
                className="flex h-full min-h-[12rem] items-center justify-center border p-8 text-center"
                style={{ borderColor: "var(--edge)" }}
              >
                <p className="italic" style={{ color: "var(--grey-hi)" }}>
                  Nobody has signed yet. First frame is yours.
                </p>
              </div>
            </Reveal>
          ) : (
            <ul className="space-y-px">
              {entries.data.map((entry, i) => (
                <li key={entry.id}>
                  <Reveal delay={Math.min(i, 6) * 0.03}>
                    <div className="p-5" style={{ background: "var(--ink-2)" }}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div className="flex items-baseline gap-3">
                          <span
                            className="display text-lg"
                            style={{ color: "var(--white)" }}
                          >
                            {entry.name}
                          </span>
                          {entry.link ? (
                            <a
                              href={
                                entry.link.startsWith("http")
                                  ? entry.link
                                  : `https://${entry.link}`
                              }
                              target="_blank"
                              rel="noreferrer nofollow"
                              className="slug inline-flex items-center gap-1"
                              style={{ color: "var(--silver)" }}
                            >
                              link <ArrowUpRight size={11} />
                            </a>
                          ) : null}
                        </div>
                        <span className="slug">{fmt(entry.createdAt)}</span>
                      </div>
                      <p
                        className="mt-2.5 whitespace-pre-line"
                        style={{ color: "var(--silver)" }}
                      >
                        {entry.message}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Section>
  );
}
