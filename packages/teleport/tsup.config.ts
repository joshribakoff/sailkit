import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false, // Disabled due to workspace build order issues
  clean: true,
  // Keep compass as external dependency (resolved at runtime)
  external: ['@bearing-dev/compass'],
  target: 'es2020',
  minify: false,
  sourcemap: true,
});
