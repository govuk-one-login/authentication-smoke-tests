
resource "aws_sns_topic" "pagerduty_p1_alerts" {
  name = "${var.environment}-pagerduty-p1-alerts"
  tags = local.default_tags
}

resource "aws_sns_topic" "pagerduty_p2_alerts" {
  name = "${var.environment}-pagerduty-p2-alerts"
  tags = local.default_tags
}

resource "aws_sns_topic" "pagerduty_cronitor_alerts" {
  name = "${var.environment}-pagerduty-cronitor-alerts"
  tags = local.default_tags
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
    resources = [aws_sns_topic.pagerduty_p1_alerts.arn, aws_sns_topic.pagerduty_p2_alerts.arn, aws_sns_topic.pagerduty_cronitor_alerts.arn]
  }
}

resource "aws_sns_topic_subscription" "pagerduty_p1_alerts_topic_subscription" {
  topic_arn = aws_sns_topic.pagerduty_p1_alerts.arn
  protocol  = "https"
  endpoint  = var.pagerduty_p1_alerts_endpoint
}

resource "aws_sns_topic_subscription" "pagerduty_p2_alerts_topic_subscription" {
  topic_arn = aws_sns_topic.pagerduty_p2_alerts.arn
  protocol  = "https"
  endpoint  = var.pagerduty_p2_alerts_endpoint
}

resource "aws_sns_topic_subscription" "pagerduty_cronitor_alerts_topic_subscription" {
  topic_arn = aws_sns_topic.pagerduty_cronitor_alerts.arn
  protocol  = "https"
  endpoint  = var.pagerduty_cronitor_alerts_endpoint
}

resource "aws_cloudwatch_event_rule" "pagerduty_cronitor_alerts_event_rule" {
  name       = "${var.environment}-pagerduty-cronitor-alerts-event-rule"
  is_enabled = true
  event_pattern = jsonencode({
    "source" = [
      "aws.synthetics"
    ],
    "detail-type" = [
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

resource "aws_cloudwatch_event_target" "pagerduty_cronitor_alerts_event_target" {
  arn  = aws_sns_topic.pagerduty_cronitor_alerts.arn
  rule = aws_cloudwatch_event_rule.pagerduty_cronitor_alerts_event_rule.name
}
