const https = require("https");
const axios = require('axios');
const util = require("util");
const { getParameter } = require("./aws");

exports.handler = async function(event, context) {
    console.log("Alert lambda triggered");
    const slackHookUrl = await getParameter("slack-hook-url");

    var data = JSON.stringify({
            "text":event.Records[0].Sns.Message});
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