const {
  S3,
  waitUntilObjectExists,
  GetObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");

const { SSM } = require("@aws-sdk/client-ssm");
const { SecretsManager } = require("@aws-sdk/client-secrets-manager");

const synthetics = require("Synthetics");
const ssm = new SSM();
const secretsManager = new SecretsManager();
const s3 = new S3();
const s3Client = new S3Client();

const getParameter = async (parameterName) => {
  const canaryName = synthetics.getCanaryName();

  const result = await ssm.getParameter({
    Name: `${canaryName}-${parameterName}`,
    WithDecryption: true,
  });

  return result.Parameter.Value;
};

const getSecret = async (secretName) => {
  const canaryName = synthetics.getCanaryName();

  const result = await secretsManager.getSecretValue({
    SecretId: `${canaryName}-${secretName}`,
  });

  return result.SecretString;
};

const emptyOtpBucket = async (bucketName, phoneNumber) => {
  await s3.deleteObject({
    Bucket: bucketName,
    Key: phoneNumber,
  });
};

const getOTPCode = async (phoneNumber, bucketName) => {
  await waitUntilObjectExists(
    {
      client: s3Client,
      minDelay: 5,
      maxWaitTime: 100,
    },
    {
      Bucket: bucketName,
      Key: phoneNumber,
    }
  );

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: phoneNumber,
  });

  const getObjectResponse = await s3Client.send(command);
  const otpCode = await getObjectResponse.Body.transformToString();
  return otpCode;
};

module.exports = { getOTPCode, emptyOtpBucket, getParameter, getSecret };
