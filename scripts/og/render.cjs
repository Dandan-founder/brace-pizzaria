// Gera public/og.jpg (1200×630) a partir de template.html.
// Uso: node scripts/og/render.cjs   (requer Playwright instalado globalmente ou via npx)
const { chromium } = require("playwright");
const path = require("node:path");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto("file://" + path.join(__dirname, "template.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(__dirname, "../../public/og.jpg"), type: "jpeg", quality: 86 });
  await browser.close();
  console.log("public/og.jpg gerado");
})();
