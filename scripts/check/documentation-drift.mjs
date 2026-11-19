#!/usr/bin/env node
// The standalone documentation-drift test: it compares the emitted OpenAPI
// document, the routes the Hono app registers, and the intake contract's §2-§4
// tables, and exits non-zero on the first difference (contracts/intake-api.md
// §7; Complexity Tracking row 18).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
const documentPath = resolve(root, 'apps/api/openapi.json');
const contractPath = resolve(root, 'specs/002-file-intake/contracts/intake-api.md');
const appPath = resolve(root, 'apps/api/src/app.ts');

/** The route literals the contract's §2 table records. */
function contractRoutes(markdown) {
  const routes = [];
  for (const line of markdown.split('\n')) {
    const match = /^\|\s*`(GET|POST|DELETE|PUT|PATCH)`\s*\|\s*`([^`]+)`\s*\|/.exec(line);
    if (match === null) continue;
    routes.push({ method: match[1].toLowerCase(), path: match[2] });
  }
  return routes;
}

/** The paths the emitted document carries. */
function documentRoutes(document) {
  const routes = [];
  for (const [path, operations] of Object.entries(document.paths ?? {})) {
    for (const method of Object.keys(operations)) {
      if (!['get', 'post', 'put', 'delete', 'patch', 'head'].includes(method)) continue;
      routes.push({ method, path: path.replace('{uploadId}', ':uploadId') });
    }
  }
  return routes;
}

/** The route registrations the app's own module list names. */
function appRoutes(source) {
  const routes = [];
  const pattern = /app\.(get|post|put|delete|patch)\(\s*'([^']+)'/g;
  for (const match of source.matchAll(pattern)) {
    routes.push({ method: match[1], path: match[2] });
  }
  return routes;
}

const document = JSON.parse(readFileSync(documentPath, 'utf8'));
const contract = readFileSync(contractPath, 'utf8');
const app = readFileSync(appPath, 'utf8');

const documented = documentRoutes(document);
const specified = contractRoutes(contract);
const registered = appRoutes(app);

const problems = [];

for (const route of specified) {
  const path = route.path.replace(/^\/api\/v1/, '').replace('{uploadId}', ':uploadId');
  if (!documented.some((entry) => entry.path === path && entry.method === route.method)) {
    problems.push(`documented route missing from openapi.json: ${route.method.toUpperCase()} ${route.path}`);
  }
}

for (const route of documented) {
  if (route.path === '/health') continue;
  // R1's authentication surface is published beside the intake and is not in
  // this slice's contract; its own suite compares it.
  if (route.path.startsWith('/auth/')) continue;
  if (!specified.some((entry) => entry.path.endsWith(route.path.replace(':uploadId', '{uploadId}')) && entry.method === route.method)) {
    problems.push(`openapi.json route not in the contract: ${route.method.toUpperCase()} ${route.path}`);
  }
}

// Every intake route the app mounts is a document entry.
for (const route of registered) {
  if (!route.path.startsWith('/api/v1/uploads') && !route.path.startsWith('/api/v1/catalogs')) continue;
  const path = route.path.replace(/^\/api\/v1/, '');
  if (!documented.some((entry) => entry.path === path && entry.method === route.method)) {
    problems.push(`app route missing from openapi.json: ${route.method.toUpperCase()} ${route.path}`);
  }
}

if (problems.length > 0) {
  console.error('Documentation drift:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  `Documentation drift ok: ${specified.length} contract routes, ${documented.length} documented routes, ${registered.length} app routes.`,
);
