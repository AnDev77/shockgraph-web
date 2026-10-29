import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { stdout } from "node:process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, "dist/index.html"), "utf8");
const references = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1]);

for (const extension of [".js", ".css"]) {
  if (!references.some((path) => path.endsWith(extension))) {
    throw new Error(`빌드 HTML에서 ${extension} 자산을 찾지 못했습니다.`);
  }
}

for (const reference of references) {
  if (!reference) continue;
  const asset = await stat(join(root, "dist", reference.slice(1)));
  if (!asset.isFile() || asset.size === 0) {
    throw new Error(`빌드 자산이 없거나 비어 있습니다: ${reference}`);
  }
}

stdout.write(`빌드 HTML과 참조 자산 ${references.length}개를 확인했습니다.\n`);
