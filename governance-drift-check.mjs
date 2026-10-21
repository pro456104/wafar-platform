#!/usr/bin/env node
/*
 * governance-drift-check.mjs — Wafar governance drift check
 * (ADR-071, ADR-072, ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083, ADR-086, ADR-088, ADR-092, ADR-093, ADR-096, ADR-097, ADR-098, ADR-099, ADR-100, ADR-101, ADR-102, ADR-103, ADR-104, ADR-105)
 * -------------------------------------------------------------------
 * Read-only. Dependency-free. Runs on the pinned Node runtime.
 *
 * It verifies the invariants the governance set cannot verify by discipline:
 *   A. the constitution footer version AND last-amended date equal
 *      `.specify/memory/version.json`
 *   B. every live `ADR-001 … ADR-0NN` range string, in every governance
 *      markdown file under `docs/`, the two Arabic mirrors, the template
 *      overrides, and the feature specifications, equals the last ADR row in
 *      `docs/DECISIONS.md`'s index; every
 *      index row's anchor resolves to its heading; no heading is orphaned; and
 *      every `ADR-NNN` reference in the governance set resolves to an ADR the
 *      index carries
 *   F. the ADR list in `Project-Technologies.txt`'s header ends at that row and
 *      is contiguous from ADR-040 to it
 *   K. every enumeration of five or more ADR numbers in the governance set
 *      equals the list this header carries, so the check has one authority for
 *      "which ADRs built the check" instead of a copy per document
 *   C. every `speckit.manifest.json` hash for an *upstream-owned* file matches
 *      the working tree, and no upstream-owned file is absent from it;
 *      project-owned files are excluded by a path rule
 *      (`.specify/templates/overrides/**`, `.specify/.gitignore`,
 *      `.specify/templates/exception-register.md`)
 *   D. `.codebuddy/commands/*` and `.opencode/commands/*` are byte-identical
 *   D2. each integration manifest (`.specify/integrations/codebuddy.manifest.json`,
 *      `.specify/integrations/opencode.manifest.json`) matches the tree it
 *      records, and covers that integration's whole command directory
 *   E. the removed design system is absent: `wafar.single.css` no longer
 *      exists, and the constitution carries no "## Design System Standards"
 *      heading
 *   G. the structural counts the governance text states in prose — slices,
 *      exception rows, principles, data entities, binding sections, API
 *      modules, pages, and product features — match the lists that enumerate
 *      them. G6 derives its set from the constitution's own `##` headings, so
 *      a binding section ADDED to the constitution is caught
 *   I. the integration topology agrees across `integration.json`,
 *      `init-options.json`, the integration directories in the tree, and the
 *      bundled workflow's nesting
 *   J. the ADR index's constitution-version column agrees with the footer's
 *      version — no cell claims a version the constitution never reached, the
 *      column never moves backwards down the table, and the last row names the
 *      footer's version
 *   G10. the Constitution Mandated Values count the constitution states equals
 *      the count the plan template's prose states, and its table's row count
 *      equals the row count that prose states
 *   G11. every entity's owning module agrees across the constitution's Data
 *      entities table and `docs/domain-model.md`'s Entity map, in both
 *      directions
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
const footerDate = constitution.match(/\*\*Last Amended\*\*:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})/);
if (!footer) {
  failures.push('A: the constitution carries no "**Version**: X.Y.Z" footer');
} else if (footer[1] !== versionJson.constitution_version) {
  failures.push(
    `A: constitution footer ${footer[1]} != version.json ${versionJson.constitution_version}`,
  );
} else if (!footerDate) {
  failures.push('A: the constitution carries no "**Last Amended**: YYYY-MM-DD" footer');
} else if (footerDate[1] !== versionJson.last_amended) {
  // ADR-086: only the semver was compared, so the version could move without
  // the recorded date of the move moving with it.
  failures.push(
    `A: constitution last-amended ${footerDate[1]} != version.json ${versionJson.last_amended}`,
  );
} else {
  notes.push(`A: version sources agree at ${footer[1]}, last amended ${footerDate[1]}`);
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
// ADR-096: feature specifications carry the live range string too, so a spec
// written at one ADR and left behind by the next is caught rather than passing
// unseen.
const walkSpecs = (dir) => {
  if (!existsSync(join(ROOT, dir))) return;
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walkSpecs(rel);
    else if (entry.name.endsWith('.md')) scannedRangeFiles.add(rel);
  }
};
walkSpecs('specs');
scannedRangeFiles.delete('docs/DECISIONS.md');
// ADR-086: the two Arabic mirrors are bound sources too. Neither is required to
// carry a live range string, so REQUIRED_RANGE_FILES above is unchanged; but a
// range string added to either is now checked instead of passing unseen.
scannedRangeFiles.add('Core-Project.txt');
scannedRangeFiles.add('Project-Technologies.txt');

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
  // The reverse direction (ADR-086): a heading the index does not carry. The
  // loop above only caught an index row with no heading.
  const indexRows = new Set(
    [...decisions.matchAll(/^\| \[ADR-(\d{3})\]\(#/gm)].map((m) => m[1]),
  );
  for (const n of headingAnchors.keys()) {
    if (!indexRows.has(n)) {
      failures.push(`B: ADR-${n} has a "## ADR-${n} — …" heading but no index row`);
    }
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
  // ADR-102: the reference pass runs over the same file set as the range pass,
  // so a feature specification's `ADR-NNN` reference is resolved instead of
  // passing unseen while `AGENTS.md` §5 states that every reference is checked.
  const referenceFiles = new Set([...REFERENCE_FILES, ...scannedRangeFiles]);
  const knownAdr = new Set(indexNumbers.map((n) => String(n).padStart(3, '0')));
  let referencesChecked = 0;
  for (const file of [...referenceFiles].sort()) {
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
  notes.push(`B: ${referencesChecked} distinct ADR references resolved across ${referenceFiles.size} files`);
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
    // ADR-105: "ends at the index" was not enough. An edit that moved the tail
    // from 101/102 to 101/104 ends at the index and silently drops two ADRs, so
    // the list is also required to be CONTIGUOUS from 040 to the last row.
    // The capture above begins after "ADR-040", so 040 is prepended back.
    const want = [];
    for (let n = 40; n <= Number(expected); n++) want.push(String(n).padStart(3, '0'));
    const listed = ['040', ...nums];
    const missing = want.filter((n) => !listed.includes(n));
    const extra = listed.filter((n) => !want.includes(n));
    if (missing.length > 0 || extra.length > 0 || listed.join(',') !== want.join(',')) {
      failures.push(
        `F: Project-Technologies.txt ADR list is not contiguous 040..${expected}` +
          (missing.length > 0 ? `; missing ${missing.join(', ')}` : '') +
          (extra.length > 0 ? `; unexpected ${extra.join(', ')}` : '') +
          (missing.length === 0 && extra.length === 0 ? '; entries out of order' : ''),
      );
    } else {
      notes.push(`F: Project-Technologies.txt ADR list is contiguous 040..${lastPt}`);
    }
  }
}

/* ---- K. every ADR enumeration agrees with the check's own header (ADR-105) - */
// ADR-071 onward is enumerated in prose in several places: the check's header,
// the constitution's References row, README.md, AGENTS.md and ROADMAP.md. Each
// copy drifted at least once (ROADMAP.md named 13 of 21; the pre-commit hook
// named 10 and stopped two amendments behind). The check's own header is the
// single authority; every run of FIVE OR MORE comma-separated ADR numbers in
// the governance set must equal it as a set. A short inline citation such as
// "(ADR-040)" or "(ADR-097, ADR-098)" is untouched, so ordinary citation stays
// free and the check does not fire on prose that names two neighbours.
const selfText = read('governance-drift-check.mjs');
const headerLine = selfText
  .split(/\r?\n/)
  .find((l) => (l.match(/ADR-\d{3}/g) || []).length >= 5);
