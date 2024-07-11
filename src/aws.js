const {
  S3,
  waitUntilObjectExists,
} = require("@aws-sdk/client-s3");

const {
  SSM,
} = require("@aws-sdk/client-ssm");

const synthetics = require("Synthetics");

const SSM = new SSM();
const S3 = new S3();

const getParameter = async (parameterName) => {
  const canaryName = synthetics.getCanaryName();

  const result = await SSM.getParameter({
    Name: `${canaryName}-${parameterName}`,
    WithDecryption: true,
  });

  return result.Parameter.Value;
};

const emptyOtpBucket = async (bucketName, phoneNumber) => {
  await S3.deleteObject({
    Bucket: bucketName,
    Key: phoneNumber,
  });
};

const getOTPCode = async (phoneNumber, bucketName) => {
  const response = await waitUntilObjectExists({
    client: S3,
    minDelay: 5,
    maxWaitTime: 100,
  }, {
    Bucket: bucketName,
    Key: phoneNumber,
  });

  if (response.ContentLength > 0) {
    return (
      await S3.getObject({ Bucket: bucketName, Key: phoneNumber })
    ).Body.toString();
  }
};

module.exports = { getOTPCode, emptyOtpBucket, getParameter };
