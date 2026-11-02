import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginResult } from "./api";

type Session = { accessToken: string; expiresAt: number };
type SessionContextValue = { session: Session | null; login: (result: LoginResult) => void; logout: () => void };
const SessionContext = createContext<SessionContextValue | null>(null);

// Memory only: refresh intentionally signs out. Refresh-token persistence is a separate contract.
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => setSession(null), Math.max(0, session.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [session]);
  return <SessionContext value={{ session,
    login: (result) => setSession({ accessToken: result.accessToken, expiresAt: Date.now() + result.expiresInSeconds * 1000 }),
    logout: () => setSession(null),
  }}>{children}</SessionContext>;
}
export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("SessionProvider is required");
  return value;
}