const canonicalAdrs = headerLine
  ? [...new Set([...headerLine.matchAll(/ADR-(\d{3})/g)].map((m) => m[1]))].sort()
  : [];
if (canonicalAdrs.length === 0) {
  failures.push('K: the check\u2019s own header carries no ADR list of five or more entries');
} else {
  const ENUM_FILES = [
    'README.md', 'AGENTS.md', 'ROADMAP.md',
    '.specify/memory/constitution.md', '.githooks/pre-commit',
    'governance-drift-check.mjs',
  ];
  let enumerationsChecked = 0;
  for (const file of ENUM_FILES) {
    if (!existsSync(join(ROOT, file))) {
      failures.push(`K: ${file} is missing`);
      continue;
    }
    const text = read(file);
    for (const m of text.matchAll(/ADR-\d{3}(?:\s*,\s*(?:and\s+)?ADR-\d{3}){4,}/g)) {
      const got = [...new Set([...m[0].matchAll(/ADR-(\d{3})/g)].map((x) => x[1]))].sort();
      if (got.join(',') !== canonicalAdrs.join(',')) {
        const missing = canonicalAdrs.filter((n) => !got.includes(n));
        const extra = got.filter((n) => !canonicalAdrs.includes(n));
        failures.push(
          `K: ${file} enumerates ${got.length} ADRs that disagree with the check\u2019s header (${canonicalAdrs.length})` +
            (missing.length > 0 ? `; missing ${missing.join(', ')}` : '') +
            (extra.length > 0 ? `; unexpected ${extra.join(', ')}` : ''),
        );
      }
      enumerationsChecked++;
    }
  }
  notes.push(`K: ${enumerationsChecked} ADR enumerations checked against the header's ${canonicalAdrs.length}`);
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
// The reverse direction (ADR-086): an upstream-owned file the manifest does not
// record. Only the two directories the manifest governs are scanned, so the
// project-owned overrides and the exception register stay out of scope by
// construction rather than by an exclusion list.
const manifestKeys = new Set(Object.keys(manifest.files));
for (const dir of ['.specify/scripts/powershell', '.specify/templates']) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const name of readdirSync(join(ROOT, dir))) {
    if (!name.endsWith('.ps1') && !name.endsWith('.md')) continue;
    const rel = `${dir}/${name}`;
    if (!manifestKeys.has(rel)) {
      failures.push(`C: ${rel} is in the tree but absent from speckit.manifest.json`);
    }
  }
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
  // Coverage (ADR-086): the manifest must record the integration's WHOLE
  // command directory. Before this check the two manifests recorded only the
  // ten core commands, so the thirteen extension commands were installed,
  // byte-compared against the other integration, and never hashed at all.
  const cmdDir = `.${integrationManifest.integration}/commands`;
  if (existsSync(join(ROOT, cmdDir))) {
    const inManifest = new Set(
      Object.keys(integrationManifest.files)
        .filter((f) => f.startsWith(`${cmdDir}/`))
        .map((f) => f.slice(cmdDir.length + 1)),
    );
    for (const name of readdirSync(join(ROOT, cmdDir))) {
      if (!inManifest.has(name)) {
        failures.push(`D2: ${cmdDir}/${name} is in the tree but absent from ${manifestRel}`);
      }
    }
  }
  notes.push(`D2: ${d2checked} command files match ${manifestRel}`);
}

