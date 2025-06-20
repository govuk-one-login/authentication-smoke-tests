const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter, getSecret, emptyOtpBucket } = require("./aws");
const { startClient } = require("./client");
const crypto = require("crypto");
const steps = require("./steps");
const { setStandardViewportSize } = require("./helpers");

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
  const syntheticsUserDeletePath = await getParameter(
    "synthetics-user-delete-path"
  );
  const testServicesApiHostname = await getSecret("test-services-api-hostname");
  const testServicesApiKey = await getSecret("test-services-api-key");
  const email = await getSecret("username");
  const phoneNumber = await getSecret("phone");
  const clientId = await getSecret("client-id");
  const clientBaseUrl = await getSecret("client-base-url");
  const issuerBaseURL = await getSecret("issuer-base-url");
  const clientPrivateKey = await getSecret("client-private-key");

  const password = crypto.randomBytes(20).toString("base64url") + "a1";

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

  await steps.launchClient(
    page,
    clientBaseUrl,
    "Create your GOV.UK One Login or sign in"
  );

  await setStandardViewportSize(page);

  await steps.clickCreateAccount(page);

  await steps.enterEmail(page, email);

  await steps.submitEmailCreate(page);

  await steps.enterOtpCode(page, email, bucketName);

  await steps.submitOtpCode(page);

  await steps.createPassword(page, password);

  await steps.submitCreatePassword(page);

  await steps.chooseSMSForSecurityCodes(page);

  await steps.submitSecurityCodesChoice(page);

  await steps.enterPhoneNumber(page, phoneNumber);

  await steps.submitPhoneNumber(page);

  await steps.enterOtpCode(page, phoneNumber, bucketName);

  await steps.submitPhoneOTP(page);

  await steps.standardClickContinue(page);

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
