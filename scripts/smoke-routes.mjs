import assert from "node:assert/strict";
import { stdout } from "node:process";
import { URL } from "node:url";
import { preview } from "vite";

const server = await preview({ preview: { host: "127.0.0.1", port: 0 } });

try {
  const address = server.httpServer.address();
  assert.ok(address && typeof address !== "string", "미리보기 서버 주소가 없습니다.");
  const origin = `http://127.0.0.1:${address.port}`;
  const routes = ["/", "/assets/QQQ", "/assets/SPY", "/rooms/QQQ", "/rooms/SPY", "/signup", "/login"];
  let homeHtml = "";

  for (const route of routes) {
    const response = await globalThis.fetch(new URL(route, origin));
    assert.equal(response.status, 200, `${route}의 HTTP 상태가 정상이어야 합니다.`);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/, `${route}는 HTML이어야 합니다.`);
    const html = await response.text();
    assert.match(html, /<div id="app"><\/div>/, `${route}에서 React 시작점을 찾지 못했습니다.`);
    if (route === "/") homeHtml = html;
  }

  const assets = [...homeHtml.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  assert.ok(assets.length >= 2, "빌드 HTML의 JS·CSS 자산을 찾지 못했습니다.");
  for (const asset of assets) {
    const response = await globalThis.fetch(new URL(asset, origin));
    assert.equal(response.status, 200, `${asset} 자산을 받지 못했습니다.`);
    assert.doesNotMatch(response.headers.get("content-type") ?? "", /text\/html/, `${asset}이 HTML로 바뀌었습니다.`);
  }

  stdout.write(`직접 URL ${routes.length}개와 JS·CSS 자산 ${assets.length}개를 확인했습니다.\n`);
} finally {
  await new Promise((resolve, reject) => server.httpServer.close((error) => error ? reject(error) : resolve()));
}
