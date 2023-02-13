
resource "aws_synthetics_canary" "smoke_tester_canary" {
  count                = 1
  artifact_s3_location = var.artifact_s3_location

  execution_role_arn = aws_iam_role.smoke_tester_role[0].arn
  handler            = var.canary_handler
  name               = local.smoke_tester_name
  runtime_version    = "syn-nodejs-puppeteer-3.9"
  start_canary       = true

  s3_bucket  = var.canary_source_bucket
  s3_key     = var.canary_source_key
  s3_version = var.canary_source_version_id

  success_retention_period = 1
  failure_retention_period = 7

  run_config {
    active_tracing     = false
    memory_in_mb       = 1024
    timeout_in_seconds = 60
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

resource "aws_cloudwatch_log_group" "canary_log_group" {
  count = var.environment == "production" ? 0 : 1

  name              = "/aws/lambda/cwsyn-${aws_synthetics_canary.smoke_tester_canary[0].name}"
  tags              = local.default_tags
  kms_key_id        = var.cloudwatch_key_arn
  retention_in_days = var.cloudwatch_log_retention

  depends_on = [
    aws_synthetics_canary.smoke_tester_canary
  ]
}

resource "aws_cloudwatch_log_subscription_filter" "log_subscription" {
  count           = var.environment == "production" ? 0 : length(var.logging_endpoint_arns)
  name            = "${aws_synthetics_canary.smoke_tester_canary[0].name}-log-subscription-${count.index}"
  log_group_name  = aws_cloudwatch_log_group.canary_log_group[0].name
  filter_pattern  = ""
  destination_arn = var.logging_endpoint_arns[count.index]

  lifecycle {
    create_before_destroy = false
  }
}