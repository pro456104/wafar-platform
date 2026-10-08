#!/usr/bin/env node
/*
 * governance-drift-check.mjs — Wafar governance drift check
 * (ADR-071, ADR-072, ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083)
 * -------------------------------------------------------------------
 * Read-only. Dependency-free. Runs on the pinned Node runtime.
 *
 * It verifies the invariants the governance set cannot verify by discipline:
 *   A. the constitution footer version equals `.specify/memory/version.json`
 *   B. every live `ADR-001 … ADR-0NN` range string, in every governance
 *      markdown file under `docs/` and the template overrides, equals the last
 *      ADR row in `docs/DECISIONS.md`'s index; every index row's anchor resolves
 *      to its heading; and every `ADR-NNN` reference in the governance set
 *      resolves to an ADR the index carries
 *   F. the ADR list in `Project-Technologies.txt`'s header ends at that row
 *   C. every `speckit.manifest.json` hash for an *upstream-owned* file matches
 *      the working tree; project-owned files are excluded by a path rule
 *      (`.specify/templates/overrides/**`, `.specify/.gitignore`,
 *      `.specify/templates/exception-register.md`)
 *   D. `.codebuddy/commands/*` and `.opencode/commands/*` are byte-identical
 *   D2. each integration manifest (`.specify/integrations/codebuddy.manifest.json`,
 *      `.specify/integrations/opencode.manifest.json`) matches the tree it
 *      records
 *   E. every token named in the constitution's Design System Standards section
 *      is defined in `wafar.single.css`
 *   G. the structural counts the governance text states in prose — slices,
 *      exception rows, principles, data entities, design-system modules,
 *      binding sections, API modules, pages, and product features — match the
 *      lists that enumerate them
 *
 * Usage:  node governance-drift-check.mjs
 * Exit:   0 = clean, 1 = drift found.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const failures = [];
const notes = [];

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const sha256 = (rel) =>
  createHash('sha256').update(readFileSync(join(ROOT, rel))).digest('hex');

/* ---- A. version sources agree -------------------------------------------- */
const constitution = read('.specify/memory/constitution.md');
const versionJson = JSON.parse(read('.specify/memory/version.json'));
const footer = constitution.match(/\*\*Version\*\*:\s*([0-9]+\.[0-9]+\.[0-9]+)/);
if (!footer) {
  failures.push('A: the constitution carries no "**Version**: X.Y.Z" footer');
} else if (footer[1] !== versionJson.constitution_version) {
  failures.push(
    `A: constitution footer ${footer[1]} != version.json ${versionJson.constitution_version}`,
  );
} else {
  notes.push(`A: version sources agree at ${footer[1]}`);
}

/* ---- B. live ADR range strings equal the index's last ADR ----------------- */
const decisions = read('docs/DECISIONS.md');
const indexNumbers = [...decisions.matchAll(/\|\s*\[ADR-(\d{3})\]\(#adr-/g)].map((m) =>
  Number(m[1]),
);
const lastAdr = indexNumbers.length ? Math.max(...indexNumbers) : null;
const expected = lastAdr === null ? null : String(lastAdr).padStart(3, '0');

// Files that MUST carry the live range string: a miss there is a defect.
const REQUIRED_RANGE_FILES = [
  'AGENTS.md',
  'README.md',
  'ROADMAP.md',
  'docs/architecture.md',
  '.specify/templates/overrides/spec-template.md',
  '.specify/templates/overrides/checklist-template.md',
];
const RANGE = /ADR-001\s*…\s*ADR-(\d{3})/g;

// Every other markdown file is scanned too, so a new document that carries a
// stale range string is caught even though it is not on the required list.
// `docs/DECISIONS.md` is excluded: it holds historical range strings in its
// records, which are correct as written.
const scannedRangeFiles = new Set(REQUIRED_RANGE_FILES);
for (const dir of ['docs', '.specify/templates/overrides']) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const name of readdirSync(join(ROOT, dir))) {
    if (name.endsWith('.md')) scannedRangeFiles.add(`${dir}/${name}`);
  }
}
scannedRangeFiles.delete('docs/DECISIONS.md');

