const { Cronitor } = require("cronitor");

exports.handler = async function (event, context) {
  let monitorKey = process.env.CRONITOR_MONITOR_KEY;
  console.log("Ping Cronitor monitor " + monitorKey);
  let cronitor = new Cronitor(process.env.CRONITOR_API_KEY);
  let monitor = new cronitor.Monitor(monitorKey);
  monitor.ping();
  console.log("Complete");
  return "ping complete";
};
