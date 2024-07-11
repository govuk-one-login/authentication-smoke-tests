const {
  S3,
  waitUntilObjectExists,
} = require("@aws-sdk/client-s3");

const {
  SSM,
} = require("@aws-sdk/client-ssm");

const synthetics = require("Synthetics");

const ssm = new SSM();
const s3 = new S3();

const getParameter = async (parameterName) => {
  const canaryName = synthetics.getCanaryName();

  const result = await ssm.getParameter({
    Name: `${canaryName}-${parameterName}`,
    WithDecryption: true,
  });

  return result.Parameter.Value;
};

const emptyOtpBucket = async (bucketName, phoneNumber) => {
  await s3.deleteObject({
    Bucket: bucketName,
    Key: phoneNumber,
  });
};

const getOTPCode = async (phoneNumber, bucketName) => {
  const response = await waitUntilObjectExists({
    client: s3,
    minDelay: 5,
    maxWaitTime: 100,
  }, {
    Bucket: bucketName,
    Key: phoneNumber,
  });

  if (response.ContentLength > 0) {
    return (
      await s3.getObject({ Bucket: bucketName, Key: phoneNumber })
    ).Body.toString();
  }
};

module.exports = { getOTPCode, emptyOtpBucket, getParameter };
