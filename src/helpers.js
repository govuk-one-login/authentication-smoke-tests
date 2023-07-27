const synthetics = require("Synthetics");
const log = require("SyntheticsLogger");


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

const checkTimeBefore = (text) => {
  const time = new Date();
    log.info(`time before ${text} = ${time.getUTCSeconds()}:${time.getMilliseconds()}`)
}

const checkTimeAfter = (text) => {
  const time = new Date();
    log.info(`time after ${text} = ${time.getUTCSeconds()}:${time.getMilliseconds()}`)
}

module.exports = { validateText, getNetworkIdlePromise, checkTimeBefore, checkTimeAfter }