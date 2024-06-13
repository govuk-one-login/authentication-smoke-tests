const synthetics = require("Synthetics");
const { getOTPCode } = require("./aws");
const { selectors } = require("./vars");
const {
  validateNoText,
  validateUrlContains,
  validateTitle,
} = require("./helpers");

const launchClient = async (page, clientBaseUrl, titleToValidate) => {
  await synthetics.executeStep("Launch Client", async () => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await validateTitle(titleToValidate, page);
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
  clickSignIn,
  enterEmail,
  submitEmail,
  enterPassword,
  submitPassword,
  enterOtpCode,
  submitOtpCode,
  microclientUserInfo,
};
