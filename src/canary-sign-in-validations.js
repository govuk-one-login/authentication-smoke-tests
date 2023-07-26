const validateLaunchClient = async (clientBaseUrl, page) => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
    });
    const expectedText = 'Create a GOV.UK One Login or sign in';
    // Evaluate the page content to check if the text exists
    await page.evaluate((expectedText) => {
      const bodyText = document.body.innerText;
      if (!bodyText.includes(expectedText)) {
        throw new Error(`Page does not contain text ${expectedText}`);
      }
    }, expectedText);
  };

const validateClickSignIn = async (page) => {
  await page.waitForSelector("#main-content #sign-in-button");
  await page.click("#main-content #sign-in-button");
  await page.waitForNavigation({ waitUntil: "networkidle0" });

  const expectedText = 'Enter your email address to sign in to your GOV.UK One Login';
  // Evaluate the page content to check if the text exists
  await page.evaluate((expectedText) => {
    const bodyText = document.body.innerText;
    if (!bodyText.includes(expectedText)) {
      throw new Error(`Page does not contain text ${expectedText}`);
    }
  }, expectedText);
};

  module.exports = { validateLaunchClient, validateClickSignIn };