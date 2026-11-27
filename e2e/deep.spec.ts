import {test,expect,type Locator} from '@playwright/test';
async function assertTraceGeometry(row:Locator){
 const issues=await row.evaluate(el=>{
  const lane=el.querySelector<HTMLElement>('.deep-lane-row')!;
  const signal=lane.querySelector<HTMLElement>('.deep-signal')!;
  const label=signal.querySelector<HTMLElement>('span')!;
  const lines=Array.from(lane.querySelectorAll<HTMLElement>('.deep-lane-line'));
  const r=lane.getBoundingClientRect(),s=signal.getBoundingClientRect(),b=label.getBoundingClientRect();
  const centers=lines.map(line=>line.getBoundingClientRect().left);
  const a=Number(signal.dataset.from),z=Number(signal.dataset.to);
  const errors:string[]=[];
  if(getComputedStyle(lane).display!=='grid')errors.push('lane grid lost');
  if(centers.some((x,i)=>i>0&&x-centers[i-1]<8))errors.push('collapsed lanes');
  if(s.width<8||s.left<r.left-2||s.right>r.right+2)errors.push('signal outside lanes');
  if(b.width>s.width+2||label.offsetHeight>lane.clientHeight+2)errors.push('clipped message label');
  if(a!==z){
   const arrow=signal.querySelector<HTMLElement>('i')!;
   const start=s.left+arrow.offsetLeft,end=start+arrow.offsetWidth;
   if(Math.abs(start-centers[Math.min(a,z)])>3||Math.abs(end-centers[Math.max(a,z)])>3)errors.push('arrow does not connect participant centers');
  }
  return errors;
 });
 expect(issues).toEqual([]);
}
const fixtures=[
  [
    "networking",
    "http-request",
    "ttfb",
    "170",
    "70"
  ],
  [
    "networking",
    "dns",
    "expires",
    "120",
    "90"
  ],
  [
    "networking",
    "ip-port",
    "reply",
    "10.0.0.3:50000",
    "Dropped"
  ],
  [
    "networking",
    "tcp",
    "retry",
    "0",
    "1"
  ],
  [
    "networking",
    "udp",
    "late",
    "1",
    "0"
  ],
  [
    "networking",
    "tls-https",
    "orders",
    "2",
    "1"
  ],
  [
    "networking",
    "http-methods",
    "orders",
    "2",
    "1"
  ],
  [
    "networking",
    "http-status-codes",
    "method",
    "GET",
    "POST"
  ],
  [
    "networking",
    "cookies-sessions",
    "changed",
    "Yes",
    "No"
  ],
  [
    "networking",
    "websocket",
    "queued",
    "10",
    "2"
  ],
  [
    "software-engineering",
    "process-thread",
    "x",
    "1",
    "2"
  ],
  [
    "software-engineering",
    "stack-heap",
    "retained",
    "8",
    "0"
  ],
  [
    "software-engineering",
    "async-await",
    "b",
    "Fulfilled",
    "Aborted"
  ],
  [
    "software-engineering",
    "event-loop",
    "latency",
    "71",
    "1"
  ],
  [
    "software-engineering",
    "api-routing",
    "calls",
    "1",
    "0"
  ],
  [
    "software-engineering",
    "middleware",
    "duration",
    "3",
    "53"
  ],
  [
    "software-engineering",
    "rest-api",
    "price",
    "40",
    "45"
  ],
  [
    "software-engineering",
    "authentication",
    "session",
    "Created",
    "None"
  ],
  [
    "software-engineering",
    "authorization",
    "writes",
    "1",
    "0"
  ],
  [
    "software-engineering",
    "jwt",
    "result",
    "401",
    "200"
  ],
  [
    "databases",
    "sql-nosql",
    "writes",
    "1",
    "3"
  ],
  [
    "databases",
    "database-index",
    "candidates",
    "20",
    "200"
  ],
  [
    "databases",
    "b-tree",
    "writes",
    "1",
    "3"
  ],
  [
    "databases",
    "transactions-acid",
    "total",
    "0",
    "1"
  ],
  [
    "databases",
    "database-locking",
    "y",
    "Free",
    "A"
  ],
  [
    "databases",
    "connection-pooling",
    "done",
    "20",
    "40"
  ],
  [
    "databases",
    "caching",
    "reads",
    "100",
    "1"
  ],
  [
    "databases",
    "cache-invalidation",
    "reads",
    "50 stale",
    "45"
  ],
  [
    "databases",
    "replication",
    "ack",
    "20",
    "40"
  ],
  [
    "databases",
    "sharding",
    "contacts",
    "1",
    "4"
  ]
,
["design-patterns","solid","core","2","0"],
["design-patterns","singleton","created","2","1"],
["design-patterns","factory","clients","2","0"],
["design-patterns","strategy","total","1100","2400"],
["design-patterns","observer","delivered","0","1"],
["architecture","dependency-injection","created","1","2"],
["architecture","repository-pattern","total","120","150"],
["architecture","clean-architecture","passed","0","2"],
["architecture","monolith-microservices","action","Rolled back","Compensated"],
["architecture","event-driven-architecture","count","3","2"],
["system-design","reverse-proxy","orders","2","1"],
["system-design","load-balancing","max","6","4"],
["system-design","scaling","time","20","14"],
["system-design","cdn","wrong","2","0"],
["system-design","message-queue","queued","16","0"],
["system-design","rate-limiting","allowed","6","3"],
["system-design","circuit-breaker","elapsed","500","203"],
["system-design","distributed-lock","value","v1","v2"],
["system-design","cap-theorem","stale","0","2"],
["system-design","raft","commit","11","10"]
] as const;
for(const [category,slug,key,first,second] of fixtures){
 test(slug+' — engineering trace choices, every event, state transitions and comparison',async({page})=>{
  const errors:string[]=[];page.on('pageerror',err=>errors.push(err.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/learn/concepts/'+category+'/'+slug+'/',{waitUntil:'domcontentloaded'});
  const trigger=page.getByRole('button',{name:'آزمایشگاه پیشرفته',exact:true});
  await expect(page.locator('astro-island').filter({has:trigger})).not.toHaveAttribute('ssr','');
  await expect(trigger).toBeInViewport({ratio:1});
  await expect.poll(()=>trigger.evaluate(el=>{
    const r=el.getBoundingClientRect();
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return hit===el||el.contains(hit);
  })).toBe(true);
  await trigger.click({timeout:10_000});
  const dialog=page.getByRole('dialog',{name:'آزمایشگاه پیشرفته'}),player=dialog.locator('[data-deep-slug="'+slug+'"]');
  await expect(player).toBeVisible();
  const modes=player.locator('.deep-modes button');
  await expect(modes).toHaveCount(2);
  for(let mode=0;mode<2;mode++){
   await modes.nth(mode).click();
   await expect(modes.nth(mode)).toHaveAttribute('aria-pressed','true');
   const events=player.locator('.deep-event-row'),count=await events.count();
   expect(count).toBeGreaterThanOrEqual(4);
   await expect(player.locator('[data-revealed=true]')).toHaveCount(0);
   for(let i=0;i<count;i++){
    await player.getByRole('button',{name:'رویداد بعد',exact:true}).click();
    await expect(events.nth(i)).toHaveAttribute('aria-current','step');
    await expect(player.locator('[data-revealed=true]')).toHaveCount(i+1);
    await expect(player.locator('.deep-current p')).not.toBeEmpty();
    await expect(events.nth(i).locator('.deep-signal')).toHaveCount(1);
    await assertTraceGeometry(events.nth(i));
   }
   await expect(player.locator('[data-value="'+key+'"]')).toHaveText(mode===0?first:second);
   await expect(player.getByRole('status')).toContainText('نتیجهٔ آزمایش');
   await player.locator('.deep-comparison summary').click();
   await expect(player.locator('.deep-compare-table')).toContainText(first);
   await expect(player.locator('.deep-compare-table')).toContainText(second);
   await player.getByRole('button',{name:'رویداد قبل',exact:true}).click();
   await expect(player.getByRole('status')).toHaveCount(0);
   await player.getByRole('button',{name:'رویداد بعد',exact:true}).click();
  }
  await page.screenshot({path:'test-results/deep/'+slug+'-desktop.png',animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  expect(await dialog.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(2);
  await player.getByRole('button',{name:'شروع آزمایش',exact:true}).click();
  await expect(player.locator('[data-revealed=true]')).toHaveCount(0);
  await player.getByRole('button',{name:'پخش آزمایش',exact:true}).click();
  await expect(player.locator('[data-revealed=true]').first()).toBeVisible({timeout:6000});
  await player.getByRole('button',{name:'توقف آزمایش',exact:true}).click();
  await assertTraceGeometry(player.locator('.deep-event-row[data-revealed=true]').first());
  await page.screenshot({path:'test-results/deep/'+slug+'-mobile.png',animations:'disabled'});
  await dialog.getByRole('button',{name:'بستن پنجره',exact:true}).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
 });
}
