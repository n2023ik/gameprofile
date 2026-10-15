import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// Run locally or in CI, never in the application server.
const origin = process.env.LOVABLE_ASSET_ORIGIN || 'https://id-preview--3bc5e670-c6b4-40f7-9eb9-27884babd165.lovable.app';
for (const name of await readdir(new URL('../src/assets/', import.meta.url))) {
if (!name.endsWith('.asset.json')) continue;
const pointer = JSON.parse(await readFile(new URL(`../src/assets/${name}`, import.meta.url), 'utf8'));
const response = await fetch(new URL(pointer.url, origin));
if (!response.ok) throw new Error(`Character download failed (${response.status}). Set LOVABLE_ASSET_ORIGIN to an accessible Lovable host.`);
const bytes = new Uint8Array(await response.arrayBuffer());
if (new TextDecoder().decode(bytes.slice(0, 4)) !== 'glTF') throw new Error('The asset host returned a page instead of a GLB. Use an accessible asset origin.');
const target = resolve('public', pointer.url.slice(1));
await mkdir(dirname(target), { recursive: true });
await writeFile(target, bytes);
console.log(`Prepared ${pointer.original_filename} for standalone hosting.`);
}