// Register stub modules for AWS CloudWatch Synthetics runtime dependencies
const Module = require("module");
const originalResolveFilename = Module._resolveFilename;

const syntheticModules = {
  Synthetics: {
    executeStep: async (name, fn) => fn(),
    getConfiguration: () => ({ setConfig: () => {} }),
    getPage: async () => ({}),
    getCanaryName: () => "test-canary",
    getCanaryUserAgentString: () => "canary-ua",
    executeHttpStep: async () => {},
  },
  SyntheticsLogger: {
    info: () => {},
    error: () => {},
    warn: () => {},
  },
  "@aws-sdk/client-secrets-manager": {
    SecretsManager: function () {
      return { getSecretValue: async () => ({}) };
    },
  },
};

Module._resolveFilename = function (request, parent, isMain, options) {
  if (syntheticModules[request]) {
    // Return a fake path that we can intercept
    return request;
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

// Pre-populate require.cache for synthetic modules
for (const [name, exports] of Object.entries(syntheticModules)) {
  require.cache[name] = {
    id: name,
    filename: name,
    loaded: true,
    exports,
  };
}
