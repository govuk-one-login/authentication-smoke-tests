
data "aws_region" "current" {}

data "aws_caller_identity" "current" {}

data "aws_partition" "current" {}

locals {
  // Using a local rather than the default_tags option on the AWS provider, as the latter has known issues which produce errors on apply.
  default_tags = {
    environment = var.environment
    application = "smoke-tests"
  }
  smoke_tester_name = "${var.environment}-${var.canary_name}"
  module_name       = "canaries"
}
