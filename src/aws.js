const AWS = require("aws-sdk");
const synthetics = require("Synthetics");

const SSM = new AWS.SSM();
const S3 = new AWS.S3();

const getParameter = async (parameterName) => {
  const canaryName = synthetics.getCanaryName();

  const result = await SSM.getParameter({
    Name: `${canaryName}-${parameterName}`,
    WithDecryption: true,
  }).promise();

  return result.Parameter.Value;
};

const emptyOtpBucket = async (bucketName) => {
  const { Contents } = await S3.listObjectsV2({ Bucket: bucketName }).promise();
  if (Contents.length > 0) {
    await S3.deleteObjects({
      Bucket: bucketName,
      Delete: {
        Objects: Contents.map(({ Key }) => ({ Key })),
      },
    }).promise();
  }
};

const getOTPCode = async (phoneNumber, bucketName) => {
  const response = await S3.waitFor("objectExists", {
    Bucket: bucketName,
    Key: phoneNumber,
    $waiter: {
      maxAttempts: 10,
      delay: 5,
    },
  }).promise();

  if (response.ContentLength > 0) {
    return (
      await S3.getObject({ Bucket: bucketName, Key: phoneNumber }).promise()
    ).Body.toString();
  }
};

module.exports = { getOTPCode, emptyOtpBucket, getParameter };
