import {test,expect} from '@playwright/test';

test('catalog lists all sixty unique routes and nine populated categories, supports Persian variants and no results',async({page})=>{
  await page.goto('/learn/catalog/');
  const sections=page.locator('.catalog-section');
  await expect(sections).toHaveCount(9);
  const links=await page.locator('.lesson-card').evaluateAll(cards=>cards.map(c=>c.getAttribute('href')));
  expect(new Set(links).size).toBe(60);
  for(const href of new Set(links)){expect(href).toMatch(/^\/learn\/concepts\/.+\/$/);const response=await page.request.get(href!);expect(response.ok(),href!).toBeTruthy();}
  for(const section of await sections.all())expect(await section.locator('.lesson-card').count()).toBeGreaterThan(0);
  await expect(page.locator('#security .lesson-card')).toHaveCount(5);
  await expect(page.locator('#computer-science .lesson-card')).toHaveCount(5);
  const filter=page.locator('#filter');
  await filter.fill('jwt');
  await expect(page.locator('.lesson-card:visible').first()).toContainText('JWT');
  await filter.fill('كنترل');
  expect(await page.locator('.lesson-card:visible').count()).toBeGreaterThan(0);
  await filter.fill('zzzz-no-such-lesson-zzzz');
  await expect(page.locator('#no-results')).toBeVisible();
  await expect(page.locator('.lesson-card:visible')).toHaveCount(0);
  await filter.clear();
  await expect(page.locator('#no-results')).toBeHidden();
  await expect(sections).toHaveCount(9);
});

test('picker provides routes to complete library and search without changing five levels',async({page})=>{
  await page.goto('/learn/');
  await page.getByRole('button',{name:'انتخاب درس',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'انتخاب درس'});
  await expect(dialog.getByRole('tab')).toHaveCount(5);
  await expect(dialog.getByRole('link',{name:/همهٔ آموزش‌ها/})).toHaveAttribute('href','/learn/catalog/');
  await expect(dialog.getByRole('link',{name:'درس‌های زیرساخت سرور'})).toHaveAttribute('href','/learn/catalog/#server-infrastructure');
  await dialog.getByRole('link',{name:'جست‌وجوی درس‌ها'}).click();
  await expect(page).toHaveURL(/\/learn\/search\/$/);
});

test('search returns working results for English and Persian',async({page})=>{
  await page.goto('/learn/search/');
  const field=page.locator('#search input');
  await expect(field).toBeVisible();
  for(const query of ['HTTP','درخواست']){
    await field.fill('');
    await expect(page.locator('.pagefind-ui__result-link')).toHaveCount(0);
    await field.fill(query);
    const results=page.locator('.pagefind-ui__result-link');
    await expect(results.first()).toBeVisible({timeout:20000});
    const href=await results.first().getAttribute('href');
    expect(href).toBeTruthy();
    const resultUrl=new URL(href!,page.url());
    expect(resultUrl.pathname).toMatch(/^\/learn\/concepts\//);
    const response=await page.request.get(resultUrl.href);
    expect(response.ok()).toBeTruthy();
  }
});

test('404 provides a working home link',async({page})=>{
  await page.goto('/learn/404.html');
  await expect(page.getByRole('heading',{name:'در شبکه گم شدید!'})).toBeVisible();
  await page.getByRole('link',{name:/بازگشت به لرن/}).click();
  await expect(page).toHaveURL(/\/learn\/$/);
});

for(const slug of ['load-balancing','replication','reverse-proxy','horizontal-scaling','vertical-scaling','health-checks','service-discovery','connection-pooling','failover','session-affinity']){
test(slug+' — Persian lesson and every quiz option gives feedback',async({page})=>{
  await page.goto('/learn/concepts/server-infrastructure/'+slug+'/');
  await expect(page.locator('html')).toHaveAttribute('lang','fa');
  await expect(page.getByRole('heading',{name:'مدل ذهنی',exact:true})).toBeVisible();
  await expect(page.locator('.learning-content [lang=en][dir=ltr] .server-lab')).toBeVisible();
  const quizzes=page.locator('section.lab').filter({has:page.locator('.quiz-option')});
  await expect(quizzes).toHaveCount(2);
  for(const quiz of await quizzes.all()){
    await quiz.scrollIntoViewIfNeeded();
    const options=quiz.locator('.quiz-option');
    let correct=0;
    for(const option of await options.all()){
      await expect(quiz.locator('xpath=ancestor::astro-island[1]')).not.toHaveAttribute('ssr','');
      await option.click();
      const feedback=quiz.locator('.quiz-feedback');
      await expect(feedback).toBeVisible();
      if((await feedback.textContent())?.includes('آفرین، درست است!'))correct++;
    }
    expect(correct).toBe(1);
  }
});
}
