import { afterEach, describe, expect, it, vi } from "vitest";
import { briefingEnabled, getBriefing } from "./api";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("CAMT Java briefing endpoint", () => {
  it("uses the same HTTPS Java origin as the instrument catalog", async () => {
    vi.stubEnv("VITE_INSTRUMENTS_API_BASE_URL", "https://api.example.test/api/v1/instruments");
    vi.stubEnv("VITE_BRIEFING_API_BASE_URL", "");
    vi.stubEnv("VITE_BRIEFING_ENABLED", "");
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      symbol: "CAMT", status: "insufficient_sources",
    }) });
    vi.stubGlobal("fetch", fetch);

    expect(briefingEnabled()).toBe(true);
    expect((await getBriefing("CAMT", new AbortController().signal)).status).toBe("insufficient_sources");
    expect(String(fetch.mock.calls.at(0)?.[0])).toBe("https://api.example.test/api/v1/briefings/CAMT?window=7d");
    expect(fetch.mock.calls.at(0)?.[1]?.credentials).toBe("omit");
  });

  it("honors an explicit disable and refuses an insecure Java origin", async () => {
    vi.stubEnv("VITE_BRIEFING_ENABLED", "false");
    expect(briefingEnabled()).toBe(false);
    vi.stubEnv("VITE_INSTRUMENTS_API_BASE_URL", "http://api.example.test/api/v1/instruments");
    vi.stubEnv("VITE_BRIEFING_API_BASE_URL", "");
    await expect(getBriefing("CAMT", new AbortController().signal)).rejects.toThrow("브리핑 API 주소");
  });
});
