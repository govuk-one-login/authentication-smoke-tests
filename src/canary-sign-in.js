const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getOTPCode, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const { selectors } = require("./vars");
const {
  validateText,
  validateNoText,
  validateUrlContains,
} = require("./helpers");

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
  log.info("Running smoke tests");

  const bucketName = await getParameter("bucket");
  const email = await getParameter("username");
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

  log.info("Empty OTP code bucket");
  await emptyOtpBucket(bucketName, phoneNumber);

  let page = await synthetics.getPage();
  const navigationPromise = page.waitForNavigation({
    waitUntil: "networkidle0",
  });

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
    });

    await validateText("Create a GOV.UK One Login or sign in", page);
  });

  await page.setViewport({ width: 1864, height: 1096 });

  await navigationPromise;

  await synthetics.executeStep("Click sign in", async () => {
    await page.waitForSelector(selectors.signInButton);
    await Promise.all([
      page.click(selectors.signInButton),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("enter-email", page);
  });

  await navigationPromise;

  await synthetics.executeStep("Enter email", async () => {
    await page.waitForSelector(selectors.emailInput);
    await page.type(selectors.emailInput, email);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("enter-password", page);
  });

  await navigationPromise;

  await synthetics.executeStep("Enter password", async () => {
    await page.waitForSelector(selectors.passwordInput);
    const password = await getParameter("password");
    await page.type(selectors.passwordInput, password);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("enter-code", page);
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
    await validateNoText("There is a problem", page);
  });

  await synthetics.executeStep("Microclient user-info", async () => {
    await page.content();

    const userInfo = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      return JSON.parse(document.querySelector("body").innerText);
    });

    const hasReachedUserInfo = userInfo.email === email;

    if (!hasReachedUserInfo) {
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
