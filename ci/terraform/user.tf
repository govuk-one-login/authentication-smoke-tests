data "aws_dynamodb_table" "user_credential_table" {
  name = "${var.environment}-user-credentials"
}

data "aws_dynamodb_table" "user_profile_table" {
  name = "${var.environment}-user-profile"
}

resource "time_static" "create_date" {
  triggers = {
    username = var.username
  }
}

locals {
  create_date = formatdate("YYYY-MM-DD'T'hh:mm:ss.000000", time_static.create_date.rfc3339)
}

resource "random_string" "subject_id" {
  keepers = {
    username = var.username
  }
  lower   = true
  upper   = true
  special = false
  number  = true
  length  = 32
}

resource "random_string" "public_subject_id" {
  lower   = true
  upper   = true
  special = false
  number  = true
  length  = 32
}

resource "aws_dynamodb_table_item" "user_credential" {
  table_name = data.aws_dynamodb_table.user_credential_table.name
  hash_key   = data.aws_dynamodb_table.user_credential_table.hash_key
  item = jsonencode({
    "Email" = {
      "S" = var.username
    },
    "Updated" = {
      "S" = local.create_date
    },
    "SubjectID" = {
      "S" = random_string.subject_id.result
    },
    "Password" = {
      "S" = var.hashed_password
    },
    "Created" = {
      "S" = formatdate("YYYY-MM-DD'T'hh:mm:ss.000000", time_static.create_date.rfc3339)
    }
  })
}

resource "aws_dynamodb_table_item" "user_profile" {
  table_name = data.aws_dynamodb_table.user_profile_table.name
  hash_key   = data.aws_dynamodb_table.user_profile_table.hash_key
  item = jsonencode({
    "Email" = {
      "S" = var.username
    },
    "EmailVerified" = {
      "N" = "1"
    },
    "PhoneNumberVerified" = {
      "N" = "1"
    },
    "SubjectID" = {
      "S" = random_string.subject_id.result
    },
    "PhoneNumber" = {
      "S" = var.phone
    },
    "PublicSubjectID" = {
      "S" = random_string.public_subject_id.result
    },
    "termsAndConditions" = {
      "M" = {
        "version" = {
          "S" = var.terms_and_conditions_version
        },
        "timestamp" = {
          "S" = local.create_date
        }
      }
    },
    "Updated" = {
      "S" = local.create_date
    },
    "Created" = {
      "S" = local.create_date
    }
  })
}

resource "aws_dynamodb_table_item" "user_profile_ipv_smoke_test" {
  table_name = data.aws_dynamodb_table.user_profile_table.name
  hash_key   = data.aws_dynamodb_table.user_profile_table.hash_key
  item = jsonencode({
    "Email" = {
      "S" = var.ipv_smoke_test_username
    },
    "EmailVerified" = {
      "N" = "1"
    },
    "PhoneNumberVerified" = {
      "N" = "1"
    },
    "SubjectID" = {
      "S" = random_string.subject_id.result
    },
    "PhoneNumber" = {
      "S" = var.ipv_smoke_test_phone
    },
    "PublicSubjectID" = {
      "S" = random_string.public_subject_id.result
    },
    "termsAndConditions" = {
      "M" = {
        "version" = {
          "S" = var.terms_and_conditions_version
        },
        "timestamp" = {
          "S" = local.create_date
        }
      }
    },
    "Updated" = {
      "S" = local.create_date
    },
    "Created" = {
      "S" = local.create_date
    }
  })
}

resource "aws_dynamodb_table_item" "user_credential_ipv_smoke_test" {
  table_name = data.aws_dynamodb_table.user_credential_table.name
  hash_key   = data.aws_dynamodb_table.user_credential_table.hash_key
  item = jsonencode({
    "Email" = {
      "S" = var.ipv_smoke_test_username
    },
    "Updated" = {
      "S" = local.create_date
    },
    "SubjectID" = {
      "S" = random_string.subject_id.result
    },
    "Password" = {
      "S" = var.hashed_password
    },
    "Created" = {
      "S" = formatdate("YYYY-MM-DD'T'hh:mm:ss.000000", time_static.create_date.rfc3339)
    }
  })
}