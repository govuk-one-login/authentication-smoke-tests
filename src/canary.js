const log = require('SyntheticsLogger');

const basicCustomEntryPoint = async function () {

    log.info("Running smoke tests...");

    return "Tweet tweet";
};

exports.handler = async () => {
    return await basicCustomEntryPoint();
};