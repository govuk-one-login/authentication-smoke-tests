data "aws_lambda_function" "cronitor_ping_lambda" {
  function_name = "${var.environment}-cronitor-ping"
}

resource "aws_cloudwatch_event_rule" "cronitor_event" {
  count = var.heartbeat_ping_enabled ? 1 : 0
  name  = "${local.smoke_tester_name}-cronitor-rule"
  state = "ENABLED"
  event_pattern = jsonencode({
    "source" = [
      "aws.synthetics"
    ],
    "detail-type" = [
      "Synthetics Canary TestRun Successful",
      "Synthetics Canary TestRun Failure"
    ],
    "detail" = {
      "canary-name" : [
        local.smoke_tester_name
      ]
    }
  })

  tags = local.default_tags
}

resource "aws_cloudwatch_event_target" "cronitor_event_target" {
  count = var.heartbeat_ping_enabled ? 1 : 0
  arn   = data.aws_lambda_function.cronitor_ping_lambda.arn
  rule  = aws_cloudwatch_event_rule.cronitor_event[0].name
}

resource "aws_lambda_permission" "allow_cloudwatch_to_trigger_cronitor_lambda" {
  count               = var.heartbeat_ping_enabled ? 1 : 0
  statement_id_prefix = "AllowExecutionFromCloudWatchScheduleRule"

  action        = "lambda:InvokeFunction"
  function_name = data.aws_lambda_function.cronitor_ping_lambda.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.cronitor_event[0].arn
}
