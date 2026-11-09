import { expect, test } from "@playwright/test";

test("QQQ 근거 화면의 발표 전환과 공식 링크는 모바일·데스크톱에서 보인다", async ({ page }) => {
  await page.goto("/assets/QQQ/evidence");
  await expect(page.getByRole("heading", { name: "QQQ 근거 보기" })).toBeVisible();
  await expect(page.getByRole("link", { name: /연준 회의 일정·발표문 열기/ }))
    .toHaveAttribute("href", /federalreserve\.gov/);
  await page.getByRole("button", { name: "PCE" }).click();
  await expect(page.getByRole("link", { name: /경제분석국 발표 일정 열기/ }))
    .toHaveAttribute("href", /bea\.gov/);
  await expect(page.getByText(/현재 AI가 작성한 요약이나 투자 판단은 제공하지 않습니다/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
