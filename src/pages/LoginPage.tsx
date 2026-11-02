import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Brand } from "../app/AppLayout";
import { AuthField } from "../features/auth/AuthField";
import { authApi, authEnabled } from "../features/auth/api";
import { useSession } from "../features/auth/session";

export function LoginPage() {
  const { session, login, logout } = useSession();
  const [message, setMessage] = useState("");
  const mutation = useMutation({ mutationFn: ({ email, password }: { email: string; password: string }) => authApi.login(email, password), retry: false,
    onSuccess: (result) => { login(result); setMessage(""); }, onError: (error) => setMessage(error.message) });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;
    const data = new FormData(event.currentTarget);
    setMessage(""); mutation.mutate({ email: String(data.get("email")).trim(), password: String(data.get("password")) });
  };
  return <main id="main" className="content auth-view"><header className="topbar"><Brand small /><Link to="/signup">회원가입</Link></header>
    <section className="auth-panel"><p className="eyebrow">ShockGraph 계정</p><h1>로그인</h1>
      {!authEnabled() ? <p role="status">회원 기능을 연결하고 있습니다. 지금은 시장 자료를 먼저 살펴보세요.</p>
      : session ? <div role="status"><p>로그인했습니다.</p><p>관심 종목 저장과 실제 채팅은 연결을 준비하고 있습니다.</p><Link className="primary-action" to="/">시장 자료 보기 →</Link><button className="auth-text-button" type="button" onClick={logout}>로그아웃</button></div>
      : <><form onSubmit={submit}><fieldset disabled={mutation.isPending}>
        <AuthField label="이메일" name="email" type="email" autoComplete="username" maxLength={254} />
        <AuthField label="비밀번호" name="password" type="password" autoComplete="current-password" minLength={8} maxLength={64} />
        <button className="auth-submit" type="submit">{mutation.isPending ? "로그인 중…" : "로그인하기"}</button>
      </fieldset></form><p className="auth-notice">현재는 새로고침하거나 로그인 시간이 지나면 다시 로그인해야 합니다.</p></>}
      {message && <p className="auth-message" role="alert">{message}</p>}
    </section></main>;
}
