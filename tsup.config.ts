import { defineConfig } from 'tsup';

export default defineConfig({
  // entryPoints is an array of entry points for your package. In this case, we're using src/index.ts.
  entryPoints: ['src/index.ts'],
  format: ['esm'],
  // dts is a boolean that tells tsup to generate declaration files.
  dts: true,
  // outDir is the output directory for the compiled code.
  outDir: 'dist',
  // clean tells tsup to clean the output directory before building.
  clean: true,
});
