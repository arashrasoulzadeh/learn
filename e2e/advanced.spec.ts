import {test,expect} from '@playwright/test';
const fixtures=[
  [
    "design-patterns",
    "solid",
    1,
    1,
    [
      [
        "srp",
        3,
        "Only renderer changes"
      ],
      [
        "ocp",
        3,
        "New policy added"
      ],
      [
        "lsp",
        3,
        "Separate capabilities"
      ],
      [
        "isp",
        3,
        "Reader unaffected"
      ],
      [
        "dip",
        3,
        "Testable without network"
      ]
    ]
  ],
  [
    "design-patterns",
    "singleton",
    1,
    2,
    [
      [
        "reuse",
        3,
        "True"
      ],
      [
        "race",
        3,
        "Two instances"
      ],
      [
        "processes",
        3,
        "Not cluster-wide"
      ]
    ]
  ],
  [
    "design-patterns",
    "factory",
    1,
    0,
    [
      [
        "simple",
        3,
        "PDF bytes"
      ],
      [
        "method",
        3,
        "CSV rows"
      ],
      [
        "family",
        3,
        "Family mismatch"
      ]
    ]
  ],
  [
    "design-patterns",
    "strategy",
    0,
    1,
    [
      [
        "standard",
        3,
        "500 cents"
      ],
      [
        "express",
        3,
        "1100 cents"
      ],
      [
        "invalid",
        3,
        "Invalid quote"
      ]
    ]
  ],
  [
    "design-patterns",
    "observer",
    1,
    2,
    [
      [
        "notify",
        3,
        "Both updated"
      ],
      [
        "unsubscribe",
        3,
        "Only B notified"
      ],
      [
        "failure",
        3,
        "B skipped"
      ]
    ]
  ],
  [
    "architecture",
    "dependency-injection",
    1,
    1,
    [
      [
        "constructor",
        3,
        "Fake receipt"
      ],
      [
        "scoped",
        3,
        "A disposed"
      ],
      [
        "captive",
        3,
        "Disposed / leaked scope"
      ]
    ]
  ],
  [
    "architecture",
    "repository-pattern",
    1,
    1,
    [
      [
        "load",
        3,
        "Aggregate loaded"
      ],
      [
        "save",
        3,
        "Committed v2"
      ],
      [
        "conflict",
        3,
        "No overwrite"
      ]
    ]
  ],
  [
    "architecture",
    "clean-architecture",
    1,
    1,
    [
      [
        "call",
        3,
        "Order 42"
      ],
      [
        "swap",
        3,
        "No DB needed"
      ],
      [
        "leak",
        3,
        "Boundary restored"
      ]
    ]
  ],
  [
    "architecture",
    "monolith-microservices",
    1,
    0,
    [
      [
        "monolith",
        3,
        "One release"
      ],
      [
        "micro",
        3,
        "Confirmed"
      ],
      [
        "partial",
        3,
        "Cancelled / released"
      ]
    ]
  ],
  [
    "architecture",
    "event-driven-architecture",
    1,
    0,
    [
      [
        "publish",
        3,
        "Projection updated"
      ],
      [
        "duplicate",
        3,
        "Count 1"
      ],
      [
        "ordering",
        3,
        "last=3"
      ]
    ]
  ],
  [
    "system-design",
    "reverse-proxy",
    1,
    1,
    [
      [
        "forward",
        3,
        "200 OK"
      ],
      [
        "bad-gateway",
        3,
        "502 Bad Gateway"
      ],
      [
        "timeout",
        3,
        "504 Gateway Timeout"
      ]
    ]
  ],
  [
    "system-design",
    "load-balancing",
    1,
    1,
    [
      [
        "round-robin",
        3,
        "A=2; B=1"
      ],
      [
        "least",
        3,
        "A=2; B=2"
      ],
      [
        "unhealthy",
        3,
        "200 from B"
      ]
    ]
  ],
  [
    "system-design",
    "scaling",
    1,
    1,
    [
      [
        "vertical",
        3,
        "150 served/s"
      ],
      [
        "horizontal",
        3,
        "180 served/s"
      ],
      [
        "bottleneck",
        3,
        "160 served/s"
      ]
    ]
  ],
  [
    "system-design",
    "cdn",
    0,
    1,
    [
      [
        "miss",
        3,
        "200 from edge"
      ],
      [
        "hit",
        3,
        "200 HIT"
      ],
      [
        "private",
        3,
        "Origin called for B"
      ]
    ]
  ],
  [
    "system-design",
    "message-queue",
    1,
    0,
    [
      [
        "normal",
        3,
        "Done"
      ],
      [
        "retry",
        3,
        "Retry job42"
      ],
      [
        "dlq",
        3,
        "Moved to DLQ"
      ]
    ]
  ],
  [
    "system-design",
    "rate-limiting",
    1,
    0,
    [
      [
        "burst",
        3,
        "3 allowed"
      ],
      [
        "refill",
        3,
        "Allowed"
      ],
      [
        "distributed",
        3,
        "Global policy needed"
      ]
    ]
  ],
  [
    "system-design",
    "circuit-breaker",
    1,
    1,
    [
      [
        "closed",
        3,
        "200"
      ],
      [
        "open",
        3,
        "No dependency call"
      ],
      [
        "half-open",
        3,
        "Recovered"
      ]
    ]
  ],
  [
    "system-design",
    "distributed-lock",
    1,
    0,
    [
      [
        "acquire",
        3,
        "Free"
      ],
      [
        "stale",
        3,
        "Stale overwrite risk"
      ],
      [
        "fenced",
        3,
        "v2 preserved"
      ]
    ]
  ],
  [
    "system-design",
    "cap-theorem",
    1,
    0,
    [
      [
        "healthy",
        3,
        "1"
      ],
      [
        "cp",
        3,
        "Unavailable"
      ],
      [
        "ap",
        3,
        "Stale read 0"
      ]
    ]
  ],
  [
    "system-design",
    "raft",
    1,
    0,
    [
      [
        "election",
        3,
        "A leader"
      ],
      [
        "commit",
        4,
        "B applied 7"
      ],
      [
        "minority",
        4,
        "A steps down"
      ]
    ]
  ]
] as const;
for(const [category,slug,quiz,answer,scenarios] of fixtures){
 test(slug+' — main scenarios, animated hops, field exercise, applied practice and mobile',async({page})=>{
  const errors:string[]=[];page.on('pageerror',err=>errors.push(err.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/learn/concepts/'+category+'/'+slug+'/',{waitUntil:'domcontentloaded'});
  const lab=page.locator('[data-lesson="'+slug+'"]'),graph=lab.locator('.flow-diagram'),state=lab.locator('.protocol-state');
  await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
  await expect(lab.getByLabel('سناریو').locator('option')).toHaveCount(scenarios.length);
  const steps=lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button');
  for(const [id,count,output] of scenarios){
   await lab.getByLabel('سناریو').selectOption(id);
   await expect(steps).toHaveCount(count);
   for(let i=0;i<count;i++){
    await steps.nth(i).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current','step');
    await expect(lab.locator('.stage-diagnostic p')).not.toBeEmpty();
    await expect(lab.locator('.stage-explanation p')).not.toBeEmpty();
    await expect(lab.locator('.stage-evidence pre').first()).not.toBeEmpty();
    await expect(state.locator('.state-value')).toHaveCount(3);
    const hops=await graph.locator('[data-flight]').count();
    expect(hops).toBeGreaterThan(0);
    await expect(lab.locator('.flight-chip')).toHaveCount(hops);
    await expect(lab.locator('[data-main-motion=true]')).toHaveAttribute('data-flight-count',String(hops));
   }
   await expect(lab.locator('.stage-evidence pre').last()).toHaveText(output);
  }
  await lab.getByRole('button',{name:'حالت‌های خاص',exact:true}).click();
  const edgeDialog=lab.getByRole('dialog',{name:/حالت‌های خاص و خطاها/});
  await edgeDialog.locator('.edge-option').last().click();
  await expect(steps.first()).toHaveAttribute('aria-current','step');
  await page.screenshot({path:'test-results/advanced/'+slug+'-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await expect(graph).toHaveAttribute('data-layout','compact');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  await lab.getByRole('button',{name:'نکته‌ها و منابع',exact:true}).click();
  const dialog=lab.getByRole('dialog',{name:'مرور و تکمیل یادگیری'});
  await dialog.getByText('سنجش یادگیری',{exact:true}).first().click();
  for(const wrong of [0,1,2].filter(i=>i!==quiz)){
    await dialog.locator('.quiz-option').nth(wrong).click();
    await expect(dialog.getByRole('status')).toContainText('درست نیست');
    await expect(dialog.getByRole('status').locator('p')).not.toBeEmpty();
    await expect(dialog.locator('.quiz-option').nth(wrong)).toHaveAttribute('aria-pressed','true');
  }
  await dialog.locator('.quiz-option').nth(quiz).click();
  await expect(dialog.getByRole('status')).toContainText('درست است');
  await dialog.locator('.network-extra summary').filter({hasText:'تمرین عملی خارج از شبیه‌سازی'}).click();
  await expect(dialog.locator('.field-exercise small')).not.toBeEmpty();
  await dialog.locator('.network-extra summary').filter({hasText:'منابع بیشتر'}).click();
  expect(await dialog.locator('.network-extra a').count()).toBeGreaterThanOrEqual(2);
  await dialog.getByRole('button',{name:'بستن پنجره'}).click();
  await steps.last().click();
  await lab.getByRole('link',{name:/حل تمرین کاربردی/}).click();
  const practice=lab.locator('.practice-check');
  for(const wrong of [0,1,2].filter(i=>i!==answer)){
    await practice.locator('.practice-option').nth(wrong).click();
    await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','false');
    await expect(practice.locator('.practice-feedback p')).not.toBeEmpty();
    await expect(practice.locator('.practice-next')).toHaveCount(0);
  }
  await practice.locator('.practice-option').nth(answer).click();
  await expect(practice.locator('.practice-feedback')).toHaveAttribute('data-correct','true');
  const next=fixtures[fixtures.findIndex(l=>l[1]===slug)+1];
  if(next)await expect(practice.locator('.practice-next')).toHaveAttribute('href','/learn/concepts/'+next[0]+'/'+next[1]+'/');
  else await expect(practice.locator('.practice-next')).toHaveCount(0);
  await page.screenshot({path:'test-results/advanced/'+slug+'-mobile.png',fullPage:true,animations:'disabled'});
  expect(errors).toEqual([]);
 });
}
test('five-level picker and cross-level practice links',async({page})=>{
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
 await page.goto('/learn/concepts/databases/sharding/',{waitUntil:'domcontentloaded'});
 const lab=page.locator('[data-lesson=sharding]');
 await expect(page.locator('astro-island').filter({has:lab})).not.toHaveAttribute('ssr','');
 await lab.getByRole('navigation',{name:'مراحل درس'}).getByRole('button').last().click();
 await lab.locator('.practice-option').nth(1).click();
 await lab.locator('.practice-next').click();
 await expect(page).toHaveURL(/\/design-patterns\/solid\/$/);
 await page.locator('#lesson-picker summary').click();
 const nav=page.getByRole('navigation',{name:'درس‌های قابل انتخاب'});
 await expect(nav.getByRole('link')).toHaveCount(50);
 for(let i=0;i<fixtures.length;i++)await expect(nav.getByRole('link').nth(i+30)).toHaveAttribute('href','/learn/concepts/'+fixtures[i][0]+'/'+fixtures[i][1]+'/');
 await nav.getByRole('link').nth(39).click();
 const eda=page.locator('[data-lesson=event-driven-architecture]');
 await expect(page.locator('astro-island').filter({has:eda})).not.toHaveAttribute('ssr','');
 await eda.getByRole('navigation',{name:'مراحل درس'}).getByRole('button').last().click();
 await eda.locator('.practice-option').nth(0).click();
 await eda.locator('.practice-next').click();
 await expect(page).toHaveURL(/\/system-design\/reverse-proxy\/$/);
});