/* ---- E. the removed design system is absent (ADR-093) ---------------------- */
// The bespoke design system was removed by ADR-093: the stylesheet is gone, and
// the constitution no longer carries a Design System Standards section. Either
// reappearing is drift.
if (existsSync(join(ROOT, 'wafar.single.css'))) {
  failures.push('E: wafar.single.css still exists; ADR-093 removed the design system');
}
if (constitution.includes('## Design System Standards')) {
  failures.push('E: the constitution still carries a Design System Standards section');
}
notes.push('E: wafar.single.css is absent and the constitution carries no Design System Standards section');

/* ---- G. structural counts the governance text states in prose ------------- */
// The governance text states countable facts ("fifteen slices", "six exception
// rows", "ten principles", "twelve entities", "eighteen
// binding sections", "ten API modules", "twenty-six pages", "sixteen product
// features"). None was machine-checked before ADR-075.
//
// Each row below counts an enumerable list and compares it to a constant
// recorded here. That constant is NOT parsed out of the prose, so for G1-G4 and
// G7-G9 the prose count is verified only in the direction where the list
// changes: a list that grows fails, while prose edited on its own does not.
// G6 is the exception — it derives its expected set from the constitution's own
// `##` headings and cross-checks the count the binding template states in
// words, so a binding section ADDED to the constitution is caught (ADR-086).
// Anchors are line-start and lists are sliced by heading, never by line number,
// so a renamed heading fails loudly instead of passing silently.
const sliceBetween = (text, from, to) => {
  const start = text.indexOf(from);
  if (start < 0) return null;
  const end = text.indexOf(to, start + from.length);
  return text.slice(start, end < 0 ? undefined : end);
};
const countMatches = (text, re) => [...text.matchAll(re)].length;

