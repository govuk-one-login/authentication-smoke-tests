data "aws_iam_policy_document" "key_policy" {
  policy_id = "key-policy-ssm"
  statement {
    sid = "Enable IAM User Permissions for root user"
    actions = [
      "kms:*",
    ]
    effect = "Allow"
    principals {
      type = "AWS"
      identifiers = [
        format(
          "arn:%s:iam::%s:root",
          data.aws_partition.current.partition,
          data.aws_caller_identity.current.account_id
        )
      ]
    }
    resources = ["*"]
  }
}

resource "aws_kms_key" "parameter_store_key" {
  description             = "KMS key for parameter store"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  policy                  = data.aws_iam_policy_document.key_policy.json

  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  key_usage                = "ENCRYPT_DECRYPT"

  tags = local.default_tags
}

resource "aws_kms_alias" "parameter_store_key_alias" {
  name          = "alias/${var.environment}-parameter-store-encryption-key"
  target_key_id = aws_kms_key.parameter_store_key.id
}

resource "aws_ssm_parameter" "base_url" {
  name  = "${local.smoke_tester_name}-url"
  type  = "String"
  value = local.account_management_url

  tags = local.default_tags
}

resource "aws_ssm_parameter" "username" {
  name   = "${local.smoke_tester_name}-username"
  type   = "SecureString"
  value  = var.username
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "password" {
  name   = "${local.smoke_tester_name}-password"
  type   = "SecureString"
  value  = var.password
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "phone" {
  name   = "${local.smoke_tester_name}-phone"
  type   = "SecureString"
  value  = var.phone
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "basic_auth_username" {
  count  = var.environment == "production" ? 0 : 1
  name   = "${local.smoke_tester_name}-basicauth-username"
  type   = "SecureString"
  value  = var.basic_auth_username
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "basic_auth_password" {
  count  = var.environment == "production" ? 0 : 1
  name   = "${local.smoke_tester_name}-basicauth-password"
  type   = "SecureString"
  value  = var.basic_auth_password
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "sms_bucket" {
  name   = "${local.smoke_tester_name}-bucket"
  type   = "SecureString"
  value  = local.sms_bucket_name
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}
