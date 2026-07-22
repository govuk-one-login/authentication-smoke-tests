# Local Canary Testing

Run Synthetics canaries locally on your Mac without Docker or the Lambda layer.

Uses a local Puppeteer browser with mocked Synthetics modules — the canary code
makes real AWS calls (SSM, S3) against a real environment.

## Prerequisites

1. Node.js 22+
2. AWS credentials configured (`di-authentication-development-AdministratorAccessPermission` profile)

## Setup

```bash
npm install --save-dev puppeteer @aws-sdk/client-secrets-manager
npx puppeteer browsers install chrome
```

## Usage

```bash
npm run canary:sign-in
npm run canary:create-account
npm run canary:sign-in-ipv
```

SSO login is handled automatically — if your session has expired, it will prompt you.

### Targeting a different environment

Set `CANARY_NAME` to match the SSM parameter prefix:

```bash
# authdev3 (default)
npm run canary:sign-in

# dev
CANARY_NAME=dev-smoke-in npm run canary:sign-in

# staging (different AWS account)
AWS_PROFILE=di-authentication-staging-AdministratorAccessPermission CANARY_NAME=staging-smoke-in npm run canary:sign-in
```

The `CANARY_NAME` must match the SSM parameter prefix in that environment
(e.g. `staging-smoke-in-username`, `staging-smoke-in-password`, etc.).

## How It Works

1. `local-testing/run.js` checks AWS credentials (triggers SSO login if expired)
2. Mocks the `Synthetics` and `SyntheticsLogger` modules
3. Launches a local Puppeteer/Chrome browser (ARM64-native on Apple Silicon)
4. Requires your canary handler (e.g. `src/canary-sign-in.js`) and calls `handler()`
5. The canary runs against the real environment using real SSM parameters

## Limitations

- No screenshots uploaded to S3 (could be added)
- No CloudWatch metrics published
- No HAR file capture
- Not identical to the Lambda runtime (different Chrome version, no VPC)

These are fine for development iteration. Use the deployed canary for production-accurate testing.

## Troubleshooting

| Problem                 | Solution                                         |
| ----------------------- | ------------------------------------------------ |
| Expired credentials     | Handled automatically; will prompt for SSO login |
| SSM parameter not found | Check `CANARY_NAME` matches deployed SSM params  |
| Chrome not found        | `npx puppeteer browsers install chrome`          |
| Wrong environment       | Set `CANARY_NAME` and `AWS_PROFILE` env vars     |
