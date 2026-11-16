import { z } from "zod";

const claim = z.object({
  text: z.string().trim().min(1).max(1000),
  citation_ids: z.array(z.string().min(1)).min(1).max(8),
});
const citation = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).max(300),
  url: z.url({ protocol: /^https$/ }),
  published_at: z.iso.datetime({ offset: true }),
});
const state = z.object({
  symbol: z.string(),
  status: z.enum(["pending", "insufficient_sources", "failed"]),
});
const ready = z.object({
  symbol: z.string(),
  status: z.literal("ready"),
  stance: z.enum(["bullish", "bearish", "mixed", "withheld"]),
  summary: z.array(claim).min(1).max(3),
  bullish_factors: z.array(claim).max(6),
  bearish_factors: z.array(claim).max(6),
  change_conditions: z.array(claim).max(6),
  citations: z.array(citation).min(1).max(24),
  generated_at: z.iso.datetime({ offset: true }),
  freshness: z.enum(["current", "stale"]),
});

export type Briefing = z.infer<typeof state> | z.infer<typeof ready>;

export function parseBriefing(input: unknown, symbol: string): Briefing {
  const result = z.union([ready, state]).parse(input);
  if (result.symbol !== symbol) throw new Error("브리핑 종목이 일치하지 않습니다.");
  if (result.status === "ready") {
    const ids = new Set(result.citations.map(({ id }) => id));
    if (ids.size !== result.citations.length ||
      [...result.summary, ...result.bullish_factors, ...result.bearish_factors, ...result.change_conditions]
        .some(({ citation_ids }) => citation_ids.some((id) => !ids.has(id)))) {
      throw new Error("브리핑의 출처를 확인할 수 없습니다.");
    }
  }
  return result;
}