// The eighteen binding sections Governance enumerates in its Authority
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
  'Glossary',
  'Product Scope',
  'Product Register',
  'Single-Reference Sufficiency',
  'File Processing Overview',
  'Artifact Workflow and Traceability',
  'Product Fact Clarifications',
];

// G6's expected set is DERIVED, not assumed (ADR-086). It used to be the
// hardcoded list above compared against the Authority paragraph alone, which
// meant a section added to the constitution AND to that paragraph passed
// silently. The set now comes from the constitution's own `##` headings, the
// three headings that are deliberately not binding are excluded by name, and
// the count the binding template states in words is parsed and compared.
const NON_BINDING_SECTIONS = ['Core Principles', 'References', 'Governance'];
const headingSections = [...constitution.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
const derivedBindingSections = headingSections.filter(
  (h) => !NON_BINDING_SECTIONS.includes(h),
);
for (const h of derivedBindingSections) {
  if (!GOV_BINDING_SECTIONS.includes(h)) {
    failures.push(
      `G: the constitution carries the binding section "${h}", which the drift check's list does not name`,
    );
  }
}
for (const n of GOV_BINDING_SECTIONS) {
  if (!derivedBindingSections.includes(n)) {
    failures.push(
      `G: the drift check names the binding section "${n}" but the constitution carries no such "## " heading`,
    );
  }
}
const authorityParagraph = sliceBetween(constitution, '**Authority.**', '\n\n') || '';
const flatAuthorityParagraph = authorityParagraph.replace(/\s+/g, ' ');
for (const n of derivedBindingSections) {
  if (!flatAuthorityParagraph.includes(n)) {
    failures.push(`G: the Authority paragraph does not name the binding section "${n}"`);
  }
}
const NUMBER_WORDS = {
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  'twenty-one': 21, 'twenty-two': 22, 'twenty-three': 23,
};
const templateText = read('.specify/templates/overrides/constitution-template.md');
const proseCount = templateText.match(/its ([a-z-]+) binding sections/);
if (!proseCount) {
  failures.push('G: the constitution template no longer states its binding-section count in words');
} else if (NUMBER_WORDS[proseCount[1]] !== derivedBindingSections.length) {
  failures.push(
    `G: the template says "${proseCount[1]}" binding sections but the constitution carries ${derivedBindingSections.length}`,
  );
}

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
  { id: 'G6', label: 'binding sections', want: 18,
    file: '.specify/memory/constitution.md',
    // Derived from the constitution's own `##` headings above, so a binding
    // section added to the document fails here instead of passing silently.
    got: () => derivedBindingSections.length },
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

/* ---- G10. the Constitution Mandated Values count the template states (ADR-105) */
// Module Discipline and Development Workflow calls its list CLOSED and requires
// the plan template's table to gain a matching row in the same change. The plan
// template states both numbers in prose ("the constitution enumerates seventeen
// values, and this table has nineteen rows") with the split documented. Nothing
// compared the three, so a value added to the constitution left the sentence
// stale and the table short, silently.
const cmvSpan = sliceBetween(constitution, 'The values are:', 'The list is closed:');
const planTpl = read('.specify/templates/overrides/plan-template.md');
const cmvProse = planTpl.match(
  /the constitution enumerates\s+([a-z-]+)\s+values,\s+and this table has\s+([a-z-]+)\s+rows/,
);
if (cmvSpan === null) {
  failures.push(
    'G10: the constitution no longer states its Constitution Mandated Values list between "The values are:" and "The list is closed:"',
  );
} else if (!cmvProse) {
  failures.push('G10: the plan template no longer states its CMV counts in prose');
} else {
  const cmvWanted = cmvSpan.split(';').length;
  const tplTable = sliceBetween(planTpl, '| # | Value | This plan records |', '\n\n');
  const cmvRows = tplTable === null ? -1 : countMatches(tplTable, /^\| \d+ \|/gm);
  if (NUMBER_WORDS[cmvProse[1]] !== cmvWanted) {
    failures.push(
      `G10: the plan template says the constitution enumerates "${cmvProse[1]}" values but it enumerates ${cmvWanted}`,
    );
  } else if (NUMBER_WORDS[cmvProse[2]] !== cmvRows) {
    failures.push(
      `G10: the plan template says its table has "${cmvProse[2]}" rows but it carries ${cmvRows}`,
    );
  } else {
    notes.push(`G10: ${cmvWanted} Constitution Mandated Values map to ${cmvRows} template rows`);
  }
}

/* ---- G11. every entity's owning module agrees with the register (ADR-105) -- */
// `docs/domain-model.md` is the entities' source of truth and the constitution's
// Data entities table is the map; a module renamed on one side and not the other
// was invisible because nothing compared the two tables.
const registerEntities = new Map();
const registerSpan = sliceBetween(constitution, '### Data entities', '\n### ');
if (registerSpan !== null) {
  for (const m of registerSpan.matchAll(/^\| `(\w+)` \| `(\w+)` \|/gm)) {
    registerEntities.set(m[1], m[2]);
  }
}
const modelSpan = sliceBetween(read('docs/domain-model.md'), '## Entity map', '\n## ');
const modelEntities = new Map();
if (modelSpan !== null) {
  for (const m of modelSpan.matchAll(/^\| `(\w+)` \| `(\w+)` \|/gm)) {
    modelEntities.set(m[1], m[2]);
  }
}
if (registerEntities.size === 0) {
  failures.push('G11: the constitution\u2019s Data entities table could not be read');
} else if (modelEntities.size === 0) {
  failures.push('G11: docs/domain-model.md\u2019s Entity map table could not be read');
} else {
  for (const [entity, owner] of registerEntities) {
    if (!modelEntities.has(entity)) {
      failures.push(`G11: ${entity} is in the register but absent from docs/domain-model.md`);
    } else if (modelEntities.get(entity) !== owner) {
      failures.push(
        `G11: ${entity} is owned by ${owner} in the register and ${modelEntities.get(entity)} in docs/domain-model.md`,
      );
    }
  }
  for (const entity of modelEntities.keys()) {
    if (!registerEntities.has(entity)) {
      failures.push(`G11: ${entity} is in docs/domain-model.md but absent from the register`);
    }
  }
  notes.push(`G11: ${registerEntities.size} entity owners agree across the register and the model`);
}

/* ---- I. the integration topology is consistent (ADR-088) ------------------ */
// Four files state the same fact and nothing compared them: integration.json
// lists the installed integrations, the default, and their settings; each
// integration owns a command directory in the tree; init-options.json names the
// integration the scaffold was built for; and the bundled workflow declares its
// required integrations. The workflow's list is an advisory, non-exhaustive
// compatibility hint by its own comment, so only its NESTING is checked here and
// never its contents against the registry.
const integrationJson = JSON.parse(read('.specify/integration.json'));
const initOptions = JSON.parse(read('.specify/init-options.json'));
const installedIntegrations = Array.isArray(integrationJson.installed_integrations)
  ? integrationJson.installed_integrations
  : [];
if (installedIntegrations.length === 0) {
  failures.push('I: integration.json lists no installed integration');
}
if (!installedIntegrations.includes(integrationJson.default_integration)) {
  failures.push(
    `I: integration.json's default "${integrationJson.default_integration}" is not among the installed integrations`,
  );
}
if (initOptions.integration && !installedIntegrations.includes(initOptions.integration)) {
  failures.push(
    `I: init-options.json names the integration "${initOptions.integration}", which integration.json does not list`,
  );
}
for (const name of Object.keys(integrationJson.integration_settings || {})) {
  if (!installedIntegrations.includes(name)) {
    failures.push(
      `I: integration.json carries settings for "${name}", which it does not list as installed`,
    );
  }
}
for (const name of installedIntegrations) {
  if (!existsSync(join(ROOT, `.${name}`))) {
    failures.push(`I: integration.json lists "${name}" but .${name}/ is absent from the tree`);
  }
}
for (const entry of readdirSync(ROOT)) {
  if (!entry.startsWith('.') || !existsSync(join(ROOT, entry, 'commands'))) continue;
  const bare = entry.slice(1);
  if (!installedIntegrations.includes(bare)) {
    failures.push(`I: ${entry}/commands/ exists but integration.json does not list "${bare}"`);
  }
}
const workflowText = read('.specify/workflows/speckit/workflow.yml');
if (
  !/^requires:\s*$/m.test(workflowText) ||
  !/^\s{2}integrations:\s*$/m.test(workflowText) ||
  !/^\s{4}any:\s*$/m.test(workflowText)
) {
  failures.push(
    'I: the bundled workflow no longer nests "requires.integrations.any" as ADR-072 fixed it',
  );
}
notes.push(
  `I: integration topology consistent (${installedIntegrations.join(', ')}; default ${integrationJson.default_integration})`,
);

/* ---- J. the ADR index's constitution-version column (ADR-103) --------------- */
// The constitution's amendment procedure names three places the version lives:
// the footer, `version.json`, and the ADR index row — whose constitution-version
// column names the version each ADR produced. A, above, checks the first two
// against each other; nothing checked the third. A version that moved in the
// footer without the index column moving with it was therefore invisible, and
// the column could claim a version the constitution never reached.
const versionCell = /^(?:—|-)?(?: \((?:unchanged)\))?$/;
const semverCell = /^(\d+\.\d+\.\d+)(?: \((?:unchanged)\))?$/;
const cmpVersion = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
};
if (footer) {
  const indexTable = decisions.slice(
    decisions.indexOf('## Index'),
    decisions.indexOf('## ADR-001'),
  );
  const columnRows = [];
  for (const line of indexTable.split(/\r?\n/)) {
    if (!/^\|\s*\[ADR-\d{3}\]/.test(line)) continue;
    const cells = line.split('|').map((s) => s.trim()).filter((s) => s.length);
    const n = /\[ADR-(\d{3})\]/.exec(cells[0])?.[1];
    const cell = cells[cells.length - 1] ?? '';
    if (!n) continue;
    const m = semverCell.exec(cell);
    columnRows.push({ n, cell, ver: m ? m[1] : null });
  }
  if (columnRows.length === 0) {
    failures.push('J: the ADR index carries no constitution-version column to check');
  } else {
    const current = footer[1];
    let claimed = 0;
    for (const row of columnRows) {
      if (row.ver === null) {
        if (!versionCell.test(row.cell)) {
          failures.push(
            `J: ADR-${row.n} constitution-version cell "${row.cell}" is neither a version nor "—"`,
          );
        }
        continue;
      }
      claimed++;
      if (cmpVersion(row.ver, current) > 0) {
        failures.push(
          `J: ADR-${row.n} claims constitution version ${row.ver}, above the footer's ${current}`,
        );
      }
    }
    // The column must never move backwards down the table: an ADR ratified
    // later cannot claim a version older than the one before it.
    let previous = null;
    for (const row of columnRows) {
      if (row.ver === null) continue;
      if (previous && cmpVersion(row.ver, previous.ver) < 0) {
        failures.push(
          `J: ADR-${row.n} claims constitution version ${row.ver}, below ADR-${previous.n}'s ${previous.ver}`,
        );
      }
      previous = row;
    }
    const last = [...columnRows].reverse().find((r) => r.ver !== null);
    const highest = columnRows
      .filter((r) => r.ver !== null)
      .reduce((a, b) => (cmpVersion(b.ver, a.ver) > 0 ? b : a));
    if (last && last.ver !== current) {
      failures.push(
        `J: the last index row (ADR-${last.n}) claims constitution version ${last.ver}, footer's is ${current}`,
      );
    }
    if (highest.ver !== current) {
      failures.push(
        `J: the highest version the index claims is ${highest.ver}, footer's is ${current}`,
      );
    }
    notes.push(
      `J: ADR index constitution-version column checked (${claimed} versions, highest ${highest.ver})`,
    );
  }
}

/* ---- report --------------------------------------------------------------- */
console.log('Wafar governance drift check (ADR-071, ADR-072, ADR-073, ADR-074, ADR-075, ADR-080, ADR-082, ADR-083, ADR-086, ADR-088, ADR-092, ADR-093, ADR-096, ADR-097, ADR-098, ADR-099, ADR-100, ADR-101, ADR-102, ADR-103, ADR-104, ADR-105)');
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
