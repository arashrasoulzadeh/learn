import {test,expect} from '@playwright/test';

test('Persian HTTP lesson opens directly and all stages and scenarios work',async({page})=>{
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.setDefaultTimeout(10_000);
  // Functional tests must not wait on external web fonts or other third-party requests.
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.goto('/learn/',{waitUntil:'domcontentloaded',timeout:20_000});
  await expect(page.locator('html')).toHaveAttribute('lang','fa');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  await expect(page.getByRole('heading',{level:1,name:'چرخهٔ یک درخواست HTTP'})).toBeVisible();
  const lab=page.getByRole('region',{name:'آموزش تعاملی درخواست HTTP'});
  await expect(lab).toBeVisible();
  await expect(lab.locator('.request-canvas svg')).toBeVisible();
  const steps=lab.getByRole('navigation',{name:'مراحل درخواست'}).getByRole('button');
  await expect(steps).toHaveCount(9);
  // Astro removes ssr once the React island has hydrated.
  await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
  for(let i=0;i<9;i++){
    await steps.nth(i).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current','step');
    await expect(lab.locator('.request-counter')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR')+' از ۹');
    await expect(lab.locator('.request-stage h2')).not.toBeEmpty();
  }
  for(const [scenario,method,status] of [['post','POST','201 Created'],['missing','GET','404 Not Found'],['error','GET','500 Internal Server Error'],['get','GET','200 OK']]){
    await lab.getByLabel('سناریو').selectOption(scenario);
    await expect(steps.first()).toHaveAttribute('aria-current','step');
    await steps.nth(7).click();
    const messages=lab.locator('.request-message pre');
    await expect(messages.nth(0)).toHaveAttribute('dir','ltr');
    await expect(messages.nth(0)).toContainText(method+' /api/products');
    await expect(messages.nth(1)).toHaveAttribute('dir','ltr');
    await expect(messages.nth(1)).toContainText('HTTP/1.1 '+status);
  }
  expect(errors).toEqual([]);
});


test('RTL diagram and shared header controls work on desktop and phone',async({page})=>{
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.goto('/learn/',{waitUntil:'domcontentloaded'});
  const header=page.locator('.learning-title');
  const picker=header.locator('#lesson-picker summary');
  const about=header.locator('#about-project summary');
  const title=header.getByRole('heading',{level:1});
  await expect(picker).toBeVisible();
  expect((await picker.boundingBox())!.x).toBeLessThan((await title.boundingBox())!.x);
  await picker.click();
  const menu=header.getByRole('navigation',{name:'درس‌های قابل انتخاب'});
  await expect(menu.getByRole('link')).toHaveCount(1);
  await expect(menu.getByRole('link')).toHaveAttribute('href','/learn/concepts/networking/http-request/');
  await about.click();
  await expect(menu).not.toBeVisible();
  await expect(header.getByText('توسعه‌دهنده: آرش رسول زاده',{exact:true})).toBeVisible();
  await expect(header.getByText('تقدیم به دوست عزیزم سمیه ابراهیم زاده',{exact:true})).toBeVisible();
  await expect(header.getByRole('link',{name:/گیت‌هاب/})).toHaveAttribute('href','https://github.com/arashrasoulzadeh/learn');
  await page.keyboard.press('Escape');
  await expect(header.getByText('تقدیم به دوست عزیزم سمیه ابراهیم زاده',{exact:true})).not.toBeVisible();
  const lab=page.getByRole('region',{name:'آموزش تعاملی درخواست HTTP'});
  await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
  const graph=lab.locator('.request-canvas svg');
  await expect(graph.locator('[data-node=browser]')).toHaveAttribute('transform','translate(700 220)');
  await expect(graph.locator('[data-node=db]')).toHaveAttribute('transform','translate(90 220)');
  const steps=lab.getByRole('navigation',{name:'مراحل درخواست'}).getByRole('button');
  await steps.nth(4).click();
  await expect(graph.locator('[data-flow-path]')).toHaveAttribute('d','M 700 220 L 500 220');
  await steps.nth(7).click();
  await expect(graph.locator('[data-flow-path]')).toHaveAttribute('d','M 295 220 L 500 220 L 700 220');
  await page.setViewportSize({width:390,height:844});
  await picker.click();
  await expect(menu.getByRole('link')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  await menu.getByRole('link').click();
  await expect(page).toHaveURL(/\/concepts\/networking\/http-request\/$/);
});


test('polished learning layout keeps visual order RTL and controls accessible',async({page})=>{
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/learn/',{waitUntil:'domcontentloaded'});
  const lab=page.getByRole('region',{name:'آموزش تعاملی درخواست HTTP'});
  await expect(lab).toBeVisible();
  await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
  const graph=lab.locator('.request-canvas'),detail=lab.locator('.request-detail');
  await expect(graph.locator('svg')).toBeVisible();
  expect((await graph.boundingBox())!.x).toBeGreaterThan((await detail.boundingBox())!.x);
  const timeline=lab.getByRole('navigation',{name:'مراحل درخواست'}).getByRole('button');
  expect((await timeline.first().boundingBox())!.x).toBeGreaterThan((await timeline.last().boundingBox())!.x);
  await lab.getByRole('button',{name:'مرحلهٔ بعد'}).click();
  await expect(timeline.nth(1)).toHaveAttribute('aria-current','step');
  await lab.getByRole('button',{name:'مرحلهٔ قبل'}).click();
  await expect(timeline.first()).toHaveAttribute('aria-current','step');
  await timeline.nth(4).click();
  await expect(lab.locator('.request-message pre').first()).toHaveAttribute('dir','ltr');
  expect(await lab.locator('.request-progress span').evaluate(el=>parseFloat((el as HTMLElement).style.width))).toBeCloseTo(5/9*100);
  await page.screenshot({path:'test-results/http-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await expect(graph).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  expect((await timeline.first().boundingBox())!.x).toBeGreaterThan((await timeline.nth(2).boundingBox())!.x);
  await lab.getByRole('button',{name:'مرحلهٔ بعد'}).click();
  await expect(timeline.nth(5)).toHaveAttribute('aria-current','step');
  await page.screenshot({path:'test-results/http-mobile.png',animations:'disabled',fullPage:true});
});
