// vite.config.js
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-plugin-tsconfig-paths';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        dts({
            rollupTypes: true,
            include: ['src'],
            exclude: ['**/*.d.ts'],
        }),
        react(),
    ],
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'directed-react',
            // the proper extensions will be added
            fileName: 'index',
        },
    },
});
