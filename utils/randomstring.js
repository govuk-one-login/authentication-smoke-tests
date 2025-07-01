const crypto = require("crypto");
const https = require("https");

module.exports.handler = async (event, context) => {
  console.log("Event:", JSON.stringify(event));

  // Generate random string regardless of event type
  const length = event.ResourceProperties?.Length || 16;
  const special = event.ResourceProperties?.Special === "true";
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
    (special ? "!@#$%^&*()" : "");

  let randomString = "";
  const randomValues = crypto.randomBytes(parseInt(length));

  for (let i = 0; i < length; i++) {
    randomString += charset.charAt(randomValues[i] % charset.length);
  }

  // For Delete events, just return success
  if (event.RequestType === "Delete") {
    return sendCfnResponse(event, context, "SUCCESS");
  }

  // For Create/Update events, return the generated string
  return sendCfnResponse(event, context, "SUCCESS", {
    RandomString: randomString,
  });
};

// Simplified CloudFormation response function
function sendCfnResponse(event, context, status, data = {}) {
  // If no ResponseURL is provided, just log and return
  if (!event.ResponseURL) {
    console.log(`No ResponseURL found. Status: ${status}, Data:`, data);
    return Promise.resolve();
  }

  const responseBody = JSON.stringify({
    Status: status,
    Reason: status === "FAILED" ? "See CloudWatch logs for details" : "OK",
    PhysicalResourceId: context.logStreamName || "random-string-generator",
    StackId: event.StackId || "",
    RequestId: event.RequestId || "",
    LogicalResourceId: event.LogicalResourceId || "",
    Data: data,
  });
  console.log("Sending response:", responseBody);

  // Parse URL safely
  let urlParts;
  try {
    const url = new URL(event.ResponseURL);
    urlParts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: "PUT",
    };
  } catch {
    console.error("Invalid ResponseURL:", event.ResponseURL);
    return Promise.resolve();
  }

  const options = {
    hostname: urlParts.hostname,
    port: 443,
    path: urlParts.path,
    method: "PUT",
    headers: {
      "Content-Type": "",
      "Content-Length": responseBody.length,
    },
  };

  return new Promise((resolve) => {
    try {
      const req = https.request(options, (res) => {
        console.log(`Response status code: ${res.statusCode}`);
        res.on("data", () => {});
        res.on("end", () => resolve());
      });

      req.on("error", (e) => {
        console.error("Request error:", e);
        resolve(); // Resolve anyway to prevent Lambda from hanging
      });

      req.write(responseBody);
      req.end();
    } catch {
      console.error("Failed to send response:");
      resolve(); // Resolve anyway to prevent Lambda from hanging
    }
  });
}
