import {test,expect} from '@playwright/test';

const curriculum=[
  {slug:'dns',cases:[['cold',5,'192.0.2.10'],['warm',3,'192.0.2.10'],['missing',3,'NXDOMAIN']],correct:1},
  {slug:'ip-port',cases:[['https',4,'LISTEN :443'],['closed',3,'Connection refused']],correct:1},
  {slug:'tcp',cases:[['normal',5,'ACK 105'],['loss',5,'ACK 105 after retry']],correct:1},
  {slug:'udp',cases:[['normal',4,'Received: 1, 2, 3'],['loss',4,'No UDP retransmission'],['reorder',3,'Received: 2, 1']],correct:2},
  {slug:'tls-https',cases:[['valid',5,'TLS application_data: ciphertext'],['invalid',3,'HTTPS request blocked']],correct:1},
  {slug:'http-methods',cases:[['get',3,'Keyboard'],['post',3,'Mouse'],['put',3,'204 No Content'],['patch',3,'25'],['delete',3,'204 No Content']],correct:1},
  {slug:'http-status-codes',cases:[['continue',3,'200 OK'],['ok',3,'200 OK'],['redirect',3,'200 OK after redirect'],['missing',3,'404 Not Found'],['server-error',3,'500 Internal Server Error']],correct:0},
  {slug:'cookies-sessions',cases:[['login',5,'200 OK · user=42'],['expired',3,'401 Unauthorized'],['logout',3,'Session revoked; cookie cleared']],correct:1},
  {slug:'websocket',cases:[['chat',5,'CLOSED 1000'],['disconnect',4,'Resynced from id=43'],['rejected',2,'WebSocket not established']],correct:1}
] as const;

for(const lesson of curriculum){
  test(lesson.slug+' — all scenarios, quiz and responsive diagram',async({page})=>{
    const errors:string[]=[];page.on('pageerror',err=>errors.push(err.message));
    await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
    await page.setViewportSize({width:1440,height:900});
    await page.goto('/learn/concepts/networking/'+lesson.slug+'/',{waitUntil:'domcontentloaded'});
    await expect(page.locator('html')).toHaveAttribute('dir','rtl');
    const lab=page.locator('[data-lesson="'+lesson.slug+'"]');
    await expect(lab).toBeVisible();
    await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
    const diagram=lab.locator('.flow-diagram');
    await expect(diagram).toHaveAttribute('data-layout','wide');
    const controls=lab.getByLabel('سناریو');
    await expect(controls.locator('option')).toHaveCount(lesson.cases.length);
    const steps=lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button');
    for(const [id,count,expected] of lesson.cases){
      await controls.selectOption(id);
      await expect(steps).toHaveCount(count);
      await expect(steps.first()).toHaveAttribute('aria-current','step');
      for(let i=0;i<count;i++){
        await steps.nth(i).click();
        await expect(steps.nth(i)).toHaveAttribute('aria-current','step');
        await expect(lab.locator('.request-counter')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR')+' از '+count.toLocaleString('fa-IR'));
        await expect(lab.locator('.request-stage h2')).not.toBeEmpty();
        await expect(lab.locator('.request-message pre').first()).not.toBeEmpty();
        await expect(lab.locator('.request-message pre').last()).toHaveAttribute('dir','ltr');
      }
      await expect(lab.locator('.request-message pre').last()).toContainText(expected);
    }
    await page.screenshot({path:'test-results/networking/'+lesson.slug+'-desktop.png',animations:'disabled'});
    await page.setViewportSize({width:390,height:844});
    await expect(diagram).toHaveAttribute('data-layout','compact');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
    expect((await diagram.boundingBox())!.width).toBeGreaterThan(280);
    await lab.getByRole('button',{name:'از ابتدا',exact:true}).click();
    await expect(steps.first()).toHaveAttribute('aria-current','step');
    await lab.getByRole('button',{name:'مرحلهٔ بعد'}).click();
    await expect(steps.nth(1)).toHaveAttribute('aria-current','step');
    await lab.locator('.network-extra summary').filter({hasText:'سنجش یادگیری'}).click();
    const options=lab.locator('.quiz-option');
    await expect(options).toHaveCount(3);
    await options.nth((lesson.correct+1)%3).click();
    await expect(lab.getByRole('status')).toContainText('درست نیست');
    await options.nth(lesson.correct).click();
    await expect(lab.getByRole('status')).toContainText('درست است');
    await lab.locator('.network-extra summary').filter({hasText:'منابع بیشتر'}).click();
    expect(await lab.locator('.network-extra a').count()).toBeGreaterThanOrEqual(2);
    await page.screenshot({path:'test-results/networking/'+lesson.slug+'-mobile.png',animations:'disabled',fullPage:true});
    expect(errors).toEqual([]);
  });
}

test('level-one picker lists all ten lessons in order and navigates to DNS',async({page})=>{
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.goto('/learn/',{waitUntil:'domcontentloaded'});
  await page.locator('#lesson-picker summary').click();
  const links=page.getByRole('navigation',{name:'درس‌های قابل انتخاب'}).getByRole('link');
  await expect(links).toHaveCount(10);
  const slugs=['http-request',...curriculum.map(l=>l.slug)];
  for(let i=0;i<slugs.length;i++)await expect(links.nth(i)).toHaveAttribute('href','/learn/concepts/networking/'+slugs[i]+'/');
  await links.nth(1).click();
  await expect(page).toHaveURL(/\/networking\/dns\/$/);
  await page.locator('#lesson-picker summary').click();
  await expect(links.nth(1)).toHaveAttribute('aria-current','page');
});
