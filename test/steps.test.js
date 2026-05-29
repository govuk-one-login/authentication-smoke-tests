const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

// Mock Synthetics modules before requiring steps
const executeStepStub = sinon.stub().callsFake((name, fn) => fn());

require.cache[require.resolve("Synthetics")] = {
  id: "Synthetics",
  filename: "Synthetics",
  loaded: true,
  exports: { executeStep: executeStepStub },
};

require.cache[require.resolve("SyntheticsLogger")] = {
  id: "SyntheticsLogger",
  filename: "SyntheticsLogger",
  loaded: true,
  exports: { info: sinon.stub(), error: sinon.stub() },
};

const getOTPCodeStub = sinon.stub();
require.cache[require.resolve("../src/aws")] = {
  id: require.resolve("../src/aws"),
  filename: require.resolve("../src/aws"),
  loaded: true,
  exports: {
    getOTPCode: getOTPCodeStub,
    getParameter: sinon.stub(),
    emptyOtpBucket: sinon.stub(),
    getSecretValue: sinon.stub(),
  },
};

const steps = require("../src/steps");

describe("steps", () => {
  let page;

  beforeEach(() => {
    page = {
      goto: sinon.stub().resolves(),
      waitForSelector: sinon.stub().resolves(),
      click: sinon.stub().resolves(),
      waitForNavigation: sinon.stub().resolves(),
      type: sinon.stub().resolves(),
      url: sinon.stub().returns("https://example.com/enter-email"),
      evaluate: sinon.stub().resolves(),
      title: sinon.stub().resolves("Where do you live? – GOV.UK One Login"),
      content: sinon.stub().resolves("<html></html>"),
      setViewport: sinon.stub().resolves(),
    };
    executeStepStub.callsFake((name, fn) => fn());
    getOTPCodeStub.resolves("123456");
  });

  afterEach(() => {
    sinon.resetHistory();
  });

  describe("launchClient", () => {
    it("should navigate to clientBaseUrl", async () => {
      page.evaluate.resolves();
      await steps.launchClient(page, "http://localhost:3031", "Test Title");
      expect(page.goto).to.have.been.calledWith("http://localhost:3031", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
    });
  });

  describe("clickSignIn", () => {
    it("should click sign in button and wait for navigation", async () => {
      page.url.returns("https://example.com/enter-email");
      await steps.clickSignIn(page);
      expect(page.waitForSelector).to.have.been.calledWith(
        "#main-content #sign-in-button"
      );
      expect(page.click).to.have.been.called;
    });
  });

  describe("enterEmail", () => {
    it("should type email into input", async () => {
      await steps.enterEmail(page, "test@example.com");
      expect(page.type).to.have.been.calledWith(
        ".govuk-grid-row #email",
        "test@example.com"
      );
    });
  });

  describe("submitEmail", () => {
    it("should click submit and validate url contains enter-password", async () => {
      page.url.returns("https://example.com/enter-password");
      await steps.submitEmail(page);
      expect(page.click).to.have.been.called;
    });
  });

  describe("enterPassword", () => {
    it("should type password into input", async () => {
      await steps.enterPassword(page, "Pa55word!");
      expect(page.type).to.have.been.calledWith(
        ".govuk-grid-row #password",
        "Pa55word!"
      );
    });
  });

  describe("submitPassword", () => {
    it("should click submit and validate url contains enter-code", async () => {
      page.url.returns("https://example.com/enter-code");
      await steps.submitPassword(page);
      expect(page.click).to.have.been.called;
    });
  });

  describe("enterOtpCode", () => {
    it("should fetch OTP and type it into input", async () => {
      await steps.enterOtpCode(page, "07700900000", "otp-bucket");
      expect(getOTPCodeStub).to.have.been.calledWith(
        "07700900000",
        "otp-bucket"
      );
      expect(page.type).to.have.been.calledWith(
        ".govuk-grid-row #code",
        "123456"
      );
    });
  });

  describe("submitOtpCode", () => {
    it("should click submit and validate no error text", async () => {
      await steps.submitOtpCode(page);
      expect(page.click).to.have.been.called;
    });
  });

  describe("microclientUserInfo", () => {
    it("should throw if email does not match", async () => {
      page.evaluate.resolves({ email: "wrong@example.com" });
      try {
        await steps.microclientUserInfo(page, "test@example.com");
        expect.fail("should have thrown");
      } catch (err) {
        expect(err.message).to.contain("Failed at Microclient user info step");
      }
    });

    it("should not throw if email matches", async () => {
      page.evaluate.resolves({ email: "test@example.com" });
      await steps.microclientUserInfo(page, "test@example.com");
    });
  });

  describe("ipvHandOff", () => {
    it("should not throw when page title matches IPV", async () => {
      page.title.resolves("Where do you live? – GOV.UK One Login");
      await steps.ipvHandOff(page);
    });

    it("should throw when page title does not match", async () => {
      page.title.resolves("Wrong Page");
      try {
        await steps.ipvHandOff(page);
        expect.fail("should have thrown");
      } catch (err) {
        expect(err.message).to.contain("Failed at IPV Hand-off step");
      }
    });
  });

  describe("clickCreateAccount", () => {
    it("should click create account link", async () => {
      page.url.returns("https://example.com/enter-email-create");
      await steps.clickCreateAccount(page);
      expect(page.waitForSelector).to.have.been.calledWith(
        "#main-content #create-account-link"
      );
    });
  });

  describe("createPassword", () => {
    it("should type password into both fields", async () => {
      await steps.createPassword(page, "NewPass1!");
      expect(page.type).to.have.been.calledWith(
        ".govuk-grid-row #password",
        "NewPass1!"
      );
      expect(page.type).to.have.been.calledWith(
        ".govuk-grid-row #confirm-password",
        "NewPass1!"
      );
    });
  });

  describe("enterPhoneNumber", () => {
    it("should type phone number into input", async () => {
      await steps.enterPhoneNumber(page, "07700900000");
      expect(page.type).to.have.been.calledWith(
        ".govuk-grid-row #phoneNumber",
        "07700900000"
      );
    });
  });

  describe("chooseSMSForSecurityCodes", () => {
    it("should click the SMS radio button", async () => {
      await steps.chooseSMSForSecurityCodes(page);
      expect(page.click).to.have.been.calledWith(".govuk-grid-row #mfaOptions");
    });
  });
});
