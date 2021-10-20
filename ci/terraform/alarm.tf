
resource "aws_cloudwatch_metric_alarm" "smoke_tester_metric_alarm_p1" {
  alarm_name          = "${local.smoke_tester_name}-metric-alarm_p1"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Failed"
  namespace           = "CloudWatchSynthetics"
  period              = "600"
  statistic           = "Sum"
  threshold           = "3"

  dimensions = {
    CanaryName = aws_synthetics_canary.smoke_tester.name
  }

  alarm_description = "GOV.UK Sign in - ${local.smoke_tester_name} P1 failure"
  alarm_actions     = [aws_sns_topic.pagerduty_p1_alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "smoke_tester_metric_alarm_p2" {
  alarm_name          = "${local.smoke_tester_name}-metric-alarm_p2"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "3"
  metric_name         = "Failed"
  namespace           = "CloudWatchSynthetics"
  period              = "600"
  statistic           = "Sum"
  threshold           = "5"

  dimensions = {
    CanaryName = aws_synthetics_canary.smoke_tester.name
  }

  alarm_description = "GOV.UK Sign in - ${local.smoke_tester_name} P2 failure"
  alarm_actions     = [aws_sns_topic.pagerduty_p2_alerts.arn]
}