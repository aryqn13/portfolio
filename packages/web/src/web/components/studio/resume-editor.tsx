import { useRef, useState } from "react";
import { ArrowUp, ArrowDown, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { client } from "../../lib/api";
import { Field, GhostBtn, IconBtn, inputClass, inputStyle } from "./fields";

/**
 * CV editor.
 *
 * Each row is one downloadable CV: a label, a one line note, and the PDF
 * itself. "Replace PDF" uploads straight to object storage and rewrites `href`,
 * so swapping a CV never needs a redeploy or a file path typed by hand.
 *
 * ORDER IS MEANING: the top row is the main CV and gets the prominent
 * treatment on the site. Everything under it is offered quietly as an
 * alternative cut. Move a row to the top to promote it.
 */

interface ResumeRow {
  label: string;
  note: string;
  href: string;
}

const MAX_MB = 10;

export function ResumeEditor({
  rows,
  onChange,
}: {
  rows: ResumeRow[];
  onChange: (next: ResumeRow[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (index: number, key: keyof ResumeRow, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  const move = (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= rows.length) return;
    const next = [...rows];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  const onFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || target === null) return;

    setError("");
    setBusy(true);

    try {
      if (file.type !== "application/pdf") throw new Error("PDFs only.");
      if (file.size > MAX_MB * 1024 * 1024) {
        throw new Error(`${file.name} is over ${MAX_MB}MB.`);
      }

      const { url, path } = await client.upload.presign({
        filename: file.name,
        contentType: file.type,
      });

      const response = await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!response.ok) throw new Error("Upload failed.");

      set(target, "href", path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      setTarget(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => void onFile(e.target.files)}
      />

      {error ? (
        <p className="slug mb-3" style={{ color: "var(--silver)" }}>
          {error}
        </p>
      ) : null}

      <div className="space-y-px">
        {rows.map((row, index) => (
          <div
            key={index}
            className="border p-4"
            style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span
                className="slug"
                style={{ color: index === 0 ? "var(--mark)" : "var(--grey)" }}
              >
                {index === 0 ? "Main CV" : "Also available"}
              </span>
              <div className="flex gap-1">
                <IconBtn label="Move up" onClick={() => move(index, -1)}>
                  <ArrowUp size={12} />
                </IconBtn>
                <IconBtn label="Move down" onClick={() => move(index, 1)}>
                  <ArrowDown size={12} />
                </IconBtn>
                <IconBtn
                  label="Delete"
                  onClick={() => onChange(rows.filter((_, i) => i !== index))}
                >
                  <Trash2 size={12} />
                </IconBtn>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label">
                <input
                  value={row.label ?? ""}
                  onChange={(e) => set(index, "label", e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
              <Field label="Note">
                <input
                  value={row.note ?? ""}
                  onChange={(e) => set(index, "note", e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </Field>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setTarget(index);
                  input.current?.click();
                }}
                className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors disabled:opacity-40 hover:!border-[var(--edge-hi)] hover:!text-white"
                style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
              >
                {busy && target === index ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                Replace PDF
              </button>

              {row.href ? (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="slug inline-flex items-center gap-2 transition-colors hover:!text-white"
                  style={{ color: "var(--grey)" }}
                >
                  <FileText size={12} /> Open current
                </a>
              ) : null}
            </div>

            <p
              className="mt-2 truncate font-mono text-[10px]"
              style={{ color: "var(--grey)" }}
              title={row.href}
            >
              {row.href || "No file yet"}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-3">
        <GhostBtn
          onClick={() => onChange([...rows, { label: "", note: "", href: "" }])}
        >
          <Upload size={12} /> Add a CV
        </GhostBtn>
      </div>
    </div>
  );
}
