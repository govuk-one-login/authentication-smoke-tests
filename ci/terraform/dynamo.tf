data "aws_dynamodb_table" "user_credential_table" {
  name = "${var.environment}-user-credentials"
}

data "aws_dynamodb_table" "user_profile_table" {
  name = "${var.environment}-user-profile"
}

resource "time_static" "create_date" {}

locals {
  create_date = formatdate("YYYY-MM-DD'T'hh:mm:ss.000000", time_static.create_date.rfc3339)
}
