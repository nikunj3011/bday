import { mkdir, copyFile } from 'node:fs/promises';
// Actual entry files let year links work on static hosts without rewrite rules.
for (const year of ['2025', '2026']) {
  await mkdir(`dist/${year}`, { recursive: true });
  await copyFile('dist/index.html', `dist/${year}/index.html`);
}
