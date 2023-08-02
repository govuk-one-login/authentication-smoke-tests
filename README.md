# di-authentication-smoke-tests

Contains source code which is run by AWS Lambdas. The live status of smoke tests can be viewed in AWS CloudWatch under Synthetics Canaries.

## Deploying to sandpit

Changes to smoke tests can be tested by deploying to the sandpit environment.
Running `./deploy-sandpit.sh` will initialise Terraform and update the sandpit smoke tests.

Note that currently the sandpit smoke tests are set up to run against the integration backend. This is because
the set-up to run against the build backend is somewhat complex. This should be fixable in future.

Using the integration credentials and backend on sandpit tests can result in occasional conflicts between sandpit and integration smoke tests
if they are scheduled to run at the same time. To prevent this, the integration cron expression is configured to run tests on the hour
(and then every three minutes), whereas the sandpit tests begin at one minute past the hour.

Currently, there are some hacks needed in order to deploy to / run in the sandpit environment:
- If running against the integration backend, put the relevant integration credentials into the terraform .tfvars file for the relevant smoke test. These credentials can be retrieved from AWS SSM Parameter Store. To ensure this file isn't accidentally commited, temporarily ignore the file in git with the following:
  - `git update-index --assume-unchanged [path-to-file]` to ignore
  - `git update-index --no-assume-unchanged [path-to-file]` to un-ignore
- Due to some issues with gds-cli, in order to run deploy-sandpit.sh it may be necessary to comment out the line
  `eval $(gds aws digital-identity-dev -e)` and manually set short-term AWS credentials.
  To do this go to [AWS Start](https://uk-digital-identity.awsapps.com/start#/) > Command line or programmatic access.
- It may be necessary to comment out / remove the following .tf files:
  - heartbeat.tf
  - alerts.tf
- It may be necessary to edit the variables files for each of the smoke tests:
  - set `sns_topic_slack_alerts_arn` to an empty string
  - Comment out or remove the following lines:
```
depends_on = [
    aws_lambda_function.cronitor_ping_lambda
]
   ```

## Formatting

Run formatting on the javascript files:
`$ yarn lint`
Run formatting on the terraform files:
`$ terraform fmt ./ci/terraform`
