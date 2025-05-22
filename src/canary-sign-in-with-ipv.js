const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, emptyOtpBucket } = require("./aws");
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

  const title = await page.title();
  if (
    title !==
    "Do you live in the UK, the Channel Islands or the Isle of Man? – GOV.UK One Login"
  ) {
    // Force fraud check by enabling the zeroHourFraudVcExpiry feature set
    await steps.forceFraudCheck(page);

    // Journey is not a new identity (identity reuse or fraud check)
    await steps.identityReuse(page);
    await steps.waitForSpinner(page, clientBaseUrl);
  }

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
