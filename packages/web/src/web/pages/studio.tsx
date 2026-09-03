import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  RotateCcw,
  Save,
} from "lucide-react";
import { client, orpc } from "../lib/api";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "../lib/admin-token";
import { defaultContent } from "../config/content";
import { defaultSocials } from "../config/socials";
import { useContent } from "../context/content";
import {
  Field,
  RecordList,
  StringList,
  TextArea,
  TextInput,
  inputClass,
  inputStyle,
} from "../components/studio/fields";
import type { FieldDef } from "../components/studio/fields";

type BlockKey =
  | "profile"
  | "positioning"
  | "bio"
  | "quickFacts"
  | "education"
  | "experience"
  | "projects"
  | "skills"
  | "sharpening"
  | "favouriteFilms"
  | "filmsIntro"
  | "musicIntro"
  | "writingIntro"
  | "writing"
  | "resumes"
  | "guestbookIntro"
  | "socials";

type Kind = "text" | "long" | "list" | "object" | "records" | "json";

interface BlockDef {
  key: BlockKey;
  label: string;
  page: string;
  kind: Kind;
  hint?: string;
  fields?: FieldDef[];
  titleKey?: string;
}

const BLOCKS: BlockDef[] = [
  {
    key: "profile",
    label: "Profile",
    page: "Everywhere",
    kind: "object",
    fields: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "tagline", label: "Tagline", long: true },
      { key: "statusLabel", label: "Status label" },
      { key: "company", label: "Company" },
      { key: "companyUrl", label: "Company URL" },
      { key: "since", label: "Since" },
      { key: "location", label: "Location" },
      { key: "focus", label: "Focus" },
      { key: "email", label: "Email" },
      { key: "githubUser", label: "GitHub username" },
      { key: "letterboxdUser", label: "Letterboxd username" },
      { key: "lastfmUser", label: "Last.fm username" },
    ],
  },
  {
    key: "positioning",
    label: "Positioning lines",
    page: "Home",
    kind: "list",
    hint: "One line per row, stacked under the name.",
  },
  {
    key: "bio",
    label: "Bio",
    page: "Home",
    kind: "list",
    hint: "One paragraph per row. All of it shows, there is no read more.",
  },
  { key: "quickFacts", label: "Footnotes", page: "Home", kind: "list" },
  {
    key: "education",
    label: "Education",
    page: "Home",
    kind: "object",
    fields: [
      { key: "school", label: "School" },
      { key: "degree", label: "Degree" },
      { key: "detail", label: "Detail", long: true },
      { key: "period", label: "Period" },
    ],
  },
  {
    key: "experience",
    label: "Experience",
    page: "Work",
    kind: "json",
    hint: 'Array of jobs. kind must be "growth", "engineering" or "community".',
  },
  {
    key: "projects",
    label: "Projects",
    page: "Work",
    kind: "json",
    hint: "Array of projects. repo is optional and links to GitHub.",
  },
  {
    key: "skills",
    label: "Toolkit",
    page: "Work",
    kind: "json",
    hint: "Two columns, growth and engineering, each with titled groups.",
  },
  { key: "sharpening", label: "Currently sharpening", page: "Work", kind: "long" },
  {
    key: "favouriteFilms",
    label: "Favourite films",
    page: "Interests",
    kind: "records",
    titleKey: "title",
    fields: [
      { key: "title", label: "Title" },
      { key: "year", label: "Year" },
      { key: "director", label: "Director" },
      { key: "url", label: "Letterboxd URL" },
      { key: "poster", label: "Poster image URL", hint: "Optional." },
      { key: "note", label: "One line take", long: true },
    ],
  },
  { key: "filmsIntro", label: "Films intro", page: "Interests", kind: "long" },
  { key: "musicIntro", label: "Music intro", page: "Interests", kind: "long" },
  { key: "writingIntro", label: "Writing intro", page: "Writing", kind: "long" },
  {
    key: "writing",
    label: "Publications",
    page: "Writing",
    kind: "records",
    titleKey: "name",
    fields: [
      { key: "name", label: "Name" },
      { key: "handle", label: "Handle" },
      { key: "url", label: "URL" },
      { key: "icon", label: "Icon key", hint: "substack, medium, rss, link" },
      { key: "blurb", label: "Blurb", long: true },
      { key: "topics", label: "Topics", long: true, list: true, hint: "Comma separated." },
    ],
  },
  {
    key: "socials",
    label: "Socials",
    page: "Elsewhere",
    kind: "records",
    titleKey: "label",
    fields: [
      { key: "id", label: "ID", hint: "Unique, lowercase." },
      { key: "label", label: "Label" },
      { key: "handle", label: "Handle" },
      { key: "url", label: "URL" },
      { key: "icon", label: "Icon key", hint: "See social-icons.ts" },
      { key: "note", label: "Note", long: true },
      { key: "wide", label: "Wide card", hint: 'Type true or leave blank.' },
      { key: "featured", label: "Featured", hint: 'Type true or leave blank.' },
    ],
  },
  {
    key: "resumes",
    label: "Resumes",
    page: "Elsewhere",
    kind: "records",
    titleKey: "label",
    fields: [
      { key: "label", label: "Label" },
      { key: "note", label: "Note", long: true },
      { key: "href", label: "File path", hint: "e.g. /files/name.pdf" },
    ],
  },
  {
    key: "guestbookIntro",
    label: "Guestbook intro",
    page: "Elsewhere",
    kind: "long",
  },
];

