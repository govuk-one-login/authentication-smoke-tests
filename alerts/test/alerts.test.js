const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

const { handler } = require("../alerts");

describe("alerts handler", () => {
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
    delete process.env.SLACK_CHANNEL_ID;
    delete process.env.ERROR_COLOR;
    delete process.env.OK_COLOR;
    delete process.env.MESSAGE_FOOTER;
  });

  describe("SNS subscription confirmation", () => {
    it("should confirm subscription by fetching the SubscribeUrl", async () => {
      fetchStub.resolves({ status: 200 });

      const event = {
        Records: [
          {
            Sns: {
              Type: "SubscriptionConfirmation",
              SubscribeUrl: "https://sns.amazonaws.com/confirm?token=abc",
            },
          },
        ],
      };

      const result = await handler(event, {});

      expect(fetchStub).to.have.been.calledWith(
        "https://sns.amazonaws.com/confirm?token=abc"
      );
      expect(result.statusCode).to.equal(200);
    });

    it("should return 400 if SubscribeUrl is missing", async () => {
      const event = {
        Records: [
          {
            Sns: {
              Type: "SubscriptionConfirmation",
              SubscribeUrl: undefined,
            },
          },
        ],
      };

      const result = await handler(event, {});

      expect(result.statusCode).to.equal(400);
    });

    it("should return 500 if subscription confirmation fails", async () => {
      fetchStub.rejects(new Error("network error"));

      const event = {
        Records: [
          {
            Sns: {
              Type: "SubscriptionConfirmation",
              SubscribeUrl: "https://sns.amazonaws.com/confirm",
            },
          },
        ],
      };

      const result = await handler(event, {});

      expect(result.statusCode).to.equal(500);
    });
  });

  describe("alarm notifications", () => {
    it("should send ALARM message to slack with error color", async () => {
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = {
        AlarmName: "TestAlarm",
        AlarmDescription: "Something broke",
        NewStateValue: "ALARM",
        AWSAccountId: "123456789",
      };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      await handler(event, {});

      expect(fetchStub).to.have.been.calledWith(
        "https://hooks.slack.com/test",
        sinon.match.has("method", "post")
      );

      const body = JSON.parse(fetchStub.firstCall.args[1].body);
      expect(body.attachments[0].color).to.equal("#C70039");
      expect(body.attachments[0].title).to.equal("TestAlarm");
      expect(body.attachments[0].fields[0].value).to.equal("ALARM");
    });

    it("should send OK message with green color", async () => {
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = {
        AlarmName: "TestAlarm",
        AlarmDescription: "Recovered",
        NewStateValue: "OK",
        AWSAccountId: "123456789",
      };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      await handler(event, {});

      const body = JSON.parse(fetchStub.firstCall.args[1].body);
      expect(body.attachments[0].color).to.equal("#36a64f");
    });

    it("should include channel when not production", async () => {
      process.env.SLACK_CHANNEL_ID = "C12345";
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = {
        AlarmName: "TestAlarm",
        AlarmDescription: "Test",
        NewStateValue: "ALARM",
        AWSAccountId: "123456789",
      };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      await handler(event, {});

      const body = JSON.parse(fetchStub.firstCall.args[1].body);
      expect(body.channel).to.equal("C12345");
    });

    it("should format ElastiCache messages differently", async () => {
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = { "ElastiCache:event": "my-cluster" };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      await handler(event, {});

      const body = JSON.parse(fetchStub.firstCall.args[1].body);
      expect(body.attachments[0].color).to.equal("#ff9966");
      expect(body.attachments[0].title).to.equal("my-cluster-notification");
    });

    it("should extract account from AlarmDescription ACCOUNT: prefix", async () => {
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = {
        AlarmName: "TestAlarm",
        AlarmDescription: "Something brokeACCOUNT:my-account",
        NewStateValue: "ALARM",
        AWSAccountId: "123456789",
      };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      await handler(event, {});

      const body = JSON.parse(fetchStub.firstCall.args[1].body);
      expect(body.attachments[0].fields[1].value).to.equal("my-account");
    });
  });
});
