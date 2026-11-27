import {test,expect} from '@playwright/test';

const curriculum=[
  {slug:'dns',cases:[['cold',5,'192.0.2.10'],['warm',3,'192.0.2.10'],['missing',3,'NXDOMAIN'],['expired',3,'192.0.2.11']],correct:1},
  {slug:'ip-port',cases:[['https',4,'LISTEN :443'],['closed',3,'Connection refused'],['filtered',3,'Connection timeout']],correct:1},
  {slug:'tcp',cases:[['normal',5,'ACK 105'],['loss',5,'ACK 105 after retry'],['duplicate',4,'ACK 105; no duplicate delivery']],correct:1},
  {slug:'udp',cases:[['normal',4,'Received: 1, 2, 3'],['loss',4,'No UDP retransmission'],['reorder',3,'Received: 2, 1'],['duplicate',3,'Duplicate ignored by app']],correct:2},
  {slug:'tls-https',cases:[['valid',5,'TLS application_data: ciphertext'],['invalid',3,'HTTPS request blocked'],['expired',3,'HTTPS request blocked']],correct:1},
  {slug:'http-methods',cases:[['get',3,'Keyboard'],['post',3,'Mouse'],['put',3,'204 No Content'],['patch',3,'25'],['delete',3,'204 No Content'],['retry-post',5,'Created id=44; duplicate product']],correct:1},
  {slug:'http-status-codes',cases:[['continue',3,'200 OK'],['ok',3,'200 OK'],['redirect',3,'200 OK after redirect'],['missing',3,'404 Not Found'],['server-error',3,'500 Internal Server Error'],['limited',3,'200 OK after wait']],correct:0},
  {slug:'cookies-sessions',cases:[['login',6,'200 OK · user=42'],['expired',3,'401 Unauthorized'],['logout',3,'Session revoked; cookie cleared'],['stolen-revoked',3,'401 Unauthorized']],correct:1},
  {slug:'websocket',cases:[['chat',5,'CLOSED 1000'],['disconnect',4,'Resynced from id=43'],['rejected',2,'WebSocket not established'],['heartbeat',3,'101 Switching Protocols']],correct:1}
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
    await expect(lab.locator('.lesson-goal p')).not.toBeEmpty();
    await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
    const diagram=lab.locator('.flow-diagram');
    await expect(diagram).toHaveAttribute('data-layout','wide');
    const stateCard=lab.locator('.request-canvas > .protocol-state');
    await expect(stateCard).toBeVisible();
    expect(await stateCard.evaluate(el=>{const box=el.getBoundingClientRect();const panel=el.closest('.request-canvas')!.getBoundingClientRect();return box.top>=panel.top-1&&box.bottom<=panel.bottom+1;})).toBe(true);
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
        await expect(lab.locator('.stage-explanation p')).not.toBeEmpty();
        await expect(lab.locator('.stage-diagnostic p')).not.toBeEmpty();
        await expect(lab.locator('.flight-steps .flight-chip').first()).not.toBeEmpty();
        const hopCount=await lab.locator('.flow-diagram [data-flight]').count();
        await expect(lab.locator('.flight-chip')).toHaveCount(hopCount);
        await expect(lab.locator('.request-canvas > .protocol-state')).toBeVisible();
        await expect(lab.locator('.backend-prediction p')).not.toBeEmpty();
        const state=lab.locator('.protocol-state[data-protocol="'+lesson.slug+'"]');
        await expect(state.locator('.state-cell')).toHaveCount(3);
        await expect(state.locator('.state-step')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR'));
        for(const value of await state.locator('.state-value').all())await expect(value).not.toBeEmpty();
        await expect(lab.locator('.stage-route')).toBeVisible();
        const lines=diagram.locator('[data-visible-flow]');
        for(const line of await lines.all()){
          const d=await line.getAttribute('d');
          expect(d).toMatch(/^M -?\d+(\.\d+)? -?\d+(\.\d+)? L -?\d+(\.\d+)? -?\d+(\.\d+)?$/);
        }
        await expect(lab.locator('.request-message pre').first()).not.toBeEmpty();
        await expect(lab.locator('.request-message pre').last()).toHaveAttribute('dir','ltr');
      }
      await expect(lab.locator('.request-message pre').last()).toContainText(expected);
      await expect(lab.locator('.practice-check')).toHaveCount(1);
    }
    await lab.getByRole('button',{name:'حالت‌های خاص',exact:true}).click();
    const edgeDialog=lab.getByRole('dialog',{name:/حالت‌های خاص و خطاها/});
    await expect(edgeDialog).toBeVisible();
    const optionsEdge=edgeDialog.locator('.edge-option');
    expect(await optionsEdge.count()).toBeGreaterThan(0);
    await optionsEdge.last().click();
    await expect(edgeDialog).not.toBeVisible();
    await expect(controls).toHaveValue(lesson.cases[lesson.cases.length-1][0]);
    await expect(steps.first()).toHaveAttribute('aria-current','step');
    await page.screenshot({path:'test-results/networking/'+lesson.slug+'-desktop.png',animations:'disabled'});
    await page.setViewportSize({width:390,height:844});
    await expect(diagram).toHaveAttribute('data-layout','compact');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
    expect((await diagram.boundingBox())!.width).toBeGreaterThan(280);
    await lab.getByRole('button',{name:'از ابتدا',exact:true}).click();
    await expect(steps.first()).toHaveAttribute('aria-current','step');
    await lab.getByRole('button',{name:'مرحلهٔ بعد'}).click();
    await expect(steps.nth(1)).toHaveAttribute('aria-current','step');
    await expect(lab.locator('.request-detail .network-extra')).toHaveCount(0);
    await lab.getByRole('button',{name:'نکته‌ها و منابع',exact:true}).click();
    await expect(lab.getByRole('dialog',{name:'مرور و تکمیل یادگیری'})).toBeVisible();
    await lab.locator('.network-extra summary').filter({hasText:'سنجش یادگیری'}).click();
    const options=lab.locator('.quiz-option');
    await expect(options).toHaveCount(3);
    for(const wrong of [0,1,2].filter(i=>i!==lesson.correct)){
      await lab.locator('.quiz-option').nth(wrong).click();
      await expect(lab.getByRole('status')).toContainText('درست نیست');
      await expect(lab.getByRole('status').locator('p')).not.toBeEmpty();
      await expect(lab.locator('.quiz-option').nth(wrong)).toHaveAttribute('aria-pressed','true');
    }
    await options.nth(lesson.correct).click();
    await expect(lab.getByRole('status')).toContainText('درست است');
    await lab.locator('.network-extra summary').filter({hasText:'تمرین عملی خارج از شبیه‌سازی'}).click();
    await expect(lab.locator('.field-exercise p').first()).not.toBeEmpty();
    await expect(lab.locator('.field-exercise small')).not.toBeEmpty();
    await lab.locator('.network-extra summary').filter({hasText:'تمرین عملی خارج از شبیه‌سازی'}).click();
    await lab.locator('.network-extra summary').filter({hasText:'منابع بیشتر'}).click();
    expect(await lab.locator('.network-extra a').count()).toBeGreaterThanOrEqual(2);
    await lab.getByRole('button',{name:'بستن پنجره'}).click();
    await expect(lab.getByRole('dialog',{name:'مرور و تکمیل یادگیری'})).not.toBeVisible();
    await page.screenshot({path:'test-results/networking/'+lesson.slug+'-mobile.png',animations:'disabled',fullPage:true});
    expect(errors).toEqual([]);
  });
}

