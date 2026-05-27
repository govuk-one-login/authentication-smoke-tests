const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

const { handler } = require("../slack");

describe("slack handler", () => {
  let fetchStub;

  beforeEach(() => {
    fetchStub = sinon.stub(global, "fetch");
    sinon.stub(console, "log");
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";
    process.env.DEPLOY_ENVIRONMENT = "test";
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SLACK_WEBHOOK_URL;
    delete process.env.DEPLOY_ENVIRONMENT;
  });

  it("should post SNS message body to slack webhook", async () => {
    fetchStub.resolves({ text: () => Promise.resolve("ok") });

    const event = {
      Records: [{ Sns: { Message: '{"text":"hello"}' } }],
    };

    await handler(event, {});

    expect(fetchStub).to.have.been.calledWith(
      "https://hooks.slack.com/test",
      sinon.match({
        method: "post",
        body: '{"text":"hello"}',
      })
    );
  });

  it("should set Content-Type to application/json", async () => {
    fetchStub.resolves({ text: () => Promise.resolve("ok") });

    const event = {
      Records: [{ Sns: { Message: "{}" } }],
    };

    await handler(event, {});

    const config = fetchStub.firstCall.args[1];
    expect(config.headers["Content-Type"]).to.equal("application/json");
  });

  it("should not throw when fetch fails", async () => {
    fetchStub.rejects(new Error("network error"));

    const event = {
      Records: [{ Sns: { Message: "{}" } }],
    };

    const result = await handler(event, {});
    expect(result).to.be.undefined;
  });
});
