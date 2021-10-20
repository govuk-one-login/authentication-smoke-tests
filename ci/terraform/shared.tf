data "terraform_remote_state" "shared" {
  backend = "s3"
  config = {
    bucket   = var.shared_state_bucket
    key      = "${var.environment}-shared-terraform.tfstate"
    role_arn = var.deployer_role_arn
    region   = var.aws_region
  }
}

locals {
  sms_bucket_name_arn = data.terraform_remote_state.shared.outputs.sms_bucket_name_arn
  sms_bucket_name     = data.terraform_remote_state.shared.outputs.sms_bucket_name
}