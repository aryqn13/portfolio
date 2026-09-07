import { useRef, useState } from "react";
import { Loader2, Trash2, Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { client } from "../../lib/api";
import { IconBtn, inputClass, inputStyle } from "./fields";

/**
 * PROOF OF WORK UPLOADER.
 *
 * The experience block is edited as raw JSON, which is fine for text and
 * hopeless for images. This sits above that textarea and gives every job a
 * visual strip: pick files, they go to object storage, and the returned paths
 * are written back into the same JSON as a `shots` array.
 *
 * It reads and writes the JSON string the textarea holds, so the two editors
 * never disagree. If the JSON is mid-edit and unparseable, this hides itself
 * rather than guessing.
 */

interface Shot {
  src: string;
  caption?: string;
}

interface Job {
  company?: string;
  role?: string;
  shots?: Shot[];
  [key: string]: unknown;
}

const MAX_MB = 8;

export function ShotsEditor({
  json,
  onChange,
}: {
  json: string;
  onChange: (nextJson: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  let jobs: Job[] | null = null;
  try {
    const parsed: unknown = JSON.parse(json);
    if (Array.isArray(parsed)) jobs = parsed as Job[];
  } catch {
    jobs = null;
  }

  if (!jobs) {
    return (
      <p className="slug mb-4" style={{ color: "var(--grey)" }}>
        Screenshot uploads appear once the JSON below is valid.
      </p>
    );
  }

  const list = jobs;

  const write = (next: Job[]) => onChange(JSON.stringify(next, null, 2));

  const setShots = (index: number, shots: Shot[]) => {
    write(
      list.map((job, i) => {
        if (i !== index) return job;
        const next = { ...job };
        if (shots.length) next.shots = shots;
        else delete next.shots;
        return next;
      }),
    );
  };

  const uploadOne = async (file: File): Promise<Shot> => {
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

    return { src: path, caption: "" };
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || target === null) return;
    setError("");
    setBusy(true);

    const picked = Array.from(files);
    const added: Shot[] = [];

    try {
      for (const [i, file] of picked.entries()) {
        if (file.size > MAX_MB * 1024 * 1024) {
          throw new Error(`${file.name} is over ${MAX_MB}MB.`);
        }
        setProgress(`Uploading ${i + 1} of ${picked.length}`);
        added.push(await uploadOne(file));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      if (added.length) {
        setShots(target, [...(list[target]?.shots ?? []), ...added]);
      }
      setBusy(false);
      setProgress("");
      setTarget(null);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="mb-6">
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        multiple
        className="hidden"
        onChange={(e) => void onFiles(e.target.files)}
      />

      <div className="mb-3 flex flex-wrap items-baseline gap-3">
        <span className="slug" style={{ color: "var(--white)" }}>
          Proof of work
        </span>
        <span className="slug" style={{ color: "var(--grey)" }}>
          {busy
            ? progress
            : `Screenshots shown under each job, under ${MAX_MB}MB each. Save when done.`}
        </span>
      </div>

      {error ? (
        <p className="slug mb-3" style={{ color: "var(--silver)" }}>
          {error}
        </p>
      ) : null}

      <div className="space-y-px">
        {list.map((job, index) => {
          const shots = job.shots ?? [];

          const move = (from: number, delta: number) => {
            const to = from + delta;
            if (to < 0 || to >= shots.length) return;
            const next = [...shots];
            [next[from], next[to]] = [next[to], next[from]];
            setShots(index, next);
          };

          return (
            <div
              key={`${job.company}-${job.role}-${index}`}
              className="border p-4"
              style={{ borderColor: "var(--edge)", background: "var(--ink-3)" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="slug" style={{ color: "var(--white)" }}>
                  {job.company ?? `Job ${index + 1}`}
                  {job.role ? (
                    <span style={{ color: "var(--grey)" }}> / {job.role}</span>
                  ) : null}
                </span>

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
                  Add screenshots
                </button>
              </div>

              {shots.length === 0 ? (
                <p className="slug mt-3" style={{ color: "var(--grey)" }}>
                  None yet
                </p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {shots.map((shot, si) => (
                    <li
                      key={`${shot.src}-${si}`}
                      className="border p-2"
                      style={{
                        borderColor: "var(--edge)",
                        background: "var(--ink-2)",
                      }}
                    >
                      <div
                        className="h-24 w-full overflow-hidden"
                        style={{ background: "var(--ink-4)" }}
                      >
                        <img
                          src={shot.src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-end gap-1">
                        <IconBtn label="Move earlier" onClick={() => move(si, -1)}>
                          <ArrowLeft size={12} />
                        </IconBtn>
                        <IconBtn label="Move later" onClick={() => move(si, 1)}>
                          <ArrowRight size={12} />
                        </IconBtn>
                        <IconBtn
                          label="Remove"
                          onClick={() =>
                            setShots(
                              index,
                              shots.filter((_, i) => i !== si),
                            )
                          }
                        >
                          <Trash2 size={12} />
                        </IconBtn>
                      </div>

                      <input
                        value={shot.caption ?? ""}
                        placeholder="Caption"
                        onChange={(e) =>
                          setShots(
                            index,
                            shots.map((s, i) =>
                              i === si ? { ...s, caption: e.target.value } : s,
                            ),
                          )
                        }
                        className={`${inputClass} mt-2`}
                        style={inputStyle}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
