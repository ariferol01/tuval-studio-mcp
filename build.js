import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function build() {
  console.log('Bundling mcp-server/index.js -> bundle.mjs with zod-shim...');
  const zodShimPath = path.resolve('zod-shim.js');

  await esbuild.build({
    entryPoints: ['index.js'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'bundle.mjs',
    alias: {
      'zod/v4': zodShimPath,
      'zod/v4-mini': zodShimPath,
      'zod/v3': zodShimPath,
      'zod': zodShimPath
    },
    banner: {
      js: `#!/usr/bin/env node
import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);
`
    }
  });

  let content = fs.readFileSync('bundle.mjs', 'utf8');
  const lines = content.split('\n');
  let firstShebang = false;
  const filtered = lines.filter((line) => {
    if (line.startsWith('#!/usr/bin/env node')) {
      if (!firstShebang) {
        firstShebang = true;
        return true;
      }
      return false;
    }
    return true;
  });

  fs.writeFileSync('bundle.mjs', filtered.join('\n'), 'utf8');
  console.log('✅ bundle.mjs built successfully.');
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
