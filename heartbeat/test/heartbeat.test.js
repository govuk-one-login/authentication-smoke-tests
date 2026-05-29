const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

describe("heartbeat handler", () => {
  let pingStub;
  let handler;

  beforeEach(() => {
    sinon.stub(console, "log");
    pingStub = sinon.stub().resolves("OK");

    const monitorStub = sinon.stub().returns({ ping: pingStub });
    const cronitorStub = { Monitor: monitorStub };
    const cronitorFactory = sinon.stub().returns(cronitorStub);

    require.cache[require.resolve("cronitor")] = {
      id: require.resolve("cronitor"),
      filename: require.resolve("cronitor"),
      loaded: true,
      exports: cronitorFactory,
    };

    process.env.CRONITOR_API_KEY = "test-api-key";
    process.env.CRONITOR_MONITOR_KEY = "monitor-abc123";

    delete require.cache[require.resolve("../heartbeat")];
    handler = require("../heartbeat").handler;

    this.monitorStub = monitorStub;
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve("cronitor")];
    delete require.cache[require.resolve("../heartbeat")];
    delete process.env.CRONITOR_API_KEY;
    delete process.env.CRONITOR_MONITOR_KEY;
  });

  it("should ping cronitor with the monitor key", async () => {
    await handler({}, {});

    expect(this.monitorStub).to.have.been.calledWith("monitor-abc123");
    expect(pingStub).to.have.been.called;
  });

  it("should return response message with monitor key excerpt", async () => {
    const result = await handler({}, {});

    expect(result).to.equal("cronitor ping monitor ending 23 returns: OK");
  });
});
