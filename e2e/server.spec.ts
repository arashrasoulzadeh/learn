import {test,expect} from '@playwright/test';

const lessons=[
 ['load-balancing','Load Balancing',6],
 ['replication','Replication',7],
 ['reverse-proxy','Reverse Proxy',5],
 ['horizontal-scaling','Horizontal Scaling',5],
 ['vertical-scaling','Vertical Scaling',5],
 ['health-checks','Health Checks',5],
 ['service-discovery','Service Discovery',5],
 ['connection-pooling','Connection Pooling',5],
 ['failover','Failover',5],
 ['session-affinity','Session Affinity',5]
] as const;

const lessonUrl=(slug:string)=>'/learn/concepts/server-infrastructure/'+slug+'/';

test.describe('Server & Infrastructure product audit',()=>{
 test('all ten lessons are discoverable from the catalog',async({page})=>{
  await page.goto('/learn/catalog/');
  await expect(page.getByText('Server & Infrastructure',{exact:true}).first()).toBeVisible();
  for(const [,title] of lessons)await expect(page.getByRole('link',{name:new RegExp(title)}).first()).toBeVisible();
 });

 test('every Server lesson renders and every teaching step is usable',async({page})=>{
  test.setTimeout(180_000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const [slug,title,stepCount] of lessons){
   await page.goto(lessonUrl(slug));
   await expect(page.getByRole('heading',{level:1,name:title})).toBeVisible();
   const lab=page.locator('.server-lab');
   await expect(lab).toBeVisible();
   await expect(lab.locator('svg.server-lab-graph')).toBeVisible();
   const steps=lab.locator('.step-button');
   await expect(steps).toHaveCount(stepCount);
   for(let i=0;i<stepCount;i++){
    await steps.nth(i).click();
    await expect(steps.nth(i)).toHaveAttribute('aria-current','step');
    await expect(lab.locator('.lab-stage small')).toContainText('STEP '+String(i+1)+' OF '+String(stepCount));
    await expect(lab.locator('.lab-stage strong')).not.toBeEmpty();
   }
  }
  expect(errors).toEqual([]);
 });

 test('all ten lessons stay inside a phone viewport',async({page})=>{
  test.setTimeout(180_000);
  await page.setViewportSize({width:390,height:844});
  for(const [slug] of lessons){
   await page.goto(lessonUrl(slug));
   await expect(page.locator('.server-lab')).toBeVisible();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
   expect(overflow,slug+' horizontal overflow').toBeLessThanOrEqual(1);
   const box=await page.locator('.server-lab-graph').boundingBox();
   expect(box,slug+' graph').not.toBeNull();
   expect(box!.width,slug+' graph width').toBeLessThanOrEqual(390);
  }
 });

 test('capture a human-review screenshot for every Server lab',async({page})=>{
  test.setTimeout(180_000);
  await page.setViewportSize({width:1440,height:1100});
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
  for(const [slug] of lessons){
   await page.goto(lessonUrl(slug));
   const lab=page.locator('.server-lab');
   await expect(lab).toBeVisible();
   await lab.screenshot({path:'test-results/server-visual/'+slug+'.png',animations:'disabled'});
  }
 });
});
