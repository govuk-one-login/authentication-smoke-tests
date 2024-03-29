const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getOTPCode, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const crypto = require("crypto");
const { selectors } = require("./vars");

const CANARY_NAME = synthetics.getCanaryName();
const SYNTHETICS_CONFIG = synthetics.getConfiguration();

let server;

SYNTHETICS_CONFIG.setConfig({
  screenshotOnStepStart: false,
  screenshotOnStepSuccess: false,
  screenshotOnStepFailure: true,
});

const deleteSyntheticsUser = async function (res) {
  return new Promise((resolve) => {
    if (
      res.statusCode < 200 ||
      (res.statusCode > 299 && !res.statusCode == 404)
    ) {
      throw res.statusCode + " " + res.statusMessage;
    }
    if (res.statusCode == 404) {
      log.warn(
        "synthetics-user not found for deletion, OK to continue the test"
      );
    }
    res.on("end", () => {
      resolve();
    });
  });
};

const basicCustomEntryPoint = async () => {
  log.info("Running smoke tests");

  const bucketName = await getParameter("bucket");
  const fireDrill = await getParameter("fire-drill");
  const testServicesApiHostname = await getParameter(
    "test-services-api-hostname"
  );
  const testServicesApiKey = await getParameter("test-services-api-key");
  const syntheticsUserDeletePath = await getParameter(
    "synthetics-user-delete-path"
  );

  const email = await getParameter("username");
  const phoneNumber = await getParameter("phone");
  const password = crypto.randomBytes(20).toString("base64url") + "a1";
  const clientId = await getParameter("client-id");
  const clientBaseUrl = await getParameter("client-base-url");
  const issuerBaseURL = await getParameter("issuer-base-url");
  const clientPrivateKey = await getParameter("client-private-key");

  if (fireDrill === "1") {
    log.info("Fire Drill! Smoke test will fail.");
    throw "Smoke Test failed due to Fire Drill";
  }

  server = await startClient(
    3031,
    "openid email phone",
    clientId,
    clientBaseUrl,
    issuerBaseURL,
    clientPrivateKey
  );

  log.info("Empty OTP code bucket");
  await emptyOtpBucket(bucketName, email);
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

  log.info("Preparing call to synthetics-user DELETE");
  let syntheticsUserDeleteStepOptions = {
    hostname: testServicesApiHostname,
    method: "DELETE",
    path: syntheticsUserDeletePath,
    port: 443,
    protocol: "https:",
  };

  var headers = {};
  headers["User-Agent"] = [
    synthetics.getCanaryUserAgentString(),
    headers["User-Agent"],
  ].join(" ");
  headers["x-api-key"] = testServicesApiKey;

  syntheticsUserDeleteStepOptions["headers"] = headers;

  const stepConfig = {
    includeResponseHeaders: true,
    restrictedHeaders: ["x-api-key"],
    includeResponseBody: true,
  };

  await synthetics.executeHttpStep(
    "Calling synthetics-user DELETE",
    syntheticsUserDeleteStepOptions,
    deleteSyntheticsUser,
    stepConfig
  );

  await synthetics.executeStep("Launch Client", async () => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
  });

  await page.setViewport({ width: 1864, height: 1096 });

  await navigationPromise;

  await synthetics.executeStep("Click create account", async () => {
    await page.waitForSelector("#main-content #create-account-link");
    await page.click("#main-content #create-account-link");
  });

  await navigationPromise;

  await synthetics.executeStep("Enter email create", async () => {
    await page.waitForSelector(selectors.emailInput);
    await page.type(selectors.emailInput, email);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Check your email", async () => {
    await page.waitForSelector(selectors.otpCodeInput);
    const emailOtpCode = await getOTPCode(email, bucketName);
    await page.type(selectors.otpCodeInput, emailOtpCode);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Create password", async () => {
    await page.waitForSelector(selectors.passwordInput);
    await page.type(selectors.passwordInput, password);
    await page.type(".govuk-grid-row #confirm-password", password);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Choose how to get security codes", async () => {
    await page.waitForSelector(".govuk-grid-row #mfaOptions");
    await page.click(".govuk-grid-row #mfaOptions");
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Enter your mobile phone number", async () => {
    await page.waitForSelector(".govuk-grid-row #phoneNumber");
    await page.type(".govuk-grid-row #phoneNumber", phoneNumber);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await synthetics.executeStep("Enter OTP code", async () => {
    await page.waitForSelector(selectors.otpCodeInput);

    const otpCode = await getOTPCode(phoneNumber, bucketName);

    await page.type(selectors.otpCodeInput, otpCode);
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await page.click(selectors.submitFormButton);
  });

  await navigationPromise;

  await synthetics.executeStep("Account created confirmation", async () => {
    (await page.url()).endsWith("/account-created");
  });

  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
  });

  await synthetics.executeStep("Microclient user-info", async () => {
    await page.content();

    const userInfo = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      return JSON.parse(document.querySelector("body").innerText);
    });

    console.log("userInfo now contains the JSON");
    console.log(userInfo);

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
