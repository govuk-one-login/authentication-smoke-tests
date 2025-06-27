const crypto = require("crypto");
const https = require("https");

module.exports.handler = function (event, context) {
  if (event.RequestType === "Delete") {
    sendResponse(event, context, "SUCCESS", {});
    return;
  }

  try {
    const { privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    const publicKey = crypto.createPublicKey(privateKey);
    const publicKeyPem = publicKey
      .export({
        type: "spki",
        format: "pem",
      })
      .toString();

    sendResponse(event, context, "SUCCESS", {
      PublicKeyPem: publicKeyPem,
      PrivateKeyPem: privateKey,
    });
  } catch (error) {
    console.error("Error:", error);
    sendResponse(event, context, "FAILED", { Error: error.message });
  }
};

function sendResponse(event, context, responseStatus, responseData) {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason:
      responseStatus === "FAILED"
        ? responseData.Error
        : "See the details in CloudWatch Log Stream: " + context.logStreamName,
    PhysicalResourceId: context.logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData,
  });

  console.log("Response body:", responseBody);

  const parsedUrl = new URL(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.pathname + parsedUrl.search,
    method: "PUT",
    headers: {
      "content-type": "",
      "content-length": responseBody.length,
    },
  };

  const request = https.request(options, function (response) {
    console.log("Status code:", response.statusCode);
    context.done();
  });

  request.on("error", function (error) {
    console.log("send response error:", error);
    context.done();
  });

  request.write(responseBody);
  request.end();
}
