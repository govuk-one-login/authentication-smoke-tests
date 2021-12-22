const axios = require('axios');
const { getParameter } = require("./aws");

exports.handler = async function(event, context) {
    console.log("Alert lambda triggered");
    const slackHookUrl = await getParameter(process.env.DEPLOY_ENVIRONMENT+"-slack-hook-url");
    var snsMessage = JSON.parse(event.Records[0].Sns.Message);

    if(JSON.stringify(snsMessage).includes("ElastiCache")) {
        console.log("Create ElastiCache notification")
        var fallback    = Object.keys(snsMessage)[0] + "for cluster: " + Object.values(snsMessage)[0];
        var colorCode   = "#ff9966";
        var title       = Object.values(snsMessage)[0] + "-notification";
        var description = Object.keys(snsMessage)[0] + " for cluster: " + Object.values(snsMessage)[0];
        var fields      = [{"title": "Status","value": "INFO","short": false}];
    } else {
        var colorCode = "#C70039";
        if (snsMessage.NewStateValue === "OK") {
            colorCode = "#36a64f"
        }
        var fallback    = snsMessage.AlarmDescription;
        var title       = snsMessage.AlarmName;
        var description = snsMessage.AlarmDescription;
        var fields      = [{"title": "Status", "value": snsMessage.NewStateValue, "short": false}];
    }
    var config = {
        method: 'post',
        url: slackHookUrl,
        headers: {
            'Content-Type': 'application/json'
        },
        data : JSON.stringify({
            "attachments": [{
                "fallback": fallback,
                "color": colorCode,
                "title": title,
                "text": description,
                "fields": fields,
                "footer": "GOV.UK Sign In alert"
            }]
        })
    };
    console.log("Sending alert to slack");
    try {
        const response = await axios(config);
        console.log(JSON.stringify(response.data));
    } catch (error) {
        console.log(error);
    }
};