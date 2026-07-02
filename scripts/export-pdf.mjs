/**
 * 由靜態輸出(out/)的 /print 頁面產出 A4 PDF。
 * 流程:起本機靜態伺服器(模擬 GitHub Pages 的 basePath 子路徑)
 *      → Playwright Chromium 開 /print → page.pdf()
 * 輸出:public/chang-yu-cheng-resume.pdf,並複製一份進 out/(部署產物)。
 * 前置:npm run build(pdf script 已串好)。
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_PATH = "/personal-resume";
const OUT_DIR = path.resolve("out");
const PDF_NAME = "chang-yu-cheng-resume.pdf";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".pdf": "application/pdf",
};

if (!existsSync(path.join(OUT_DIR, "index.html"))) {
  console.error("找不到 out/index.html,請先執行 npm run build");
  process.exit(1);
}

const server = createServer((req, res) => {
  let url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  if (url === "/" || url === BASE_PATH) url = `${BASE_PATH}/`;
  if (!url.startsWith(`${BASE_PATH}/`)) {
    res.writeHead(404);
    res.end();
    return;
  }
  let file = path.join(OUT_DIR, url.slice(BASE_PATH.length + 1));
  if (!file.startsWith(OUT_DIR)) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (existsSync(file) && statSync(file).isDirectory()) {
    file = path.join(file, "index.html");
  }
  if (!existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, {
    "content-type": MIME[path.extname(file)] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const printUrl = `http://127.0.0.1:${port}${BASE_PATH}/print/`;
console.log("印製頁:", printUrl);

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(printUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready); // 等思源宋體載入,確保 PDF 內嵌字型

  const pdfPath = path.resolve("public", PDF_NAME);
  await mkdir(path.dirname(pdfPath), { recursive: true });
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "14mm", bottom: "14mm", left: "13mm", right: "13mm" },
  });
  await copyFile(pdfPath, path.join(OUT_DIR, PDF_NAME));
  console.log("PDF 已輸出:", pdfPath, "(並複製到 out/)");
} finally {
  await browser.close();
  server.close();
}
