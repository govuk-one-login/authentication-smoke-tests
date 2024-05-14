module "canary_sign_in" {
  source               = "./modules/canary"
  environment          = var.environment
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  artefact_bucket_arn  = aws_s3_bucket.smoketest_artefact_bucket.arn

  slack_hook_uri      = var.slack_hook_uri
  sms_bucket_name     = var.use_integration_env_for_sign_in_journey ? "integration-smoke-test-sms-codes" : local.sms_bucket_name
  sms_bucket_name_arn = var.use_integration_env_for_sign_in_journey ? "arn:aws:s3:::integration-smoke-test-sms-codes" : local.sms_bucket_name_arn

  canary_handler = "canary-sign-in.handler"
  canary_name    = "smoke-in"

  canary_source_bucket     = aws_s3_object.canary_source.bucket
  canary_source_key        = aws_s3_object.canary_source.key
  canary_source_version_id = aws_s3_object.canary_source.version_id

  sns_topic_pagerduty_p1_alerts_arn = aws_sns_topic.pagerduty_p1_alerts.arn
  sns_topic_pagerduty_p2_alerts_arn = aws_sns_topic.pagerduty_p2_alerts.arn
  sns_topic_slack_alerts_arn        = data.aws_sns_topic.slack_events.arn
  create_account_smoke_test         = false
  metric_alarms_enabled             = var.sign_in_metric_alarm_enabled
  heartbeat_ping_enabled            = var.sign_in_heartbeat_ping_enabled

  username            = var.sign_in_smoke_test_username
  password            = var.use_integration_env_for_sign_in_journey ? var.integration_password : var.password
  phone               = var.sign_in_smoke_test_phone
  basic_auth_username = var.use_integration_env_for_sign_in_journey ? var.integration_basic_auth_username : var.basic_auth_username
  basic_auth_password = var.use_integration_env_for_sign_in_journey ? var.integration_basic_auth_password : var.basic_auth_password
  client_id           = random_string.stub_rp_client_id[0].result
  client_base_url     = var.client_base_url
  client_private_key  = tls_private_key.stub_rp_client_private_key[0].private_key_pem
  issuer_base_url     = var.use_integration_env_for_sign_in_journey ? var.integration_issuer_base_url : var.issuer_base_url

  smoke_test_cron_expression = var.smoke_test_cron_expression

  cloudwatch_key_arn       = data.terraform_remote_state.shared.outputs.cloudwatch_encryption_key_arn
  cloudwatch_log_retention = 30
  logging_endpoint_arns    = var.logging_endpoint_arns
  runtime_version          = var.runtime_version

  depends_on = [
    aws_lambda_function.cronitor_ping_lambda
  ]
}
