# Local Canary Testing

Run Synthetics canaries locally on your Mac without Docker or the Lambda layer.

Uses a local Puppeteer browser with mocked Synthetics modules — the canary code
makes real AWS calls (SSM, S3, Secrets Manager) against a real environment.

## Prerequisites

1. Node.js 22+
2. AWS credentials configured for the target environment

### AWS profiles by environment

| Environment | AWS Profile                                                   |
| ----------- | ------------------------------------------------------------- |
| authdev3    | `di-authentication-development-AdministratorAccessPermission` |
| staging     | `di-authentication-staging-ApprovedAdmin`                     |

> **Staging access:** The staging profile requires a TEAM request. Once the request is
> approved, run `authentication-api/scripts/set-up-sso.sh` to configure the profile locally.

## Setup

```bash
npm install --save-dev puppeteer @aws-sdk/client-secrets-manager
npx puppeteer browsers install chrome
```

## Usage

Scripts are namespaced by environment:

### authdev3

```bash
npm run canary:sign-in:authdev3
npm run canary:create-account:authdev3
npm run canary:sign-in-ipv:authdev3
```

### staging

```bash
npm run canary:sign-in:staging
npm run canary:create-account:staging
npm run canary:sign-in-ipv:staging
```

SSO login is handled automatically — if your session has expired, it will prompt you.

### Environment variables

Each script sets the following environment variables:

| Variable             | Description                                     |
| -------------------- | ----------------------------------------------- |
| `DEPLOY_ENVIRONMENT` | Target environment (e.g. `authdev3`, `staging`) |
| `CANARY_NAME`        | Canary identifier, matches SSM parameter prefix |
| `AWS_PROFILE`        | AWS SSO profile for the target account          |
| `AWS_REGION`         | AWS region (`eu-west-2`)                        |

### Targeting a different environment manually

Override the env vars directly:

```bash
DEPLOY_ENVIRONMENT=integration CANARY_NAME=integration-smoke-in AWS_PROFILE=di-authentication-integration-AdministratorAccessPermission AWS_REGION=eu-west-2 node local-testing/run.js canary-sign-in
```

The `CANARY_NAME` must match the SSM parameter prefix in that environment
(e.g. `staging-smoke-in-username`, `staging-smoke-in-password`, etc.).

## IPV canary behaviour

The `canary-sign-in-with-ipv` canary is environment-aware:

- **staging, integration, production** — asserts the IPV hand-off page loads
- **dev, build, authdev3** — completes the sign-in flow and returns success without asserting IPV (IPV is not available in these environments)

The canary still requests P2 confidence level (`vtr: '["P2.Cl.Cm"]'`) in all environments.

## How It Works

1. `local-testing/run.js` checks AWS credentials (triggers SSO login if expired)
2. Mocks the `Synthetics` and `SyntheticsLogger` modules
3. Launches a local Puppeteer/Chrome browser (ARM64-native on Apple Silicon)
4. Requires your canary handler (e.g. `src/canary-sign-in.js`) and calls `handler()`
5. The canary runs against the real environment using real SSM parameters and Secrets Manager

## Limitations

- No screenshots uploaded to S3 (could be added)
- No CloudWatch metrics published
- No HAR file capture
- Not identical to the Lambda runtime (different Chrome version, no VPC)

These are fine for development iteration. Use the deployed canary for production-accurate testing.

## Troubleshooting

| Problem                      | Solution                                                    |
| ---------------------------- | ----------------------------------------------------------- |
| Expired credentials          | Handled automatically; will prompt for SSO login            |
| SSM parameter not found      | Check `CANARY_NAME` matches deployed SSM params             |
| Chrome not found             | `npx puppeteer browsers install chrome`                     |
| Wrong environment            | Use the correct `:env` suffixed script or set vars manually |
| `DEPLOY_ENVIRONMENT` not set | Use the npm scripts which set this automatically            |
