const log = require("SyntheticsLogger");
const synthetics = require("Synthetics");
const { getOTPCode } = require("./aws");
const { selectors } = require("./vars");
const {
  validateText,
  validateNoText,
  validateUrlContains,
} = require("./helpers");

const launchClient = async (page, clientBaseUrl, textToValidate) => {
  await synthetics.executeStep("Launch Client", async () => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await validateText(textToValidate, page);
  });
};

// Note only used by IPV canary
const clickContinueOnIpvStartPage = async (page) => {
  await synthetics.executeStep("Click continue to prove identity", async () => {
    await page.waitForSelector("#form-tracking > button");
    await Promise.all([
      page.click("#form-tracking > button"),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("sign-in-or-create", page);
  });
};

const clickSignIn = async (page) => {
  await synthetics.executeStep("Click sign in", async () => {
    await page.waitForSelector(selectors.signInButton);
    await Promise.all([
      page.click(selectors.signInButton),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("enter-email", page);
  });
};

const enterEmail = async (page, email) => {
  await synthetics.executeStep("Enter email", async () => {
    await page.waitForSelector(selectors.emailInput);
    await page.type(selectors.emailInput, email);
  });
};

const submitEmail = async (page) => {
  await synthetics.executeStep("Submit email", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("enter-password", page);
  });
};

const enterPassword = async (page, password) => {
  await synthetics.executeStep("Enter password", async () => {
    await page.waitForSelector(selectors.passwordInput);
    await page.type(selectors.passwordInput, password);
  });
};

const submitPassword = async (page) => {
  await synthetics.executeStep("Submit password", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
    await validateUrlContains("enter-code", page);
  });
};

const enterOtpCode = async (page, phoneNumber, bucketName) => {
  await synthetics.executeStep("Enter OTP code", async () => {
    await page.waitForSelector(selectors.otpCodeInput);
    const otpCode = await getOTPCode(phoneNumber, bucketName);
    await page.type(selectors.otpCodeInput, otpCode);
  });
};

const submitOtpCode = async (page) => {
  await synthetics.executeStep("Submit OTP code", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await Promise.all([
      page.click(selectors.submitFormButton),
      page.waitForNavigation(),
    ]);
    await validateNoText("There is a problem", page);
  });
};

// Note only used by IPV canary
const ipvHandOff = async (page) => {
  await synthetics.executeStep("IPV hand-off", async () => {
    const pageTitleForConsole = await page.title();

    log.info(pageTitleForConsole);

    const hasReachedIPV =
      (await page.title()) ===
      "Tell us if you have one of the following types of photo ID – GOV.UK One Login";

    if (!hasReachedIPV) {
      throw new Error(`Failed at IPV Hand-off step`);
    }
  });
};

// Note only used by non-IPV sign-in canary
const microclientUserInfo = async (page, email) => {
  await synthetics.executeStep("Microclient user info", async () => {
    await page.content();

    const userInfo = await page.evaluate(() => {
      // eslint-disable-next-line no-undef
      return JSON.parse(document.querySelector("body").innerText);
    });

    const hasReachedUserInfo = userInfo.email === email;

    if (!hasReachedUserInfo) {
      throw new Error(`Failed at Microclient user info step`);
    }
  });
};

module.exports = {
  launchClient,
  clickContinueOnIpvStartPage,
  clickSignIn,
  enterEmail,
  submitEmail,
  enterPassword,
  submitPassword,
  enterOtpCode,
  submitOtpCode,
  ipvHandOff,
  microclientUserInfo,
};
