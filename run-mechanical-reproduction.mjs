import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
function arg(name, fallback = null) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
}
function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}
function run(command, argv, cwd = process.cwd()) {
  return spawnSync(command, argv, { cwd, encoding: "utf8", stdio: ["ignore","pipe","pipe"] });
}
function emitAndExit(output, code) {
  if (outPath) fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(output, null, 2));
  process.exit(code);
}

const subjectRepo = arg("--subject-repo", "https://github.com/Riverbraid/Riverbraid-Core.git");
const subjectCommit = arg("--subject-commit");
const outPath = arg("--out");

const profilePath = path.resolve("profiles/mechanical-reproduction-v0.1/profile.json");
const profileBytes = fs.readFileSync(profilePath);
const profile = JSON.parse(profileBytes.toString("utf8"));
const profileHash = sha256(profileBytes);
const contract = profile.core_check_contract || {};

function baseResult(result, check, extra = {}) {
  const evaluatorHead = run("git", ["rev-parse","HEAD"]);
  const evaluatorCommit =
    evaluatorHead.status === 0 && /^[0-9a-f]{40}$/.test(evaluatorHead.stdout.trim())
      ? evaluatorHead.stdout.trim()
      : "0000000000000000000000000000000000000000";
  const attempted = subjectCommit ?? null;
  const subjectFields = result === "INVALID_ATTEMPT"
    ? {subject_commit:null, attempted_subject_commit:attempted}
    : {subject_commit:subjectCommit};
  const resultSubject = result === "INVALID_ATTEMPT"
    ? `invalid-attempt-${sha256(Buffer.from(attempted || "", "utf8"))}`
    : subjectCommit;
  return {
    result_id:`urn:riverbraid:result:mechanical-reproduction:${resultSubject}:${evaluatorCommit}`,
    subject_ref:subjectRepo,
    ...subjectFields,
    profile_ref:profile.profile_id,
    profile_definition_sha256:profileHash,
    evaluator_ref:"https://github.com/Riverbraid/Riverbraid-Evaluation-Kit",
    evaluator_commit:evaluatorCommit,
    environment:{node:process.version,platform:process.platform,arch:process.arch},
    checks:[check],
    result,
    evidence_refs:["profiles/mechanical-reproduction-v0.1/profile.json"],
    nonclaims:profile.nonclaims,
    ...extra
  };
}

if (!subjectCommit || !/^[0-9a-f]{40}$/.test(subjectCommit)) {
  emitAndExit(baseResult(
    "INVALID_ATTEMPT",
    {check_ref:"urn:riverbraid:check:core-contract-binding:v0.1",result:"INVALID_ATTEMPT",evidence:{reason:"INVALID_SUBJECT_COMMIT"}}
  ), 2);
}

const evaluatorHead = run("git", ["rev-parse","HEAD"]);
if (evaluatorHead.status !== 0 || !/^[0-9a-f]{40}$/.test(evaluatorHead.stdout.trim())) {
  throw new Error(`Evaluator commit unavailable: ${evaluatorHead.stderr}`);
}
const evaluatorCommit = evaluatorHead.stdout.trim();

const gitVersion = run("git", ["--version"]);
if (gitVersion.status !== 0) throw new Error("git executable unavailable");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "riverbraid-mechanical-reproduction-"));
const subjectDir = path.join(tempRoot, "Riverbraid-Core");

let wrapperResult = "FAIL";
let wrapperCheck = {
  check_ref:"urn:riverbraid:check:core-mechanical-boundary:v0.1",
  result:"FAIL",
  evidence:{}
};

