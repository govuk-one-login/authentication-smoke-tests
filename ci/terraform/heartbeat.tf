locals {
  cronitor_lambda_name = "${var.environment}-cronitor-ping"
}

resource "aws_cloudwatch_log_group" "cronitor_lambda_log_group" {
  name              = "/aws/lambda/${local.cronitor_lambda_name}"
  kms_key_id        = data.terraform_remote_state.shared.outputs.cloudwatch_encryption_key_arn
  retention_in_days = 1

  tags = local.default_tags
}

data "aws_iam_policy_document" "cronitor_execution" {
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

resource "aws_iam_policy" "cronitor_execution" {
  policy      = data.aws_iam_policy_document.cronitor_execution.json
  name_prefix = "${var.environment}-cronitor-execution-policy"
}

resource "aws_iam_role" "cronitor_execution" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-cronitor-execution-role"
}

resource "aws_iam_role_policy_attachment" "cronitor_execution" {
  policy_arn = aws_iam_policy.cronitor_execution.arn
  role       = aws_iam_role.cronitor_execution.name
}

resource "aws_lambda_function" "cronitor_ping_lambda" {
  function_name = local.cronitor_lambda_name

  s3_bucket = var.code_s3_bucket
  s3_key    = var.heartbeat_code_s3_key

  role        = aws_iam_role.cronitor_execution.arn
  handler     = "heartbeat.handler"
  timeout     = 30
  memory_size = 512

  environment {
    variables = {
      CRONITOR_API_KEY     = var.cronitor_api_key
      CRONITOR_MONITOR_KEY = var.cronitor_monitor_key
    }
  }

  runtime = "nodejs14.x"

  tags = local.default_tags
}
