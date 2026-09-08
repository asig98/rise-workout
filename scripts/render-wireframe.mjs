/* Renders docs/wireframe.png from scripts/wireframe.html. */
import { chromium } from "playwright";
import { resolve } from "node:path";

const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1560, height: 1200 }, deviceScaleFactor: 2 });
await page.goto("file://" + resolve("scripts/wireframe.html"), { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({ path: "docs/wireframe.png", fullPage: true });
await browser.close();
console.log("docs/wireframe.png written");
