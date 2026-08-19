import fs from "node:fs";
import path from "node:path";

const root = "profiles/mechanical-reproduction-v0.1";
const schema = JSON.parse(fs.readFileSync(path.join(root, "result.schema.json"), "utf8"));
const fixtures = [
  "fixtures/PASS.valid.json",
  "fixtures/INVALID_ATTEMPT.valid.json"
].map((relativePath) => ({
  relativePath,
  value: JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"))
}));

const hex40 = /^[0-9a-f]{40}$/;
const hex64 = /^[0-9a-f]{64}$/;
const allowedResults = new Set(schema.properties.result.enum);
const allowedKeys = new Set(Object.keys(schema.properties));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifySchemaBoundary() {
  assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "Unexpected schema dialect");
  assert(schema.additionalProperties === false, "Result schema must remain closed");
  const conditional = schema.allOf?.find((entry) => entry?.if?.properties?.result?.const === "INVALID_ATTEMPT");
  assert(conditional, "INVALID_ATTEMPT conditional is missing");
  assert(conditional.then?.properties?.subject_commit?.type === "null", "INVALID_ATTEMPT must null subject_commit");
  assert(conditional.then?.required?.includes("attempted_subject_commit"), "INVALID_ATTEMPT must require attempted_subject_commit");
  assert(conditional.else?.properties?.subject_commit?.pattern === "^[0-9a-f]{40}$", "Non-invalid result must bind a 40-hex subject_commit");
  assert(conditional.else?.not?.required?.includes("attempted_subject_commit"), "Non-invalid result must omit attempted_subject_commit");
}

function verifyFixture({relativePath, value}) {
  for (const key of schema.required) assert(Object.hasOwn(value, key), `${relativePath}: missing ${key}`);
  for (const key of Object.keys(value)) assert(allowedKeys.has(key), `${relativePath}: unexpected ${key}`);
  assert(allowedResults.has(value.result), `${relativePath}: invalid result`);
  assert(typeof value.result_id === "string" && value.result_id.length > 0, `${relativePath}: invalid result_id`);
  assert(typeof value.subject_ref === "string" && value.subject_ref.length > 0, `${relativePath}: invalid subject_ref`);
  assert(typeof value.profile_ref === "string" && value.profile_ref.length > 0, `${relativePath}: invalid profile_ref`);
  assert(hex64.test(value.profile_definition_sha256), `${relativePath}: invalid profile_definition_sha256`);
  assert(typeof value.evaluator_ref === "string" && value.evaluator_ref.length > 0, `${relativePath}: invalid evaluator_ref`);
  assert(hex40.test(value.evaluator_commit), `${relativePath}: invalid evaluator_commit`);
  assert(value.environment && typeof value.environment === "object" && !Array.isArray(value.environment), `${relativePath}: invalid environment`);
  assert(Array.isArray(value.checks), `${relativePath}: invalid checks`);
  assert(value.checks.every((check) => typeof check.check_ref === "string" && allowedResults.has(check.result)), `${relativePath}: invalid check`);
  assert(Array.isArray(value.evidence_refs) && value.evidence_refs.every((ref) => typeof ref === "string"), `${relativePath}: invalid evidence_refs`);
  assert(Array.isArray(value.nonclaims) && value.nonclaims.length > 0 && value.nonclaims.every((claim) => typeof claim === "string"), `${relativePath}: invalid nonclaims`);
  if (value.result === "INVALID_ATTEMPT") {
    assert(value.subject_commit === null, `${relativePath}: INVALID_ATTEMPT subject_commit must be null`);
    assert(Object.hasOwn(value, "attempted_subject_commit"), `${relativePath}: attempted_subject_commit missing`);
    assert(value.attempted_subject_commit === null || typeof value.attempted_subject_commit === "string", `${relativePath}: invalid attempted_subject_commit`);
  } else {
    assert(hex40.test(value.subject_commit), `${relativePath}: subject_commit must be 40-hex`);
    assert(!Object.hasOwn(value, "attempted_subject_commit"), `${relativePath}: attempted_subject_commit must be absent`);
  }
}

verifySchemaBoundary();
fixtures.forEach(verifyFixture);
console.log(JSON.stringify({
  profile_ref:"urn:riverbraid:profile:mechanical-reproduction:v0.1",
  check_ref:"urn:riverbraid:check:result-contract-fixtures:v0.1",
  fixtures:fixtures.map(({relativePath}) => relativePath),
  result:"PASS",
  nonclaims:["This verifies the declared result-grammar boundary and two fixtures only."]
}, null, 2));
