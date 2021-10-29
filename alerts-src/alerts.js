const https = require("https");
const axios = require('axios');
const util = require("util");
const { getParameter } = require("./aws");

exports.handler = async function(event, context) {
    console.log("Alert lambda triggered");
    const slackHookUrl = await getParameter(process.env.DEPLOY_ENVIRONMENT+"-slack-hook-url");
    var snsMessage = JSON.parse(event.Records[0].Sns.Message);
    var colorCode = "#C70039";
    if(snsMessage.NewStateValue === "OK") {
        colorCode = "#36a64f"
    }
     var data = JSON.stringify({
      "attachments": [{"fallback": snsMessage.AlarmDescription,"color": colorCode,"title": snsMessage.AlarmName,"text": "Alarm Description: " + snsMessage.AlarmDescription,"fields": [{"title": "Status","value": snsMessage.NewStateValue,"short": false}],"footer": "GOV.UK Sign In alert"}]});
    var config = {
      method: 'post',
      url: slackHookUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data : data
    };
    console.log("Sending alert to slack");
    try {
    const response = await axios(config);
      console.log(JSON.stringify(response.data));
    } catch (error) {
        console.log(error);
    }
 };