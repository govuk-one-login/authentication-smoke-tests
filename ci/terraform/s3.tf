resource "aws_s3_bucket" "smoketest_artefact_bucket" {
  bucket = "${var.environment}-smoke-test-artefacts"

  acl = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  tags = local.default_tags
}

resource "aws_s3_bucket" "smoketest_source_bucket" {
  bucket = "${var.environment}-smoke-test-source"

  acl = "private"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  versioning {
    enabled    = true
  }

  tags = local.default_tags
}

resource "aws_s3_bucket_object" "canary_source" {
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket
  key    = "${var.environment}-smoke-test-canary.zip"

  source = var.smoke_test_lambda_zip_file
  source_hash = filemd5(var.smoke_test_lambda_zip_file)
}