if (expected === null) {
  failures.push('B: no ADR index rows found in docs/DECISIONS.md');
} else {
  for (const file of REQUIRED_RANGE_FILES) {
    if (!existsSync(join(ROOT, file))) {
      failures.push(`B: ${file} is missing`);
      continue;
    }
    if ([...read(file).matchAll(RANGE)].length === 0) {
      failures.push(`B: ${file} carries no live "ADR-001 … ADR-0NN" range string`);
    }
  }
  for (const file of [...scannedRangeFiles].sort()) {
    if (!existsSync(join(ROOT, file))) continue;
    for (const m of read(file).matchAll(RANGE)) {
      if (m[1] !== expected) {
        failures.push(`B: ${file} range ends at ADR-${m[1]}, index ends at ADR-${expected}`);
      }
    }
  }
  // Every index row's anchor must resolve to its heading. The heading anchor is
  // GitHub's slug: lowercase, drop every character that is not a letter, digit,
  // space, or hyphen, then replace each space with a hyphen (no collapsing, so
  // an em dash between two spaces yields two hyphens). ADR-082 added this check
  // and repaired the one row it found (ADR-064).
  const anchorOf = (s) =>
    s.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-');
  const headingAnchors = new Map();
  for (const m of decisions.matchAll(/^## ADR-(\d{3}) — (.+)$/gm)) {
    headingAnchors.set(m[1], anchorOf(`adr-${m[1]} — ${m[2]}`));
  }
  let anchorsChecked = 0;
  for (const m of decisions.matchAll(/^\| \[ADR-(\d{3})\]\(#([^)]+)\)/gm)) {
    const [, n, anchor] = m;
    const expectedAnchor = headingAnchors.get(n);
    if (!expectedAnchor) {
      failures.push(`B: ADR-${n} has an index row but no "## ADR-${n} — …" heading`);
    } else if (expectedAnchor !== anchor) {
      failures.push(`B: ADR-${n} index anchor #${anchor} != heading anchor #${expectedAnchor}`);
    }
    anchorsChecked++;
  }
  notes.push(`B: index ends at ADR-${expected}; ${scannedRangeFiles.size} markdown files scanned`);
  notes.push(`B: ${anchorsChecked} ADR index anchors resolved against their headings`);

  // Every `ADR-NNN` reference in the governance set must resolve to an ADR the
  // index carries. ADR-083 added this check; a typo or a reference to an ADR
  // that does not exist would otherwise pass silently.
  const REFERENCE_FILES = [
    'README.md', 'AGENTS.md', 'ROADMAP.md', 'Core-Project.txt',
    'Project-Technologies.txt', 'docs/architecture.md', 'docs/domain-model.md',
    'docs/CHANGELOG-mirror.md', 'docs/DECISIONS.md',
    '.specify/templates/exception-register.md',
    '.specify/templates/overrides/spec-template.md',
    '.specify/templates/overrides/plan-template.md',
    '.specify/templates/overrides/tasks-template.md',
    '.specify/templates/overrides/checklist-template.md',
    '.specify/templates/overrides/constitution-template.md',
  ];
  const knownAdr = new Set(indexNumbers.map((n) => String(n).padStart(3, '0')));
  let referencesChecked = 0;
  for (const file of REFERENCE_FILES) {
    if (!existsSync(join(ROOT, file))) {
      failures.push(`B: ${file} is missing`);
      continue;
    }
    for (const n of new Set([...read(file).matchAll(/ADR-(\d{3})/g)].map((m) => m[1]))) {
      if (!knownAdr.has(n)) {
        failures.push(`B: ${file} references ADR-${n}, which the index does not carry`);
      }
      referencesChecked++;
    }
  }
  notes.push(`B: ${referencesChecked} distinct ADR references resolved across ${REFERENCE_FILES.length} files`);
}

/* ---- F. the Project-Technologies.txt header ADR list ends at the index ----- */
const projectTech = read('Project-Technologies.txt');
const ptRun = projectTech.match(/ADR-040((?:\/\d{3})+)/);
if (!ptRun) {
  failures.push('F: Project-Technologies.txt header carries no ADR list starting at ADR-040');
} else if (expected !== null) {
  const nums = ptRun[1].split('/').filter(Boolean);
  const lastPt = nums[nums.length - 1];
  if (lastPt !== expected) {
    failures.push(
      `F: Project-Technologies.txt ADR list ends at ${lastPt}, index ends at ${expected}`,
    );
  } else {
    notes.push(`F: Project-Technologies.txt ADR list ends at ${lastPt}`);
  }
}

/* ---- C. manifest hashes for upstream-owned files -------------------------- */
// The exception register is a project-owned file, not an upstream one: the
// constitution's Governance section requires the project to maintain it, and
// ADR-052 and ADR-054 added its six rows to it. Enforcing its recorded hash
// would fail on the next granted exception, so it is excluded here (ADR-074).
const projectOwned = (p) =>
  p.startsWith('.specify/templates/overrides/') ||
  p === '.specify/.gitignore' ||
  p === '.specify/templates/exception-register.md';

const manifest = JSON.parse(read('.specify/integrations/speckit.manifest.json'));
let checked = 0;
let skipped = 0;
for (const [file, hash] of Object.entries(manifest.files)) {
  if (projectOwned(file)) {
    skipped++;
    continue;
  }
  if (!existsSync(join(ROOT, file))) {
    failures.push(`C: ${file} is listed in the manifest but missing from the tree`);
    continue;
  }
  const actual = sha256(file);
  if (actual !== hash) {
    failures.push(`C: ${file} hash ${actual.slice(0, 12)}… != manifest ${hash.slice(0, 12)}…`);
  }
  checked++;
}
notes.push(`C: ${checked} upstream-owned manifest entries checked, ${skipped} project-owned skipped`);

/* ---- D. the two integrations are byte-identical --------------------------- */
const A_DIR = '.codebuddy/commands';
const B_DIR = '.opencode/commands';
if (!existsSync(join(ROOT, A_DIR)) || !existsSync(join(ROOT, B_DIR))) {
  failures.push('D: one of the integration command directories is missing');
} else {
  const la = readdirSync(join(ROOT, A_DIR)).sort();
  const lb = readdirSync(join(ROOT, B_DIR)).sort();
  if (la.join('\n') !== lb.join('\n')) {
    failures.push('D: the two integration command directories list different files');
  }
  for (const f of la) {
    if (!lb.includes(f)) continue;
    if (sha256(join(A_DIR, f)) !== sha256(join(B_DIR, f))) {
      failures.push(`D: ${A_DIR}/${f} != ${B_DIR}/${f}`);
    }
  }
  notes.push(`D: ${la.length} command files compared across the two integrations`);
}

/* ---- D2. each integration manifest matches the tree it records ------------- */
for (const manifestRel of [
  '.specify/integrations/codebuddy.manifest.json',
  '.specify/integrations/opencode.manifest.json',
]) {
  if (!existsSync(join(ROOT, manifestRel))) {
    failures.push(`D2: ${manifestRel} is missing`);
    continue;
  }
  const integrationManifest = JSON.parse(read(manifestRel));
  let d2checked = 0;
  for (const [file, hash] of Object.entries(integrationManifest.files)) {
    if (!existsSync(join(ROOT, file))) {
      failures.push(`D2: ${file} is listed in ${manifestRel} but missing from the tree`);
      continue;
    }
    if (sha256(file) !== hash) {
      failures.push(`D2: ${file} hash != the value recorded in ${manifestRel}`);
    }
    d2checked++;
  }
  notes.push(`D2: ${d2checked} command files match ${manifestRel}`);
}

/* ---- E. design-system tokens named in the register exist in the stylesheet - */
const dsStart = constitution.indexOf('## Design System Standards');
const dsEnd = constitution.indexOf('\n## Glossary');
const dsSection = dsStart >= 0 && dsEnd > dsStart ? constitution.slice(dsStart, dsEnd) : '';
if (!dsSection) {
  failures.push('E: could not locate the Design System Standards section');
} else {
  const css = read('wafar.single.css');
  const defined = new Set(
    [...css.matchAll(/(--[a-z0-9]+(?:-[a-z0-9]+)*)\s*:/g)].map((m) => m[1]),
  );

  // A row may name a token exactly, a family as a prefix glob (`--text-*`), a
  // brace expansion (`--motion-loop-{pulse,spin}`), or a range with named
  // endpoints (`--space-0` … `--space-32`). Every glob form is resolved first so
  // its prefix is not read as a token of its own.
  const GLOB_STAR = /--[a-z0-9]+(?:-[a-z0-9]+)*-\*/g;
  const GLOB_BRACE = /(--[a-z0-9]+(?:-[a-z0-9]+)*)-\{([a-z0-9,\s-]+)\}/g;

  const globPrefixes = new Set(
    [...dsSection.matchAll(GLOB_STAR)].map((m) => m[0].slice(0, -1)),
  );
  const braceNames = new Set();
  for (const m of dsSection.matchAll(GLOB_BRACE)) {
    for (const part of m[2].split(',')) {
      const p = part.trim();
      if (p) braceNames.add(`${m[1]}-${p}`);
    }
  }

  const withoutGlobs = dsSection.replace(GLOB_STAR, ' ').replace(GLOB_BRACE, ' ');
  const named = new Set(
    [...withoutGlobs.matchAll(/--[a-z0-9]+(?:-[a-z0-9]+)*/g)].map((m) => m[0]),
  );
  for (const t of braceNames) named.add(t);

  for (const t of [...named].sort()) {
    if (!defined.has(t)) {
      failures.push(`E: ${t} is named in Design System Standards but not defined in wafar.single.css`);
    }
  }
  for (const p of [...globPrefixes].sort()) {
    if (![...defined].some((d) => d.startsWith(p))) {
      failures.push(`E: the family ${p}* is named in Design System Standards but no matching token is defined in wafar.single.css`);
    }
  }
  notes.push(
    `E: ${named.size} exact tokens + ${globPrefixes.size} families named in the register; ${defined.size} defined in the stylesheet`,
  );
}

/* ---- G. structural counts the governance text states in prose ------------- */
// The constitution, the roadmap, the exception register, and the architecture
// state countable facts ("fifteen slices", "six exception rows", "ten
// principles", "twelve entities", "fourteen modules", "nineteen binding
// sections", "ten API modules", "twenty-six pages", "sixteen product
// features"). None was machine-checked before ADR-075, so
// any of them could drift silently. Each row counts an enumerable list and
// compares it to the number the governance text states. Anchors are line-start
// and lists are sliced by heading, never by line number, so a renamed heading
// fails loudly instead of passing silently.
const sliceBetween = (text, from, to) => {
  const start = text.indexOf(from);
  if (start < 0) return null;
  const end = text.indexOf(to, start + from.length);
  return text.slice(start, end < 0 ? undefined : end);
};
const countMatches = (text, re) => [...text.matchAll(re)].length;

// The nineteen binding sections Governance enumerates in its Authority
// paragraph. A section renamed in the constitution drops out of the paragraph
// and is caught here.
const GOV_BINDING_SECTIONS = [
  'Query Safety and Secrets',
  'Schema and Migration Control',
  'Identity, Authentication, and Session Policy',
  'Authorization and Access Control',
  'Performance Budgets and Verification',
  'Dependency Governance',
  'Module Discipline and Development Workflow',
  'Project Structure and Debt Control',
  'Documentation',
  'Deployment and Observability',
  'Technology Standards',
  'Design System Standards',
  'Glossary',
  'Product Scope',
  'Product Register',
  'Single-Reference Sufficiency',
  'File Processing Overview',
  'Artifact Workflow and Traceability',
  'Product Fact Clarifications',
];

const structuralCounts = [
  { id: 'G1', label: 'slices (R1–R15)', want: 15, file: 'ROADMAP.md',
    got: () => countMatches(read('ROADMAP.md'), /^\| R\d+ \|/gm) },
  { id: 'G2', label: 'exception rows (EX-###)', want: 6,
    file: '.specify/templates/exception-register.md',
    got: () => countMatches(read('.specify/templates/exception-register.md'), /^\| EX-\d{3} \|/gm) },
  { id: 'G3', label: 'principles', want: 10,
    file: '.specify/memory/constitution.md',
    got: () => countMatches(constitution, /^### [IVX]+\./gm) },
  { id: 'G4', label: 'data entities', want: 12,
    file: '.specify/memory/constitution.md',
    got: () => {
      const s = sliceBetween(constitution, '### Data entities', '\n### ');
      return s === null ? -1 : countMatches(s, /^\| `\w+` \| `\w+` \|/gm);
    } },
  { id: 'G5', label: 'design-system modules', want: 14,
    file: '.specify/memory/constitution.md',
    got: () => {
      const s = sliceBetween(constitution, '### Module map', '\n### ');
      return s === null ? -1 : countMatches(s, /\| \d{2} \| [a-z]+ \|/g);
    } },
  { id: 'G6', label: 'binding sections', want: 19,
    file: '.specify/memory/constitution.md',
    got: () => {
      const s = sliceBetween(constitution, '**Authority.**', '\n\n');
      if (s === null) return -1;
      // The enumeration wraps across lines, so a name can straddle a newline;
      // collapse whitespace before matching.
      const flat = s.replace(/\s+/g, ' ');
      return GOV_BINDING_SECTIONS.filter((n) => flat.includes(n)).length;
    } },
  { id: 'G7', label: 'API modules', want: 10,
    file: 'docs/architecture.md',
    got: () => {
      const s = sliceBetween(read('docs/architecture.md'), '## 2. Module map', '## 3. ');
      return s === null ? -1 : countMatches(s, /^\| `\w+` \|/gm);
    } },
  // G8 and G9 complete the set: the governance text also states a page count
  // ("Twenty-six pages are in scope", Product Register) and a product-feature
  // count ("The sixteen product features are listed in Product Scope"). Both
  // were stated in prose and left unchecked until ADR-080.
  { id: 'G8', label: 'pages (the twenty-six)', want: 26,
    file: '.specify/memory/constitution.md',
    got: () => {
      const s = sliceBetween(constitution, '## Product Scope', '\n## Product Register');
      if (s === null) return -1;
      // The three page tables (public site, merchant area, administrator
      // application) carry two columns and a "Page" header row. The Product
      // Features table carries three columns, so the two-column shape excludes
      // it without a second anchor.
      return countMatches(s, /^\| (?!Page \|)[^|]+ \| [^|]+ \|$/gm);
    } },
  { id: 'G9', label: 'product features (the sixteen)', want: 16,
    file: '.specify/memory/constitution.md',
    got: () => {
      const s = sliceBetween(constitution, '### Product Features', '\n## ');
      return s === null ? -1 : countMatches(s, /^\| \d+ \|/gm);
    } },
];

for (const c of structuralCounts) {
  const actual = c.got();
  if (actual !== c.want) {
    failures.push(`G: ${c.file} should carry ${c.want} ${c.label} but ${actual} found`);
  }
}
notes.push(`G: ${structuralCounts.length} structural counts checked`);

/* ---- report --------------------------------------------------------------- */
console.log('Wafar governance drift check (ADR-071, ADR-072, ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083)');
console.log('=====================================');
for (const n of notes) console.log(`  ok   ${n}`);
if (failures.length === 0) {
  console.log('\nRESULT: clean — no drift found.');
  process.exit(0);
}
console.log('');
for (const f of failures) console.log(`  FAIL ${f}`);
console.log(`\nRESULT: ${failures.length} drift finding(s).`);
process.exit(1);
