const { getParameter } = require("./aws");

const formatMessage = (snsMessage, colorCode, snsMessageFooter) => {
  var description = snsMessage.AlarmDescription.split("ACCOUNT:");
  var account = snsMessage.AWSAccountId;
  if (description.length > 1) {
    account = description[1];
  }
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
  } else {
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
  }
};

const buildMessageRequest = (snsMessage, colorCode, snsMessageFooter) => {
  const body = formatMessage(snsMessage, colorCode, snsMessageFooter);
  if (process.env.DEPLOY_ENVIRONMENT === "integration") {
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
