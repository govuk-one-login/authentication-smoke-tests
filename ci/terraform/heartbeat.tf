locals {
  cronitor_lambda_name = "${var.environment}-cronitor-ping"
}

resource "aws_cloudwatch_log_group" "cronitor_lambda_log_group" {
  name              = "/aws/lambda/${local.cronitor_lambda_name}"
  kms_key_id        = data.terraform_remote_state.shared.outputs.cloudwatch_encryption_key_arn
  retention_in_days = 30
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

  s3_bucket         = var.heartbeat_lambda_zip_file == "" ? var.code_s3_bucket : aws_s3_object.heartbeat_source[0].bucket
  s3_key            = var.heartbeat_lambda_zip_file == "" ? var.heartbeat_code_s3_key : aws_s3_object.heartbeat_source[0].key
  s3_object_version = var.heartbeat_lambda_zip_file == "" ? null : aws_s3_object.heartbeat_source[0].version_id

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

  runtime = "nodejs20.x"
}
