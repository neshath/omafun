import {cp, mkdir, rm} from 'node:fs/promises';
import path from 'node:path';

const root = new URL('..', import.meta.url);
const dist = new URL('../dist/', import.meta.url);
await rm(dist, {recursive: true, force: true});
await mkdir(dist, {recursive: true});
for (const file of ['index.html', 'style.css', 'workbench.css']) {
  await cp(new URL(`../${file}`, import.meta.url), new URL(`../dist/${file}`, import.meta.url));
}
await cp(new URL('../src/', import.meta.url), new URL('../dist/src/', import.meta.url), {recursive: true});
console.log(`Staged Pixel Forge web assets in ${path.resolve(new URL('../dist/', import.meta.url).pathname)}`);
