import { defineConfig } from 'tsdown';

const isDebug = process.env.NODE_ENV !== 'production';

export default defineConfig([
    {
        entry: { index: 'src/index.ts' },
        format: ['cjs', 'esm'],
        dts: true,
        sourcemap: true,
        clean: true,
        minify: !isDebug,
    },
    {
        entry: { cli: 'src/cli.ts' },
        format: ['esm'],
        dts: false,
        sourcemap: isDebug,
        clean: false,
        minify: !isDebug,
        banner: { js: '#!/usr/bin/env node' },
    },
]);
