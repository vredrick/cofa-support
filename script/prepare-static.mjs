import { mkdir, copyFile } from 'node:fs/promises';
await mkdir(new URL('../public/vendor/', import.meta.url), { recursive: true });
await copyFile(new URL('../node_modules/pdf-lib/dist/pdf-lib.min.js', import.meta.url), new URL('../public/vendor/pdf-lib.min.js', import.meta.url));
await copyFile(new URL('../node_modules/pdf-lib/LICENSE.md', import.meta.url), new URL('../public/vendor/pdf-lib-LICENSE.md', import.meta.url));
