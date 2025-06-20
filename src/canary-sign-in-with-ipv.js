const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getSecret, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const { setStandardViewportSize } = require("./helpers");
const steps = require("./steps");

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
  const email = await getSecret("username");
  const password = await getSecret("password");
  const phoneNumber = await getSecret("phone");
  const clientId = await getSecret("client-id");
  const clientBaseUrl = await getSecret("client-base-url");
  const issuerBaseURL = await getSecret("issuer-base-url");
  const clientPrivateKey = await getSecret("client-private-key");

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

  await steps.launchClient(
    page,
    clientBaseUrl,
    "Create your GOV.UK One Login or sign in"
  );

  setStandardViewportSize(page);

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
