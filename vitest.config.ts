import { defineConfig } from 'vitest/config';
export default defineConfig({test:{fileParallelism:false,testTimeout:20000,hookTimeout:60000,include:['tests/**/*.test.ts']}});
