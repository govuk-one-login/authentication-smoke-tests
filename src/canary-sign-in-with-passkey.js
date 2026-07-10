const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getParameter } = require("./aws");
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
  log.info("Running smoke tests: Sign in with Passkey");

  const fireDrill = await getParameter("fire-drill");
  if (fireDrill === "1") {
    log.info("Fire Drill! Sign in with Passkey smoke test will fail.");
    throw "Sign in with Passkey smoke test failed due to Fire Drill";
  }

  const email = await getParameter("username");
  const clientId = await getParameter("client-id");
  const clientBaseUrl = await getParameter("client-base-url");
  const issuerBaseURL = await getParameter("issuer-base-url");
  const clientPrivateKey = await getParameter("client-private-key");

  const testHeader = await getParameter("test-header");

  server = await startClient(
    3033,
    "openid email phone",
    clientId,
    clientBaseUrl,
    issuerBaseURL,
    clientPrivateKey
  );

  const page = await synthetics.getPage();

  let headers = {};
  headers["test-header"] = testHeader;

  await page.setExtraHTTPHeaders(headers);

  await steps.enableVirtualAuthenticator(page);

  await steps.launchClient(
    page,
    clientBaseUrl,
    "Create your GOV.UK One Login or sign in"
  );

  setStandardViewportSize(page);

  await steps.clickSignIn(page);

  await steps.enterEmail(page, email);

  await steps.submitEmailForPasskey(page);

  await steps.authenticateWithPasskey(page);

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
