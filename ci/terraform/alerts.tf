locals {
  alerts_lambda_name = "${var.environment}-alerts"
}

resource "aws_cloudwatch_log_group" "alerts_lambda_log_group" {
  name              = "/aws/lambda/${local.alerts_lambda_name}"
  kms_key_id        = data.terraform_remote_state.shared.outputs.cloudwatch_encryption_key_arn
  retention_in_days = 1

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
  function_name    = local.alerts_lambda_name
  filename         = var.alerts_lambda_zip_file
  source_code_hash = filebase64sha256(var.alerts_lambda_zip_file)

  role        = aws_iam_role.alerts_execution.arn
  handler     = "alerts.handler"
  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      DEPLOY_ENVIRONMENT = var.environment
    }
  }

  runtime = "nodejs14.x"

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