test('level-one picker lists all ten lessons in order and navigates to DNS',async({page})=>{
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.goto('/learn/',{waitUntil:'domcontentloaded'});
  await page.locator('#lesson-picker summary').click();
  const links=page.getByRole('navigation',{name:'درس‌های قابل انتخاب'}).getByRole('link');
  await expect(links).toHaveCount(50);
  const slugs=['http-request',...curriculum.map(l=>l.slug)];
  for(let i=0;i<slugs.length;i++)await expect(links.nth(i)).toHaveAttribute('href','/learn/concepts/networking/'+slugs[i]+'/');
  await links.nth(1).click();
  await expect(page).toHaveURL(/\/networking\/dns\/$/);
  await page.locator('#lesson-picker summary').click();
  await expect(links.nth(1)).toHaveAttribute('aria-current','page');
});


const tailoredCases=[
  ['dns','expired',2,'192.0.2.11'],
  ['ip-port','filtered',2,'TIMEOUT'],
  ['tcp','duplicate',2,'Duplicate discarded'],
  ['udp','duplicate',1,'×2'],
  ['tls-https','expired',1,'Expired'],
  ['http-methods','retry-post',4,'44 · Mouse'],
  ['http-status-codes','limited',1,'429'],
  ['cookies-sessions','logout',1,'Revoked'],
  ['websocket','disconnect',2,'OPEN']
] as const;
for(const [slug,scenario,stage,expected] of tailoredCases){
  test(slug+' — tailored protocol state reflects the selected edge case',async({page})=>{
    await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
    await page.goto('/learn/concepts/networking/'+slug+'/',{waitUntil:'domcontentloaded'});
    const lab=page.locator('[data-lesson="'+slug+'"]');
    await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
    await lab.getByLabel('سناریو').selectOption(scenario);
    await lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button').nth(stage).click();
    await expect(lab.locator('.protocol-state')).toContainText(expected);
    await lab.locator('.protocol-state').scrollIntoViewIfNeeded();
    await page.screenshot({path:'test-results/networking/'+slug+'-state.png',animations:'disabled'});
  });
}

