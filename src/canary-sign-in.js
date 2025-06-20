const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getSecret, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const { setStandardViewportSize } = require("./helpers");
const steps = require("./steps");

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
  const email = await getSecret("username");
  const password = await getSecret("password");
  const phoneNumber = await getSecret("phone");
  const clientBaseUrl = await getSecret("client-base-url");
  const clientId = await getSecret("client-id");
  const issuerBaseURL = await getSecret("issuer-base-url");
  const clientPrivateKey = await getSecret("client-private-key");

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
