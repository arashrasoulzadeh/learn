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
  await expect(lab.locator('svg')).toBeVisible();
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
