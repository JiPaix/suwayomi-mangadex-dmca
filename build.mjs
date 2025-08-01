import { build } from 'esbuild';
import { rmSync } from 'node:fs';

rmSync('./dist', {recursive: true})

const shared = {
  entryPoints: ['src/lib.ts'],
  bundle: true,
  target: 'es2020',
  platform: 'browser',
  minify: true,
  sourcemap: true,
};

await build({
  ...shared,
  format: 'esm',
  outfile: 'dist/browser/lib.esm.js',
});

await build({
  ...shared,
  format: 'cjs',
  outfile: 'dist/browser/lib.cjs.js',
});