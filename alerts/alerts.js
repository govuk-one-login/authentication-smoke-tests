const { getParameter } = require("./aws");

const formatMessage = (snsMessage, colorCode, snsMessageFooter) => {
  if (JSON.stringify(snsMessage).includes("ElastiCache")) {
    return {
      attachments: [
        {
          fallback:
            Object.keys(snsMessage)[0] +
            "for cluster: " +
            Object.values(snsMessage)[0],
          color: "#ff9966",
          title: Object.values(snsMessage)[0] + "-notification",
          text:
            Object.keys(snsMessage)[0] +
            " for cluster: " +
            Object.values(snsMessage)[0],
          fields: [
            {
              title: "Status",
              value: "INFO",
              short: false,
            },
          ],
          footer: snsMessageFooter,
        },
      ],
    };
  }

  var description = snsMessage.AlarmDescription.split("ACCOUNT:");
  var account = snsMessage.AWSAccountId;
  if (description.length > 1) {
    account = description[1];
  }
  return {
    attachments: [
      {
        fallback: description[0],
        color: colorCode,
        title: snsMessage.AlarmName,
        text: description[0],
        fields: [
          {
            title: "Status",
            value: snsMessage.NewStateValue,
            short: false,
          },
          {
            title: "Account",
            value: account,
            short: false,
          },
        ],
        footer: snsMessageFooter,
      },
    ],
  };
};

const buildMessageRequest = (snsMessage, colorCode, snsMessageFooter) => {
  const body = formatMessage(snsMessage, colorCode, snsMessageFooter);
  if (process.env.DEPLOY_ENVIRONMENT !== "production") {
    body.channel = process.env.SLACK_CHANNEL_ID;
  }
  return {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };
};

// eslint-disable-next-line no-unused-vars
const handler = async function (event, context) {
  console.log("Alert lambda triggered");

  // Handle SNS subscription confirmation
  if (event.Records[0].Sns.Type === "SubscriptionConfirmation") {
    console.log("SNS Subscription confirmation received");

    const subscribeUrl = event.Records[0].Sns.SubscribeUrl;
    console.log("SubscribeUrl:", subscribeUrl);

    if (!subscribeUrl) {
      console.log("SubscribeUrl not found in SNS message");
      return { statusCode: 400, body: "SubscribeUrl not found" };
    }

    try {
      const response = await fetch(subscribeUrl);
      console.log("Subscription confirmed:", response.status);
      return { statusCode: 200, body: "Subscription confirmed" };
    } catch (error) {
      console.log("Error confirming subscription:", error);
      return { statusCode: 500, body: "Error confirming subscription" };
    }
  }

  const slackHookUrl =
    process.env.SLACK_WEBHOOK_URL ||
    (await getParameter(process.env.DEPLOY_ENVIRONMENT + "-slack-hook-url"));
  let colorCode = process.env.ERROR_COLOR || "#C70039";
  let snsMessageFooter = process.env.MESSAGE_FOOTER || "GOV.UK Sign In alert";

  let snsMessage = JSON.parse(event.Records[0].Sns.Message);
  console.log(snsMessage);
  if (snsMessage.NewStateValue === "OK") {
    colorCode = process.env.OK_COLOR || "#36a64f";
  }
  const messageRequest = buildMessageRequest(
    snsMessage,
    colorCode,
    snsMessageFooter
  );

  console.log("Sending alert to slack");
  try {
    const response = await fetch(slackHookUrl, messageRequest);
    const message = await response.text();
    console.log(message);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handler };
