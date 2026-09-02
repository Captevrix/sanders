/**
 * Legal policy adapter.
 *
 * The legacy site embeds its Privacy Policy and Terms of Use through the
 * Captevrix policy generator. That service exposes the policy content as JSON,
 * so we fetch it server side and render it in the site's own typography rather
 * than injecting a third-party script and stylesheet into the page.
 */

export type PolicyKey = "privacy" | "terms";

export type Policy = {
  key: PolicyKey;
  html: string;
  version: number | null;
  updatedAt: string | null;
  ok: boolean;
};

const POLICY_IDS: Record<PolicyKey, string> = {
  privacy: "923ede18-756e-49de-be0b-d9b65ee99abf",
  terms: "1d333377-9a22-4b4e-b3ff-82c17534b515",
};

const LEGACY_URLS: Record<PolicyKey, string> = {
  privacy: "https://www.sandershousing.com/privacy-policy-2/",
  terms: "https://www.sandershousing.com/terms-of-use/",
};

export const POLICY_FALLBACK_URL = LEGACY_URLS;

const BASE = "https://policygenerator.captevrix.com";
const CACHE_MS = 60 * 60 * 1000;
const cache = new Map<PolicyKey, { at: number; data: Policy }>();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => {
    const safe = /^(https?:|mailto:|tel:|\/)/i.test(href) ? href : "#";
    const external = /^https?:/i.test(safe);
    return `<a href="${safe}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

/** Minimal, safe markdown to HTML. No raw HTML from the source is preserved. */
function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let para: string[] = [];

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };
  const closePara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      closePara();
      closeList();
      continue;
    }

    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      closePara();
      closeList();
      const level = Math.min(heading[1]!.length + 1, 6);
      out.push(`<h${level}>${inline(heading[2]!)}</h${level}>`);
      continue;
    }

    if (/^(---|\*\*\*|___)\s*$/.test(line)) {
      closePara();
      closeList();
      out.push("<hr />");
      continue;
    }

    const bullet = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (bullet) {
      closePara();
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${inline(bullet[1]!)}</li>`);
      continue;
    }

    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      closePara();
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${inline(ordered[1]!)}</li>`);
      continue;
    }

    closeList();
    para.push(line.trim());
  }

  closePara();
  closeList();
  return out.join("\n");
}

function stripHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

export async function getPolicy(key: PolicyKey): Promise<Policy> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  try {
    const res = await fetch(`${BASE}/api/embed/${POLICY_IDS[key]}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Policy request failed: ${res.status}`);
    const json = (await res.json()) as {
      content?: string;
      content_format?: string;
      version?: number;
      published_at?: string;
    };
    const content = String(json.content ?? "");
    if (!content.trim()) throw new Error("Empty policy content");

    const html =
      json.content_format === "html" ? stripHtml(content) : markdownToHtml(content);

    const data: Policy = {
      key,
      html,
      version: typeof json.version === "number" ? json.version : null,
      updatedAt: json.published_at ?? null,
      ok: true,
    };
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch {
    const stale = cache.get(key);
    if (stale) return stale.data;
    return { key, html: "", version: null, updatedAt: null, ok: false };
  }
}
