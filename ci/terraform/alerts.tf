locals {
  alerts_lambda_name = "${var.environment}-alerts"
}

resource "aws_cloudwatch_log_group" "alerts_lambda_log_group" {
  name              = "/aws/lambda/${local.alerts_lambda_name}"
  kms_key_id        = data.terraform_remote_state.shared.outputs.cloudwatch_encryption_key_arn
  retention_in_days = 7

  tags = local.default_tags
}

data "aws_iam_policy_document" "alerts_execution" {
  statement {
    sid    = "AllowLogging"
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:*:*:*",
    ]
  }
}

resource "aws_iam_policy" "alerts_execution" {
  policy      = data.aws_iam_policy_document.alerts_execution.json
  name_prefix = "${var.environment}-alerts-execution-policy"
}

resource "aws_iam_role" "alerts_execution" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-slackalerts-execution-role"
}

resource "aws_iam_role_policy_attachment" "alerts_execution" {
  policy_arn = aws_iam_policy.alerts_execution.arn
  role       = aws_iam_role.alerts_execution.name
}

resource "aws_iam_role_policy_attachment" "parameter_execution" {
  policy_arn = aws_iam_policy.parameter_policy.arn
  role       = aws_iam_role.alerts_execution.name
}

resource "aws_lambda_function" "alerts_lambda" {
  function_name = local.alerts_lambda_name

  s3_bucket         = var.alerts_lambda_zip_file == "" ? var.code_s3_bucket : aws_s3_object.alerts_source[0].bucket
  s3_key            = var.alerts_lambda_zip_file == "" ? var.alerts_code_s3_key : aws_s3_object.alerts_source[0].key
  s3_object_version = var.alerts_lambda_zip_file == "" ? null : aws_s3_object.alerts_source[0].version_id


  role        = aws_iam_role.alerts_execution.arn
  handler     = "alerts.handler"
  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      DEPLOY_ENVIRONMENT = var.environment
    }
  }

  runtime = "nodejs18.x"

  tags = local.default_tags
}

resource "aws_sns_topic_subscription" "event_stream_subscription" {
  topic_arn = data.aws_sns_topic.slack_events.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.alerts_lambda.arn
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.alerts_lambda.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = data.aws_sns_topic.slack_events.arn
}

data "aws_sns_topic" "slack_events" {
  name = "${var.environment}-slack-events"
}

resource "aws_sns_topic_subscription" "slack_alerts_stream_subscription" {
  topic_arn = data.aws_sns_topic.slack_alerts.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.alerts_lambda.arn
}

resource "aws_lambda_permission" "slack_alerts_with_sns" {
  statement_id  = "AllowExecutionFromSlackAlertsSNSTopic"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.alerts_lambda.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = data.aws_sns_topic.slack_alerts.arn
}

data "aws_sns_topic" "slack_alerts" {
  name = "${var.environment}-slack-alerts"
}
