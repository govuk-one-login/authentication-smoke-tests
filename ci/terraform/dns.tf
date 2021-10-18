data "terraform_remote_state" "dns" {
  count   = var.account_management_url == null ? 1 : 0
  backend = "s3"
  config = {
    bucket   = var.dns_state_bucket
    key      = var.dns_state_key
    role_arn = var.dns_state_role
    region   = var.aws_region
  }
}

locals {
  account_management_url = var.account_management_url == null ? "https://${lookup(data.terraform_remote_state.dns[0].outputs, "${var.environment}_account_management_url", "")}" : var.account_management_url
}