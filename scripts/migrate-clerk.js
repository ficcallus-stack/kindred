const fs = require('fs');
const path = require('path');

function walk(dir) {
  const results = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      results.push(...walk(p));
    } else {
      results.push(p);
    }
  }
  return results;
}

const src = path.join(__dirname, '..', 'src', 'app');
const files = walk(src).filter(f => f.endsWith('actions.ts') || f.endsWith('route.ts'));

let changed = 0;
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('@clerk')) continue;
  
  const orig = c;

  // Replace imports
  c = c.replace(
    /import \{ currentUser \} from "@clerk\/nextjs\/server";/g,
    'import { requireUser } from "@/lib/get-server-user";'
  );
  c = c.replace(
    /import \{ auth \} from "@clerk\/nextjs\/server";/g,
    'import { requireUser } from "@/lib/get-server-user";'
  );

  // Replace currentUser() + guard pattern
  c = c.replace(
    /const clerkUser = await currentUser\(\);\s*\n\s*if \(!clerkUser\) throw new Error\("Unauthorized"\);/g,
    'const clerkUser = await requireUser();'
  );

  // Replace auth() + guard pattern
  c = c.replace(
    /const \{ userId \} = await auth\(\);\s*\n\s*if \(!userId\) throw new Error\("Unauthorized"\);/g,
    'const { uid: userId } = await requireUser();'
  );

  // Replace clerkUser.id with clerkUser.uid
  c = c.replace(/clerkUser\.id/g, 'clerkUser.uid');

  if (c !== orig) {
    fs.writeFileSync(f, c);
    changed++;
    console.log('Fixed:', path.relative(src, f));
  }
}

console.log(`\nDone. Fixed ${changed} files.`);
