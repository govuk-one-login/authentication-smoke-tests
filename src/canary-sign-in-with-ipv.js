const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const {
  setStandardViewportSize,
  authenticateWithBasicAuth,
} = require("./helpers");
const steps = require("./steps");

const CANARY_NAME = synthetics.getCanaryName();
const SYNTHETICS_CONFIG = synthetics.getConfiguration();

let server;

SYNTHETICS_CONFIG.setConfig({
  screenshotOnStepStart: true,
  screenshotOnStepSuccess: true,
  screenshotOnStepFailure: true,
});

const basicCustomEntryPoint = async () => {
  log.info("Running smoke tests: Sign in with IPV");

  const fireDrill = await getParameter("fire-drill");
  if (fireDrill === "1") {
    log.info("Fire Drill! Sign in with IPV smoke test will fail.");
    throw "Sign in with IPV smoke test failed due to Fire Drill";
  }

  const bucketName = await getParameter("bucket");
  const email = await getParameter("username");
  const password = await getParameter("password");
  const phoneNumber = await getParameter("phone");
  const clientId = await getParameter("client-id");
  const clientBaseUrl = await getParameter("client-base-url");
  const issuerBaseURL = await getParameter("issuer-base-url");
  const clientPrivateKey = await getParameter("client-private-key");

  server = await startClient(
    3032,
    "openid email phone",
    clientId,
    clientBaseUrl,
    issuerBaseURL,
    clientPrivateKey,
    true
  );

  log.info(`Empty OTP code bucket (${bucketName})`);
  await emptyOtpBucket(bucketName, phoneNumber);

  const page = await synthetics.getPage();

  // Currently, sandpit canaries need to be run against the integration backend
  if (CANARY_NAME.includes("integration") || CANARY_NAME.includes("sandpit")) {
    log.info("Running against INTEGRATION environment");
    await authenticateWithBasicAuth(page);
  }

  await steps.launchClient(
    page,
    clientBaseUrl,
    "Prove your identity with GOV.UK One Login"
  );

  setStandardViewportSize(page);

  await steps.clickContinueOnIpvStartPage(page);

  await steps.clickSignIn(page);

  await steps.enterEmail(page, email);

  await steps.submitEmail(page);

  await steps.enterPassword(page, password);

  await steps.submitPassword(page);

  await steps.enterOtpCode(page, phoneNumber, bucketName);

  await steps.submitOtpCode(page);

  await steps.ipvHandOff(page);

  return "success";
};

module.exports.handler = async () => {
  try {
    return await basicCustomEntryPoint();
  } catch (err) {
    log.error(err);
    throw err;
  } finally {
    if (server) server.close();
  }
};
