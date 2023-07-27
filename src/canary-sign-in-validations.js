const { validateText, getNetworkIdlePromise } = require("./helpers");
const { text, selectors } = require("./vars");

const validateLaunchClient = async (clientBaseUrl, page) => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
    });
    await validateText(text.login, page);

  };

const validateClickSignIn = async (page) => {
  await page.waitForSelector(selectors.signInButton);
  await page.click(selectors.signInButton);

  await getNetworkIdlePromise();

  await validateText(text.enterEmail, page);


};

const validateClickContinueAfterEnteringEmail = async (page) => {
  await page.waitForSelector(selectors.emailContinueButton);
  await page.click(selectors.emailContinueButton);
  await getNetworkIdlePromise();

  await validateText(text.password, page);


};


  module.exports = { validateLaunchClient, validateClickSignIn, validateClickContinueAfterEnteringEmail };