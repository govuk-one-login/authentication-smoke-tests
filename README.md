# di-authentication-smoke-tests

Contains source code which is run by AWS Lambdas. The live status of smoke tests can be viewed in AWS CloudWatch under Synthetics Canaries.

## Deploying to Dev

Changes to smoke tests can be tested by deploying to the Dev environment.
Running `./scripts/sam-deploy-dev.sh` will trigger a GHA workflow on current checkout branch ( build-and-deploy-dev-sp.yml) and the GHA workflow trigger's codepipeline dev-smoke-test-pipeline

## Formatting

Run formatting on the javascript files:
`$ yarn lint`
