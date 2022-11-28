
resource "aws_synthetics_canary" "smoke_tester_canary" {

  count                = var.environment == "production" ? 0 : 1
  artifact_s3_location = var.artifact_s3_location

  execution_role_arn = aws_iam_role.smoke_tester_role.arn
  handler            = var.canary_handler
  name               = local.smoke_tester_name
  runtime_version    = "syn-nodejs-puppeteer-3.8"
  start_canary       = true

  s3_bucket  = var.canary_source_bucket
  s3_key     = var.canary_source_key
  s3_version = var.canary_source_version_id

  success_retention_period = 1
  failure_retention_period = 7

  run_config {
    active_tracing     = false
    memory_in_mb       = 1024
    timeout_in_seconds = 90
  }

  schedule {
    expression = "cron(${var.smoke_test_cron_expression})"
  }

  tags = local.default_tags

  depends_on = [
    aws_iam_role_policy_attachment.canary_execution,
    aws_iam_role_policy_attachment.parameter_policy,
    aws_iam_role_policy_attachment.sms_bucket_policy,
  ]
}