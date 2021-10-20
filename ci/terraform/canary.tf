resource "aws_iam_role" "smoke_tester_role" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-smoke-tester-canary-execution-role"
}

resource "aws_iam_role_policy_attachment" "canary_execution" {
  policy_arn = aws_iam_policy.canary_execution.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_iam_role_policy_attachment" "sms_bucket_policy" {
  policy_arn = aws_iam_policy.sms_bucket_policy.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_iam_role_policy_attachment" "parameter_policy" {
  policy_arn = aws_iam_policy.parameter_policy.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_synthetics_canary" "smoke_tester" {
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  execution_role_arn   = aws_iam_role.smoke_tester_role.arn
  handler              = "canary.handler"
  name                 = local.smoke_tester_name
  runtime_version      = "syn-nodejs-puppeteer-3.3"
  start_canary         = true

  s3_bucket  = aws_s3_bucket_object.canary_source.bucket
  s3_key     = aws_s3_bucket_object.canary_source.key
  s3_version = aws_s3_bucket_object.canary_source.version_id

  success_retention_period = 1
  failure_retention_period = 7

  run_config {
    active_tracing     = false
    memory_in_mb       = 1024
    timeout_in_seconds = 90
  }

  schedule {
    expression = "rate(${var.smoke_test_rate_minutes} minutes)"
  }

  tags = local.default_tags

  depends_on = [
    aws_iam_role_policy_attachment.canary_execution,
    aws_iam_role_policy_attachment.parameter_policy,
    aws_iam_role_policy_attachment.sms_bucket_policy,
  ]
}