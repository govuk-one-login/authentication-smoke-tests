const log = require("SyntheticsLogger");
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

// Note only used by IPV canary
const ipvHandOff = async (page) => {
  await synthetics.executeStep("IPV hand-off", async () => {
    const pageTitleForConsole = await page.title();

    log.info(pageTitleForConsole);

    const hasReachedIPV =
      (await page.title()) === "Where do you live? – GOV.UK One Login";

    if (!hasReachedIPV) {
      throw new Error(`Failed at IPV Hand-off step`);
    }
  });
};

// Steps only used by Create Account canary

const clickCreateAccount = async (page) => {
  await synthetics.executeStep("Click create account", async () => {
    await page.waitForSelector("#main-content #create-account-link");
    await waitForNavigationAndClick(page, selectors.createAccountButton);
    await validateUrlContains("enter-email-create", page);
  });
};

const submitEmailCreate = async (page) => {
  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await waitForNavigationAndClick(page, selectors.submitFormButton);
  });
  await validateUrlContains("check-your-email", page);
};

const createPassword = async (page, password) => {
  await synthetics.executeStep("Create password", async () => {
    await page.waitForSelector(selectors.passwordInput);
    await page.type(selectors.passwordInput, password);
    await page.type(selectors.confirmPasswordInput, password);
  });
};

const submitCreatePassword = async (page) => {
  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await waitForNavigationAndClick(page, selectors.submitFormButton);
    await validateUrlContains("get-security-codes", page);
  });
};

const chooseSMSForSecurityCodes = async (page) => {
  await synthetics.executeStep("Choose how to get security codes", async () => {
    await page.waitForSelector(selectors.smsMfaRadio);
    await page.click(selectors.smsMfaRadio);
  });
};

const submitSecurityCodesChoice = async (page) => {
  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await waitForNavigationAndClick(page, selectors.submitFormButton);
    await validateUrlContains("enter-phone-number", page);
  });
};

const enterPhoneNumber = async (page, phoneNumber) => {
  await synthetics.executeStep("Enter your mobile phone number", async () => {
    await page.waitForSelector(selectors.phoneNumberInput);
    await page.type(selectors.phoneNumberInput, phoneNumber);
  });
};

const submitPhoneNumber = async (page) => {
  await synthetics.executeStep("Click continue", async () => {
    await waitForNavigationAndClick(page, selectors.submitFormButton);
    await validateUrlContains("check-your-phone", page);
  });
};

const submitPhoneOTP = async (page) => {
  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await waitForNavigationAndClick(page, selectors.submitFormButton);
    await validateUrlContains("account-created", page);
  });
};

// Helper steps

const standardClickContinue = async (page) => {
  await synthetics.executeStep("Click continue", async () => {
    await page.waitForSelector(selectors.submitFormButton);
    await waitForNavigationAndClick(page, selectors.submitFormButton);
  });
};

// In step helper functions

function waitForNavigationAndClick(page, selector) {
  return Promise.all([
    page.waitForNavigation({
      waitUntil: "networkidle0",
    }),
    page.click(selector),
  ]);
}

module.exports = {
  launchClient,
  clickSignIn,
  enterEmail,
  submitEmail,
  enterPassword,
  submitPassword,
  enterOtpCode,
  submitOtpCode,
  ipvHandOff,
  microclientUserInfo,
  clickCreateAccount,
  submitEmailCreate,
  createPassword,
  submitCreatePassword,
  chooseSMSForSecurityCodes,
  submitSecurityCodesChoice,
  enterPhoneNumber,
  submitPhoneNumber,
  submitPhoneOTP,
  standardClickContinue,
};
