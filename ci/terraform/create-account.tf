
module "canary_create_account" {

  source               = "./modules/canary"
  environment          = var.environment
  artifact_s3_location = "s3://${aws_s3_bucket.smoketest_artefact_bucket.bucket}"
  artefact_bucket_arn  = aws_s3_bucket.smoketest_artefact_bucket.arn

  slack_hook_uri      = var.slack_hook_uri
  sms_bucket_name     = local.sms_bucket_name
  sms_bucket_name_arn = local.sms_bucket_name_arn

  canary_handler = "canary-create-account.handler"
  canary_name    = "create"

  canary_source_bucket     = aws_s3_bucket_object.canary_source.bucket
  canary_source_key        = aws_s3_bucket_object.canary_source.key
  canary_source_version_id = aws_s3_bucket_object.canary_source.version_id

  account_management_url = local.account_management_url

  username            = var.username_create_account
  phone               = var.phone
  basic_auth_username = var.basic_auth_username
  basic_auth_password = var.basic_auth_password

  smoke_test_cron_expression = "0/10 10-17 ? * MON-FRI *"

}