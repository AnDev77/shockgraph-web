import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AppLayout } from "../app/AppLayout";
import { HomePage } from "./HomePage";
import { AssetPage } from "./AssetPage";
import { RoomPage } from "./RoomPage";
import { EvidencePage } from "./EvidencePage";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderRoute(path: string) {
  render(<MemoryRouter initialEntries={[path]}><Routes><Route element={<AppLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/assets/:symbol" element={<AssetPage />} />
    <Route path="/assets/:symbol/evidence" element={<EvidencePage />} />
    <Route path="/rooms/:symbol" element={<RoomPage />} />
  </Route></Routes></MemoryRouter>);
}

test("홈의 종목과 공식 원문, 연구 보류를 구분한다", () => {
  renderRoute("/");
  expect(screen.getByRole("link", { name: /나스닥 100 ETF/ })).toHaveAttribute("href", "/assets/QQQ");
  expect(screen.getByRole("link", { name: /S&P 500 ETF/ })).toHaveAttribute("href", "/assets/SPY");
  expect(screen.getByRole("link", { name: /연준에서 일정 보기/ })).toHaveAttribute("href", expect.stringContaining("federalreserve.gov"));
  expect(screen.getByText("공개 전")).toBeInTheDocument();
});

test("SPY 상세의 차트 출처와 토론 링크가 종목을 유지한다", () => {
  renderRoute("/assets/SPY");
  expect(within(screen.getByRole("navigation", { name: "주요 메뉴" })).getByRole("link", { name: "토론" }))
    .toHaveAttribute("href", "/rooms/SPY");
  expect(screen.getByRole("heading", { name: "SPY" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /SPY 토론방 미리보기/ })).toHaveAttribute("href", "/rooms/SPY");
  expect(screen.getByRole("link", { name: /SPY 발표 근거 보기/ })).toHaveAttribute("href", "/assets/SPY/evidence");
  expect(screen.getByRole("link", { name: /차트가 보이지 않으면/ })).toHaveAttribute("href", expect.stringContaining("AMEX-SPY"));
  expect(screen.getByRole("img", { name: "SPY 외부 제공 차트" })).toBeInTheDocument();
  expect(document.querySelectorAll('script[data-tradingview-widget="true"]')).toHaveLength(1);
});

test("근거 화면은 공식 자료를 바꾸되 AI 해설과 위험 수치를 꾸며내지 않는다", () => {
  renderRoute("/assets/QQQ/evidence");
  expect(screen.getByRole("heading", { name: "QQQ 근거 보기" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /연준 회의 일정·발표문 열기/ }))
    .toHaveAttribute("href", expect.stringContaining("federalreserve.gov"));
  fireEvent.click(screen.getByRole("button", { name: "CPI" }));
  expect(screen.getByRole("button", { name: "CPI" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("link", { name: /노동통계국 발표 일정 열기/ }))
    .toHaveAttribute("href", expect.stringContaining("bls.gov"));
  expect(screen.getByText(/현재 AI가 작성한 요약이나 투자 판단은 제공하지 않습니다/)).toBeInTheDocument();
  expect(screen.getByText(/독립 시험이 확인되기 전에는/)).toBeInTheDocument();
});

test("지원하지 않는 종목의 근거 URL은 홈으로 이동한다", () => {
  renderRoute("/assets/INVALID/evidence");
  expect(screen.getByRole("heading", { name: /미국 경제 발표와/ })).toBeInTheDocument();
});

test("상세 화면의 발표 메뉴가 홈의 공식 자료로 이동한다", () => {
  const scrollIntoView = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: scrollIntoView });
  try {
    renderRoute("/assets/SPY");
    fireEvent.click(within(screen.getByRole("navigation", { name: "주요 메뉴" })).getByRole("link", { name: "발표" }));
    expect(screen.getByRole("heading", { name: "공식 발표 일정" })).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledOnce();
  } finally {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  }
});

test("종목방은 글쓰기 연결 전 상태를 명확히 표시한다", () => {
  renderRoute("/rooms/QQQ");
  expect(screen.getByRole("heading", { name: "QQQ 토론방" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "채팅 준비 중" })).toBeDisabled();
  expect(screen.getByText("현재 글을 읽거나 쓸 수 없습니다.")).toBeInTheDocument();
});

test("지원하지 않는 종목은 홈으로 이동한다", () => {
  renderRoute("/assets/<script>");
  expect(screen.getByRole("heading", { name: /미국 경제 발표와/ })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "<script>" })).not.toBeInTheDocument();
});
