import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  // Bundle all dependencies for browser use
  noExternal: ['@bearing-dev/compass'],
  target: 'es2020',
  minify: false,
  sourcemap: true,
});
