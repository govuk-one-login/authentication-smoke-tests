const cronitor = require("cronitor")(process.env.CRONITOR_API_KEY);

// eslint-disable-next-line no-unused-vars
const handler = async function (event, context) {
  const monitorKey = process.env.CRONITOR_MONITOR_KEY;
  const keyExcerpt = monitorKey.slice(-2);
  console.log("cronitor ping monitor ending " + keyExcerpt);
  const monitor = new cronitor.Monitor(monitorKey);
  return monitor.ping().then((response) => {
    return (
      "cronitor ping monitor ending " + keyExcerpt + " returns: " + response
    );
  });
};

module.exports = { handler };
