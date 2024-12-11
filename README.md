# di-authentication-smoke-tests

Contains source code which is run by AWS Lambdas. The live status of smoke tests can be viewed in AWS CloudWatch under Synthetics Canaries.

## Deploying to sandpit

Changes to smoke tests can be tested by deploying to the sandpit environment.
Running `./deploy-sandpit.sh` will initialise Terraform and update the sandpit smoke tests.

By default, the sandpit smoke tests will run against no backend. The values in `sandpit.tfvars` are all set to invalid values by default, so `deploy-sandpit.sh` will run out of the box. They will also not start automatically.

Using the integration credentials and backend on sandpit tests can result in occasional conflicts between sandpit and integration smoke tests
if they are scheduled to run at the same time. To prevent this, the integration cron expression is configured to run tests on the hour
(and then every three minutes), whereas the sandpit tests begin at one minute past the hour.

Currently, there are some hacks needed in order to deploy to / run in the sandpit environment:

- If running against the integration backend, put the relevant integration credentials into `sandpit.tfvars` file for the relevant smoke test. These credentials can be retrieved from AWS SSM Parameter Store. To ensure this file isn't accidentally commited, temporarily ignore the file in git with the following:

  - `git update-index --assume-unchanged [path-to-file]` to ignore
  - `git update-index --no-assume-unchanged [path-to-file]` to un-ignore

- It may be necessary to edit the variables files for each of the smoke tests:
  - set `sns_topic_slack_alerts_arn` to an empty string

## Formatting

Run formatting on the javascript files:
`$ yarn lint`
Run formatting on the terraform files:
`$ terraform fmt ./ci/terraform`
