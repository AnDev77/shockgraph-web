import { z } from "zod";
import type { AssetSymbol } from "../market/assets";

const message = z.object({
  id: z.number().int().positive(),
  symbol: z.enum(["QQQ", "SPY"]),
  authorId: z.number().int().positive(),
  content: z.string().max(1000),
  createdAt: z.string().datetime({ offset: true }),
});
export type RoomMessage = z.infer<typeof message>;
const envelope = z.object({ success: z.boolean(), data: z.unknown(), error: z.unknown().optional() });

export class ChatError extends Error {}
export function chatEnabled() { return import.meta.env.VITE_CHAT_ENABLED === "true"; }

function baseUrl() {
  const base = import.meta.env.VITE_CHAT_API_BASE_URL || "/api/v1/finance/rooms";
  const local = import.meta.env.DEV && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(base);
  if (!/^\/(?!\/)/.test(base) && !/^https:\/\//.test(base) && !local) {
    throw new ChatError("토론방 연결을 준비하고 있습니다.");
  }
  return base.replace(/\/$/, "");
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  if (!chatEnabled()) throw new ChatError("토론방을 준비하고 있습니다.");
  let response: Response;
  try {
    response = await fetch(`${baseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      credentials: "omit",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ChatError("토론방에 연결할 수 없습니다. 잠시 뒤 다시 시도해 주세요.");
  }
  const parsed = envelope.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new ChatError("토론방 응답을 확인할 수 없습니다.");
  if (!response.ok || !parsed.data.success) {
    throw new ChatError(response.status === 401 ? "로그인이 만료됐습니다. 다시 로그인해 주세요."
      : response.status === 409 ? "이미 처리된 글입니다. 목록을 새로 확인해 주세요."
        : "요청을 처리하지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
  }
  return parsed.data.data;
}

export const chatApi = {
  list: async (symbol: AssetSymbol, afterId?: number): Promise<RoomMessage[]> => {
    const path = `/${symbol}/messages${afterId === undefined ? "" : `?afterId=${afterId}`}`;
    const rows = z.array(message).max(30).parse(await request(path));
    if (rows.some((row) => row.symbol !== symbol)) throw new ChatError("토론방 응답이 일치하지 않습니다.");
    return rows;
  },
  post: async (symbol: AssetSymbol, content: string, requestId: string, token: string): Promise<RoomMessage> => {
    const row = message.parse(await request(`/${symbol}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content, requestId }),
    }));
    if (row.symbol !== symbol) throw new ChatError("토론방 응답이 일치하지 않습니다.");
    return row;
  },
};
