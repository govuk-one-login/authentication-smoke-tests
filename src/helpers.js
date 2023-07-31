const validateText = async (expectedText, page) => {
  await page.evaluate((expectedText) => {
    // eslint-disable-next-line no-undef
    const bodyText = document.body.innerText;
    if (!bodyText.includes(expectedText)) {
      throw new Error(`Page does not contain text '${expectedText}'`);
    }
  }, expectedText);
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

module.exports = { validateText, validateNoText, validateUrlContains };
