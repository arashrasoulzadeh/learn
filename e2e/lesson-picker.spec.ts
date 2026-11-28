import {test,expect} from '@playwright/test';

test('tabbed lesson gallery previews all fifty lessons and supports keyboard, mobile and navigation',async({page})=>{
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4321'?route.continue():route.abort());
 await page.goto('/learn/',{waitUntil:'domcontentloaded'});
 const trigger=page.getByRole('button',{name:'انتخاب درس',exact:true});
 const dialog=page.getByRole('dialog',{name:'انتخاب درس'});
 await trigger.click();
 await expect(dialog).toBeVisible();
 const tabs=dialog.getByRole('tab');
 await expect(tabs).toHaveCount(5);
 const urls=new Set<string>();
 for(let i=0;i<5;i++){
   await tabs.nth(i).click();
   await expect(tabs.nth(i)).toHaveAttribute('aria-selected','true');
   const panel=dialog.getByRole('tabpanel');
   const cards=panel.getByRole('link');
   await expect(cards).toHaveCount(10);
   await expect(panel.locator('[data-preview]')).toHaveCount(10);
   for(const card of await cards.all()){
     const href=await card.getAttribute('href');
     expect(href).toMatch(/^\/learn\/concepts\/.+\/$/);
     urls.add(href!);
     await expect(card.locator('.preview-graph')).toBeVisible();
     expect(await card.locator('.preview-graph line, .preview-graph circle').count()).toBeGreaterThan(0);
   }
 }
 expect(urls.size).toBe(50);
 await tabs.nth(4).focus();
 await page.keyboard.press('Home');
 await expect(tabs.nth(0)).toBeFocused();
 await expect(tabs.nth(0)).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('ArrowLeft');
 await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await expect(trigger).toBeFocused();
 await page.setViewportSize({width:390,height:844});
 await trigger.click();
 await expect(tabs.nth(0)).toHaveAttribute('aria-selected','true');
 const grid=dialog.getByRole('tabpanel').locator('.picker-grid');
 expect(await grid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
 await tabs.nth(4).click();
 await page.screenshot({path:'test-results/lesson-picker-mobile.png',animations:'disabled'});
 await dialog.getByRole('tabpanel').getByRole('link').last().click();
 await expect(page).toHaveURL(/\/system-design\/raft\/$/);
 await trigger.click();
 await expect(tabs.nth(4)).toHaveAttribute('aria-selected','true');
 await expect(dialog.getByRole('tabpanel').getByRole('link').last()).toHaveAttribute('aria-current','page');
 await dialog.getByRole('button',{name:'بستن انتخاب درس'}).click();
 await expect(dialog).not.toBeVisible();
 await expect(trigger).toBeFocused();
});
