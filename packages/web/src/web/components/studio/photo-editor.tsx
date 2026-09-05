import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Trash2, Upload } from "lucide-react";
import { client } from "../../lib/api";
import { IconBtn, inputClass, inputStyle } from "./fields";

/**
 * The photo deck editor. Pick files from the machine, they go straight to
 * object storage and land in the deck in the order they are dropped. The first
 * card is the one on top of the stack on the home page.
 */

interface PhotoRow {
  src: string;
  alt?: string;
}

const MAX_MB = 8;

export function PhotoEditor({
  rows,
  onChange,
}: {
  rows: PhotoRow[];
  onChange: (next: PhotoRow[]) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const uploadOne = async (file: File) => {
    const { url, path } = await client.upload.presign({
      filename: file.name,
      contentType: file.type,
    });

    const response = await fetch(url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!response.ok) throw new Error(`Upload failed for ${file.name}.`);

    return { src: path, alt: file.name.replace(/\.[^.]+$/, "") };
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError("");
    setBusy(true);

    const picked = Array.from(files);
    const added: PhotoRow[] = [];

    try {
      for (const [i, file] of picked.entries()) {
        if (file.size > MAX_MB * 1024 * 1024) {
          throw new Error(`${file.name} is over ${MAX_MB}MB.`);
        }
        setProgress(`Uploading ${i + 1} of ${picked.length}`);
        added.push(await uploadOne(file));
      }
      onChange([...rows, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
      if (added.length) onChange([...rows, ...added]);
    } finally {
      setBusy(false);
      setProgress("");
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          multiple
          className="hidden"
          onChange={(e) => void onFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors disabled:opacity-40"
          style={{
            borderColor: "var(--edge-hi)",
            color: "var(--white)",
            background: "var(--ink-3)",
          }}
        >
          {busy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Upload size={12} />
          )}
          Add photos
        </button>
        <span className="slug" style={{ color: "var(--grey)" }}>
          {busy
            ? progress
            : `${rows.length} in the deck, under ${MAX_MB}MB each`}
        </span>
      </div>

      {error ? (
        <p className="slug mt-3" style={{ color: "var(--silver)" }}>
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="slug mt-5" style={{ color: "var(--grey)" }}>
          Empty. The home page hides the portrait until there is one photo.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {rows.map((row, index) => (
            <li
              key={`${row.src}-${index}`}
              className="flex gap-3 border p-3"
              style={{ borderColor: "var(--edge)", background: "var(--ink-3)" }}
            >
              {/* 4:5 and fitted, exactly like the card on the home page. */}
              <div
                className="h-24 w-[4.8rem] shrink-0 overflow-hidden rounded-[10px]"
                style={{ background: "var(--ink-4)" }}
              >
                <img
                  src={row.src}
                  alt=""
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="slug" style={{ color: "var(--white)" }}>
                    {index === 0 ? "On top" : String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex gap-1">
                    <IconBtn label="Move earlier" onClick={() => move(index, -1)}>
                      <ArrowLeft size={12} />
                    </IconBtn>
                    <IconBtn label="Move later" onClick={() => move(index, 1)}>
                      <ArrowRight size={12} />
                    </IconBtn>
                    <IconBtn
                      label="Remove"
                      onClick={() =>
                        onChange(rows.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 size={12} />
                    </IconBtn>
                  </div>
                </div>

                <input
                  value={row.alt ?? ""}
                  placeholder="Alt text"
                  onChange={(e) =>
                    onChange(
                      rows.map((r, i) =>
                        i === index ? { ...r, alt: e.target.value } : r,
                      ),
                    )
                  }
                  className={inputClass}
                  style={inputStyle}
                />

                <p
                  className="truncate font-mono text-[10px]"
                  style={{ color: "var(--grey)" }}
                  title={row.src}
                >
                  {row.src}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
