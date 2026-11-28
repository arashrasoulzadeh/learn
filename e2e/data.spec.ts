import {test,expect} from '@playwright/test';
const lessons=[
  [
    "sql-nosql",
    [
      [
        "relational",
        3,
        "JOIN result: 42,Sam"
      ],
      [
        "document",
        3,
        "order42.items[0].qty=3"
      ],
      [
        "invalid-reference",
        3,
        "Order not created"
      ]
    ],
    1,
    1,
    "invalid-reference",
    1,
    "CONFLICT FK"
  ],
  [
    "database-index",
    [
      [
        "scan",
        3,
        "D returned"
      ],
      [
        "lookup",
        3,
        "D returned; 1 heap row (model)"
      ],
      [
        "write-cost",
        3,
        "Row and index consistent"
      ]
    ],
    2,
    0,
    "lookup",
    2,
    "1 row fetched"
  ],
  [
    "b-tree",
    [
      [
        "seek",
        3,
        "found key 35"
      ],
      [
        "range",
        3,
        "20,30,35"
      ],
      [
        "split",
        3,
        "Balanced tree"
      ]
    ],
    0,
    1,
    "split",
    2,
    "sep=25"
  ],
  [
    "transactions-acid",
    [
      [
        "commit",
        4,
        "A=70; B=80; total=150"
      ],
      [
        "rollback",
        3,
        "A=100; B=50; total=150"
      ],
      [
        "isolation",
        3,
        "T2 sees 70"
      ]
    ],
    1,
    1,
    "rollback",
    2,
    "ROLLBACK"
  ],
  [
    "database-locking",
    [
      [
        "wait",
        3,
        "X owner=B"
      ],
      [
        "deadlock",
        4,
        "B rolled back; A can continue"
      ],
      [
        "ordered",
        3,
        "No cycle in this schedule"
      ]
    ],
    2,
    1,
    "deadlock",
    2,
    "WAIT B→A"
  ],
  [
    "connection-pooling",
    [
      [
        "reuse",
        3,
        "C1 available for next request"
      ],
      [
        "full",
        3,
        "R3 using C1"
      ],
      [
        "leak",
        3,
        "R3 timed out"
      ]
    ],
    0,
    1,
    "leak",
    2,
    "FULL"
  ],
  [
    "caching",
    [
      [
        "miss",
        3,
        "Cached price=50; TTL=60"
      ],
      [
        "hit",
        2,
        "50; 0 DB reads"
      ],
      [
        "expiry",
        3,
        "45; TTL=60"
      ]
    ],
    1,
    1,
    "hit",
    1,
    "DB reads=0"
  ],
  [
    "cache-invalidation",
    [
      [
        "stale",
        3,
        "HIT 50 (stale)"
      ],
      [
        "invalidate",
        4,
        "Cache=45 v2"
      ],
      [
        "race",
        4,
        "STALE 50 v1"
      ]
    ],
    2,
    1,
    "race",
    3,
    "STALE 50 v1"
  ],
  [
    "replication",
    [
      [
        "healthy",
        3,
        "Both replicas caught up"
      ],
      [
        "lag",
        3,
        "45"
      ],
      [
        "failover",
        3,
        "New primary at 101; 102 lost"
      ]
    ],
    0,
    0,
    "failover",
    2,
    "PRIMARY 101"
  ],
  [
    "sharding",
    [
      [
        "targeted",
        3,
        "2 orders; 1 shard contacted"
      ],
      [
        "scatter",
        3,
        "Total=8"
      ],
      [
        "hotspot",
        3,
        "Hot key identified"
      ]
    ],
    1,
    1,
    "hotspot",
    1,
    "HOT 90 requests"
  ]
] as const;
for(const [slug,scenarios,quizAnswer,practiceAnswer,edge,edgeStage,stateText] of lessons){
 test(slug+' — every scenario, applied practice, resources and responsive layout',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/learn/concepts/databases/'+slug+'/',{waitUntil:'domcontentloaded'});
  const lab=page.locator('[data-lesson="'+slug+'"]');
  await expect(lab).toBeVisible();
  await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  const graph=lab.locator('.flow-diagram'),state=lab.locator('.protocol-state'),select=lab.getByLabel('سناریو');
  const steps=lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button');
  await expect(graph).toHaveAttribute('data-layout','wide');
  await expect(lab.locator('.lesson-goal p')).not.toBeEmpty();
  await expect(select.locator('option')).toHaveCount(scenarios.length);
  for(const [id,count,output] of scenarios){
   await select.selectOption(id);
   await expect(steps).toHaveCount(count);
   await expect(lab.locator('.backend-prediction p')).not.toBeEmpty();
   await expect(steps.first()).toHaveAttribute('aria-current','step');
   for(let i=0;i<count;i++){
    await steps.nth(i).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current','step');
    await expect(lab.locator('.request-counter')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR')+' از '+count.toLocaleString('fa-IR'));
    await expect(state.locator('.state-cell')).toHaveCount(3);
    await expect(state.locator('.state-step')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR'));
    await expect(lab.locator('.stage-explanation p')).not.toBeEmpty();
        await expect(lab.locator('.stage-diagnostic p')).not.toBeEmpty();
        await expect(lab.locator('.flight-steps .flight-chip').first()).not.toBeEmpty();
        const hopCount=await lab.locator('.flow-diagram [data-flight]').count();
        await expect(lab.locator('.flight-chip')).toHaveCount(hopCount);
        await expect(lab.locator('.request-canvas > .protocol-state')).toBeVisible();
        await expect(lab.locator('.backend-prediction p')).not.toBeEmpty();
    await expect(lab.locator('.stage-route')).toBeVisible();
    for(const cell of await state.locator('.state-value').all())await expect(cell).not.toBeEmpty();
    await expect(lab.locator('.request-message pre').first()).not.toBeEmpty();
    await expect(lab.locator('.request-message pre').last()).toHaveAttribute('dir','ltr');
    const flow=graph.locator('[data-visible-flow]');
    if(await flow.count()>0)for(const path of await flow.all())expect(await path.getAttribute('d')).toMatch(/^M -?\d+(\.\d+)? -?\d+(\.\d+)? L -?\d+(\.\d+)? -?\d+(\.\d+)?$/);
    else await expect(graph.locator('[data-local-step=true]')).toHaveCount(1);
   }
   await expect(lab.locator('.request-message pre').last()).toContainText(output);
  }
  await select.selectOption(edge);
  await steps.nth(edgeStage).click();
  await expect(state).toContainText(stateText);
  await lab.getByRole('button',{name:'حالت‌های خاص',exact:true}).click();
  const edgeDialog=lab.getByRole('dialog',{name:/حالت‌های خاص و خطاها/});
  await expect(edgeDialog).toBeVisible();
  await edgeDialog.locator('.edge-option').last().click();
  await expect(edgeDialog).not.toBeVisible();
  await expect(steps.first()).toHaveAttribute('aria-current','step');
  await expect(lab.locator('.backend-prediction')).toBeVisible();
  await page.screenshot({path:'test-results/data/'+slug+'-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await expect(graph).toHaveAttribute('data-layout','compact');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  await lab.getByRole('button',{name:'مرحلهٔ بعد'}).click();
  await expect(steps.nth(1)).toHaveAttribute('aria-current','step');
  await lab.getByRole('button',{name:'نکته‌ها و منابع',exact:true}).click();
  const dialog=lab.getByRole('dialog',{name:'مرور و تکمیل یادگیری'});
  await expect(dialog).toBeVisible();
  await dialog.getByText('سنجش یادگیری',{exact:true}).first().click();
  for(const wrong of [0,1,2].filter(i=>i!==quizAnswer)){
    await dialog.locator('.quiz-option').nth(wrong).click();
    await expect(dialog.getByRole('status')).toContainText('درست نیست');
    await expect(dialog.getByRole('status').locator('p')).not.toBeEmpty();
    await expect(dialog.locator('.quiz-option').nth(wrong)).toHaveAttribute('aria-pressed','true');
  }
  await dialog.locator('.quiz-option').nth(quizAnswer).click();
  await expect(dialog.getByRole('status')).toContainText('درست است');
  await dialog.locator('.network-extra summary').filter({hasText:'تمرین عملی خارج از شبیه‌سازی'}).click();
  await expect(dialog.locator('.field-exercise small')).not.toBeEmpty();
  await dialog.locator('.network-extra summary').filter({hasText:'منابع بیشتر'}).click();
  expect(await dialog.locator('.network-extra a').count()).toBeGreaterThanOrEqual(2);
  await dialog.getByRole('button',{name:'بستن پنجره'}).click();
  await steps.last().click();
  await lab.getByRole('link',{name:/حل تمرین کاربردی/}).click();
  const practice=lab.locator('.practice-check');
  await expect(practice).toBeFocused();
  for(const wrong of [0,1,2].filter(i=>i!==practiceAnswer)){
    await practice.locator('.practice-option').nth(wrong).click();
    await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','false');
    await expect(practice.locator('.practice-feedback p')).not.toBeEmpty();
    await expect(practice.locator('.practice-next')).toHaveCount(0);
  }
  await practice.locator('.practice-option').nth(practiceAnswer).click();
  await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','true');
  const index=lessons.findIndex(l=>l[0]===slug);
  if(index<lessons.length-1)await expect(practice.locator('.practice-next')).toHaveAttribute('href','/learn/concepts/databases/'+lessons[index+1][0]+'/');
  else await expect(practice.locator('.practice-next')).toHaveAttribute('href','/learn/concepts/design-patterns/solid/');
  await page.screenshot({path:'test-results/data/'+slug+'-mobile.png',fullPage:true,animations:'disabled'});
  expect(errors).toEqual([]);
 });
}

test('JWT continues to level three and the picker opens the current level in order',async({page})=>{
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
 await page.goto('/learn/concepts/software-engineering/jwt/',{waitUntil:'domcontentloaded'});
 const jwt=page.locator('[data-lesson="jwt"]');
 await expect(page.locator('astro-island').filter({has:jwt})).not.toHaveAttribute('ssr','');
 await jwt.getByRole('navigation',{name:'مراحل درس'}).getByRole('button').last().click();
 await jwt.locator('.practice-option').nth(1).click();
 await jwt.locator('.practice-next').click();
 await expect(page).toHaveURL(/\/databases\/sql-nosql\/$/);
 await page.locator('#lesson-picker .picker-trigger').click();
 const nav=page.getByRole('navigation',{name:'درس‌های قابل انتخاب'});
 await expect(nav.getByRole('link')).toHaveCount(10);
 for(let i=0;i<lessons.length;i++)await expect(nav.getByRole('link').nth(i)).toHaveAttribute('href','/learn/concepts/databases/'+lessons[i][0]+'/');
 await expect(nav.getByRole('link').nth(0)).toHaveAttribute('aria-current','page');
 await nav.getByRole('link').nth(9).click();
 await expect(page).toHaveURL(/\/databases\/sharding\/$/);
});
