import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type Block =
  | { kind: "heading"; text: string }
  | { kind: "para"; text: string }
  | { kind: "list"; items: { label?: string; text: string }[] };

/** Parse the light markdown subset used by listing descriptions. */
function parseDescription(raw: string): Block[] {
  const blocks: Block[] = [];
  let list: { label?: string; text: string }[] = [];
  let para: string[] = [];

  const flushList = () => {
    if (list.length) blocks.push({ kind: "list", items: list });
    list = [];
  };
  const flushPara = () => {
    const text = para.join(" ").trim();
    if (text) blocks.push({ kind: "para", text });
    para = [];
  };

  for (const line of raw.replace(/\r\n/g, "\n").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      flushPara();
      continue;
    }
    const heading = /^#{2,3}\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushList();
      flushPara();
      blocks.push({ kind: "heading", text: (heading[1] ?? "").replace(/[*_]/g, "").trim() });
      continue;
    }
    const bullet = /^[-*\u2022]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushPara();
      const body = bullet[1] ?? "";
      const labelled = /^\*\*(.+?):?\*\*:?\s*(.*)$/.exec(body);
      if (labelled) list.push({ label: (labelled[1] ?? "").trim(), text: (labelled[2] ?? "").trim() });
      else list.push({ text: body.replace(/\*\*/g, "").trim() });
      continue;
    }
    flushList();
    para.push(trimmed.replace(/\*\*/g, ""));
  }
  flushList();
  flushPara();
  return blocks;
}

function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          return (
            <h3
              key={i}
              className="mt-6 font-display text-[15px] font-extrabold uppercase tracking-wide text-foreground first:mt-0"
            >
              {block.text}
            </h3>
          );
        }
        if (block.kind === "list") {
          return (
            <ul key={i} className="mt-3 space-y-2">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    {item.label ? (
                      <span className="font-semibold text-foreground">{item.label}: </span>
                    ) : null}
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mt-3 first:mt-0">
            {block.text}
          </p>
        );
      })}
    </>
  );
}

/**
 * Renders a listing description. When `collapsible` is set the lead paragraph
 * and highlights show first, with the rest behind a "Read more" toggle.
 */
export function HomeDescription({
  text,
  collapsible = false,
  className = "",
}: {
  text: string;
  collapsible?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const blocks = useMemo(() => parseDescription(text ?? ""), [text]);
  if (blocks.length === 0) return null;

  // Show everything up to the second heading, then hide the tail.
  let cut = blocks.length;
  if (collapsible) {
    const headings = blocks.map((b, i) => (b.kind === "heading" ? i : -1)).filter((i) => i >= 0);
    if (headings.length >= 2) cut = headings[1];
  }
  const canCollapse = collapsible && cut < blocks.length;
  const visible = canCollapse && !open ? blocks.slice(0, cut) : blocks;

  return (
    <div className={`max-w-[68ch] text-[17px] leading-relaxed text-muted-foreground ${className}`}>
      <div className={canCollapse && !open ? "relative" : undefined}>
        <BlockList blocks={visible} />
        {canCollapse && !open ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-background"
          />
        ) : null}
      </div>

      {canCollapse ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-md border border-border px-4 text-[15px] font-semibold text-foreground hover:bg-secondary"
        >
          {open ? "Show less" : "Read more about this home"}
          <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : null}
    </div>
  );
}
