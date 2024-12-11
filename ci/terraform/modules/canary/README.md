<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | n/a |

## Modules

No modules.

## Resources

| Name | Type |
|------|------|
| [aws_cloudwatch_event_rule.cronitor_event](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_rule) | resource |
| [aws_cloudwatch_event_target.cronitor_event_target](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_event_target) | resource |
| [aws_cloudwatch_log_group.canary_log_group](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_cloudwatch_log_subscription_filter.log_subscription](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_subscription_filter) | resource |
| [aws_cloudwatch_metric_alarm.smoke_tester_metric_alarm_p1](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_cloudwatch_metric_alarm.smoke_tester_metric_alarm_p2](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm) | resource |
| [aws_iam_policy.basic_auth_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_policy.canary_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_policy.create_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_policy.signin_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_policy.sms_bucket_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy) | resource |
| [aws_iam_role.smoke_tester_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy_attachment.basic_auth_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.canary_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.create_parameter_policy_attachment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.signin_parameter_policy_attachment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_iam_role_policy_attachment.sms_bucket_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment) | resource |
| [aws_kms_alias.parameter_store_key_alias](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_alias) | resource |
| [aws_kms_key.parameter_store_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key) | resource |
| [aws_lambda_permission.allow_cloudwatch_to_trigger_cronitor_lambda](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambda_permission) | resource |
| [aws_ssm_parameter.basic_auth_password](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.basic_auth_username](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.client_base_url](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.client_id](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.client_private_key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.fire_drill](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.issuer_base_url](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.password](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.phone](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.slack_hook_url](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.sms_bucket](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.synthetics-user-delete-path](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.test-services-api-hostname](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.test-services-api-key](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_ssm_parameter.username](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/ssm_parameter) | resource |
| [aws_synthetics_canary.smoke_tester_canary](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/synthetics_canary) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_policy_document.basic_auth_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.canary_execution](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.create_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.key_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.lambda_can_assume_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.signin_parameter_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_iam_policy_document.sms_bucket_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_lambda_function.cronitor_ping_lambda](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/lambda_function) | data source |
| [aws_partition.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/partition) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_artefact_bucket_arn"></a> [artefact\_bucket\_arn](#input\_artefact\_bucket\_arn) | n/a | `string` | n/a | yes |
| <a name="input_artifact_s3_location"></a> [artifact\_s3\_location](#input\_artifact\_s3\_location) | n/a | `string` | n/a | yes |
| <a name="input_basic_auth_password"></a> [basic\_auth\_password](#input\_basic\_auth\_password) | n/a | `string` | n/a | yes |
| <a name="input_basic_auth_username"></a> [basic\_auth\_username](#input\_basic\_auth\_username) | n/a | `string` | n/a | yes |
| <a name="input_canary_handler"></a> [canary\_handler](#input\_canary\_handler) | n/a | `string` | n/a | yes |
| <a name="input_canary_name"></a> [canary\_name](#input\_canary\_name) | n/a | `string` | n/a | yes |
| <a name="input_canary_source_bucket"></a> [canary\_source\_bucket](#input\_canary\_source\_bucket) | n/a | `string` | n/a | yes |
| <a name="input_canary_source_key"></a> [canary\_source\_key](#input\_canary\_source\_key) | n/a | `string` | n/a | yes |
| <a name="input_canary_source_version_id"></a> [canary\_source\_version\_id](#input\_canary\_source\_version\_id) | n/a | `string` | n/a | yes |
| <a name="input_client_base_url"></a> [client\_base\_url](#input\_client\_base\_url) | n/a | `string` | n/a | yes |
| <a name="input_client_id"></a> [client\_id](#input\_client\_id) | n/a | `string` | n/a | yes |
| <a name="input_client_private_key"></a> [client\_private\_key](#input\_client\_private\_key) | n/a | `string` | n/a | yes |
| <a name="input_cloudwatch_key_arn"></a> [cloudwatch\_key\_arn](#input\_cloudwatch\_key\_arn) | The ARN of the KMS key to use log encryption | `string` | n/a | yes |
| <a name="input_cloudwatch_log_retention"></a> [cloudwatch\_log\_retention](#input\_cloudwatch\_log\_retention) | The number of days to retain Cloudwatch logs for | `number` | n/a | yes |
| <a name="input_create_account_smoke_test"></a> [create\_account\_smoke\_test](#input\_create\_account\_smoke\_test) | n/a | `bool` | n/a | yes |
| <a name="input_environment"></a> [environment](#input\_environment) | n/a | `string` | n/a | yes |
| <a name="input_heartbeat_ping_enabled"></a> [heartbeat\_ping\_enabled](#input\_heartbeat\_ping\_enabled) | n/a | `bool` | n/a | yes |
| <a name="input_issuer_base_url"></a> [issuer\_base\_url](#input\_issuer\_base\_url) | n/a | `string` | n/a | yes |
| <a name="input_metric_alarms_enabled"></a> [metric\_alarms\_enabled](#input\_metric\_alarms\_enabled) | n/a | `bool` | n/a | yes |
| <a name="input_phone"></a> [phone](#input\_phone) | n/a | `string` | n/a | yes |
| <a name="input_runtime_version"></a> [runtime\_version](#input\_runtime\_version) | n/a | `string` | n/a | yes |
| <a name="input_slack_hook_uri"></a> [slack\_hook\_uri](#input\_slack\_hook\_uri) | n/a | `string` | n/a | yes |
| <a name="input_smoke_test_cron_expression"></a> [smoke\_test\_cron\_expression](#input\_smoke\_test\_cron\_expression) | n/a | `string` | n/a | yes |
| <a name="input_sms_bucket_name"></a> [sms\_bucket\_name](#input\_sms\_bucket\_name) | n/a | `string` | n/a | yes |
| <a name="input_sms_bucket_name_arn"></a> [sms\_bucket\_name\_arn](#input\_sms\_bucket\_name\_arn) | n/a | `string` | n/a | yes |
| <a name="input_sns_topic_pagerduty_p1_alerts_arn"></a> [sns\_topic\_pagerduty\_p1\_alerts\_arn](#input\_sns\_topic\_pagerduty\_p1\_alerts\_arn) | n/a | `string` | n/a | yes |
| <a name="input_sns_topic_pagerduty_p2_alerts_arn"></a> [sns\_topic\_pagerduty\_p2\_alerts\_arn](#input\_sns\_topic\_pagerduty\_p2\_alerts\_arn) | n/a | `string` | n/a | yes |
| <a name="input_sns_topic_slack_alerts_arn"></a> [sns\_topic\_slack\_alerts\_arn](#input\_sns\_topic\_slack\_alerts\_arn) | n/a | `string` | n/a | yes |
| <a name="input_username"></a> [username](#input\_username) | n/a | `string` | n/a | yes |
| <a name="input_fire_drill"></a> [fire\_drill](#input\_fire\_drill) | n/a | `string` | `"0"` | no |
| <a name="input_logging_endpoint_arns"></a> [logging\_endpoint\_arns](#input\_logging\_endpoint\_arns) | Amazon Resource Name (ARN) for the CSLS endpoints to ship logs to | `list(string)` | `[]` | no |
| <a name="input_password"></a> [password](#input\_password) | n/a | `string` | `null` | no |
| <a name="input_start_canary"></a> [start\_canary](#input\_start\_canary) | n/a | `bool` | `true` | no |
| <a name="input_synthetics_user_delete_path"></a> [synthetics\_user\_delete\_path](#input\_synthetics\_user\_delete\_path) | n/a | `string` | `null` | no |
| <a name="input_test_services_api_hostname"></a> [test\_services\_api\_hostname](#input\_test\_services\_api\_hostname) | n/a | `string` | `null` | no |
| <a name="input_test_services_api_key"></a> [test\_services\_api\_key](#input\_test\_services\_api\_key) | n/a | `string` | `null` | no |

## Outputs

No outputs.
<!-- END_TF_DOCS -->
