const { expect } = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const chai = require("chai");

chai.use(sinonChai);

describe("aws", () => {
  let getParameterStub,
    getSecretValueStub,
    deleteObjectStub,
    sendStub,
    waitUntilObjectExistsStub;
  let aws;

  beforeEach(() => {
    getParameterStub = sinon.stub().resolves({
      Parameter: { Value: "test-value" },
    });
    getSecretValueStub = sinon.stub().resolves({
      SecretString: "secret-value",
    });
    deleteObjectStub = sinon.stub().resolves();
    sendStub = sinon.stub().resolves({
      Body: { transformToString: sinon.stub().resolves("123456") },
    });
    waitUntilObjectExistsStub = sinon.stub().resolves();

    require.cache[require.resolve("@aws-sdk/client-s3")] = {
      id: require.resolve("@aws-sdk/client-s3"),
      filename: require.resolve("@aws-sdk/client-s3"),
      loaded: true,
      exports: {
        S3: sinon.stub().returns({ deleteObject: deleteObjectStub }),
        S3Client: sinon.stub().returns({ send: sendStub }),
        waitUntilObjectExists: waitUntilObjectExistsStub,
        GetObjectCommand: sinon.stub(),
      },
    };

    require.cache[require.resolve("@aws-sdk/client-ssm")] = {
      id: require.resolve("@aws-sdk/client-ssm"),
      filename: require.resolve("@aws-sdk/client-ssm"),
      loaded: true,
      exports: {
        SSM: sinon.stub().returns({ getParameter: getParameterStub }),
      },
    };

    // Use the module name as key since it's registered via setup.js
    require.cache["@aws-sdk/client-secrets-manager"] = {
      id: "@aws-sdk/client-secrets-manager",
      filename: "@aws-sdk/client-secrets-manager",
      loaded: true,
      exports: {
        SecretsManager: sinon
          .stub()
          .returns({ getSecretValue: getSecretValueStub }),
      },
    };

    require.cache["Synthetics"] = {
      id: "Synthetics",
      filename: "Synthetics",
      loaded: true,
      exports: {
        getCanaryName: sinon.stub().returns("test-canary"),
      },
    };

    delete require.cache[require.resolve("../src/aws")];
    aws = require("../src/aws");
  });

  afterEach(() => {
    delete require.cache[require.resolve("../src/aws")];
    delete require.cache[require.resolve("@aws-sdk/client-s3")];
    delete require.cache[require.resolve("@aws-sdk/client-ssm")];
    delete require.cache["@aws-sdk/client-secrets-manager"];
    delete require.cache["Synthetics"];
  });

  describe("getParameter", () => {
    it("should call SSM with canary name prefix", async () => {
      const result = await aws.getParameter("bucket");
      expect(getParameterStub).to.have.been.calledWith({
        Name: "test-canary-bucket",
        WithDecryption: true,
      });
      expect(result).to.equal("test-value");
    });
  });

  describe("getSecretValue", () => {
    it("should return SecretString when available", async () => {
      const result = await aws.getSecretValue("/deploy/test/secret");
      expect(getSecretValueStub).to.have.been.calledWith({
        SecretId: "/deploy/test/secret",
      });
      expect(result).to.equal("secret-value");
    });

    it("should return SecretBinary when SecretString is absent", async () => {
      getSecretValueStub.resolves({
        SecretString: undefined,
        SecretBinary: Buffer.from("binary"),
      });
      const result = await aws.getSecretValue("/deploy/test/secret");
      expect(result).to.deep.equal(Buffer.from("binary"));
    });
  });

  describe("emptyOtpBucket", () => {
    it("should delete the object from S3", async () => {
      await aws.emptyOtpBucket("my-bucket", "07700900000");
      expect(deleteObjectStub).to.have.been.calledWith({
        Bucket: "my-bucket",
        Key: "07700900000",
      });
    });
  });

  describe("getOTPCode", () => {
    it("should wait for object and return its content", async () => {
      const result = await aws.getOTPCode("07700900000", "my-bucket");
      expect(waitUntilObjectExistsStub).to.have.been.called;
      expect(result).to.equal("123456");
    });
  });
});
