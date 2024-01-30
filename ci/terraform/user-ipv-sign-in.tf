resource "random_string" "subject_id_ipv_sign_in" {
  lower   = true
  upper   = true
  special = false
  numeric = true
  length  = 32
}

resource "random_string" "public_subject_id_ipv_sign_in" {
  lower   = true
  upper   = true
  special = false
  numeric = true
  length  = 32
}

resource "random_bytes" "salt_ipv_sign_in" {
  length = 32
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
      "S" = random_string.subject_id_ipv_sign_in.result
    },
    "PhoneNumber" = {
      "S" = var.ipv_smoke_test_phone
    },
    "PublicSubjectID" = {
      "S" = random_string.public_subject_id_ipv_sign_in.result
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
    },
    "salt" = {
      "B" = random_bytes.salt_ipv_sign_in.base64
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
      "S" = random_string.subject_id_ipv_sign_in.result
    },
    "Password" = {
      "S" = var.hashed_password
    },
    "Created" = {
      "S" = formatdate("YYYY-MM-DD'T'hh:mm:ss.000000", time_static.create_date.rfc3339)
    }
  })
}