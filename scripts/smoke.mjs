/* Headless smoke test.

   Runs the built app in Chromium with all four APIs intercepted, so both the
   happy paths and the offline fallbacks can be exercised without depending on
   four third-party services being up. Screenshots land in scripts/shots/.

   Run: node scripts/smoke.mjs            (mocked APIs)
        node scripts/smoke.mjs --offline  (every API fails)
*/

import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const OFFLINE = process.argv.includes("--offline");
/* --pages exercises the GitHub Pages build, which is served from a SUBFOLDER
   (asig98.github.io/rise-workout) rather than a domain root. That difference
   breaks base-path mistakes loudly, so it's worth testing rather than assuming. */
const PAGES = process.argv.includes("--pages");
const PREFIX = PAGES ? "/rise-workout" : "";
const DIST = resolve(PAGES ? "docs" : "dist");
const SHOTS = resolve("scripts/shots");
const PORT = 4317;

const MIME = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml",
};

/* ---------- a static server for dist/ ---------- */
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  // Serve DIST at PREFIX, exactly as GitHub Pages serves a repo subfolder.
  let path = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) : url.pathname;
  let file = join(DIST, !path || path === "/" ? "index.html" : path);
  if (!existsSync(file)) file = join(DIST, "index.html");
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});
await new Promise((r) => server.listen(PORT, r));

/* ---------- fixtures ---------- */
const QUOTES = {
  quotes: [
    { id: 1, quote: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { id: 2, quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  ],
};

const WEATHER = {
  current_units: { temperature_2m: "°F" },
  current: { time: "2026-09-08T18:45", temperature_2m: 74.2, weather_code: 0, wind_speed_10m: 6, precipitation: 0 },
};

const WGER_INFO = {
  count: 2,
  results: [
    {
      id: 101, category: { id: 11, name: "Chest" },
      muscles: [{ id: 4, name: "Pectoralis major", name_en: "Chest" }],
      muscles_secondary: [{ id: 5, name: "Triceps brachii", name_en: "Triceps" }],
      equipment: [{ id: 7, name: "none (bodyweight exercise)" }],
      images: [],
      translations: [{ language: 2, name: "Incline Push-Up", description: "<p>Hands elevated on a bench or chair.</p>" }],
    },
    {
      id: 102, category: { id: 9, name: "Legs" },
      muscles: [{ id: 10, name: "Quadriceps femoris", name_en: "Quads" }],
      muscles_secondary: [],
      equipment: [{ id: 7, name: "none (bodyweight exercise)" }],
      images: [],
      translations: [{ language: 2, name: "Bulgarian Split Squat", description: "<p>Rear foot elevated.</p>" }],
    },
  ],
};

const CATEGORIES = { results: [{ id: 11, name: "Chest" }, { id: 9, name: "Legs" }, { id: 10, name: "Abs" }] };
const EQUIPMENT = { results: [{ id: 7, name: "none (bodyweight exercise)" }, { id: 3, name: "Dumbbell" }] };
const CALORIES = [{ name: "calisthenics", calories_per_hour: 380, duration_minutes: 20, total_calories: 127 }];

/* ---------- run ---------- */
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 },   // a phone, which is how Rise is used
  deviceScaleFactor: 2,
  permissions: ["geolocation"],
  geolocation: { latitude: 40.71, longitude: -74.01 },
  locale: "en-US",
});

const errors = [];
const apiHits = new Set();

