
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
  name          = "alias/${var.environment}-${var.canary_name}-parameter-store-encryption-key"
  target_key_id = aws_kms_key.parameter_store_key.id
}

resource "aws_ssm_parameter" "fire_drill" {
  name  = "${var.environment}-${var.canary_name}-fire-drill"
  type  = "String"
  value = var.fire_drill

  tags = local.default_tags
}

resource "aws_ssm_parameter" "test-services-api-key" {
  name  = "${var.environment}-${var.canary_name}-test-services-api-key"
  type  = "String"
  value = var.test-services-api-key

  tags = local.default_tags
}

resource "aws_ssm_parameter" "test-services-api-hostname" {
  name  = "${var.environment}-${var.canary_name}-test-services-api-hostname"
  type  = "String"
  value = var.test-services-api-hostname

  tags = local.default_tags
}

resource "aws_ssm_parameter" "synthetics-user-delete-path" {
  name  = "${var.environment}-${var.canary_name}-synthetics-user-delete-path"
  type  = "String"
  value = var.synthetics-user-delete-path

  tags = local.default_tags
}


resource "aws_ssm_parameter" "base_url" {
  name  = "${var.environment}-${var.canary_name}-url"
  type  = "String"
  value = var.account_management_url

  tags = local.default_tags
}

resource "aws_ssm_parameter" "username" {
  name   = "${var.environment}-${var.canary_name}-username"
  type   = "SecureString"
  value  = var.username
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "password" {
  name   = "${var.environment}-${var.canary_name}-password"
  type   = "SecureString"
  value  = var.password
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "phone" {
  name   = "${var.environment}-${var.canary_name}-phone"
  type   = "SecureString"
  value  = var.phone
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "ipv_smoke_test_phone" {
  name   = "${var.environment}-${var.canary_name}-ipv-smoke-test-phone"
  type   = "SecureString"
  value  = var.ipv_smoke_test_phone
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "basic_auth_username" {
  count  = 1
  name   = "${var.environment}-${var.canary_name}-basicauth-username"
  type   = "SecureString"
  value  = var.basic_auth_username
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "basic_auth_password" {
  count  = 1
  name   = "${var.environment}-${var.canary_name}-basicauth-password"
  type   = "SecureString"
  value  = var.basic_auth_password
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "sms_bucket" {
  name   = "${var.environment}-${var.canary_name}-bucket"
  type   = "SecureString"
  value  = var.sms_bucket_name
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "slack_hook_url" {
  name   = "${var.environment}-${var.canary_name}-slack-hook-url"
  type   = "SecureString"
  value  = var.slack_hook_uri
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "client_id" {
  name  = "${var.environment}-${var.canary_name}-client-id"
  type  = "String"
  value = var.client_id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "client_private_key" {
  name   = "${var.environment}-${var.canary_name}-client-private-key"
  type   = "SecureString"
  value  = var.client_private_key
  key_id = aws_kms_alias.parameter_store_key_alias.id

  tags = local.default_tags
}

resource "aws_ssm_parameter" "client_base_url" {
  name  = "${var.environment}-${var.canary_name}-client-base-url"
  type  = "String"
  value = var.client_base_url

  tags = local.default_tags
}
resource "aws_ssm_parameter" "id_enabled_client_base_url" {
  name  = "${var.environment}-${var.canary_name}-id-enabled-client-base-url"
  type  = "String"
  value = var.id_enabled_client_base_url

  tags = local.default_tags
}

resource "aws_ssm_parameter" "issuer_base_url" {
  name  = "${var.environment}-${var.canary_name}-issuer-base-url"
  type  = "String"
  value = var.issuer_base_url

  tags = local.default_tags
}