import { Link } from "react-router";
import { useSession } from "./session";

export function AuthNav() {
  const { session, logout } = useSession();
  return <nav className="auth-nav" aria-label="회원 메뉴">{session
    ? <><span>로그인됨</span><button type="button" onClick={logout}>로그아웃</button></>
    : <Link to="/login">로그인</Link>}</nav>;
}
