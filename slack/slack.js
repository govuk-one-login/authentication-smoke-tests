const { getParameter } = require("./aws");

// eslint-disable-next-line no-unused-vars
const handler = async function (event, context) {
  console.log("Alert lambda triggered");
  const slackHookUrl =
    process.env.SLACK_WEBHOOK_URL ||
    (await getParameter(process.env.DEPLOY_ENVIRONMENT + "-slack-hook-url"));

  var config = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: event.Records[0].Sns.Message,
  };
  console.log("Sending alert to slack");
  try {
    // eslint-disable-next-line no-undef
    const response = await fetch(slackHookUrl, config);
    const message = await response.text();
    console.log(message);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handler };
