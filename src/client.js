const log = require("SyntheticsLogger");
const express = require("express");
const app = express();
const { auth } = require("express-openid-connect");
const crypto = require("crypto");

const startClient = async (
  port,
  scope,
  clientId,
  clientBaseUrl,
  issuerBaseURL,
  clientPrivateKey
) => {
  log.info("Starting Client");
  app.use(
    auth({
      issuerBaseURL: issuerBaseURL,
      baseURL: clientBaseUrl,
      clientID: clientId,
      secret: crypto.randomBytes(20).toString("base64url"),
      clientAuthMethod: "private_key_jwt",
      clientAssertionSigningKey: clientPrivateKey,
      idTokenSigningAlg: "ES256",
      authRequired: true,
      authorizationParams: {
        response_type: "code",
        scope: scope,
      },
    })
  );
  app.get("/", async (req, res) => {
    const userinfo = await req.oidc.fetchUserInfo();
    res.json(userinfo);
  });
  return app.listen(port);
};

module.exports = { startClient };
