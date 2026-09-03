import type { ReactNode } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

/** Shared shell styles so every editor looks like the same tool. */
export const inputStyle = {
  background: "var(--ink)",
  borderColor: "var(--edge)",
  color: "var(--white)",
};

export const inputClass =
  "w-full border px-3 py-2 font-mono text-[13px] outline-none transition-colors focus:border-[var(--edge-hi)]";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="slug block">{label}</span>
      {hint ? (
        <span
          className="mt-1 block font-mono text-[11px]"
          style={{ color: "var(--grey)" }}
        >
          {hint}
        </span>
      ) : null}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputClass}
      style={inputStyle}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className={`${inputClass} resize-y leading-[1.6]`}
      style={inputStyle}
    />
  );
}

/** A list of plain strings: paragraphs, bullet lines, facts. */
export function StringList({
  items,
  onChange,
  rows = 3,
  addLabel = "Add item",
}: {
  items: string[];
  onChange: (next: string[]) => void;
  rows?: number;
  addLabel?: string;
}) {
  const set = (index: number, value: string) =>
    onChange(items.map((item, i) => (i === index ? value : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <span
            className="slug w-6 shrink-0 pt-2"
            style={{ color: "var(--grey)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <textarea
            value={item}
            onChange={(e) => set(index, e.target.value)}
            rows={rows}
            className={`${inputClass} resize-y leading-[1.6]`}
            style={inputStyle}
          />
          <div className="flex shrink-0 flex-col gap-1">
            <IconBtn label="Move up" onClick={() => move(index, -1)}>
              <ArrowUp size={12} />
            </IconBtn>
            <IconBtn label="Move down" onClick={() => move(index, 1)}>
              <ArrowDown size={12} />
            </IconBtn>
            <IconBtn
              label="Delete"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              <Trash2 size={12} />
            </IconBtn>
          </div>
        </div>
      ))}

      <GhostBtn onClick={() => onChange([...items, ""])}>
        <Plus size={12} /> {addLabel}
      </GhostBtn>
    </div>
  );
}

export interface FieldDef {
  key: string;
  label: string;
  long?: boolean;
  /** Comma separated string list stored as an array. */
  list?: boolean;
  hint?: string;
}

type Row = Record<string, unknown>;

const asText = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : value === undefined ? "" : String(value);

/** Repeatable object rows: favourite films, writing, resumes, socials. */
export function RecordList({
  rows,
  fields,
  onChange,
  titleKey,
  addLabel = "Add entry",
}: {
  rows: Row[];
  fields: FieldDef[];
  onChange: (next: Row[]) => void;
  titleKey: string;
  addLabel?: string;
}) {
  const setRow = (index: number, key: string, raw: string, list?: boolean) => {
    const value = list
      ? raw
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
      : raw;
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const blank = () =>
    Object.fromEntries(fields.map((field) => [field.key, field.list ? [] : ""]));

  return (
    <div className="space-y-px">
      {rows.map((row, index) => (
        <div
          key={index}
          className="border p-4"
          style={{ borderColor: "var(--edge)", background: "var(--ink-2)" }}
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="slug" style={{ color: "var(--white)" }}>
              {asText(row[titleKey]) || `Entry ${index + 1}`}
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
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.long ? "sm:col-span-2" : undefined}
              >
                <Field label={field.label} hint={field.hint}>
                  {field.long ? (
                    <textarea
                      value={asText(row[field.key])}
                      onChange={(e) =>
                        setRow(index, field.key, e.target.value, field.list)
                      }
                      rows={3}
                      className={`${inputClass} resize-y leading-[1.6]`}
                      style={inputStyle}
                    />
                  ) : (
                    <input
                      value={asText(row[field.key])}
                      onChange={(e) =>
                        setRow(index, field.key, e.target.value, field.list)
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                  )}
                </Field>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-3">
        <GhostBtn onClick={() => onChange([...rows, blank()])}>
          <Plus size={12} /> {addLabel}
        </GhostBtn>
      </div>
    </div>
  );
}

export function IconBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center border transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
      style={{ borderColor: "var(--edge)", color: "var(--grey)" }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="slug inline-flex items-center gap-2 border px-3 py-2 transition-colors hover:!border-[var(--edge-hi)] hover:!text-white"
      style={{ borderColor: "var(--edge)", color: "var(--grey-hi)" }}
    >
      {children}
    </button>
  );
}
