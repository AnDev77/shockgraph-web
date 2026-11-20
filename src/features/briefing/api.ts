import { parseBriefing } from "./schemas";

// The instrument catalog decides which symbols support briefing. A deployment may explicitly disable reads.
export const briefingEnabled = () => import.meta.env.VITE_BRIEFING_ENABLED !== "false";

function briefingBase() {
  const explicit = import.meta.env.VITE_BRIEFING_API_BASE_URL;
  if (explicit) return explicit;
  const catalog = import.meta.env.VITE_INSTRUMENTS_API_BASE_URL || "";
  // The catalog and briefing GET belong to the same Java API. No extra host setting is needed.
  if (catalog.endsWith("/api/v1/instruments")) {
    return `${catalog.slice(0, -"/api/v1/instruments".length)}/api/v1/briefings`;
  }
  return "/api/v1/briefings";
}

function endpoint(symbol: string) {
  const base = briefingBase();
  const url = new URL(base, window.location.origin);
  if ((!/^\/(?!\/)/.test(base) && url.protocol !== "https:") ||
      url.username || url.password || url.search || url.hash ||
      (!/^https:\/\//i.test(base) && url.origin !== window.location.origin)) {
    throw new Error("브리핑 API 주소를 확인해 주세요.");
  }
  url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(symbol)}`;
  url.searchParams.set("window", "7d");
  return url;
}

export async function getBriefing(symbol: string, signal: AbortSignal) {
  const response = await fetch(endpoint(symbol), {
    headers: { Accept: "application/json" },
    credentials: "omit",
    cache: "no-store",
    signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
  });
  if (!response.ok) throw new Error("브리핑 연결 실패");
  return parseBriefing(await response.json(), symbol);
}
