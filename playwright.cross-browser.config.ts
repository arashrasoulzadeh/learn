import {defineConfig,devices} from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testMatch:'site-qa.spec.ts',
  projects:[
    {name:'firefox',use:{...devices['Desktop Firefox'],browserName:'firefox'}},
    {name:'webkit',use:{...devices['Desktop Safari'],browserName:'webkit'}}
  ]
});
