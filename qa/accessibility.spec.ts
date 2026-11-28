import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const path of ['/learn/','/learn/catalog/','/learn/search/','/learn/concepts/databases/transactions-acid/','/learn/concepts/server-infrastructure/load-balancing/']){
  test('WCAG audit '+path,async({page},info)=>{
    await page.goto(path,{waitUntil:'domcontentloaded'});
    await page.locator('main').waitFor();
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    await info.attach('axe-report',{body:JSON.stringify(results,null,2),contentType:'application/json'});
    expect(results.violations.filter(v=>v.impact==='critical')).toEqual([]);
  });
}
