
module "canary_create_account" {
  source               = "./modules/canary"
  count                = 1
  environment          = var.environment
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  artefact_bucket_arn  = aws_s3_bucket.smoketest_artefact_bucket.arn

  slack_hook_uri      = var.slack_hook_uri
  sms_bucket_name     = local.sms_bucket_name
  sms_bucket_name_arn = local.sms_bucket_name_arn

  canary_handler = "canary-create-account.handler"
  canary_name    = "smoke-cra"

  canary_source_bucket     = aws_s3_bucket_object.canary_source.bucket
  canary_source_key        = aws_s3_bucket_object.canary_source.key
  canary_source_version_id = aws_s3_bucket_object.canary_source.version_id

  sns_topic_pagerduty_p1_alerts_arn = aws_sns_topic.pagerduty_p1_alerts.arn
  sns_topic_pagerduty_p2_alerts_arn = aws_sns_topic.pagerduty_p2_alerts.arn
  sns_topic_slack_alerts_arn        = ""
  create_account_smoke_test         = true
  metric_alarms_enabled             = var.create_account_metric_alarm_enabled
  heartbeat_ping_enabled            = var.create_account_heartbeat_ping_enabled

  test-services-api-key       = var.test-services-api-key
  test-services-api-hostname  = var.test-services-api-hostname
  synthetics-user-delete-path = var.synthetics-user-delete-path
  username                    = var.username_create_account
  phone                       = var.phone_create_account
  basic_auth_username         = var.basic_auth_username
  basic_auth_password         = var.basic_auth_password
  client_id                   = random_string.stub_rp_client_id[0].result
  client_base_url             = var.client_base_url
  client_private_key          = tls_private_key.stub_rp_client_private_key[0].private_key_pem
  issuer_base_url             = var.issuer_base_url

  # the test will run Mon-Fri, between 0800-1700 (UTC) every 3 minutes
  smoke_test_cron_expression = "0/03 08-17 ? * MON-FRI *"
  start_canary               = false

  cloudwatch_key_arn       = data.terraform_remote_state.shared.outputs.cloudwatch_encryption_key_arn
  cloudwatch_log_retention = 1
  logging_endpoint_arns    = var.logging_endpoint_arns
#
#  depends_on = [
#    aws_lambda_function.cronitor_ping_lambda
#  ]
}