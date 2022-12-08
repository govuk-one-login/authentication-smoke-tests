
resource "aws_cloudwatch_metric_alarm" "smoke_tester_metric_alarm_p1" {
  count               = var.environment == "production" ? 0 : 1
  alarm_name          = "${local.smoke_tester_name}-metric-alarm_p1"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Failed"
  namespace           = "CloudWatchSynthetics"
  period              = "600"
  statistic           = "Sum"
  threshold           = "3"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CanaryName = aws_synthetics_canary.smoke_tester_canary[0].name
  }

  alarm_description = "GOV.UK Sign in - ${local.smoke_tester_name} (create account smoke test) P1 alarm"
  alarm_actions     = [var.environment == "production" ? var.sns_topic_pagerduty_p1_alerts_arn : var.sns_topic_slack_alerts_arn]
  ok_actions        = [var.environment == "production" ? var.sns_topic_pagerduty_p1_alerts_arn : var.sns_topic_slack_alerts_arn]
}

resource "aws_cloudwatch_metric_alarm" "smoke_tester_metric_alarm_p2" {
  count               = var.environment == "production" ? 0 : 1
  alarm_name          = "${local.smoke_tester_name}-metric-alarm_p2"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "3"
  metric_name         = "Failed"
  namespace           = "CloudWatchSynthetics"
  period              = "600"
  statistic           = "Sum"
  threshold           = "5"
  treat_missing_data  = "notBreaching"

  dimensions = {
    CanaryName = aws_synthetics_canary.smoke_tester_canary[0].name
  }

  alarm_description = "GOV.UK Sign in - ${local.smoke_tester_name} (create account smoke test) P2 alarm"
  alarm_actions     = [var.environment == "production" ? var.sns_topic_pagerduty_p2_alerts_arn : var.sns_topic_slack_alerts_arn]
  ok_actions        = [var.environment == "production" ? var.sns_topic_pagerduty_p2_alerts_arn : var.sns_topic_slack_alerts_arn]
}
