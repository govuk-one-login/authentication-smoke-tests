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
    sid    = "AllowS3Publishing"
    effect = "Allow"

    actions = [
      "s3:PutObject",
      "s3:GetBucketLocation",
    ]

    resources = [
      var.artefact_bucket_arn,
      "${var.artefact_bucket_arn}/canary/${data.aws_region.current.id}/${var.environment}-${var.canary_name}/*",
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
      "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/cwsyn-${var.canary_name}-*",
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
  name_prefix = "${var.environment}-${var.canary_name}-canary-execution-policy"
}

data "aws_iam_policy_document" "sms_bucket_policy" {
  statement {
    sid    = "AllowS3ReadingAndDeleting"
    effect = "Allow"

    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:ListBucket",
    ]

    resources = [
      var.sms_bucket_name_arn,
      "${var.sms_bucket_name_arn}/*"
    ]
  }
}

resource "aws_iam_policy" "sms_bucket_policy" {
  policy      = data.aws_iam_policy_document.sms_bucket_policy.json
  name_prefix = "${var.environment}-${var.canary_name}-canary-sms-bucket-policy"
}

data "aws_iam_policy_document" "parameter_policy" {
  statement {
    sid    = "AllowGetParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
    ]

    resources = [
      aws_ssm_parameter.fire_drill.arn,
      aws_ssm_parameter.test-services-api-key.arn,
      aws_ssm_parameter.test-services-api-hostname.arn,
      aws_ssm_parameter.synthetics-user-delete-path.arn,
      aws_ssm_parameter.base_url.arn,
      aws_ssm_parameter.phone.arn,
      aws_ssm_parameter.ipv_smoke_test_phone.arn,
      aws_ssm_parameter.sms_bucket.arn,
      aws_ssm_parameter.username.arn,
      aws_ssm_parameter.password.arn,
      aws_ssm_parameter.slack_hook_url.arn,
      aws_ssm_parameter.client_id.arn,
      aws_ssm_parameter.client_base_url.arn,
      aws_ssm_parameter.issuer_base_url.arn,
      aws_ssm_parameter.client_private_key.arn,
      aws_ssm_parameter.id_enabled_client_base_url.arn
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

data "aws_iam_policy_document" "basic_auth_parameter_policy" {
  count = 1
  statement {
    sid    = "AllowGetParameters"
    effect = "Allow"

    actions = [
      "ssm:GetParameter",
    ]

    resources = [
      aws_ssm_parameter.basic_auth_password[0].arn,
      aws_ssm_parameter.basic_auth_username[0].arn,
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

resource "aws_iam_policy" "basic_auth_parameter_policy" {
  count       = 1
  policy      = data.aws_iam_policy_document.basic_auth_parameter_policy[0].json
  name_prefix = "${var.environment}-${var.canary_name}-basic-auth-parameter-store-policy"
}

resource "aws_iam_policy" "parameter_policy" {
  policy      = data.aws_iam_policy_document.parameter_policy.json
  name_prefix = "${var.environment}-${var.canary_name}-parameter-store-policy"
}