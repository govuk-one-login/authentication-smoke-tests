const globals = require("globals");
const js = require("@eslint/js");
const nodePlugin = require("eslint-plugin-n");

module.exports = [
  js.configs.recommended,
  nodePlugin.configs["flat/recommended-script"],
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "n/no-unsupported-features/node-builtins": [
        "error",
        {
          ignores: ["fetch"],
        },
      ],
      "n/no-unpublished-require": "off",
      "n/no-missing-require": "off",
      "n/exports-style": ["error", "module.exports"],
      "n/file-extension-in-import": ["error", "always"],
      "n/prefer-global/buffer": ["error", "always"],
      "n/prefer-global/console": ["error", "always"],
      "n/prefer-global/process": ["error", "always"],
      "n/prefer-global/url-search-params": ["error", "always"],
      "n/prefer-global/url": ["error", "always"],
      "n/prefer-promises/dns": "error",
      "n/prefer-promises/fs": "error",
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
  {
    ignores: ["eslint.config.js"],
  },
];
