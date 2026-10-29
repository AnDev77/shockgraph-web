import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Brand } from "../app/AppLayout";
import { AuthField } from "../features/auth/AuthField";
import { AuthError, authApi, authEnabled } from "../features/auth/api";

type Stage = { step: "email" } | { step: "code"; email: string }
  | { step: "details"; email: string; proof: string; expiresAt: number } | { step: "done" };

export function SignupPage() {
  const [stage, setStage] = useState<Stage>({ step: "email" });
  const [message, setMessage] = useState("");
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(Date.now);
  const fail = (error: Error) => {
    setMessage(error.message);
    if (error instanceof AuthError && error.retryAfter) setWaitUntil(Date.now() + error.retryAfter * 1000);
  };
  const send = useMutation({ mutationFn: authApi.send, retry: false,
    onSuccess: (_, email) => { setStage({ step: "code", email }); setWaitUntil(Date.now() + 60_000); setMessage("메일을 확인해 주세요. 인증번호는 5분 동안 사용할 수 있습니다."); }, onError: fail });
  const confirm = useMutation({ mutationFn: ({ email, code }: { email: string; code: string }) => authApi.confirm(email, code), retry: false,
    onSuccess: (result, { email }) => { setStage({ step: "details", email, proof: result.verificationToken, expiresAt: Date.now() + result.expiresInSeconds * 1000 }); setMessage("이메일을 확인했습니다. 가입 정보를 입력해 주세요."); }, onError: fail });
  const signup = useMutation({ mutationFn: ({ email, password, nickname, proof }: { email: string; password: string; nickname: string; proof: string }) => authApi.signup(email, password, nickname, proof), retry: false,
    onSuccess: () => { setStage({ step: "done" }); setMessage(""); },
    onError: (error) => { setStage({ step: "email" }); setMessage(`${error.message} 가입이 완료됐는지 로그인으로 확인하거나 이메일을 다시 인증해 주세요.`); } });
  const busy = send.isPending || confirm.isPending || signup.isPending;
  const remaining = Math.max(0, Math.ceil((waitUntil - now) / 1000));
  useEffect(() => {
    if (!waitUntil) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [waitUntil]);
  useEffect(() => {
    if (stage.step !== "details") return;
    const timer = window.setTimeout(() => { setStage({ step: "email" }); setMessage("인증 시간이 지났습니다. 이메일을 다시 인증해 주세요."); }, Math.max(0, stage.expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [stage]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setMessage("");
    if (stage.step === "email") send.mutate(String(data.get("email")).trim());
    else if (stage.step === "code") confirm.mutate({ email: stage.email, code: String(data.get("code")) });
    else if (stage.step === "details") {
      if (Date.now() >= stage.expiresAt) { setStage({ step: "email" }); setMessage("이메일을 다시 인증해 주세요."); return; }
      const password = String(data.get("password"));
      if (password !== data.get("passwordConfirm")) { setMessage("비밀번호가 서로 다릅니다."); return; }
      signup.mutate({ email: stage.email, proof: stage.proof, nickname: String(data.get("nickname")).trim(), password });
    }
  };
  return <main id="main" className="content auth-view"><header className="topbar"><Brand small /><Link to="/login">로그인</Link></header>
    <section className="auth-panel"><p className="eyebrow">ShockGraph 계정</p><h1>회원가입</h1>
      {!authEnabled() ? <p role="status">회원 기능을 연결하고 있습니다. 준비가 끝나면 이메일 인증으로 가입할 수 있어요.</p>
      : stage.step === "done" ? <div role="status"><h2>가입이 완료됐어요</h2><p>이메일과 비밀번호로 로그인해 주세요.</p><Link className="primary-action" to="/login">로그인하기 →</Link></div>
      : <><p>이메일을 확인한 뒤 계정을 만들 수 있어요.</p>
        <ol className="auth-steps" aria-label="가입 단계"><li aria-current={stage.step === "email" ? "step" : undefined}>이메일</li><li aria-current={stage.step === "code" ? "step" : undefined}>인증번호</li><li aria-current={stage.step === "details" ? "step" : undefined}>가입 정보</li></ol>
        <form onSubmit={submit} key={stage.step}><fieldset disabled={busy}>
          {stage.step === "email" && <AuthField label="이메일" name="email" type="email" autoComplete="email" maxLength={254} />}
          {stage.step === "code" && <><p className="auth-email">{stage.email}</p><AuthField label="인증번호 6자리" name="code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" /></>}
          {stage.step === "details" && <><p className="auth-email">{stage.email}</p><AuthField label="닉네임" name="nickname" minLength={2} maxLength={30} autoComplete="nickname" /><AuthField label="비밀번호 (8~64자)" name="password" type="password" minLength={8} maxLength={64} autoComplete="new-password" /><AuthField label="비밀번호 확인" name="passwordConfirm" type="password" minLength={8} maxLength={64} autoComplete="new-password" /></>}
          <button className="auth-submit" type="submit" disabled={busy || (stage.step === "email" && remaining > 0)}>{busy ? "처리 중…" : stage.step === "email" ? "인증번호 받기" : stage.step === "code" ? "인증번호 확인" : "가입하기"}</button>
          {stage.step === "code" && <button className="auth-text-button" type="button" disabled={remaining > 0 || busy} onClick={() => send.mutate(stage.email)}>{remaining ? `${remaining}초 후 다시 받기` : "인증번호 다시 받기"}</button>}
          {stage.step !== "email" && <button className="auth-text-button" type="button" onClick={() => { setStage({ step: "email" }); setMessage(""); }}>다른 이메일로 인증하기</button>}
        </fieldset></form>
        {stage.step === "email" && remaining > 0 && <p>다시 요청하려면 {remaining}초 기다려 주세요.</p>}
        <p className="auth-notice">이메일 인증 후 10분 안에 가입해 주세요. 화면을 닫으면 다시 인증해야 합니다.</p>
      </>}
      {message && <p className="auth-message" role="status" aria-live="polite">{message}</p>}
    </section></main>;
}
