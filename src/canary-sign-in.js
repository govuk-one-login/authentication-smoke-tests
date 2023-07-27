const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getOTPCode, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const { validateText, checkTimeBefore, checkTimeAfter, validateNoText, getAllParams, validateUrl } = require("./helpers");
const { text, urls } = require("./vars");

const CANARY_NAME = synthetics.getCanaryName();
const SYNTHETICS_CONFIG = synthetics.getConfiguration();

let server;

SYNTHETICS_CONFIG.setConfig({
  screenshotOnStepStart: true,
  screenshotOnStepSuccess: true,
  screenshotOnStepFailure: true,
});

const basicCustomEntryPoint = async () => {
  log.info(`Running smoke tests 27`);

  // const { bucketName, email, password } = 
  //   getAllParams(["bucket", "email", "password"])

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

  log.info("Empty OTP code bucket");
  await emptyOtpBucket(bucketName, phoneNumber);

  let page = await synthetics.getPage();

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
    await validateText(text.login, page);
  });

  await page.setViewport({ width: 1864, height: 1096 });


  await synthetics.executeStep("Sign in page", async () => {
    await page.waitForSelector("#main-content #sign-in-button");
    await validateText(text.login, page);
    await validateUrl(urls.signIn, page);
    await Promise.all([
      page.click("#main-content #sign-in-button"),
      page.waitForNavigation(),
    ]);
    await validateUrl(urls.email, page);
  });
  
  await synthetics.executeStep("Enter email page", async () => {
    await page.waitForSelector(".govuk-grid-row #email");
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await validateText(text.enterEmail, page);
    await page.type(".govuk-grid-row #email", email);
    await page.click(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
  });

  await synthetics.executeStep("Enter password page", async () => {
    await validateNoText(text.passwordWrongTooManyTimes, page);
    await page.waitForSelector(".govuk-grid-row #password");
    await page.waitForSelector(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await validateText(text.password, page);
    
    await page.type(".govuk-grid-row #password", password);
    await page.click(
      "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button"
    );
    await validateNoText(text.passwordError, page);
  });

  // TODO this step hasn't been run successfully
  await synthetics.executeStep("OTP page", async () => {
    await page.waitForSelector(".govuk-grid-row #code");
    await validateText(text.otp);

    const otpCode = await getOTPCode(phoneNumber, bucketName);

    await page.type(".govuk-grid-row #code", otpCode);

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
