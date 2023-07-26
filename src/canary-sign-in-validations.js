const validateLaunchClient = async (clientBaseUrl, page) => {
    await page.goto(clientBaseUrl, {
      waitUntil: "domcontentloaded",
    });
    const expectedText = 'sign in';
    // Evaluate the page content to check if the text exists
    const textExists = await page.evaluate((expectedText) => {
      const bodyText = document.body.innerText;
      if (!bodyText.includes(expectedText)) {
        throw new Error(`Page does not contain text ${expectedText}`);
      }
    }, expectedText);
  };

  module.exports = { validateLaunchClient };