const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getOTPCode, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");

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
  const email = await getParameter("username");
  const phoneNumber = await getParameter("phone");
  const clientBaseUrl = await getParameter("client-base-url");
  const clientId = await getParameter("client-id");
  const issuerBaseURL = await getParameter("issuer-base-url");
  const clientPrivateKey = await getParameter("client-private-key");

  const server = await startClient(
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

  if (CANARY_NAME.includes("integration")) {
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
  });

  await page.setViewport({ width: 1864, height: 1096 });

  await navigationPromise;

  await synthetics.executeStep("Click sign in", async () => {
    await page.waitForSelector("#main-content #sign-in-link");
    await page.click("#main-content #sign-in-link");
  });

  await navigationPromise;

  await synthetics.executeStep("Enter email", async () => {
    await page.waitForSelector(".govuk-grid-row #email");
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

    const otpCode = await getOTPCode(phoneNumber, bucketName);

    await page.type(".govuk-grid-row #code", otpCode);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await Promise.all([
      page.click(
        "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
      ),
      page.waitForNavigation(),
    ]);
  });

  await synthetics.executeStep("Microclient user-info", async () => {
    await page.content();

    const userInfo = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      return JSON.parse(document.querySelector("body").innerText);
    });

    const hasReachedUserInfo = userInfo.email === email;

    if (!hasReachedUserInfo) {
      server.close();
      throw "Failed smoke test";
    }
  });

  server.close();
  return "success";
};

module.exports.handler = async () => {
  return await basicCustomEntryPoint();
};
