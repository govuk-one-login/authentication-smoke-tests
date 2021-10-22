const AWS = require("aws-sdk");

const SSM = new AWS.SSM();
const S3 = new AWS.S3();

const getParameter = async (parameterName) => {

  const result = await SSM.getParameter({
    Name: `${parameterName}`,
    WithDecryption: true,
  }).promise();

  return result.Parameter.Value;
};

module.exports = { getParameter };
