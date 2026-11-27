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
    command:'npm run dev -- --host 127.0.0.1',
    url:'http://127.0.0.1:4321/learn/',
    reuseExistingServer:false,
    timeout:120_000
  }
});
