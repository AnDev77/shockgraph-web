import { parseBriefing } from "./schemas";

export const briefingEnabled = () => import.meta.env.VITE_BRIEFING_ENABLED === "true";

function endpoint(symbol: string) {
  const base = import.meta.env.VITE_BRIEFING_API_BASE_URL || "/api/v1/briefings";
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
