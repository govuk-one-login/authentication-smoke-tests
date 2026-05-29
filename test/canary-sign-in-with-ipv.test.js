const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

describe("canary-sign-in-with-ipv", () => {
  let handler, getParameterStub, emptyOtpBucketStub, startClientStub;
  let stepsStubs, pageStub, serverStub;

  beforeEach(() => {
    getParameterStub = sinon.stub();
    getParameterStub.withArgs("fire-drill").resolves("0");
    getParameterStub.withArgs("bucket").resolves("otp-bucket");
    getParameterStub.withArgs("username").resolves("user@example.com");
    getParameterStub.withArgs("password").resolves("Pa55word!");
    getParameterStub.withArgs("phone").resolves("07700900000");
    getParameterStub.withArgs("client-id").resolves("client-id");
    getParameterStub
      .withArgs("client-base-url")
      .resolves("http://localhost:3032");
    getParameterStub
      .withArgs("issuer-base-url")
      .resolves("https://issuer.example.com");
    getParameterStub.withArgs("client-private-key").resolves("private-key");
    getParameterStub.withArgs("test-header").resolves("test-value");

    emptyOtpBucketStub = sinon.stub().resolves();
    serverStub = { close: sinon.stub() };
    startClientStub = sinon.stub().resolves(serverStub);

    pageStub = {
      setExtraHTTPHeaders: sinon.stub().resolves(),
      setViewport: sinon.stub().resolves(),
    };

    stepsStubs = {
      launchClient: sinon.stub().resolves(),
      clickSignIn: sinon.stub().resolves(),
      enterEmail: sinon.stub().resolves(),
      submitEmail: sinon.stub().resolves(),
      enterPassword: sinon.stub().resolves(),
      submitPassword: sinon.stub().resolves(),
      enterOtpCode: sinon.stub().resolves(),
      submitOtpCode: sinon.stub().resolves(),
      ipvHandOff: sinon.stub().resolves(),
    };

    const getConfigStub = { setConfig: sinon.stub() };

    require.cache[require.resolve("Synthetics")] = {
      id: "Synthetics",
      filename: "Synthetics",
      loaded: true,
      exports: {
        getConfiguration: sinon.stub().returns(getConfigStub),
        getPage: sinon.stub().resolves(pageStub),
      },
    };

    require.cache[require.resolve("SyntheticsLogger")] = {
      id: "SyntheticsLogger",
      filename: "SyntheticsLogger",
      loaded: true,
      exports: { info: sinon.stub(), error: sinon.stub() },
    };

    require.cache[require.resolve("../src/aws")] = {
      id: require.resolve("../src/aws"),
      filename: require.resolve("../src/aws"),
      loaded: true,
      exports: {
        getParameter: getParameterStub,
        emptyOtpBucket: emptyOtpBucketStub,
        getSecretValue: sinon.stub(),
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

    delete require.cache[require.resolve("../src/canary-sign-in-with-ipv")];
    handler = require("../src/canary-sign-in-with-ipv").handler;
  });

  afterEach(() => {
    delete require.cache[require.resolve("../src/canary-sign-in-with-ipv")];
    delete require.cache[require.resolve("../src/aws")];
    delete require.cache[require.resolve("../src/client")];
    delete require.cache[require.resolve("../src/steps")];
    delete require.cache[require.resolve("../src/helpers")];
    delete require.cache[require.resolve("Synthetics")];
    delete require.cache[require.resolve("SyntheticsLogger")];
  });

  it("should return success on successful run", async () => {
    const result = await handler();
    expect(result).to.equal("success");
  });

  it("should throw on fire drill", async () => {
    getParameterStub.withArgs("fire-drill").resolves("1");
    delete require.cache[require.resolve("../src/canary-sign-in-with-ipv")];
    handler = require("../src/canary-sign-in-with-ipv").handler;

    try {
      await handler();
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).to.contain("Fire Drill");
    }
  });

  it("should start client on port 3032 with P2 flag true", async () => {
    await handler();
    expect(startClientStub).to.have.been.calledWith(
      3032,
      "openid email phone",
      "client-id",
      "http://localhost:3032",
      "https://issuer.example.com",
      "private-key",
      true
    );
  });

  it("should empty OTP bucket", async () => {
    await handler();
    expect(emptyOtpBucketStub).to.have.been.calledWith(
      "otp-bucket",
      "07700900000"
    );
  });

  it("should call ipvHandOff as final step", async () => {
    await handler();
    expect(stepsStubs.ipvHandOff).to.have.been.calledWith(pageStub);
  });

  it("should close server on error", async () => {
    stepsStubs.clickSignIn.rejects(new Error("timeout"));
    try {
      await handler();
    } catch {
      // expected
    }
    expect(serverStub.close).to.have.been.called;
  });
});
