import {defineConfig} from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testDir:'./qa',testMatch:'accessibility.spec.ts',workers:1});
