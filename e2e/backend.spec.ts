import {test,expect} from '@playwright/test';
const lessons=[
  [
    "process-thread",
    [
      [
        "sequential",
        3,
        "counter=2"
      ],
      [
        "race",
        4,
        "counter=1 (lost update)"
      ],
      [
        "mutex",
        4,
        "counter=2"
      ]
    ],
    0,
    1,
    "mutex",
    3,
    "counter=2"
  ],
  [
    "stack-heap",
    [
      [
        "call",
        3,
        "x → #1"
      ],
      [
        "alias",
        3,
        "x.n === 9"
      ],
      [
        "retained",
        3,
        "object eligible for GC"
      ]
    ],
    1,
    1,
    "alias",
    2,
    "obj#1={n:9}"
  ],
  [
    "async-await",
    [
      [
        "await",
        4,
        "42"
      ],
      [
        "reject",
        3,
        "error handled"
      ],
      [
        "parallel-io",
        3,
        "['a','b']"
      ]
    ],
    1,
    1,
    "reject",
    1,
    "rejected"
  ],
  [
    "event-loop",
    [
      [
        "order",
        4,
        "A D C B"
      ],
      [
        "blocking",
        3,
        "timer eventually runs"
      ],
      [
        "microtasks",
        4,
        "job1 job2 timer"
      ]
    ],
    1,
    1,
    "microtasks",
    2,
    "job1 job2"
  ],
  [
    "api-routing",
    [
      [
        "match",
        4,
        "200 OK; product 42"
      ],
      [
        "not-found",
        2,
        "404 Not Found"
      ],
      [
        "wrong-method",
        3,
        "405 Method Not Allowed"
      ]
    ],
    2,
    0,
    "wrong-method",
    2,
    "405; Allow"
  ],
  [
    "middleware",
    [
      [
        "allowed",
        4,
        "start → handler → end"
      ],
      [
        "denied",
        3,
        "401 Unauthorized"
      ],
      [
        "exception",
        4,
        "500 Internal Server Error"
      ]
    ],
    0,
    1,
    "denied",
    2,
    "401; skipped"
  ],
  [
    "rest-api",
    [
      [
        "create",
        3,
        "201 Created"
      ],
      [
        "conditional",
        4,
        "200 OK; version v2"
      ],
      [
        "stale",
        3,
        "412 Precondition Failed"
      ]
    ],
    0,
    1,
    "stale",
    2,
    "412; unchanged"
  ],
  [
    "authentication",
    [
      [
        "valid",
        4,
        "200 OK; signed in"
      ],
      [
        "invalid",
        3,
        "Invalid credentials"
      ],
      [
        "limited",
        3,
        "Eligible for verification"
      ]
    ],
    2,
    1,
    "invalid",
    2,
    "Anonymous"
  ],
  [
    "authorization",
    [
      [
        "owner",
        3,
        "200 OK; own order"
      ],
      [
        "other-owner",
        3,
        "403 Forbidden; no order data"
      ],
      [
        "role",
        3,
        "403; order unchanged"
      ]
    ],
    1,
    2,
    "role",
    2,
    "403; unchanged"
  ],
  [
    "jwt",
    [
      [
        "valid",
        4,
        "200 OK"
      ],
      [
        "expired",
        3,
        "401 invalid_token"
      ],
      [
        "tampered",
        3,
        "401 invalid_token"
      ],
      [
        "audience",
        3,
        "401 invalid_token"
      ]
    ],
    2,
    1,
    "audience",
    2,
    "Wrong audience"
  ]
] as const;
for(const [slug,scenarios,quizAnswer,practiceAnswer,edge,edgeStage,stateText] of lessons){
 test(slug+' — every scenario, applied practice, resources and responsive layout',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/learn/concepts/software-engineering/'+slug+'/',{waitUntil:'domcontentloaded'});
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
   await expect(steps.first()).toHaveAttribute('aria-current','step');
   for(let i=0;i<count;i++){
    await steps.nth(i).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current','step');
    await expect(lab.locator('.request-counter')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR')+' از '+count.toLocaleString('fa-IR'));
    await expect(state.locator('.state-cell')).toHaveCount(3);
    await expect(state.locator('.state-step')).toHaveText('مرحلهٔ '+(i+1).toLocaleString('fa-IR'));
    await expect(lab.locator('.stage-explanation p')).not.toBeEmpty();
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
  if(slug==='process-thread')await expect(state.locator('.backend-counter b')).toHaveText('2');
  else await expect(state).toContainText(stateText);
  await lab.getByRole('button',{name:'حالت‌های خاص',exact:true}).click();
  const edgeDialog=lab.getByRole('dialog',{name:/حالت‌های خاص و خطاها/});
  await expect(edgeDialog).toBeVisible();
  await edgeDialog.locator('.edge-option').last().click();
  await expect(edgeDialog).not.toBeVisible();
  await expect(steps.first()).toHaveAttribute('aria-current','step');
  await page.screenshot({path:'test-results/backend/'+slug+'-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await expect(graph).toHaveAttribute('data-layout','compact');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  await lab.getByRole('button',{name:'مرحلهٔ بعد'}).click();
  await expect(steps.nth(1)).toHaveAttribute('aria-current','step');
  await lab.getByRole('button',{name:'نکته‌ها و منابع',exact:true}).click();
  const dialog=lab.getByRole('dialog',{name:'مرور و تکمیل یادگیری'});
  await expect(dialog).toBeVisible();
  await dialog.getByText('سنجش یادگیری',{exact:true}).first().click();
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
  await practice.locator('.practice-option').nth((practiceAnswer+1)%3).click();
  await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','false');
  await practice.locator('.practice-option').nth(practiceAnswer).click();
  await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','true');
  const index=lessons.findIndex(l=>l[0]===slug);
  if(index<lessons.length-1)await expect(practice.locator('.practice-next')).toHaveAttribute('href','/learn/concepts/software-engineering/'+lessons[index+1][0]+'/');
  else await expect(practice.locator('.practice-feedback')).toContainText('آخرین درس این سطح');
  await page.screenshot({path:'test-results/backend/'+slug+'-mobile.png',fullPage:true,animations:'disabled'});
  expect(errors).toEqual([]);
 });
}
test('curriculum lists two ordered levels and reaches process and thread from WebSocket',async({page})=>{
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
 await page.goto('/learn/concepts/networking/websocket/',{waitUntil:'domcontentloaded'});
 const lab=page.locator('[data-lesson="websocket"]');
 await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
 await lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button').last().click();
 await lab.getByRole('link',{name:/حل تمرین کاربردی/}).click();
 await lab.locator('.practice-option').nth(2).click();
 await lab.locator('.practice-next').click();
 await expect(page).toHaveURL(/\/software-engineering\/process-thread\/$/);
 await page.locator('#lesson-picker summary').click();
 const nav=page.getByRole('navigation',{name:'درس‌های قابل انتخاب'});
 await expect(nav.getByRole('link')).toHaveCount(20);
 for(let i=0;i<lessons.length;i++)await expect(nav.getByRole('link').nth(i+10)).toHaveAttribute('href','/learn/concepts/software-engineering/'+lessons[i][0]+'/');
 await expect(nav.getByRole('link').nth(10)).toHaveAttribute('aria-current','page');
 await nav.getByRole('link').last().click();
 await expect(page).toHaveURL(/\/software-engineering\/jwt\/$/);
});
