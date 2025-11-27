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
