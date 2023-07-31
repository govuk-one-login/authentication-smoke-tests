const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getOTPCode, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const { selectors } = require("./vars");

const CANARY_NAME = synthetics.getCanaryName();
const SYNTHETICS_CONFIG = synthetics.getConfiguration();
const isSandpitJourney = () => CANARY_NAME.includes("sandpit");

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

  // TODO: fix the reliance on hard coding here
  const bucketName = isSandpitJourney()
    ? "integration-smoke-test-sms-codes"
    : await getParameter("bucket");
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

  let page = await synthetics.getPage();
  const navigationPromise = page.waitForNavigation({
    waitUntil: "networkidle0",
  });

  // TODO: remove ref to sandpit - this is only temp so we can point at integration for now
  if (CANARY_NAME.includes("integration") || isSandpitJourney()) {
    log.info("Running against INTEGRATION environment");

    const basicAuthUsername = await getParameter("basicauth-username");
    const basicAuthPassword = await getParameter("basicauth-password");

    await page.authenticate({
      username: basicAuthUsername,
      password: basicAuthPassword,
    });
  }

  await synthetics.executeStep("Launch Client", async () => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
  });

  await page.setViewport({ width: 1864, height: 1096 });

  await navigationPromise;

  await synthetics.executeStep("Click continue to prove identity", async () => {
    await page.waitForSelector("#form-tracking > button");
    await page.click("#form-tracking > button");
  });

  await navigationPromise;

  await synthetics.executeStep("Click sign in", async () => {
    await page.waitForSelector(selectors.signInButton);
    await page.click(selectors.signInButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Enter email", async () => {
    await page.waitForSelector(selectors.emailInput);
    await page.type(selectors.emailInput, email);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Enter password", async () => {
    await page.waitForSelector(selectors.passwordInput);
    await page.type(selectors.passwordInput, password);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Enter OTP code", async () => {
    await page.waitForSelector(selectors.otpCodeInput);

    const otpCode = await getOTPCode(phoneNumber, bucketName);

    await page.type(selectors.otpCodeInput, otpCode);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);

    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
  });

  await synthetics.executeStep("IPV hand-off", async () => {
    const pageTitleForConsole = await page.title();

    log.info(pageTitleForConsole);

    const hasReachedIPV =
      (await page.title()) ===
      "Tell us if you have one of the following types of photo ID – GOV.UK";

    if (!hasReachedIPV) {
      throw "Failed smoke test";
    }
  });

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