const practiceAnswers:Record<string,number>={"dns":0,"ip-port":1,"tcp":2,"udp":0,"tls-https":1,"http-methods":2,"http-status-codes":0,"cookies-sessions":1,"websocket":2};
for(const lesson of curriculum){
  test(lesson.slug+' — applied practice gives useful feedback',async({page})=>{
    await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
    await page.goto('/learn/concepts/networking/'+lesson.slug+'/',{waitUntil:'domcontentloaded'});
    const lab=page.locator('[data-lesson="'+lesson.slug+'"]');
    await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
    const steps=lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button');
    await expect(lab.locator('.practice-check')).toHaveCount(0);
    await steps.last().click();
    const practice=lab.locator('.practice-check');
    await lab.getByRole('link',{name:/حل تمرین کاربردی/}).click();
    await expect(practice).toBeFocused();
    const answer=practiceAnswers[lesson.slug];
    for(const wrong of [0,1,2].filter(i=>i!==answer)){
      await practice.locator('.practice-option').nth(wrong).click();
      await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','false');
      await expect(practice.locator('.practice-feedback p')).not.toBeEmpty();
      await expect(practice.locator('.practice-next')).toHaveCount(0);
    }
    await practice.locator('.practice-option').nth(answer).click();
    await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','true');
    await expect(practice.locator('.practice-feedback p').first()).not.toBeEmpty();
    const index=curriculum.findIndex(item=>item.slug===lesson.slug);
    if(index<curriculum.length-1)await expect(practice.locator('.practice-next')).toHaveAttribute('href','/learn/concepts/networking/'+curriculum[index+1].slug+'/');
    else await expect(practice.locator('.practice-next')).toHaveAttribute('href','/learn/concepts/software-engineering/process-thread/');
    await lab.getByRole('button',{name:'از ابتدا',exact:true}).click();
    await expect(practice).toHaveCount(0);
  });
}


test('a manually selected last TCP stage can play, stop, and replay from the beginning only after finishing',async({page})=>{
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.goto('/learn/concepts/networking/tcp/',{waitUntil:'domcontentloaded'});
  const lab=page.locator('[data-lesson="tcp"]');
  await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
  await page.clock.install();
  const steps=lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button');
  await steps.last().click();
  await lab.getByRole('button',{name:'پخش',exact:true}).click();
  await expect(steps.last()).toHaveAttribute('aria-current','step');
  await expect(lab.locator('[data-main-motion=true]')).toHaveAttribute('data-flight-count','2');
  await lab.getByRole('button',{name:'توقف',exact:true}).click();
  await expect(steps.last()).toHaveAttribute('aria-current','step');
  await lab.getByRole('button',{name:'پخش',exact:true}).click();
  await page.clock.fastForward(7000);
  await expect(lab.getByRole('button',{name:'پخش مجدد',exact:true})).toBeVisible();
  await lab.getByRole('button',{name:'پخش مجدد',exact:true}).click();
  await expect(steps.first()).toHaveAttribute('aria-current','step');
  await lab.getByRole('button',{name:'توقف',exact:true}).click();
});
