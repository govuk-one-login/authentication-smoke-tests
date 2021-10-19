const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getOTPCode, emptyOtpBucket } = require("./aws");

const CANARY_NAME = synthetics.getCanaryName();
const SYNTHETICS_CONFIG = synthetics.getConfiguration();

SYNTHETICS_CONFIG.setConfig({
  screenshotOnStepStart: true,
  screenshotOnStepSuccess: true,
  screenshotOnStepFailure: true,
});

const basicCustomEntryPoint = async () => {
  log.info("Running smoke tests");

  const bucketName = await getParameter("bucket");

  log.info("Empty OTP code bucket");
  await emptyOtpBucket(bucketName);

  let page = await synthetics.getPage();
  const navigationPromise = page.waitForNavigation({
    waitUntil: "networkidle0",
  });

  if (CANARY_NAME.includes("integration")) {
    log.info("Running against INTEGRATION environment");

    const email = await getParameter("basicauth-username");
    const basicAuthPassword = await getParameter("basicauth-password");

    await page.authenticate({ username: email, password: basicAuthPassword });
  }

  await synthetics.executeStep("Launch AM", async () => {
    const url = await getParameter("url");
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  });

  await page.setViewport({ width: 1864, height: 1096 });

  await navigationPromise;

  await synthetics.executeStep("Select sign in", async () => {
    await page.waitForSelector("form #create-account-false");
    await page.click("form #create-account-false");
    await page.type("form #create-account-false", "false");
  });

  await navigationPromise;

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await page.click(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
  });

  await navigationPromise;

  await synthetics.executeStep("Enter email", async () => {
    await page.waitForSelector(".govuk-grid-row #email");
    const email = await getParameter("username");
    await page.type(".govuk-grid-row #email", email);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await page.click(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
  });

  await navigationPromise;

  await synthetics.executeStep("Enter password", async () => {
    await page.waitForSelector(".govuk-grid-row #password");
    const password = await getParameter("password");
    await page.type(".govuk-grid-row #password", password);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await page.click(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
  });

  await navigationPromise;

  await synthetics.executeStep("Enter OTP code", async () => {
    await page.waitForSelector(".govuk-grid-row #code");

    const phoneNumber = await getParameter("phone");
    const otpCode = await getOTPCode(phoneNumber, bucketName);

    await page.type(".govuk-grid-row #code", otpCode);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await page.click(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
  });

  await navigationPromise;

  await synthetics.executeStep("Manage your account", async () => {
    await page.waitForSelector("#warning-link");

    const hasReachedAM =
      (await page.title()) === "Manage your account - GOV.UK account";

    if (!hasReachedAM) {
      throw "Failed smoke test";
    }
  });

  return "success";
};

module.exports.handler = async () => {
  return await basicCustomEntryPoint();
};
