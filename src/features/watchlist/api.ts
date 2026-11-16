import { z } from "zod";
import { symbolSchema } from "../market/catalog";

const symbols = z.array(symbolSchema).max(200);
const envelope = z.object({ success: z.boolean(), data: z.unknown(), error: z.unknown().optional() });

export class WatchlistError extends Error {}
export function watchlistEnabled() { return import.meta.env.VITE_WATCHLIST_ENABLED === "true"; }

function baseUrl() {
  const base = import.meta.env.VITE_WATCHLIST_API_BASE_URL || "/api/v1/watchlist";
  const url = new URL(base, window.location.origin);
  const sameOriginPath = /^\/(?!\/)/.test(base) && url.origin === window.location.origin;
  const local = import.meta.env.DEV && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
  if ((!sameOriginPath && url.protocol !== "https:" && !local) || url.username || url.password || url.search || url.hash ||
      (!sameOriginPath && !/^https?:\/\//.test(base))) {
    throw new WatchlistError("관심 종목 연결을 준비하고 있습니다.");
  }
  return url.href.replace(/\/$/, "");
}

async function request(path: string, method: "GET" | "PUT" | "DELETE", token: string) {
  if (!watchlistEnabled()) throw new WatchlistError("관심 종목 기능을 준비하고 있습니다.");
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      method, headers: { Authorization: `Bearer ${token}` }, cache: "no-store",
      credentials: "omit", signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new WatchlistError("관심 종목에 연결할 수 없습니다. 잠시 뒤 다시 시도해 주세요."); }
  const parsed = envelope.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new WatchlistError("관심 종목 응답을 확인할 수 없습니다.");
  if (!response.ok || !parsed.data.success) {
    throw new WatchlistError(response.status === 401 ? "로그인이 만료됐습니다. 다시 로그인해 주세요."
      : "관심 종목을 저장하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
  }
  const result = symbols.safeParse(parsed.data.data);
  if (!result.success || new Set(result.data).size !== result.data.length) {
    throw new WatchlistError("관심 종목 응답을 확인할 수 없습니다.");
  }
  return result.data;
}

export const watchlistApi = {
  list: (token: string) => request("", "GET", token),
  add: (symbol: string, token: string) => request(`/${encodeURIComponent(symbol)}`, "PUT", token),
  remove: (symbol: string, token: string) => request(`/${encodeURIComponent(symbol)}`, "DELETE", token),
};
