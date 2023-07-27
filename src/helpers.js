const synthetics = require("Synthetics");
const log = require("SyntheticsLogger");
const { getParameter } = require("./aws");

const getAllParams = async (paramStrArr) => {
  let obj = {};
  for (const param of paramStrArr) {
    obj[param] = await getParameter(param);
  }
  return obj;
}

const validateUrl = async (expectedSlug, page) => {
  const url = await page.url();
  if (!url.includes(expectedSlug)) {
    throw new Error(`Url is ${url} and does not contain '${expectedSlug}'`);
  }
}


const validateText = async (expectedText, page) => {
    await page.evaluate((expectedText) => {
    const bodyText = document.body.innerText;
    if (!bodyText.includes(expectedText)) {
      throw new Error(`Page does not contain text '${expectedText}'`);
    }
  }, expectedText);
}

const validateNoText = async (notExpectedText, page) => {
  await page.evaluate((notExpectedText) => {
  const bodyText = document.body.innerText;
  if (bodyText.includes(notExpectedText)) {
    throw new Error(`Page contains text '${notExpectedText}'`);
  }
}, notExpectedText);
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

module.exports = { getAllParams, validateUrl, validateText, validateNoText, getNetworkIdlePromise, checkTimeBefore, checkTimeAfter }