const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

const {
  handler,
  isSuppressedAlert,
  formatMessage,
  buildMessageRequest,
  ELASTICACHE_RUNBOOK_URL,
} = require("../alerts");

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
      expect(body.attachments[0].title).to.equal(
        "ElastiCache: my-cluster-notification"
      );
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

  describe("alert suppression", () => {
    it("should suppress ElastiCache ServiceUpdateAvailable notifications", async () => {
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = {
        "Service Update Name": "elasticache-20260608-intel",
        "Replication Group ID": "production-sessions-store",
        "ElastiCache:ServiceUpdateAvailable": "production-sessions-store",
      };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      const result = await handler(event, {});

      expect(fetchStub).to.not.have.been.called;
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.equal("Alert suppressed");
    });

    it("should suppress ElastiCache ServiceUpdateAvailableForNode notifications", async () => {
      fetchStub.resolves({ text: () => Promise.resolve("ok") });

      const snsMessage = {
        "Service Update Name": "elasticache-20260608-intel",
        "Replication Group ID": "production-sessions-store",
        "ElastiCache:ServiceUpdateAvailableForNode":
          "production-sessions-store",
      };

      const event = {
        Records: [
          {
            Sns: { Type: "Notification", Message: JSON.stringify(snsMessage) },
          },
        ],
      };

      const result = await handler(event, {});

      expect(fetchStub).to.not.have.been.called;
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.equal("Alert suppressed");
    });

    it("should not suppress other ElastiCache notifications", async () => {
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

      expect(fetchStub).to.have.been.calledWith(
        "https://hooks.slack.com/test",
        sinon.match.has("method", "post")
      );
    });

    it("should not suppress regular alarm notifications", async () => {
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
    });
  });

  describe("isSuppressedAlert", () => {
    it("should return true for ServiceUpdateAvailable messages", () => {
      const message = {
        "Service Update Name": "elasticache-20260608-intel",
        "Replication Group ID": "production-sessions-store",
        "ElastiCache:ServiceUpdateAvailable": "production-sessions-store",
      };
      expect(isSuppressedAlert(message)).to.be.true;
    });

    it("should return true for ServiceUpdateAvailableForNode messages", () => {
      const message = {
        "Service Update Name": "elasticache-20260608-intel",
        "Replication Group ID": "production-sessions-store",
        "ElastiCache:ServiceUpdateAvailableForNode":
          "production-sessions-store",
      };
      expect(isSuppressedAlert(message)).to.be.true;
    });

    it("should return false for other ElastiCache messages", () => {
      const message = { "ElastiCache:event": "my-cluster" };
      expect(isSuppressedAlert(message)).to.be.false;
    });

    it("should return false for non-ElastiCache messages", () => {
      const message = {
        AlarmName: "TestAlarm",
        AlarmDescription: "Test",
        NewStateValue: "ALARM",
        AWSAccountId: "123456789",
      };
      expect(isSuppressedAlert(message)).to.be.false;
    });
  });

  describe("formatMessage - ElastiCache text content", () => {
    const snsMessage = {
      "ElastiCache:FailoverComplete": "production-sessions-store",
      "Cache Cluster ID": "production-sessions-store-001",
    };

    it("should include the summary line as the first line", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const text = result.attachments[0].text;
      const firstLine = text.split("\n")[0];

      expect(firstLine).to.equal(
        "ElastiCache:FailoverComplete for cluster: production-sessions-store"
      );
    });

    it("should include the full stringified SNS message", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const text = result.attachments[0].text;

      expect(text).to.include(JSON.stringify(snsMessage, null, 2));
    });

    it("should include the runbook link", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const text = result.attachments[0].text;

      expect(text).to.include("Runbook: " + ELASTICACHE_RUNBOOK_URL);
    });

    it("should include a Raw event label before the stringified message", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const text = result.attachments[0].text;

      expect(text).to.include(
        "Raw event:\n" + JSON.stringify(snsMessage, null, 2)
      );
    });

    it("should end with the stringified SNS message", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const text = result.attachments[0].text;

      expect(text.trim().endsWith(JSON.stringify(snsMessage, null, 2))).to.be
        .true;
    });

    it("should order content as summary, then runbook, then raw event", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const text = result.attachments[0].text;

      const summaryIndex = text.indexOf(
        "ElastiCache:FailoverComplete for cluster:"
      );
      const runbookIndex = text.indexOf(ELASTICACHE_RUNBOOK_URL);
      const rawEventIndex = text.indexOf("Raw event:");
      const dumpIndex = text.indexOf(JSON.stringify(snsMessage, null, 2));

      expect(summaryIndex).to.be.lessThan(runbookIndex);
      expect(runbookIndex).to.be.lessThan(rawEventIndex);
      expect(rawEventIndex).to.be.lessThan(dumpIndex);
    });

    it("should still set color, title, status, and footer correctly", () => {
      const result = formatMessage(snsMessage, "#ff9966", "test footer");
      const attachment = result.attachments[0];

      expect(attachment.color).to.equal("#ff9966");
      expect(attachment.title).to.equal(
        "ElastiCache: production-sessions-store-notification"
      );
      expect(attachment.fields[0].value).to.equal("INFO");
      expect(attachment.footer).to.equal("test footer");
    });
  });

  describe("buildMessageRequest - ElastiCache JSON.stringify round-trip", () => {
    const snsMessage = {
      "ElastiCache:FailoverComplete": "production-sessions-store",
      "Cache Cluster ID": "production-sessions-store-001",
      "Replication Group ID": "production-sessions-store",
    };

    it("should produce valid JSON in the request body", () => {
      const request = buildMessageRequest(snsMessage, "#ff9966", "test footer");

      expect(() => JSON.parse(request.body)).to.not.throw();
    });

    it("should preserve the full SNS message dump after JSON.stringify round-trip", () => {
      const request = buildMessageRequest(snsMessage, "#ff9966", "test footer");
      const parsed = JSON.parse(request.body);
      const text = parsed.attachments[0].text;

      // Extract the JSON dump that follows "Raw event:\n"
      const rawEventPrefix = "Raw event:\n";
      const dumpStart = text.indexOf(rawEventPrefix) + rawEventPrefix.length;
      const extractedDump = text.substring(dumpStart).trim();

      expect(() => JSON.parse(extractedDump)).to.not.throw();
      expect(JSON.parse(extractedDump)).to.deep.equal(snsMessage);
    });

    it("should preserve the runbook URL after JSON.stringify round-trip", () => {
      const request = buildMessageRequest(snsMessage, "#ff9966", "test footer");
      const parsed = JSON.parse(request.body);
      const text = parsed.attachments[0].text;

      expect(text).to.include(ELASTICACHE_RUNBOOK_URL);
    });

    it("should include channel when not production", () => {
      process.env.DEPLOY_ENVIRONMENT = "test";
      process.env.SLACK_CHANNEL_ID = "C12345";

      const request = buildMessageRequest(snsMessage, "#ff9966", "test footer");
      const parsed = JSON.parse(request.body);

      expect(parsed.channel).to.equal("C12345");
    });
  });
});
