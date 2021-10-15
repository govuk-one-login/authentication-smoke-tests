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
    sid = "AllowS3BucketList"

    actions = [
      "s3:ListAllMyBuckets",
    ]

    resources = [
      "*"
    ]
  }

  statement {
    sid = "AllowS3Publishing"

    actions = [
      "s3:PutObject",
      "s3:GetBucketLocation",
    ]

    resources = [
      aws_s3_bucket.smoketest_artefact_bucket.arn,
      "${aws_s3_bucket.smoketest_artefact_bucket.arn}/*",
    ]
  }

  statement {
    sid = "AllowLogging"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "arn:aws:logs:eu-west-2:${data.aws_region.current.id}:log-group:/aws/lambda/cwsyn-${local.smoke_tester_name}-*"
    ]
  }

  statement {
    sid = "AllowMetricPublishing"

    actions = [
      "cloudwatch:PutMetricData",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_role" "smoke_tester_role" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-smoke-tester-canary-execution-role"
}

resource "aws_iam_policy" "canary_policy" {
  policy      = data.aws_iam_policy_document.canary_execution.json
  name_prefix = "${var.environment}-canary-execution-policy"
}

resource "aws_iam_role_policy_attachment" "canary_policy" {
  policy_arn = aws_iam_policy.canary_policy.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_synthetics_canary" "smoke_tester" {
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  execution_role_arn   = aws_iam_role.smoke_tester_role.arn
  handler              = "canary.handler"
  name                 = local.smoke_tester_name
  runtime_version      = "syn-nodejs-puppeteer-3.2"
  zip_file             = var.smoke_test_lambda_zip_file
  start_canary         = true

  success_retention_period = 1
  failure_retention_period = 7

  run_config {
    active_tracing     = false
    memory_in_mb       = 1024
    timeout_in_seconds = 90
  }

  schedule {
    expression = "rate(2 minutes)"
  }

  tags = local.default_tags
}