const DEFAULTS: Record<string, unknown> = {
  ...defaultContent,
  socials: defaultSocials,
};

/** Booleans typed as text in the socials editor get normalised on save. */
function coerce(key: BlockKey, value: unknown): unknown {
  if (key !== "socials" || !Array.isArray(value)) return value;
  return value.map((row) => {
    const next = { ...(row as Record<string, unknown>) };
    for (const flag of ["wide", "featured"]) {
      const raw = next[flag];
      if (typeof raw === "string") {
        const truthy = raw.trim().toLowerCase() === "true";
        if (truthy) next[flag] = true;
        else delete next[flag];
      }
    }
    for (const flag of ["note"]) {
      if (next[flag] === "") delete next[flag];
    }
    return next;
  });
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const login = useMutation({
    mutationFn: (value: string) => client.admin.login({ password: value }),
    onSuccess: (result) => {
      setAdminToken(result.token, result.expiresAt);
      onDone();
    },
    onError: () => setError("Wrong password."),
  });

  return (
    <div className="grain flex min-h-screen items-center justify-center px-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          if (password) login.mutate(password);
        }}
        className="w-full max-w-sm border p-7"
        style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
      >
        <span className="slug">Studio</span>
        <h1
          className="display-tight mt-3 text-[2.2rem]"
          style={{ color: "var(--white)" }}
        >
          Sign in
        </h1>
        <p className="mt-3 text-sm" style={{ color: "var(--silver)" }}>
          One owner, one password. Everything on the site is editable from here.
        </p>

        <div className="mt-6 flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className={inputClass}
            style={inputStyle}
          />
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((v) => !v)}
            className="flex w-10 shrink-0 items-center justify-center border transition-colors"
            style={{ borderColor: "var(--edge)", color: "var(--grey)" }}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={login.isPending || !password}
          className="slug mt-5 flex w-full items-center justify-center gap-2 border px-4 py-3 transition-colors disabled:opacity-40"
          style={{
            borderColor: "var(--edge-hi)",
            color: "var(--white)",
            background: "var(--ink-3)",
          }}
        >
          {login.isPending ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Checking
            </>
          ) : (
            "Enter the studio"
          )}
        </button>

        {error ? (
          <p className="mt-3 text-sm" style={{ color: "var(--silver)" }}>
            {error}
          </p>
        ) : null}

        <Link
          to="/"
          className="slug link-underline mt-6 inline-flex items-center gap-2"
          style={{ color: "var(--grey)" }}
        >
          <ArrowLeft size={12} /> Back to the site
        </Link>
      </form>
    </div>
  );
}

