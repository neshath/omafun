import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const platformSource = await readFile(new URL('../src/platform.js', import.meta.url), 'utf8');
const serverSource = await readFile(new URL('../server.mjs', import.meta.url), 'utf8');
const tauriConfig = JSON.parse(await readFile(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'));

test('desktop file bridge uses Tauri globals without runtime imports', () => {
  assert.match(platformSource, /globalThis\.__TAURI__/);
  assert.match(platformSource, /tauri\.dialog\.open/);
  assert.match(platformSource, /tauri\.fs\.readTextFile/);
  assert.doesNotMatch(platformSource, /import\(['"]@tauri-apps\//);
  assert.equal(tauriConfig.app.withGlobalTauri, true);
});

test('development server binds only to loopback', () => {
  assert.match(serverSource, /\.listen\(4173,\s*['"]127\.0\.0\.1['"]/);
  assert.doesNotMatch(serverSource, /\.listen\(4173,\s*['"]0\.0\.0\.0['"]/);
});
