import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve('dist');
const base = process.env.SITE_BASE_PATH || '/';
for (const entry of ['index.html', '2025/index.html', '2026/index.html']) {
  const html = readFileSync(resolve(root, entry), 'utf8');
  assert.ok(!/<script[^>]+src=["'][^"']*\.(?:tsx?|jsx)(?:[?"'])/i.test(html), `${entry} references uncompiled source`);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/gi)].map(match => match[1]);
  assert.ok(scripts.length > 0, `${entry} has no compiled entry script`);
  for (const url of scripts) {
    assert.ok(url.startsWith(base), `Asset ${url} does not match deployment base ${base}`);
    assert.ok(url.endsWith('.js'), `${url} is not compiled JavaScript`);
    const file = resolve(root, url.slice(base.length));
    assert.ok(!relative(root, file).startsWith('..'), 'Asset escapes dist');
    assert.ok(existsSync(file), `Missing asset ${url}`);
  }
}
assert.ok(existsSync(resolve(root, '2025/original.html')), 'Missing archived game');
assert.ok(existsSync(resolve(root, 'song.mp3')), 'Missing music');
console.log(`Verified compiled site, both years, and music under ${base}`);
