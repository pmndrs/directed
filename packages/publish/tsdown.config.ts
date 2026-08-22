import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/react.ts'],
  tsconfig: 'tsconfig.build.json',
  format: ['esm', 'cjs'],
  fixedExtension: false,
  dts: { eager: true },
});
