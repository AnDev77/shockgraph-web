import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { assets } from "./assets";

export const symbolSchema = z.string().regex(/^[A-Z][A-Z0-9.-]{0,13}$/);
const instrumentSchema = z.object({
  symbol: symbolSchema,
  name: z.string().trim().min(1).max(160),
  chartSymbol: z.string().regex(/^[A-Z0-9]+:[A-Z0-9.-]+$/).nullable(),
  investorUrl: z.url({ protocol: /^https$/ }).nullable(),
  featured: z.boolean(), watchlist: z.boolean(), briefing: z.boolean(), discussion: z.boolean(),
});
export type Instrument = z.infer<typeof instrumentSchema>;
const envelope = z.object({ success: z.literal(true), data: z.array(instrumentSchema).min(1).max(200) });

const preview = Object.values(assets).map((asset): Instrument => ({
  symbol: asset.symbol, name: asset.name, chartSymbol: asset.chartSymbol,
  investorUrl: "investorUrl" in asset ? asset.investorUrl : null,
  featured: asset.symbol === "CAMT" || asset.symbol === "SPCX" || asset.symbol === "AVGO",
  watchlist: false,
  briefing: false,
  discussion: asset.symbol === "QQQ" || asset.symbol === "SPY",
}));

function catalogUrl() { return import.meta.env.VITE_INSTRUMENTS_API_BASE_URL || ""; }

async function fetchCatalog(signal: AbortSignal) {
  const url = catalogUrl();
  const local = import.meta.env.DEV && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);
  if (!/^\/(?!\/)/.test(url) && !/^https:\/\//.test(url) && !local) throw new Error("Invalid catalog endpoint");
  const response = await fetch(url, {
    credentials: "omit", cache: "no-store", signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]),
  });
  if (!response.ok) throw new Error("Catalog unavailable");
  const { data } = envelope.parse(await response.json());
  if (new Set(data.map((row) => row.symbol)).size !== data.length) throw new Error("Duplicate symbols");
  return data;
}

export function useCatalog() {
  const connected = Boolean(catalogUrl());
  const query = useQuery({
    queryKey: ["instruments", catalogUrl()], queryFn: ({ signal }) => fetchCatalog(signal),
    enabled: connected, staleTime: 60_000, retry: false,
  });
  return { instruments: connected ? (query.data ?? []) : preview,
    loading: connected && query.isPending,
    error: connected && query.isError, retry: query.refetch, connected };
}