async function mock(pattern, body, label) {
  await ctx.route(pattern, (route) => {
    apiHits.add(label);
    if (OFFLINE) return route.abort("failed");
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}

await mock("**/dummyjson.com/**", QUOTES, "dummyjson");
await mock("**/api.open-meteo.com/**", WEATHER, "open-meteo");
await mock("**/wger.de/api/v2/exerciseinfo/**", WGER_INFO, "wger:exercises");
await mock("**/wger.de/api/v2/exercisecategory/**", CATEGORIES, "wger:categories");
await mock("**/wger.de/api/v2/equipment/**", EQUIPMENT, "wger:equipment");
await mock("**/api.api-ninjas.com/**", CALORIES, "api-ninjas");

const page = await ctx.newPage();
/* Google Fonts can't be reached from this sandbox, and a blocked webfont is
   not an app defect — filter it so a real error is never lost in the noise. */
const NETWORK_NOISE = /ERR_TUNNEL_CONNECTION_FAILED|fonts\.(googleapis|gstatic)\.com/;
page.on("console", (m) => {
  if (m.type() === "error" && !NETWORK_NOISE.test(m.text())) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("PAGE ERROR: " + e.message));

/* A wrong base path shows up as 404s on the bundle, not as a thrown error, so
   watch responses directly. */
const notFound = [];
page.on("response", (r) => {
  if (r.status() === 404 && new URL(r.url()).port === String(PORT)) notFound.push(new URL(r.url()).pathname);
});

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  ok" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

await page.goto(`http://localhost:${PORT}${PREFIX}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

/* ---------- Today ---------- */
console.log(`\n== TODAY ${OFFLINE ? "(offline)" : "(mocked APIs)"}${PAGES ? " [pages build, served at " + PREFIX + "/]" : ""} ==`);
check("app mounts", await page.locator("h1", { hasText: "Rise." }).isVisible());
check("routine renders 8 rows", (await page.locator(".exercise").count()) === 8,
  `${await page.locator(".exercise").count()} rows`);

const quote = (await page.locator("#quote").textContent()) || "";
check(
  OFFLINE ? "quote falls back to bundled" : "quote comes from the API",
  OFFLINE ? quote.length > 10 : quote.includes("Discipline") || quote.includes("body achieves"),
  quote.slice(0, 48) + "…"
);

const weatherVisible = await page.locator(".weather-card").isVisible().catch(() => false);
check(
  OFFLINE ? "weather card hidden when the API fails" : "weather card shows live conditions",
  OFFLINE ? !weatherVisible : weatherVisible,
  weatherVisible ? (await page.locator(".weather-text b").textContent()) : "not rendered"
);

await page.screenshot({ path: join(SHOTS, `today${OFFLINE ? "-offline" : ""}.png`), fullPage: true });

/* ---------- ticking + celebration ---------- */
console.log("\n== TICKING ==");
await page.locator(".exercise .tick").first().click();
await page.waitForTimeout(250);
check("ring updates after one tick", (await page.locator(".ring-label b").textContent()) === "13%",
  await page.locator(".ring-label b").textContent());
check("a toast fires", await page.locator("#toast.show").isVisible());

const boxes = page.locator(".exercise .tick");
for (let i = 1; i < 8; i++) await boxes.nth(i).click();
await page.waitForTimeout(700);
check("celebration appears at 100%", await page.locator("#celebration.show").isVisible());
check("first-workout badge is awarded",
  ((await page.locator(".gains").textContent()) || "").includes("First Step"),
  await page.locator(".gains").textContent());
await page.screenshot({ path: join(SHOTS, `celebration${OFFLINE ? "-offline" : ""}.png`) });
await page.locator("#celebration .btn-primary").click();
await page.waitForTimeout(300);

/* ---------- persistence ---------- */
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(700);
check("ticks survive a reload", (await page.locator(".ring-label b").textContent()) === "100%",
  await page.locator(".ring-label b").textContent());

/* ---------- Progress ---------- */
console.log("\n== PROGRESS ==");
await page.locator(".tabbar button", { hasText: "Progress" }).click();
await page.waitForTimeout(900);
check("streak counts today", (await page.locator(".hero-num").textContent()) === "1",
  await page.locator(".hero-num").textContent());
check("heatmap draws 12 weeks", (await page.locator(".heat-cell").count()) >= 84,
  `${await page.locator(".heat-cell").count()} cells`);
check("bar chart renders", (await page.locator(".bars .bar-hit").count()) === 8);
check("badges render", (await page.locator(".badge").count()) === 10);
check("one badge is unlocked", (await page.locator(".badge.on").count()) === 1);

const calText = (await page.locator(".calories-card").textContent()) || "";
check(
  OFFLINE ? "calorie card degrades gracefully" : "calorie estimate from the API",
  OFFLINE ? calText.length > 0 : /kcal|Estimating/.test(calText),
  calText.replace(/\s+/g, " ").slice(0, 70)
);
await page.screenshot({ path: join(SHOTS, `progress${OFFLINE ? "-offline" : ""}.png`), fullPage: true });

/* ---------- Routine + library ---------- */
console.log("\n== ROUTINE ==");
await page.locator(".tabbar button", { hasText: "Routine" }).click();
await page.waitForTimeout(400);
check("editor lists the routine", (await page.locator(".edit-row").count()) === 8);
check("rest-day picker has 7 days", (await page.locator(".day-btn").count()) === 7);

await page.locator(".library-card .btn").click();
await page.waitForTimeout(1200);
const libRows = await page.locator(".library-row").count();
check(
  OFFLINE ? "library falls back to the bundled list" : "library loads from wger",
  libRows > 0,
  `${libRows} results`
);
if (!OFFLINE) {
  check("wger names render",
    ((await page.locator(".library-row b").first().textContent()) || "").includes("Split Squat") ||
      ((await page.locator(".library-row b").first().textContent()) || "").includes("Push-Up"),
    await page.locator(".library-row b").first().textContent());
}

await page.locator(".library-add").first().click();
await page.waitForTimeout(400);
check("adding from the library prefills the form",
  ((await page.locator("#fName").inputValue()) || "").length > 0,
  await page.locator("#fName").inputValue());
await page.locator(".form-card .btn-primary").click();
await page.waitForTimeout(400);
check("the added exercise joins the routine", (await page.locator(".edit-row").count()) === 9,
  `${await page.locator(".edit-row").count()} rows`);
await page.screenshot({ path: join(SHOTS, `routine${OFFLINE ? "-offline" : ""}.png`), fullPage: true });

/* ---------- keyboard reorder ---------- */
const firstName = await page.locator(".edit-row .name").first().textContent();
await page.locator(".drag-handle").first().focus();
await page.keyboard.press("ArrowDown");
await page.waitForTimeout(300);
check("keyboard reorder moves a row",
  (await page.locator(".edit-row .name").nth(1).textContent()) === firstName,
  `${firstName} → slot 2`);

/* ---------- guided player ---------- */
console.log("\n== GUIDED PLAYER ==");
await page.locator(".tabbar button", { hasText: "Today" }).click();
await page.waitForTimeout(300);
await page.locator("#reset, .reset").first().click();
await page.waitForTimeout(300);
await page.locator(".action-row .btn-primary").click();
await page.waitForTimeout(600);
check("player opens", await page.locator("#player.show").isVisible());
check("player shows the first exercise", (await page.locator(".player-name").textContent()) !== "Breathe",
  await page.locator(".player-name").textContent());
await page.screenshot({ path: join(SHOTS, `player${OFFLINE ? "-offline" : ""}.png`) });

/* The first exercise may be timed or rep-based depending on the routine, and
   the player behaves differently for each — so assert the right thing rather
   than assuming a ring is on screen. */
const timed = await page.locator(".player-ring").isVisible().catch(() => false);
if (timed) {
  const before = await page.locator(".player-count").textContent();
  await page.waitForTimeout(2200);
  const after = await page.locator(".player-count").textContent();
  check("timed move counts down", before !== after, `${before} → ${after}`);
} else {
  const reps = await page.locator(".player-reps").textContent();
  check("rep-based move shows its target and waits for a tap",
    /^\d+$/.test((reps || "").trim()) &&
      (await page.locator(".player-actions .btn-primary").textContent()) === "Done",
    `${reps} reps`);
}

await page.locator(".player-exit").click();
await page.waitForTimeout(400);
check("exit closes the player", !(await page.locator("#player.show").isVisible()));

/* ---------- report ---------- */
console.log("\n== APIs CALLED ==");
console.log("  " + ([...apiHits].join(", ") || "none"));

console.log("\n== ASSET 404s ==");
console.log("  " + (notFound.length ? notFound.join(", ") : "none"));

console.log("\n== CONSOLE ERRORS ==");
if (errors.length) errors.forEach((e) => console.log("  ! " + e));
else console.log("  none");

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

await browser.close();
server.close();
process.exit(failed.length || errors.length || notFound.length ? 1 : 0);
