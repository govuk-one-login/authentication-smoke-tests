const log = require("SyntheticsLogger");
const express = require("express");
const app = express();
const { auth } = require("express-openid-connect");
const crypto = require("node:crypto");

// Normalise any RSA private key (PKCS#1 or PKCS#8) to PKCS#8 PEM
function toPkcs8Pem(pem) {
  const key = crypto.createPrivateKey(pem);
  return key.export({ type: "pkcs8", format: "pem" });
}

const startClient = async (
  port,
  scope,
  clientId,
  clientBaseUrl,
  issuerBaseURL,
  clientPrivateKey,
  isP2LevelOfConfidenceJourney
) => {
  log.info("Starting Client");
  app.use(
    auth({
      issuerBaseURL: issuerBaseURL,
      baseURL: clientBaseUrl,
      clientID: clientId,
      secret: crypto.randomBytes(20).toString("base64url"),
      clientAuthMethod: "private_key_jwt",
      clientAssertionSigningKey: toPkcs8Pem(clientPrivateKey),
      clientAssertionSigningAlg: "RS256",
      idTokenSigningAlg: "ES256",
      authRequired: true,
      authorizationParams: {
        response_type: "code",
        scope: scope,
        vtr: isP2LevelOfConfidenceJourney ? '["P2.Cl.Cm"]' : '["Cl.Cm"]',
      },
      httpTimeout: 10000,
    })
  );
  app.get("/", async (req, res) => {
    const userinfo = await req.oidc.fetchUserInfo();
    res.json(userinfo);
  });
  return app.listen(port);
};

module.exports = { startClient };
