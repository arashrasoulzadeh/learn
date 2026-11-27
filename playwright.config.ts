import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./e2e',
  timeout:120_000,
  expect:{timeout:8_000},
  fullyParallel:false,
  workers:2,
  use:{
    baseURL:'http://127.0.0.1:4321',
    trace:'retain-on-failure',
    screenshot:'only-on-failure',
    ...devices['Desktop Chrome']
  },
  webServer:{
    // Exercise the exact static output that will be deployed, without the Astro dev toolbar.
    command:'npm run preview -- --host 127.0.0.1 --port 4321',
    url:'http://127.0.0.1:4321/learn/',
    reuseExistingServer:false,
    timeout:120_000
  }
});
