const synthetics = require("Synthetics");

const validateText = async (expectedText, page) => {
    await page.evaluate((expectedText) => {
    const bodyText = document.body.innerText;
    if (!bodyText.includes(expectedText)) {
      throw new Error(`Page does not contain text '${expectedText}'`);
    }
  }, expectedText);
}
const getNetworkIdlePromise = async () => {
    const page = await synthetics.getPage();
      const idlePromise = page.waitForNavigation({
        waitUntil: "networkidle0",
        timeout: 150000
      });

      return idlePromise;
}

module.exports = { validateText, getNetworkIdlePromise }