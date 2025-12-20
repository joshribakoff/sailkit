import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  noExternal: ['@bearing-dev/compass'],
  target: 'es2020',
  minify: false,
  sourcemap: true,
});
