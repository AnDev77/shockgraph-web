import { z } from "zod";

const errorMessages: Record<string, string> = {
  AUTH_001: "이미 가입된 이메일입니다. 로그인해 주세요.",
  MEMBER_002: "이미 가입된 이메일입니다. 로그인해 주세요.",
  AUTH_002: "인증번호가 만료됐거나 없습니다. 새 번호를 요청해 주세요.",
  AUTH_003: "인증번호가 맞지 않습니다. 다시 확인해 주세요.",
  AUTH_004: "가입 인증이 만료됐거나 사용됐습니다. 이메일을 다시 인증해 주세요.",
  AUTH_005: "이메일 또는 비밀번호가 맞지 않습니다.",
  AUTH_006: "이용할 수 없는 계정입니다.",
  AUTH_009: "요청이 많습니다. 잠시 기다린 뒤 다시 시도해 주세요.",
  AUTH_010: "인증번호를 5회 틀렸습니다. 새 번호를 요청해 주세요.",
  AUTH_011: "메일을 보내지 못했습니다. 잠시 뒤 새 번호를 요청해 주세요.",
  COMMON_002: "회원 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
};

export class AuthError extends Error {
  constructor(message: string, public readonly retryAfter = 0) { super(message); }
}

export function authEnabled() { return import.meta.env.VITE_AUTH_ENABLED === "true"; }

function apiBase() {
  const base = import.meta.env.VITE_AUTH_API_BASE_URL || "/api/v1/auth";
  const local = import.meta.env.DEV && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(base);
  if (!/^\/(?!\/)/.test(base) && !/^https:\/\//.test(base) && !local) {
    throw new AuthError("회원 서비스 연결을 준비하고 있습니다.");
  }
  return base.replace(/\/$/, "");
}

const envelope = z.object({ success: z.boolean(), data: z.unknown(), error: z.unknown().optional() });
const apiError = z.object({ code: z.string() });

async function post<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
  if (!authEnabled()) throw new AuthError("회원 기능을 준비하고 있습니다.");
  let response: Response;
  try {
    response = await fetch(`${apiBase()}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), credentials: "omit", cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    if (error instanceof AuthError) throw error;
    throw new AuthError("연결이 원활하지 않습니다. 잠시 후 다시 시도해 주세요.");
  }
  // A hosting fallback may return HTML with HTTP 200. Never treat it as success.
  const parsed = envelope.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new AuthError("회원 서비스 응답을 확인할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  if (!response.ok || !parsed.data.success) {
    const error = apiError.safeParse(parsed.data.error);
    const wait = Number(response.headers.get("Retry-After"));
    throw new AuthError(error.success ? (errorMessages[error.data.code] ?? "요청을 처리하지 못했습니다.") : "요청을 처리하지 못했습니다.",
      Number.isFinite(wait) && wait > 0 ? Math.min(wait, 3600) : 0);
  }
  const result = schema.safeParse(parsed.data.data);
  if (!result.success) throw new AuthError("회원 서비스 응답을 확인할 수 없습니다.");
  return result.data;
}

const proofSchema = z.object({ verificationToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/), expiresInSeconds: z.number().int().positive().max(600) });
const loginSchema = z.object({ accessToken: z.string().min(1), tokenType: z.literal("Bearer"), expiresInSeconds: z.number().int().positive().max(86400) });
export type LoginResult = z.infer<typeof loginSchema>;
export const authApi = {
  send: (email: string) => post("/email-verifications/send", { email }, z.null()),
  confirm: (email: string, code: string) => post("/email-verifications/confirm", { email, code }, proofSchema),
  signup: (email: string, password: string, nickname: string, verificationToken: string) =>
    post("/signup", { email, password, nickname, verificationToken }, z.object({ memberId: z.number().int().positive() })),
  login: (email: string, password: string) => post("/login", { email, password }, loginSchema),
};
