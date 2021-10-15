const log = require('SyntheticsLogger');
const syn = require('Synthetics');
const AWS = require('aws-sdk');

const basicCustomEntryPoint = async function () {

    let canaryName = syn.getCanaryName();
    log.info("Running smoke tests...");

    let ssm = new AWS.SSM();
    let params = {
        Name: canaryName + "-username",
        WithDecryption: true
    };
    ssm.getParameter(params, function(err, data) {
        if (err)
            log.error(err, err.stack);
        else {
            log.info("Username" + data.Parameter.Value);
            log.info("ARN" + data.Parameter.ARN);
        }
    });

    return "Tweet tweet";
};

exports.handler = async () => {
    return await basicCustomEntryPoint();
};