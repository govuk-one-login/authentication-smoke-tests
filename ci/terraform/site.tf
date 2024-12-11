terraform {
  required_version = ">= 1.9.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.75.1"
    }
    time = {
      source  = "hashicorp/time"
      version = "0.12.1"
    }
  }

  backend "s3" {
  }
}

locals {
  smoke_tests_default_tags = {
    Environment = var.environment
    Owner       = "di-authentication@digital.cabinet-office.gov.uk"
    Product     = "GOV.UK Sign In"
    System      = "Authentication"
    Service     = "smoke-tests"

    application = "smoke-tests"
    terraform   = "authentication-smoke-tests"
  }
}

provider "aws" {
  region = var.aws_region

  dynamic "assume_role" {
    for_each = var.deployer_role_arn != null ? [var.deployer_role_arn] : []
    content {
      role_arn = assume_role.value
    }
  }

  default_tags {
    tags = local.smoke_tests_default_tags
  }
}

provider "aws" {
  alias = "cloudfront"

  region = "us-east-1"

  dynamic "assume_role" {
    for_each = var.deployer_role_arn != null ? [var.deployer_role_arn] : []
    content {
      role_arn = assume_role.value
    }
  }

  default_tags {
    tags = local.smoke_tests_default_tags
  }
}

provider "time" {}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_partition" "current" {}
