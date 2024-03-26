resource "aws_s3_bucket" "smoketest_artefact_bucket" {
  bucket = "${var.environment}-smoke-test-artefacts"

  tags = local.default_tags
}

resource "aws_s3_bucket_server_side_encryption_configuration" "smoketest_artefact_bucket" {
  bucket = aws_s3_bucket.smoketest_artefact_bucket.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_acl" "smoketest_artefact_bucket" {
  bucket = aws_s3_bucket.smoketest_artefact_bucket.bucket

  acl = "private"
}

resource "aws_s3_bucket_public_access_block" "smoketest_artefact_private_bucket" {
  bucket                  = aws_s3_bucket.smoketest_artefact_bucket.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "smoketest_source_bucket" {
  bucket = "${var.environment}-smoke-test-source"

  tags = local.default_tags
}


resource "aws_s3_bucket_public_access_block" "smoketest_source_private_bucket" {
  bucket                  = aws_s3_bucket.smoketest_source_bucket.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "smoketest_source_bucket" {
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_acl" "smoketest_source_bucket" {
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket

  acl = "private"
}

resource "aws_s3_bucket_versioning" "smoketest_source_bucket" {
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_object" "canary_source" {
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket
  key    = "${var.environment}-smoke-test-canary.zip"

  source      = var.smoke_test_lambda_zip_file
  source_hash = filemd5(var.smoke_test_lambda_zip_file)

}

resource "aws_s3_object" "alerts_source" {
  count  = var.alerts_lambda_zip_file == "" ? 0 : 1
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket
  key    = "${var.environment}-alerts-canary.zip"

  source      = var.alerts_lambda_zip_file
  source_hash = filemd5(var.alerts_lambda_zip_file)
}

resource "aws_s3_object" "heartbeat_source" {
  count  = var.alerts_lambda_zip_file == "" ? 0 : 1
  bucket = aws_s3_bucket.smoketest_source_bucket.bucket
  key    = "${var.environment}-heartbeat-canary.zip"

  source      = var.heartbeat_lambda_zip_file
  source_hash = filemd5(var.heartbeat_lambda_zip_file)
}
