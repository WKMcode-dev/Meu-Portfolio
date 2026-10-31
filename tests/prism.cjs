const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
(async()=>{
 const engine = process.env.TEST_ENGINE === 'webkit' ? webkit : chromium;
 const browser = await engine.launch(engine === chromium ? {executablePath:process.env.TEST_BROWSER_EXECUTABLE || undefined,args:['--enable-unsafe-swiftshader']} : {});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:950},deviceScaleFactor:2});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error') errors.push(m.text());});
  await page.goto(pathToFileURL(resolve('index.html')).href);
  await page.locator('.prism-active').waitFor({timeout:8000});
  await page.waitForTimeout(1600);
  const logo=page.locator('.brand-word');
  const first=await logo.screenshot(); await page.waitForTimeout(600);const second=await logo.screenshot();
  assert.notDeepEqual(first,second,'Light must change rendered pixels over time');
  await page.evaluate(()=>window.PortfolioSettings.set({effects:false}));
  const frozen=await logo.screenshot();await page.waitForTimeout(300);assert.deepEqual(frozen,await logo.screenshot(),'Effects off stops rendering');
  if(process.env.PORTFOLIO_SCREENSHOTS) await page.screenshot({path:resolve(process.env.PORTFOLIO_SCREENSHOTS,'prism-webgl-desktop.png')});
  await page.evaluate(()=>window.PortfolioSettings.set({effects:true}));
  await page.setViewportSize({width:390,height:850});await page.waitForTimeout(300);
  if(process.env.PORTFOLIO_SCREENSHOTS) await page.screenshot({path:resolve(process.env.PORTFOLIO_SCREENSHOTS,'prism-webgl-mobile.png')});
  await page.emulateMedia({forcedColors:'active'});
  assert.equal(await page.locator('.brand-prism').isVisible(),false);
  await page.emulateMedia({forcedColors:'none'});
  const glError=await page.locator('canvas.brand-prism').evaluate(c=>c.getContext('webgl').getError());assert.equal(glError,0);
  await page.locator('canvas.brand-prism').evaluate(c=>c.getContext('webgl').getExtension('WEBGL_lose_context').loseContext());
  await page.waitForTimeout(100);assert.equal(await page.locator('.prism-active').count(),0);
  assert.deepEqual(errors,[]);console.log('PASS WebGL: animated pixels, pause, resize, context loss fallback, no GL or JS errors');
  await page.close();
 } finally{await browser.close();}
})();
