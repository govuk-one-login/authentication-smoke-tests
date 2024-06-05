const { getParameter } = require("./aws");

const validateTitle = async (expectedTitle, page) => {
  await page.evaluate((expectedTitle) => {
    // eslint-disable-next-line no-undef
    const title = document.title;
    if (!title.includes(expectedTitle)) {
      throw new Error(`Page title does not contain text '${expectedTitle}'`);
    }
  }, expectedTitle);
};

const validateNoText = async (notExpectedText, page) => {
  await page.evaluate((notExpectedText) => {
    // eslint-disable-next-line no-undef
    const bodyText = document.body.innerText;
    if (bodyText.includes(notExpectedText)) {
      throw new Error(`Page contains text '${notExpectedText}'`);
    }
  }, notExpectedText);
};

const validateUrlContains = async (expectedSlug, page) => {
  const url = await page.url();
  if (!url.includes(expectedSlug)) {
    throw new Error(`Url is ${url} and does not contain '${expectedSlug}'`);
  }
};
const setStandardViewportSize = async (page) => {
  await page.setViewport({ width: 1864, height: 1096 });
};

const authenticateWithBasicAuth = async (page) => {
  const basicAuthUsername = await getParameter("basicauth-username");
  const basicAuthPassword = await getParameter("basicauth-password");

  await page.authenticate({
    username: basicAuthUsername,
    password: basicAuthPassword,
  });
};

module.exports = {
  validateTitle,
  validateNoText,
  validateUrlContains,
  setStandardViewportSize,
  authenticateWithBasicAuth,
};
