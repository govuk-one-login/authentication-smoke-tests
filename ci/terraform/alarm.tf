
resource "aws_cloudwatch_metric_alarm" "smoke_tester_metric_alarm_p1" {
  alarm_name          =  "${local.smoke_tester_name}-metric-alarm_p1"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Failed"
  namespace           = "CloudWatchSynthetics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "2"

  dimensions = {
    CanaryName = aws_synthetics_canary.smoke_tester.name
  }

  alarm_description = "Monitor smoke-tester P1 failures"
  alarm_actions     = [aws_sns_topic.pagerduty_p1_alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "smoke_tester_metric_alarm_p2" {
  alarm_name          =  "${local.smoke_tester_name}-metric-alarm_p2"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "1"
  metric_name         = "Failed"
  namespace           = "CloudWatchSynthetics"
  period              = "300"
  statistic           = "Sum"
  threshold           = "2"

  dimensions = {
    CanaryName = aws_synthetics_canary.smoke_tester.name
  }

  alarm_description = "Monitor smoke-tester P2 failures"
  alarm_actions     = [aws_sns_topic.pagerduty_p2_alerts.arn]
}