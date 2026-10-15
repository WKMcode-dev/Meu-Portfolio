const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const { createServer } = require("node:http");
  const { readFile } = require("node:fs/promises");
  const { resolve, join, extname } = require("node:path");
  const { pathToFileURL } = require("node:url");
  const root = resolve(__dirname, "..");
  const screenshotDir = process.env.PORTFOLIO_SCREENSHOTS;
  if (screenshotDir)
    await require("node:fs/promises").mkdir(screenshotDir, { recursive: true });
  const screenshot = async (page, name) => {
    if (screenshotDir)
      await page.screenshot({ path: join(screenshotDir, name + ".png") });
  };
  const server = createServer(async (req, res) => {
    const path = resolve(
      root,
      "." +
        decodeURIComponent(
          new URL(req.url, "http://localhost").pathname,
        ).replace(/\/$/, "/index.html"),
    );
    if (!path.startsWith(root + "/")) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const data = await readFile(path);
      res.setHeader(
        "content-type",
        {
          ".html": "text/html",
          ".js": "text/javascript",
          ".css": "text/css",
          ".svg": "image/svg+xml",
          ".webp": "image/webp",
          ".png": "image/png",
        }[extname(path)] || "application/octet-stream",
      );
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.TEST_BROWSER_EXECUTABLE || undefined,
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
      });
      const page = await context.newPage();
      page.setDefaultTimeout(6000);
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url);
      const mobile = width <= 700,
        toggle = page.locator(".menu-toggle");
      if (mobile) {
        assert.equal(await page.locator(".site-nav").isVisible(), false);
        await toggle.click();
        assert.equal(await toggle.getAttribute("aria-expanded"), "true");
        await screenshot(page, `menu-v11-${width}`);
        await page.keyboard.press("Escape");
        assert.equal(await toggle.getAttribute("aria-expanded"), "false");
        await toggle.click();
      }
      await page.locator(".settings-open").click();
      assert.equal(await page.locator("#settings-dialog").isVisible(), true);
      await page.getByRole("radio", { name: "Claro", exact: true }).check();
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        "light",
      );
      await page
        .getByRole("combobox", { name: "Idioma", exact: true })
        .selectOption("en");
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.match(
        await page.locator("#hero-title").textContent(),
        /Ideas into/,
      );
      await page
        .getByRole("switch", { name: "Visual effects", exact: true })
        .uncheck();
      assert.equal(
        await page.locator("html").getAttribute("data-effects"),
        "off",
      );
      await screenshot(page, `settings-v11-${width}`);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("#settings-dialog").isVisible(), false);
      if (mobile)
        assert.equal(
          await page
            .locator(".menu-toggle")
            .evaluate((e) => e === document.activeElement),
          true,
        );
      await page.reload();
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        "light",
      );
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.equal(await page.locator("#effects").isChecked(), false);
      await screenshot(page, `portfolio-light-v11-${width}`);
      if (mobile)
        await page
          .getByRole("button", { name: "Open menu", exact: true })
          .click();
      await page.getByRole("button", { name: "Settings", exact: true }).click();
      await page
        .getByRole("combobox", { name: "Language", exact: true })
        .selectOption("es");
      await page.getByRole("radio", { name: "Oscuro", exact: true }).check();
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "Detalles", exact: true })
        .first()
        .click();
      assert.match(
        await page.locator("#dialog-description").textContent(),
        /comprobaciones ICMP/,
      );
      await page.keyboard.press("Escape");
      if (mobile)
        await page
          .getByRole("button", { name: "Abrir menú", exact: true })
          .click();
      await page.getByRole("button", { name: "Ajustes", exact: true }).click();
      await page
        .getByRole("combobox", { name: "Idioma", exact: true })
        .selectOption("pt-BR");
      await page.keyboard.press("Escape");
      await page.locator("#inicio").scrollIntoViewIfNeeded();
      await screenshot(page, `portfolio-dark-v11-${width}`);
      const overflow = await page.locator("body *").evaluateAll((es) =>
        es
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return (
              r.width &&
              r.right > innerWidth + 2 &&
              getComputedStyle(e).position !== "fixed"
            );
          })
          .map((e) => e.tagName + "." + e.className),
      );
      assert.deepEqual(overflow, []);
      assert.deepEqual(errors, []);
      console.log(
        "PASS",
        width,
        "menu, themes, 3 languages, effects, storage, dialogs, layout",
      );
      await context.close();
    }
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(url);
    assert.equal(
      await page.locator("html").getAttribute("data-effects"),
      "off",
    );
    await context.close();
    const noStorage = await browser.newContext();
    await noStorage.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("blocked");
        },
      });
    });
    const blocked = await noStorage.newPage();
    await blocked.goto(url);
    await blocked
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await blocked.getByRole("radio", { name: "Claro", exact: true }).check();
    assert.equal(
      await blocked.locator("html").getAttribute("data-theme"),
      "light",
    );
    await noStorage.close();
    const offline = await browser.newPage();
    await offline.goto(pathToFileURL(join(root, "index.html")).href);
    await offline
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    assert.equal(await offline.locator("#settings-dialog").isVisible(), true);
    await offline.close();
    const animated = await browser.newContext({
      viewport: { width: 390, height: 900 },
      reducedMotion: "no-preference",
    });
    const motionPage = await animated.newPage();
    await motionPage.goto(url);
    assert.equal(
      await motionPage.evaluate(() => window.gsap?.version),
      "3.15.0",
    );
    assert.ok(
      await motionPage.evaluate(() => window.ScrollTrigger.getAll().length > 0),
    );
    const sheen = () => motionPage.locator(".brand-word").evaluate((el) =>
      getComputedStyle(el).getPropertyValue("--chrome-position"));
    const initialSheen = await sheen();
    await motionPage.evaluate(() => scrollTo(0, 500));
    await motionPage.waitForFunction((initial) =>
      getComputedStyle(document.querySelector(".brand-word")).getPropertyValue("--chrome-position") !== initial,
      initialSheen);
    await screenshot(motionPage, "wkm-chrome-mobile");
    await motionPage.evaluate(() => scrollTo(0, 0));
    await motionPage.locator(".menu-toggle").click();
    await motionPage
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    await motionPage
      .getByRole("switch", { name: "Efeitos visuais", exact: true })
      .uncheck();
    assert.equal(
      await motionPage.evaluate(() => window.ScrollTrigger.getAll().length),
      0,
    );
    await motionPage
      .getByRole("switch", { name: "Efeitos visuais", exact: true })
      .check();
    assert.ok(
      await motionPage.evaluate(() => window.ScrollTrigger.getAll().length > 0),
    );
    await motionPage.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await motionPage.locator("html").getAttribute("data-effects"),
      "on",
    );
    assert.ok(
      await motionPage.evaluate(() => window.ScrollTrigger.getAll().length > 0),
    );
    await animated.close();
    console.log(
      "PASS GSAP loaded, cleanup/restart and explicit effects override",
    );
    const system = await browser.newContext({ reducedMotion: "no-preference" });
    const systemPage = await system.newPage();
    await systemPage.goto(url);
    await systemPage.emulateMedia({ reducedMotion: "reduce" });
    await systemPage.waitForFunction(
      () => document.documentElement.dataset.effects === "off",
    );
    assert.equal(
      await systemPage.evaluate(() => window.ScrollTrigger.getAll().length),
      0,
    );
    await system.close();
    const touch = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    const touchPage = await touch.newPage();
    await touchPage.goto(url);
    assert.equal(
      await touchPage.locator("html").getAttribute("data-effects"),
      "off",
    );
    await touchPage.locator(".menu-toggle").tap();
    await touchPage
      .getByRole("button", { name: "Configurações", exact: true })
      .tap();
    await touchPage
      .getByRole("switch", { name: "Efeitos visuais", exact: true })
      .tap();
    assert.equal(
      await touchPage.locator("html").getAttribute("data-effects"),
      "on",
    );
    assert.ok(
      await touchPage.evaluate(() => window.ScrollTrigger.getAll().length > 0),
    );
    assert.equal(
      await touchPage
        .locator(".settings-shell")
        .evaluate((el) => getComputedStyle(el).clipPath),
      "none",
    );
    assert.equal(
      await touchPage
        .locator(".settings-frame path")
        .getAttribute("d")
        .then(Boolean),
      true,
    );
    await touchPage
      .getByRole("button", { name: "Fechar configurações", exact: true })
      .tap();
    await touchPage.reload();
    assert.equal(
      await touchPage.locator("html").getAttribute("data-effects"),
      "on",
    );
    await touchPage.locator(".menu-toggle").tap();
    await touchPage.evaluate(() => {
      const modal = document.getElementById("settings-dialog");
      window.modalAnimationObserved = false;
      new MutationObserver(() => { if (parseFloat(getComputedStyle(modal).opacity) < 1) window.modalAnimationObserved = true; }).observe(modal, { attributes: true, attributeFilter: ["style"] });
    });
    await touchPage
      .getByRole("button", { name: "Configurações", exact: true })
      .tap();
    await touchPage.waitForFunction(() => window.modalAnimationObserved);
    await touchPage.setViewportSize({ width: 390, height: 320 });
    await touchPage.waitForFunction(
      () =>
        document.querySelector(".settings-content").scrollHeight >
        document.querySelector(".settings-content").clientHeight,
    );
    const modalBox = await touchPage.locator(".settings-dialog").boundingBox();
    assert.ok(modalBox.y >= 0 && modalBox.y + modalBox.height <= 321);
    await touch.close();
    console.log(
      "PASS system default, mobile touch effects activation/persistence, animated modal and small-height scrolling",
    );
    const noJS = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 900 },
    });
    const plain = await noJS.newPage();
    await plain.goto(url);
    assert.equal(await plain.locator(".site-nav").isVisible(), true);
    assert.equal(
      await plain
        .getByRole("heading", { name: "Painel Ping", exact: true })
        .count(),
      1,
    );
    await noJS.close();
    const noMotionLibrary = await browser.newContext();
    await noMotionLibrary.route("**/vendor/**", (route) => route.abort());
    const fallback = await noMotionLibrary.newPage();
    await fallback.goto(url);
    await fallback
      .getByRole("button", { name: "Configurações", exact: true })
      .click();
    assert.equal(await fallback.locator("#settings-dialog").isVisible(), true);
    await noMotionLibrary.close();
    console.log(
      "PASS reduced motion, blocked storage, direct local file, no JS, optional animation fallback",
    );
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
