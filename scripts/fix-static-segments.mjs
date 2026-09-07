// Next.js Windows export bug: https://github.com/vercel/next.js/issues/92339
// Client requests dot-separated segment names; Windows export can nest them.
// Only add the missing equivalent files inside the generated export directory.
import { copyFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function fixStaticSegments(directory) {
  const root = path.resolve(directory);
  const copies = [];
  function walk(dir, segmentRoot = null) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      const current = path.join(dir, item.name);
      const base = segmentRoot ?? (item.isDirectory() && item.name.startsWith('__next.') ? dir : null);
      if (item.isDirectory()) walk(current, base);
      else if (base && item.name.endsWith('.txt')) {
        const target = path.join(base, path.relative(base, current).split(path.sep).join('.'));
        if (!target.startsWith(root + path.sep)) throw new Error('Export target escaped root');
        if (existsSync(target)) {
          if (!readFileSync(target).equals(readFileSync(current))) throw new Error(`Conflicting segment artifact: ${target}`);
        } else {
          copyFileSync(current, target);
          copies.push(path.relative(root, target));
        }
      }
    }
  }
  walk(root);
  return copies;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const copies = fixStaticSegments(process.argv[2] ?? 'out');
  console.log(`Static segment compatibility: ${copies.length} missing artifacts added.`);
}
