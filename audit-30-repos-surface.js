#!/usr/bin/env node

/**
 * Riverbraid 30-Repository Surface Audit Script
 * READ-ONLY AUDIT ONLY - NO MUTATIONS
 * 
 * Purpose: Inventory tags, branches, root files, and verification surfaces
 * across the 30 repositories defined in verified-repo-registry.json
 * 
 * Output: riverbraid-30-surface-inventory.json
 * 
 * Usage:
 *   node audit-30-repos-surface.js
 * 
 * Requirements:
 *   - git CLI available and in PATH
 *   - Node.js with fs, path, child_process modules
 *   - Read-only access to GitHub repositories
 *   - ~500MB free disk space for temporary clones
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const os = require('os');

// Configuration
const SCRIPT_DIR = __dirname;
const REGISTRY_PATH = path.join(SCRIPT_DIR, 'verified-repo-registry.json');
const OUTPUT_PATH = path.join(SCRIPT_DIR, 'riverbraid-30-surface-inventory.json');
const WORK_DIR = path.join(os.tmpdir(), `riverbraid-audit-${Date.now()}`);

const VERIFICATION_FILES = [
  'verify.mjs',
  'run-vectors.cjs',
  'verify-all.sh',
  'verify-v1.5.sh',
  'package.json',
  '.github/workflows/verify.yml'
];

const JUNK_PATTERNS = [
  '.DS_Store',
  'Thumbs.db',
  '*.tmp',
  '*.bak',
  '*.old',
  '*.log',
  '*.swp',
  '*~'
];

console.log('[AUDIT] Riverbraid 30-Repository Surface Inventory');
console.log(`[AUDIT] Output: ${OUTPUT_PATH}`);
console.log(`[AUDIT] Work directory: ${WORK_DIR}`);
console.log('[AUDIT] Mode: READ-ONLY');
console.log('');

// Verify registry exists
if (!fs.existsSync(REGISTRY_PATH)) {
  console.error(`[ERROR] Registry not found: ${REGISTRY_PATH}`);
  process.exit(1);
}

// Load registry
let repos;
try {
  const registryContent = fs.readFileSync(REGISTRY_PATH, 'utf8');
  repos = JSON.parse(registryContent);
  console.log(`[OK] Loaded registry: ${repos.length} repositories`);
} catch (err) {
  console.error(`[ERROR] Failed to parse registry: ${err.message}`);
  process.exit(1);
}

// Create work directory
if (!fs.existsSync(WORK_DIR)) {
  fs.mkdirSync(WORK_DIR, { recursive: true });
  console.log(`[OK] Created work directory`);
}

const results = [];

// Main audit loop
for (let i = 0; i < repos.length; i++) {
  const repo = repos[i];
  const repoName = repo.name;
  const repoUrl = repo.url;
  const pinnedCommit = repo.commit;
  const verifyCommand = repo.verify_command;

  console.log(`[${i + 1}/${repos.length}] AUDIT ${repoName}`);

  const entry = {
    name: repoName,
    url: repoUrl,
    pinned_commit: pinnedCommit,
    verify_command: verifyCommand,
    clone: 'NOT_ATTEMPTED',
    default_branch: 'UNKNOWN',
    branches: [],
    tags: [],
    root_files: [],
    verification_files: [],
    has_readme: false,
    has_package_json: false,
    has_verify_mjs: false,
    has_run_vectors_cjs: false,
    tag_naming_findings: [],
    surface_findings: [],
    recommended_action: 'REVIEW'
  };

  const repoPath = path.join(WORK_DIR, repoName);

  try {
    // Clone repository (no tags initially to save bandwidth)
    console.log(`  → Cloning ${repoName}...`);
    execSync(`git clone --quiet --no-tags "${repoUrl}" "${repoPath}"`, {
      stdio: 'pipe',
      timeout: 60000
    });
    entry.clone = 'OK';

    // Process repository
    process.chdir(repoPath);

    // Fetch all branches and tags
    console.log(`  → Fetching branches and tags...`);
    execSync('git fetch --quiet --tags', { stdio: 'pipe', timeout: 30000 });
    execSync('git fetch --quiet --all', { stdio: 'pipe', timeout: 30000 });

    // Get default branch
    try {
      const defaultBranchOutput = execSync(
        'git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || echo "refs/remotes/origin/main"',
        { encoding: 'utf8', stdio: 'pipe' }
      ).trim();
      entry.default_branch = defaultBranchOutput.replace('refs/remotes/origin/', '').split('\n')[0];
    } catch (e) {
      entry.default_branch = 'main'; // Fallback
    }

    // Get all branches
    try {
      const branchesOutput = execSync('git branch -r', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      entry.branches = branchesOutput
        .split('\n')
        .map(b => b.trim())
        .filter(b => b && !b.includes('HEAD') && !b.includes('->'))
        .sort();
    } catch (e) {
      entry.branches = [entry.default_branch];
    }

    // Get all tags
    try {
      const tagsOutput = execSync('git tag --list', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      entry.tags = tagsOutput
        .split('\n')
        .map(t => t.trim())
        .filter(t => t)
        .sort();
    } catch (e) {
      entry.tags = [];
    }

    // List root files
    try {
      const files = fs.readdirSync(repoPath, { withFileTypes: true });
      entry.root_files = files
        .map(f => (f.isDirectory() ? f.name + '/' : f.name))
        .filter(f => !f.startsWith('.'))
        .sort();
    } catch (e) {
      entry.surface_findings.push(`failed to list root files: ${e.message}`);
    }

    // Check for verification files
    for (const candidate of VERIFICATION_FILES) {
      const fullPath = path.join(repoPath, candidate);
      if (fs.existsSync(fullPath)) {
        entry.verification_files.push(candidate);
      }
    }

    // Check for standard files
    entry.has_readme = fs.existsSync(path.join(repoPath, 'README.md'));
    entry.has_package_json = fs.existsSync(path.join(repoPath, 'package.json'));
    entry.has_verify_mjs = fs.existsSync(path.join(repoPath, 'verify.mjs'));
    entry.has_run_vectors_cjs = fs.existsSync(path.join(repoPath, 'run-vectors.cjs'));

    // Analyze tag naming
    for (const tag of entry.tags) {
      if (tag.match(/^V[0-9]/)) {
        entry.tag_naming_findings.push(`uppercase V tag: ${tag}`);
      }
      if (tag.match(/stationary|gold|genesis|governance/) && !tag.match(/^v[0-9]/)) {
        entry.tag_naming_findings.push(`nonstandard semantic tag: ${tag}`);
      }
    }

    // Check for junk files
    try {
      const walkDir = (dir, callback) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
          if (file.name.startsWith('.')) continue;
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            walkDir(fullPath, callback);
          } else {
            callback(fullPath, file.name);
          }
        }
      };

      walkDir(repoPath, (fullPath, fileName) => {
        for (const pattern of JUNK_PATTERNS) {
          const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
          if (fileName.match(new RegExp(`^${regexPattern}$`))) {
            const relPath = path.relative(repoPath, fullPath);
            entry.surface_findings.push(`possible junk file: ${relPath}`);
          }
        }
      });
    } catch (e) {
      entry.surface_findings.push(`failed to scan for junk files: ${e.message}`);
    }

    // Check for missing README
    if (!entry.has_readme) {
      entry.surface_findings.push('missing README.md');
    }

    // Determine recommended action
    const hasIssues = entry.tag_naming_findings.length > 0 || entry.surface_findings.length > 0;
    if (!hasIssues) {
      entry.recommended_action = 'KEEP';
    } else {
      entry.recommended_action = 'REVIEW';
    }

    console.log(`  ✓ ${repoName} audited successfully`);

  } catch (err) {
    entry.clone = 'FAILED';
    entry.surface_findings.push(`Clone failed: ${err.message}`);
    entry.recommended_action = 'REVIEW';
    console.log(`  ✗ ${repoName} clone failed: ${err.message}`);
  } finally {
    // Return to script directory
    process.chdir(SCRIPT_DIR);
    results.push(entry);
  }
}

// Write output
console.log('');
console.log('[WRITE] Generating output JSON...');

const output = {
  metadata: {
    audit_timestamp: new Date().toISOString(),
    mode: 'READ_ONLY',
    mutation_scope: 'NONE',
    deletion_allowed: false,
    registry_count: repos.length,
    audited_count: results.length
  },
  tag_protection_policy: {
    protected_tags: [
      'any tag linked from README',
      'any tag linked from release notes',
      'any tag referenced in registry',
      'any signed or governance tag',
      'any tag used in prior public claims'
    ],
    candidate_delete_only_if: [
      'not referenced anywhere',
      'not attached to a release',
      'not signed governance history',
      'clearly superseded',
      'name is confusing and no external dependency is likely'
    ]
  },
  repositories: results
};

try {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');
  console.log(`[OK] Output written: ${OUTPUT_PATH}`);
  console.log(`[OK] Total repositories audited: ${results.length}`);
  console.log(`[OK] Repositories with KEEP status: ${results.filter(r => r.recommended_action === 'KEEP').length}`);
  console.log(`[OK] Repositories with REVIEW status: ${results.filter(r => r.recommended_action === 'REVIEW').length}`);
} catch (err) {
  console.error(`[ERROR] Failed to write output: ${err.message}`);
  process.exit(1);
}

// Cleanup
console.log('');
console.log('[CLEANUP] Removing temporary directory...');
try {
  execSync(`rm -rf "${WORK_DIR}"`, { stdio: 'pipe' });
  console.log('[OK] Temporary directory cleaned up');
} catch (err) {
  console.warn(`[WARN] Failed to remove temporary directory: ${err.message}`);
  console.warn(`[WARN] Manual cleanup: rm -rf "${WORK_DIR}"`);
}

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('AUDIT COMPLETE');
console.log('═══════════════════════════════════════════════════════');
console.log(`Output: ${OUTPUT_PATH}`);
console.log('');
console.log('Next steps:');
console.log('1. Review output JSON for surface findings');
console.log('2. Classify tags by protection policy');
console.log('3. Do NOT delete tags yet - classification first');
console.log('');