function BlockEditor({
  block,
  current,
  onSaved,
}: {
  block: BlockDef;
  current: unknown;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<unknown>(current);
  const [json, setJson] = useState(() => JSON.stringify(current, null, 2));
  const [status, setStatus] = useState<"" | "saved" | "error">("");
  const [message, setMessage] = useState("");

  // Refresh the editor when the server value changes underneath it.
  useEffect(() => {
    setDraft(current);
    setJson(JSON.stringify(current, null, 2));
  }, [current]);

  const save = useMutation({
    mutationFn: (value: unknown) =>
      client.content.save({
        key: block.key,
        value: JSON.stringify(coerce(block.key, value)),
      }),
    onSuccess: () => {
      setStatus("saved");
      setMessage("Saved and live.");
      onSaved();
    },
    onError: (error) => {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    },
  });

  const reset = useMutation({
    mutationFn: () => client.content.reset({ key: block.key }),
    onSuccess: () => {
      setStatus("saved");
      setMessage("Reset to the built in default.");
      onSaved();
    },
  });

  const submit = () => {
    setStatus("");
    if (block.kind === "json") {
      try {
        save.mutate(JSON.parse(json));
      } catch {
        setStatus("error");
        setMessage("That is not valid JSON.");
      }
      return;
    }
    save.mutate(draft);
  };

  return (
    <div
      className="border p-5 md:p-6"
      style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="display text-[1.3rem]" style={{ color: "var(--white)" }}>
            {block.label}
          </h2>
          <span className="slug mt-1 block">{block.page} page</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => reset.mutate()}
            className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
            style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={save.isPending}
            className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors disabled:opacity-40"
            style={{
              borderColor: "var(--edge-hi)",
              color: "var(--white)",
              background: "var(--ink-3)",
            }}
          >
            {save.isPending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Save
          </button>
        </div>
      </div>

      {block.hint ? (
        <p className="mt-3 font-mono text-[11px]" style={{ color: "var(--grey)" }}>
          {block.hint}
        </p>
      ) : null}

      <div className="mt-5">
        {block.kind === "text" || block.kind === "long" ? (
          <TextArea
            value={typeof draft === "string" ? draft : ""}
            onChange={setDraft}
            rows={block.kind === "long" ? 4 : 2}
          />
        ) : null}

        {block.kind === "list" ? (
          <StringList
            items={Array.isArray(draft) ? (draft as string[]) : []}
            onChange={(next) => setDraft(next)}
          />
        ) : null}

        {block.kind === "object" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {block.fields?.map((field) => {
              const record = (draft ?? {}) as Record<string, unknown>;
              return (
                <div
                  key={field.key}
                  className={field.long ? "sm:col-span-2" : undefined}
                >
                  <Field label={field.label} hint={field.hint}>
                    {field.long ? (
                      <TextArea
                        rows={2}
                        value={String(record[field.key] ?? "")}
                        onChange={(value) =>
                          setDraft({ ...record, [field.key]: value })
                        }
                      />
                    ) : (
                      <TextInput
                        value={String(record[field.key] ?? "")}
                        onChange={(value) =>
                          setDraft({ ...record, [field.key]: value })
                        }
                      />
                    )}
                  </Field>
                </div>
              );
            })}
          </div>
        ) : null}

        {block.kind === "records" ? (
          <RecordList
            rows={Array.isArray(draft) ? (draft as Record<string, unknown>[]) : []}
            fields={block.fields ?? []}
            titleKey={block.titleKey ?? "label"}
            onChange={(next) => setDraft(next)}
          />
        ) : null}

        {block.kind === "json" ? (
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            rows={18}
            spellCheck={false}
            className={`${inputClass} resize-y leading-[1.55]`}
            style={inputStyle}
          />
        ) : null}
      </div>

      {status ? (
        <p
          className="slug mt-4 inline-flex items-center gap-2"
          style={{ color: status === "saved" ? "var(--white)" : "var(--silver)" }}
        >
          {status === "saved" ? <Check size={12} /> : null}
          {message}
        </p>
      ) : null}
    </div>
  );
}