try {
  const clone = run("git", ["clone","--quiet",subjectRepo,subjectDir]);
  if (clone.status !== 0) {
    wrapperResult = "UNAVAILABLE";
    wrapperCheck = {...wrapperCheck,result:"UNAVAILABLE",evidence:{reason:"CLONE_FAILED",stderr:clone.stderr.trim()}};
  } else {
    const checkout = run("git", ["checkout","--quiet","--detach",subjectCommit], subjectDir);
    if (checkout.status !== 0) {
      wrapperResult = "UNAVAILABLE";
      wrapperCheck = {...wrapperCheck,result:"UNAVAILABLE",evidence:{reason:"SUBJECT_COMMIT_UNAVAILABLE",stderr:checkout.stderr.trim()}};
    } else {
      const actualCommit = run("git", ["rev-parse","HEAD"], subjectDir).stdout.trim();
      if (actualCommit !== subjectCommit) {
        wrapperResult = "INVALID_ATTEMPT";
        wrapperCheck = {...wrapperCheck,result:"INVALID_ATTEMPT",evidence:{reason:"SUBJECT_COMMIT_MISMATCH",expected:subjectCommit,actual:actualCommit}};
      } else {
        const coreProfileFile = path.join(subjectDir, contract.mechanical_profile_path || "");
        const coreVerifierFile = path.join(subjectDir, contract.verifier_path || "");

        if (!fs.existsSync(coreProfileFile) || !fs.existsSync(coreVerifierFile)) {
          wrapperResult = "INVALID_ATTEMPT";
          wrapperCheck = {...wrapperCheck,result:"INVALID_ATTEMPT",evidence:{reason:"BOUND_CORE_CONTRACT_FILE_MISSING"}};
        } else {
          const observedCoreProfileSha = sha256(fs.readFileSync(coreProfileFile));
          const observedCoreVerifierSha = sha256(fs.readFileSync(coreVerifierFile));

          if (
            observedCoreProfileSha !== contract.mechanical_profile_sha256 ||
            observedCoreVerifierSha !== contract.verifier_sha256
          ) {
            wrapperResult = "INVALID_ATTEMPT";
            wrapperCheck = {
              ...wrapperCheck,
              result:"INVALID_ATTEMPT",
              evidence:{
                reason:"CORE_CHECK_CONTRACT_SHA256_MISMATCH",
                expected_profile_sha256:contract.mechanical_profile_sha256,
                observed_profile_sha256:observedCoreProfileSha,
                expected_verifier_sha256:contract.verifier_sha256,
                observed_verifier_sha256:observedCoreVerifierSha
              }
            };
          } else {
            const coreProfile = JSON.parse(fs.readFileSync(coreProfileFile,"utf8"));
            if (coreProfile.profile_id !== contract.profile_ref) {
              wrapperResult = "INVALID_ATTEMPT";
              wrapperCheck = {
                ...wrapperCheck,
                result:"INVALID_ATTEMPT",
                evidence:{reason:"CORE_PROFILE_REF_MISMATCH",expected:contract.profile_ref,observed:coreProfile.profile_id || null}
              };
            } else {
              const verify = run(process.execPath, [contract.verifier_path], subjectDir);
              let coreResult = null;
              try { coreResult = JSON.parse(verify.stdout); } catch {}

              const allCoreChecksPass =
                Array.isArray(coreResult?.checks) &&
                coreResult.checks.length > 0 &&
                coreResult.checks.every((x) => x.result === "PASS");

              const contractPass =
                verify.status === 0 &&
                coreResult?.result === "PASS" &&
                coreResult?.subject_commit === subjectCommit &&
                coreResult?.profile_ref === contract.profile_ref &&
                coreResult?.profile_definition_sha256 === contract.mechanical_profile_sha256 &&
                coreResult?.evaluator_ref === contract.expected_core_evaluator_ref &&
                allCoreChecksPass;

              wrapperResult = contractPass ? "PASS" : "FAIL";
              wrapperCheck = {
                ...wrapperCheck,
                result:wrapperResult,
                evidence:{
                  core_result_sha256:sha256(Buffer.from(verify.stdout || "", "utf8")),
                  core_exit_code:verify.status,
                  core_subject_commit:coreResult?.subject_commit || null,
                  bound_profile_sha256:observedCoreProfileSha,
                  bound_verifier_sha256:observedCoreVerifierSha,
                  core_profile_ref:coreResult?.profile_ref || null,
                  core_profile_definition_sha256:coreResult?.profile_definition_sha256 || null,
                  core_evaluator_ref:coreResult?.evaluator_ref || null,
                  all_core_checks_pass:allCoreChecksPass
                }
              };
            }
          }
        }
      }
    }
  }
} finally {
  fs.rmSync(tempRoot, {recursive:true, force:true});
}

const subjectFields = wrapperResult === "INVALID_ATTEMPT"
  ? {subject_commit:null, attempted_subject_commit:subjectCommit}
  : {subject_commit:subjectCommit};
const resultSubject = wrapperResult === "INVALID_ATTEMPT"
  ? `invalid-attempt-${sha256(Buffer.from(subjectCommit, "utf8"))}`
  : subjectCommit;

const output = {
  result_id:`urn:riverbraid:result:mechanical-reproduction:${resultSubject}:${evaluatorCommit}`,
  subject_ref:subjectRepo,
  ...subjectFields,
  profile_ref:profile.profile_id,
  profile_definition_sha256:profileHash,
  evaluator_ref:"https://github.com/Riverbraid/Riverbraid-Evaluation-Kit",
  evaluator_commit:evaluatorCommit,
  environment:{
    node:process.version,
    platform:process.platform,
    arch:process.arch,
    git:gitVersion.stdout.trim()
  },
  checks:[wrapperCheck],
  result:wrapperResult,
  evidence_refs:[
    "profiles/mechanical-reproduction-v0.1/profile.json",
    `Riverbraid-Core@${subjectCommit}`,
    `core-contract-profile-sha256:${contract.mechanical_profile_sha256}`,
    `core-contract-verifier-sha256:${contract.verifier_sha256}`
  ],
  nonclaims:profile.nonclaims
};

if (outPath) fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(JSON.stringify(output, null, 2));
process.exit(wrapperResult === "PASS" ? 0 : (wrapperResult === "INVALID_ATTEMPT" ? 2 : 1));
