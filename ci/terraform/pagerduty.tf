
resource "aws_sns_topic" "pagerduty_p1_alerts" {
  name = "${var.environment}-pagerduty-p1-alerts"
}

resource "aws_sns_topic" "pagerduty_p2_alerts" {
  name = "${var.environment}-pagerduty-p2-alerts"
}

data "aws_iam_policy_document" "pagerduty_alerts_policy_document" {
  version   = "2012-10-17"
  policy_id = "${var.environment}-pagerduty-alerts-sns-topic-policy"

  statement {
    effect = "Allow"
    sid    = "GivePagerDutyAlertsSnsTopicPolicyPublish"
    actions = [
      "SNS:Publish",
      "SNS:RemovePermission",
      "SNS:SetTopicAttributes",
      "SNS:DeleteTopic",
      "SNS:ListSubscriptionsByTopic",
      "SNS:GetTopicAttributes",
      "SNS:Receive",
      "SNS:AddPermission",
      "SNS:Subscribe"
    ]
    resources = [aws_sns_topic.pagerduty_p1_alerts.arn, aws_sns_topic.pagerduty_p2_alerts.arn]
  }
}

resource "aws_sns_topic_subscription" "pagerduty_p1_alerts_topic_subscription" {
  count     = var.environment == "production" ? 1 : 0
  topic_arn = aws_sns_topic.pagerduty_p1_alerts.arn
  protocol  = "https"
  endpoint  = var.pagerduty_p1_alerts_endpoint
}

resource "aws_sns_topic_subscription" "pagerduty_p2_alerts_topic_subscription" {
  count     = var.environment == "production" ? 1 : 0
  topic_arn = aws_sns_topic.pagerduty_p2_alerts.arn
  protocol  = "https"
  endpoint  = var.pagerduty_p2_alerts_endpoint
}
