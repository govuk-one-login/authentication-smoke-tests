const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

describe("canary-create-account", () => {
  let handler, getParameterStub, emptyOtpBucketStub, getSecretValueStub;
  let startClientStub, stepsStubs, pageStub, serverStub;
  let syntheticsStub;

  beforeEach(() => {
    getParameterStub = sinon.stub();
    getParameterStub.withArgs("bucket").resolves("otp-bucket");
    getParameterStub.withArgs("fire-drill").resolves("0");
    getParameterStub
      .withArgs("synthetics-user-delete-path")
      .resolves("/delete/user");
    getParameterStub.withArgs("username").resolves("user@example.com");
    getParameterStub.withArgs("phone").resolves("07700900000");
    getParameterStub.withArgs("client-id").resolves("client-id");
    getParameterStub
      .withArgs("client-base-url")
      .resolves("http://localhost:3031");
    getParameterStub
      .withArgs("issuer-base-url")
      .resolves("https://issuer.example.com");
    getParameterStub.withArgs("client-private-key").resolves("private-key");
    getParameterStub.withArgs("test-header").resolves("test-value");

    emptyOtpBucketStub = sinon.stub().resolves();
    getSecretValueStub = sinon.stub();
    getSecretValueStub.resolves("secret-value");

    serverStub = { close: sinon.stub() };
    startClientStub = sinon.stub().resolves(serverStub);

    pageStub = {
      setExtraHTTPHeaders: sinon.stub().resolves(),
      setViewport: sinon.stub().resolves(),
    };

    stepsStubs = {
      launchClient: sinon.stub().resolves(),
      clickCreateAccount: sinon.stub().resolves(),
      enterEmail: sinon.stub().resolves(),
      submitEmailCreate: sinon.stub().resolves(),
      enterOtpCode: sinon.stub().resolves(),
      submitOtpCode: sinon.stub().resolves(),
      createPassword: sinon.stub().resolves(),
      submitCreatePassword: sinon.stub().resolves(),
      chooseSMSForSecurityCodes: sinon.stub().resolves(),
      submitSecurityCodesChoice: sinon.stub().resolves(),
      enterPhoneNumber: sinon.stub().resolves(),
      submitPhoneNumber: sinon.stub().resolves(),
      submitPhoneOTP: sinon.stub().resolves(),
      standardClickContinue: sinon.stub().resolves(),
      microclientUserInfo: sinon.stub().resolves(),
    };

    const getConfigStub = { setConfig: sinon.stub() };

    syntheticsStub = {
      getConfiguration: sinon.stub().returns(getConfigStub),
      getPage: sinon.stub().resolves(pageStub),
      executeHttpStep: sinon.stub().resolves(),
      getCanaryUserAgentString: sinon.stub().returns("canary-ua"),
    };

    require.cache[require.resolve("Synthetics")] = {
      id: "Synthetics",
      filename: "Synthetics",
      loaded: true,
      exports: syntheticsStub,
    };

    require.cache[require.resolve("SyntheticsLogger")] = {
      id: "SyntheticsLogger",
      filename: "SyntheticsLogger",
      loaded: true,
      exports: { info: sinon.stub(), error: sinon.stub(), warn: sinon.stub() },
    };

    require.cache[require.resolve("../src/aws")] = {
      id: require.resolve("../src/aws"),
      filename: require.resolve("../src/aws"),
      loaded: true,
      exports: {
        getParameter: getParameterStub,
        emptyOtpBucket: emptyOtpBucketStub,
        getSecretValue: getSecretValueStub,
        getOTPCode: sinon.stub(),
      },
    };

    require.cache[require.resolve("../src/client")] = {
      id: require.resolve("../src/client"),
      filename: require.resolve("../src/client"),
      loaded: true,
      exports: { startClient: startClientStub },
    };

    require.cache[require.resolve("../src/steps")] = {
      id: require.resolve("../src/steps"),
      filename: require.resolve("../src/steps"),
      loaded: true,
      exports: stepsStubs,
    };

    require.cache[require.resolve("../src/helpers")] = {
      id: require.resolve("../src/helpers"),
      filename: require.resolve("../src/helpers"),
      loaded: true,
      exports: {
        setStandardViewportSize: sinon.stub().resolves(),
        validateTitle: sinon.stub().resolves(),
        validateNoText: sinon.stub().resolves(),
        validateUrlContains: sinon.stub().resolves(),
      },
    };

    process.env.DEPLOY_ENVIRONMENT = "test";

    delete require.cache[require.resolve("../src/canary-create-account")];
    handler = require("../src/canary-create-account").handler;
  });

  afterEach(() => {
    delete require.cache[require.resolve("../src/canary-create-account")];
    delete require.cache[require.resolve("../src/aws")];
    delete require.cache[require.resolve("../src/client")];
    delete require.cache[require.resolve("../src/steps")];
    delete require.cache[require.resolve("../src/helpers")];
    delete require.cache[require.resolve("Synthetics")];
    delete require.cache[require.resolve("SyntheticsLogger")];
    delete process.env.DEPLOY_ENVIRONMENT;
  });

  it("should return success on successful run", async () => {
    const result = await handler();
    expect(result).to.equal("success");
  });

  it("should throw on fire drill", async () => {
    getParameterStub.withArgs("fire-drill").resolves("1");
    delete require.cache[require.resolve("../src/canary-create-account")];
    handler = require("../src/canary-create-account").handler;

    try {
      await handler();
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).to.equal("Smoke Test failed due to Fire Drill");
    }
  });

  it("should call executeHttpStep to delete synthetics user", async () => {
    await handler();
    expect(syntheticsStub.executeHttpStep).to.have.been.calledWith(
      "Calling synthetics-user DELETE",
      sinon.match({ method: "DELETE", path: "/delete/user" }),
      sinon.match.func,
      sinon.match.object
    );
  });

  it("should empty OTP bucket for both email and phone", async () => {
    await handler();
    expect(emptyOtpBucketStub).to.have.been.calledWith(
      "otp-bucket",
      "user@example.com"
    );
    expect(emptyOtpBucketStub).to.have.been.calledWith(
      "otp-bucket",
      "07700900000"
    );
  });

  it("should call create account steps", async () => {
    await handler();
    expect(stepsStubs.clickCreateAccount).to.have.been.called;
    expect(stepsStubs.submitEmailCreate).to.have.been.called;
    expect(stepsStubs.createPassword).to.have.been.called;
    expect(stepsStubs.chooseSMSForSecurityCodes).to.have.been.called;
    expect(stepsStubs.enterPhoneNumber).to.have.been.calledWith(
      pageStub,
      "07700900000"
    );
    expect(stepsStubs.submitPhoneOTP).to.have.been.called;
    expect(stepsStubs.microclientUserInfo).to.have.been.calledWith(
      pageStub,
      "user@example.com"
    );
  });

  it("should close server on error", async () => {
    stepsStubs.clickCreateAccount.rejects(new Error("timeout"));
    try {
      await handler();
    } catch {
      // expected
    }
    expect(serverStub.close).to.have.been.called;
  });
});
