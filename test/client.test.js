const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

describe("client", () => {
  let startClient, authStub, listenStub, useStub, getStub;

  beforeEach(() => {
    listenStub = sinon.stub().returns({ close: sinon.stub() });
    useStub = sinon.stub();
    getStub = sinon.stub();
    authStub = sinon.stub().returns("auth-middleware");

    require.cache[require.resolve("SyntheticsLogger")] = {
      id: "SyntheticsLogger",
      filename: "SyntheticsLogger",
      loaded: true,
      exports: { info: sinon.stub(), error: sinon.stub() },
    };

    const expressMock = () => ({
      use: useStub,
      get: getStub,
      listen: listenStub,
    });
    require.cache[require.resolve("express")] = {
      id: require.resolve("express"),
      filename: require.resolve("express"),
      loaded: true,
      exports: expressMock,
    };

    require.cache[require.resolve("express-openid-connect")] = {
      id: require.resolve("express-openid-connect"),
      filename: require.resolve("express-openid-connect"),
      loaded: true,
      exports: { auth: authStub },
    };

    delete require.cache[require.resolve("../src/client")];
    startClient = require("../src/client").startClient;
  });

  afterEach(() => {
    delete require.cache[require.resolve("../src/client")];
    delete require.cache[require.resolve("express")];
    delete require.cache[require.resolve("express-openid-connect")];
    delete require.cache[require.resolve("SyntheticsLogger")];
  });

  it("should configure auth middleware with correct params", async () => {
    await startClient(
      3031,
      "openid email phone",
      "client-id",
      "http://localhost:3031",
      "https://issuer.example.com",
      "private-key",
      false
    );

    expect(authStub).to.have.been.calledWith(
      sinon.match({
        issuerBaseURL: "https://issuer.example.com",
        baseURL: "http://localhost:3031",
        clientID: "client-id",
        clientAuthMethod: "private_key_jwt",
        clientAssertionSigningKey: "private-key",
        idTokenSigningAlg: "ES256",
        authRequired: true,
      })
    );
  });

  it("should use Cl.Cm vtr by default", async () => {
    await startClient(
      3031,
      "openid email phone",
      "client-id",
      "http://localhost:3031",
      "https://issuer.example.com",
      "private-key",
      false
    );

    const config = authStub.firstCall.args[0];
    expect(config.authorizationParams.vtr).to.equal('["Cl.Cm"]');
  });

  it("should use P2.Cl.Cm vtr when isP2LevelOfConfidenceJourney is true", async () => {
    await startClient(
      3032,
      "openid email phone",
      "client-id",
      "http://localhost:3032",
      "https://issuer.example.com",
      "private-key",
      true
    );

    const config = authStub.firstCall.args[0];
    expect(config.authorizationParams.vtr).to.equal('["P2.Cl.Cm"]');
  });

  it("should listen on the specified port", async () => {
    await startClient(
      3031,
      "openid email phone",
      "client-id",
      "http://localhost:3031",
      "https://issuer.example.com",
      "private-key",
      false
    );

    expect(listenStub).to.have.been.calledWith(3031);
  });

  it("should register a GET / route", async () => {
    await startClient(
      3031,
      "openid email phone",
      "client-id",
      "http://localhost:3031",
      "https://issuer.example.com",
      "private-key",
      false
    );

    expect(getStub).to.have.been.calledWith("/", sinon.match.func);
  });
});
