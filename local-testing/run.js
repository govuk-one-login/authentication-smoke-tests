/**
 * Local canary runner — executes canary handlers directly without the
 * Synthetics Lambda layer. Mocks the Synthetics and SyntheticsLogger
 * modules so the canary code runs on your Mac with real AWS calls
 * (SSM, S3) but a local Puppeteer browser.
 *
 * Usage:
 *   node local-testing/run.js canary-sign-in
 *   node local-testing/run.js canary-create-account
 *   node local-testing/run.js canary-sign-in-with-ipv
 */

const path = require("path");
const puppeteer = require("puppeteer");

const canaryFile = process.argv[2];
if (!canaryFile) {
  throw new Error(
    "Usage: node local-testing/run.js <canary-file>\n" +
      "  e.g. node local-testing/run.js canary-sign-in"
  );
}

const CANARY_NAME = process.env.CANARY_NAME || "authdev3-smoke-in";

// --- Mock SyntheticsLogger ---
const SyntheticsLogger = {
  info: (...args) => console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
  warn: (...args) => console.warn("[WARN]", ...args),
  write: (...args) => console.log("[LOG]", ...args),
  reset: async () => {},
  deleteLogFile: async () => {},
};

// --- Mock Synthetics ---
let browser = null;
let page = null;
const stepErrors = [];

const Synthetics = {
  getCanaryName: () => CANARY_NAME,

  getConfiguration: () => ({
    setConfig: () => {},
    withScreenshotOnStepStart: () => Synthetics.getConfiguration(),
    withScreenshotOnStepSuccess: () => Synthetics.getConfiguration(),
    withScreenshotOnStepFailure: () => Synthetics.getConfiguration(),
  }),

  getPage: async () => {
    if (!page) {
      browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
      });
      page = await browser.newPage();
    }
    return page;
  },

  executeStep: async (stepName, fn) => {
    console.log(`\n▶ Step: ${stepName}`);
    try {
      await fn();
      console.log(`  ✓ ${stepName} passed`);
    } catch (err) {
      console.error(`  ✗ ${stepName} failed:`, err.message);
      stepErrors.push({ stepName, error: err });
      throw err;
    }
  },

  getStepErrors: () => stepErrors,
  getVisualMonitoringFailureOutsideStep: () => null,
  addExecutionError: () => {},
  reset: async () => {},
  setEventAndContext: async () => {},
  beforeCanary: async () => {},
  launch: async () => {},
  afterCanary: async () => {},
};

// --- Register mocks so require() finds them ---
const Module = require("module");
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request === "Synthetics") return "Synthetics";
  if (request === "SyntheticsLogger") return "SyntheticsLogger";
  return originalResolve.call(this, request, ...args);
};

require.cache["Synthetics"] = {
  id: "Synthetics",
  filename: "Synthetics",
  loaded: true,
  exports: Synthetics,
};
require.cache["SyntheticsLogger"] = {
  id: "SyntheticsLogger",
  filename: "SyntheticsLogger",
  loaded: true,
  exports: SyntheticsLogger,
};

// --- Ensure AWS credentials are valid ---
const { execSync } = require("child_process");

const AWS_PROFILE =
  process.env.AWS_PROFILE ||
  "di-authentication-development-AdministratorAccessPermission";
process.env.AWS_PROFILE = AWS_PROFILE;
process.env.AWS_REGION = process.env.AWS_REGION || "eu-west-2";

try {
  execSync(`aws sts get-caller-identity --profile ${AWS_PROFILE}`, {
    stdio: "ignore",
  });
} catch {
  console.log(`🔑 SSO session expired, logging in...`);
  execSync(`aws sso login --profile ${AWS_PROFILE}`, { stdio: "inherit" });
}

// --- Run the canary ---
async function main() {
  console.log(`\n🔬 Running canary: ${canaryFile}`);
  console.log(`   Canary name: ${CANARY_NAME}`);
  console.log(`   Region: eu-west-2\n`);

  const canaryPath = path.resolve(__dirname, "..", "src", canaryFile);
  const canary = require(canaryPath);

  try {
    await canary.handler();
    console.log("\n✅ Canary PASSED");
  } catch (err) {
    console.error("\n❌ Canary FAILED:", err.message);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
}

main();
