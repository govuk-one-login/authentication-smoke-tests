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
    sid    = "AllowS3BucketList"
    effect = "Allow"

    actions = [
      "s3:ListAllMyBuckets",
    ]

    resources = [
      "*"
    ]
  }

    statement {
      sid = "AllowS3Publishing"
      effect = "Allow"

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
    sid    = "AllowLogging"
    effect = "Allow"

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
    sid    = "AllowMetricPublishing"
    effect = "Allow"

    actions = [
      "cloudwatch:PutMetricData",
    ]

    resources = ["*"]
  }
}

resource "aws_iam_policy" "canary_execution" {
  policy      = data.aws_iam_policy_document.canary_execution.json
  name_prefix = "${var.environment}-canary-execution-policy"
}

data "aws_iam_policy_document" "sms_bucket_policy" {
  statement {
    sid    = "AllowS3ReadingAndDeleting"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:ListObjects",
    ]

    resources = [
      local.sms_bucket_name_arn,
      "${local.sms_bucket_name_arn}/*",
    ]
  }
}

resource "aws_iam_policy" "sms_bucket_policy" {
  policy      = data.aws_iam_policy_document.sms_bucket_policy.json
  name_prefix = "${var.environment}-canary-sms-bucket-policy"
}

data "aws_iam_policy_document" "parameter_policy" {
  statement {
    sid    = "AllowGetParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
    ]

    resources = [
      aws_ssm_parameter.base_url.arn,
      aws_ssm_parameter.password.arn,
      aws_ssm_parameter.phone.arn,
      aws_ssm_parameter.sms_bucket.arn,
      aws_ssm_parameter.username.arn,
    ]
  }
  statement {
    sid    = "AllowDecryptOfParameters"
    effect = "Allow"

    actions = [
      "kms:Decrypt",
    ]

    resources = [
      aws_kms_alias.parameter_store_key_alias.arn,
      aws_kms_key.parameter_store_key.arn
    ]
  }
}

resource "aws_iam_policy" "parameter_policy" {
  policy      = data.aws_iam_policy_document.parameter_policy.json
  name_prefix = "${var.environment}-parameter-store-policy"
}

resource "aws_iam_role" "smoke_tester_role" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-smoke-tester-canary-execution-role"
}

resource "aws_iam_role_policy_attachment" "canary_execution" {
  policy_arn = aws_iam_policy.canary_execution.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_iam_role_policy_attachment" "sms_bucket_policy" {
  policy_arn = aws_iam_policy.sms_bucket_policy.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_iam_role_policy_attachment" "parameter_policy" {
  policy_arn = aws_iam_policy.parameter_policy.arn
  role       = aws_iam_role.smoke_tester_role.name
}

resource "aws_synthetics_canary" "smoke_tester" {
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  execution_role_arn   = aws_iam_role.smoke_tester_role.arn
  handler              = "canary.handler"
  name                 = local.smoke_tester_name
  runtime_version      = "syn-nodejs-puppeteer-3.2"
  start_canary         = true

  s3_bucket  = aws_s3_bucket_object.canary_source.bucket
  s3_key     = aws_s3_bucket_object.canary_source.key
  s3_version = aws_s3_bucket_object.canary_source.version_id

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