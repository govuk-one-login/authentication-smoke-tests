# di-authentication-smoke-tests

Contains source code which is run by AWS Lambdas. The live status of smoke tests can be viewed in AWS CloudWatch under Synthetics Canaries.

## Deploying to Dev

Changes to smoke tests can be tested by deploying to the Dev environment.
Running `./scripts/sam-deploy-dev.sh` will trigger a GHA workflow on current checkout branch ( build-and-deploy-dev-sp.yml) and the GHA workflow trigger's codepipeline dev-smoke-test-pipeline

## Deploying to authdev3 ( Orch integrated dev env)

Changes to smoke tests can be tested by deploying to the Authdev3 environment.
Running `./sam-deploy-authdev3.sh` will trigger a local SAM deploy on current checkout branch , it will update the cloudformation stack authdev3-smoke-test-canary in eu-west-2

## Formatting

Run formatting on the javascript files:
`$ npm run lint`

## Configuring the Passkey Smoke Test

The passkey smoke test (`canary-sign-in-with-passkey`) uses a Chrome DevTools Protocol virtual authenticator with a pre-loaded credential. Before the canary can run, you need to create the smoke test user, generate a credential, and store it in both Secrets Manager (for the virtual authenticator) and DynamoDB (so the backend recognises it).

### Prerequisites

- `openssl`, `jq`, and `argon2` installed locally
- AWS credentials for both the account containing the secrets and the account containing DynamoDB tables
- The RP ID for the target environment (e.g. `authdev3.dev.account.gov.uk`)

### Steps

1. **Create the smoke test user (auth-app MFA):** (run with credentials for the account containing the DynamoDB tables)

   ```bash
   ./scripts/create-smoke-test-users.sh auth-app \
     --email <USER_EMAIL> \
     --password '<PASSWORD>' \
     --auth-app-secret <TOTP_SECRET> \
     -e <ENV>
   ```

   This creates the user-profile and user-credentials items in DynamoDB.

2. **Generate the passkey credential:**

   ```bash
   ./scripts/generate-passkey-credential.sh \
     --rp-id <RP_ID> \
     --public-subject-id <USER_PUBLIC_SUBJECT_ID> \
     --output-dir ./output
   ```

   This produces two files:
   - `output/dynamo-item.json` — the passkey record for DynamoDB
   - `output/secrets-values.json` — credential ID, private key, RP ID, and user handle for Secrets Manager

3. **Store DynamoDB item** (run with credentials for the account containing the authenticator table):

   ```bash
   ./scripts/store-passkey-dynamo-item.sh \
     --environment <ENV> \
     --input-dir ./output
   ```

   Use `--table-name` if the table doesn't follow the default `<environment>-authenticator` naming convention.

4. **Store passkey secrets** (run with credentials for the account containing Secrets Manager):

   ```bash
   ./scripts/store-passkey-secrets.sh \
     --environment <ENV> \
     --input-dir ./output
   ```

   This stores the credential values in Secrets Manager. CloudFormation resolves them into SSM parameters at deploy time, so redeploy the stack after running this.

   ```

   ```

### Creating an SMS MFA user

For smoke tests that use SMS MFA:

```bash
./scripts/create-smoke-test-users.sh sms \
  --email <USER_EMAIL> \
  --password '<PASSWORD>' \
  --phone <PHONE_NUMBER> \
  -e <ENV>
```

### RP IDs by environment

| Environment | RP ID                       |
| ----------- | --------------------------- |
| authdev1    | authdev1.dev.account.gov.uk |
| authdev2    | authdev2.dev.account.gov.uk |
| authdev3    | authdev3.dev.account.gov.uk |
| dev         | dev.account.gov.uk          |
| build       | build.account.gov.uk        |
| staging     | staging.account.gov.uk      |
| integration | integration.account.gov.uk  |
| production  | account.gov.uk              |

### How it works

- The store script writes credential values to Secrets Manager.
- CloudFormation resolves the secrets into SSM parameters via `{{resolve:secretsmanager:...}}` on each deploy.
- At runtime, the canary reads the credential from SSM and loads it into a virtual authenticator via `WebAuthn.addCredential`.
- The corresponding public key in DynamoDB allows the backend to verify the assertion.

### Rotating the credential

To rotate, simply re-run steps 2–4 above and then redeploy the stack. The generate script produces a new key pair, the store scripts update Secrets Manager and DynamoDB, and the next deploy resolves the new values into SSM.