function Moderation() {
  const queryClient = useQueryClient();
  const rows = useQuery(orpc.admin.guestbookAll.queryOptions());

  const moderate = useMutation(
    orpc.admin.moderate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
        queryClient.invalidateQueries({ queryKey: orpc.guestbook.key() });
      },
    }),
  );

  return (
    <div
      className="border p-5 md:p-6"
      style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
    >
      <h2 className="display text-[1.3rem]" style={{ color: "var(--white)" }}>
        Guestbook
      </h2>
      <span className="slug mt-1 block">Hide anything that does not belong</span>

      {rows.isLoading ? (
        <p className="slug mt-5">Loading</p>
      ) : !rows.data?.length ? (
        <p className="mt-5 text-sm" style={{ color: "var(--grey-hi)" }}>
          No entries yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-px">
          {rows.data.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-4 p-4"
              style={{
                background: "var(--ink-3)",
                opacity: row.hidden ? 0.45 : 1,
              }}
            >
              <div>
                <span className="display text-base" style={{ color: "var(--white)" }}>
                  {row.name}
                </span>
                <p className="mt-1 text-sm" style={{ color: "var(--silver)" }}>
                  {row.message}
                </p>
                {row.link ? <p className="slug mt-1">{row.link}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => moderate.mutate({ id: row.id, hidden: !row.hidden })}
                className="slug inline-flex shrink-0 items-center gap-2 border px-3 py-2 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
                style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
              >
                {row.hidden ? <Eye size={12} /> : <EyeOff size={12} />}
                {row.hidden ? "Restore" : "Hide"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Studio() {
  const [signedIn, setSignedIn] = useState(() => Boolean(getAdminToken()));
  const [page, setPage] = useState("All");
  const queryClient = useQueryClient();
  const live = useContent() as unknown as Record<string, unknown>;

  const pageNames = useMemo(
    () => ["All", ...Array.from(new Set(BLOCKS.map((block) => block.page)))],
    [],
  );

  const visible = BLOCKS.filter((block) => page === "All" || block.page === page);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: orpc.content.key() });
  };

  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;

  return (
    <div className="grain relative min-h-screen">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-14 sm:px-8">
        <header
          className="flex flex-wrap items-end justify-between gap-4 border-b pb-6"
          style={{ borderColor: "var(--edge)" }}
        >
          <div>
            <span className="slug">Studio</span>
            <h1
              className="display-tight mt-3 text-[clamp(2.2rem,6vw,3.4rem)]"
              style={{ color: "var(--white)" }}
            >
              Edit the site
            </h1>
            <p className="mt-3 max-w-[60ch] text-sm" style={{ color: "var(--silver)" }}>
              Saving a block publishes it immediately. Reset puts the built in
              default back, so nothing here can be lost for good.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
              style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
            >
              <ArrowLeft size={12} /> Site
            </Link>
            <button
              type="button"
              onClick={() => {
                clearAdminToken();
                setSignedIn(false);
              }}
              className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
              style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
            >
              <LogOut size={12} /> Sign out
            </button>
          </div>
        </header>

        <nav className="mt-6 flex flex-wrap gap-2">
          {pageNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setPage(name)}
              className="slug border px-3 py-2 transition-colors"
              style={{
                borderColor: page === name ? "var(--edge-hi)" : "var(--edge)",
                color: page === name ? "var(--white)" : "var(--grey)",
                background: page === name ? "var(--ink-3)" : "transparent",
              }}
            >
              {name}
            </button>
          ))}
        </nav>

        <div className="mt-8 space-y-px">
          {visible.map((block) => (
            <BlockEditor
              key={block.key}
              block={block}
              current={live[block.key] ?? DEFAULTS[block.key]}
              onSaved={refresh}
            />
          ))}

          {page === "All" || page === "Elsewhere" ? <Moderation /> : null}
        </div>
      </div>
    </div>
  );
}
