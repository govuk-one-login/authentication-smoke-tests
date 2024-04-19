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
SYNTHETICS_CONFIG.setConfig({
  screenshotOnStepStart: true,
  screenshotOnStepSuccess: true,
  screenshotOnStepFailure: true,
});

let server;

const basicCustomEntryPoint = async () => {
  log.info("Running smoke tests");

  const bucketName = await getParameter("bucket");
  const email = await getParameter("username");
  const password = await getParameter("password");
  const phoneNumber = await getParameter("phone");
  const clientBaseUrl = await getParameter("client-base-url");
  const clientId = await getParameter("client-id");
  const issuerBaseURL = await getParameter("issuer-base-url");
  const clientPrivateKey = await getParameter("client-private-key");

  server = await startClient(
    3031,
    "openid email phone",
    clientId,
    clientBaseUrl,
    issuerBaseURL,
    clientPrivateKey
  );

  log.info("Emptying OTP code bucket");
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
    "Create your GOV.UK One&nbsp;Login or sign&nbsp;in"
  );

  setStandardViewportSize(page);

  await steps.clickSignIn(page);

  await steps.enterEmail(page, email);

  await steps.submitEmail(page);

  await steps.enterPassword(page, password);

  await steps.submitPassword(page);

  await steps.enterOtpCode(page, phoneNumber, bucketName);

  await steps.submitOtpCode(page);

  await steps.microclientUserInfo(page, email);

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
