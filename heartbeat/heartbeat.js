const cronitor = require("cronitor")(process.env.CRONITOR_API_KEY);

const handler = async function (event, context) {
  // eslint-disable-line no-unused-vars
  const monitorKey = process.env.CRONITOR_MONITOR_KEY;
  console.log("cronitor ping monitor " + monitorKey);
  const monitor = new cronitor.Monitor(monitorKey);
  return monitor.ping().then((response) => {
    return "cronitor ping monitor " + monitorKey + " returns: " + response;
  });
};

module.exports = { handler };
