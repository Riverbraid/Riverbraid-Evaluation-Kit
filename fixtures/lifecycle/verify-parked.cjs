#!/usr/bin/env node
"use strict";
const fs = require("fs");
function fail(code) { console.error(code); process.exit(1); }
for (const file of ["README.md", "repo.role.json", "package.json", "verify-parked.cjs"]) {
  if (!fs.existsSync(file)) fail(`MISSING_REQUIRED_FILE:${file}`);
}
const role = JSON.parse(fs.readFileSync("repo.role.json", "utf8").replace(/^\uFEFF/, ""));
if (role.status !== "parked") fail("ROLE_STATUS_MUST_BE_PARKED");
console.log(`PARKED_REPO_VERIFIED:${role.name}`);
