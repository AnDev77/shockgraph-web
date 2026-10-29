import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AppLayout } from "../app/AppLayout";
import { HomePage } from "./HomePage";
import { AssetPage } from "./AssetPage";
import { RoomPage } from "./RoomPage";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderRoute(path: string) {
  render(<MemoryRouter initialEntries={[path]}><Routes><Route element={<AppLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/assets/:symbol" element={<AssetPage />} />
    <Route path="/rooms/:symbol" element={<RoomPage />} />
  </Route></Routes></MemoryRouter>);
}

test("홈의 종목과 공식 원문, 연구 보류를 구분한다", () => {
  renderRoute("/");
  expect(screen.getByRole("link", { name: /나스닥 100 ETF/ })).toHaveAttribute("href", "/assets/QQQ");
  expect(screen.getByRole("link", { name: /S&P 500 ETF/ })).toHaveAttribute("href", "/assets/SPY");
  expect(screen.getByRole("link", { name: /연준 공식 일정 확인/ })).toHaveAttribute("href", expect.stringContaining("federalreserve.gov"));
  expect(screen.getByText("HOLD")).toBeInTheDocument();
});

test("SPY 상세의 차트 출처와 토론 링크가 종목을 유지한다", () => {
  renderRoute("/assets/SPY");
  expect(screen.getByRole("heading", { name: "SPY" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /SPY 토론방 보기/ })).toHaveAttribute("href", "/rooms/SPY");
  expect(screen.getByRole("link", { name: /차트가 보이지 않으면/ })).toHaveAttribute("href", expect.stringContaining("AMEX-SPY"));
  expect(screen.getByRole("img", { name: "SPY 외부 제공 차트" })).toBeInTheDocument();
  expect(document.querySelectorAll('script[data-tradingview-widget="true"]')).toHaveLength(1);
});

test("종목방은 글쓰기 연결 전 상태를 명확히 표시한다", () => {
  renderRoute("/rooms/QQQ");
  expect(screen.getByRole("heading", { name: "QQQ 토론방" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "로그인 후 대화 참여" })).toBeDisabled();
  expect(screen.getByText("채팅 기능은 아직 사용할 수 없습니다.")).toBeInTheDocument();
});

test("지원하지 않는 종목은 홈으로 이동한다", () => {
  renderRoute("/assets/<script>");
  expect(screen.getByRole("heading", { name: /발표를 이해하고/ })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "<script>" })).not.toBeInTheDocument();
});
