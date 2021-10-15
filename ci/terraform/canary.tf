data "aws_iam_policy_document" "lambda_can_assume_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    principals {
      identifiers = [
        "lambda.amazonaws.com"
      ]
      type = "Service"
    }

    actions = [
      "sts:AssumeRole"
    ]
  }
}

data "aws_iam_policy_document" "canary_execution" {
  statement {
    sid = "AllTheStuff"
    
    actions = [
      "s3:PutObject",
      "s3:GetBucketLocation",
      "s3:ListAllMyBuckets",
      "cloudwatch:PutMetricData",
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "smoke_tester_role" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name = "${var.environment}-smoke-tester-canary-execution-role"
}

resource "aws_iam_policy" "canary_policy" {
  policy = data.aws_iam_policy_document.canary_execution.json
  name_prefix = "${var.environment}-canary-execution-policy"
}

resource "aws_iam_role_policy_attachment" "canary_policy" {
  policy_arn = aws_iam_policy.canary_policy.arn
  role = aws_iam_role.smoke_tester_role.name
}

resource "aws_synthetics_canary" "smoke_tester" {
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  execution_role_arn   = aws_iam_role.smoke_tester_role.arn
  handler              = "canary.handler"
  name                 = "${var.environment}-smoke-test"
  runtime_version      = "syn-nodejs-puppeteer-3.2"
  zip_file = var.smoke_test_lambda_zip_file
  start_canary = true

  schedule {
    expression = "rate(5 minutes)"
  }

  tags = local.default_tags
}