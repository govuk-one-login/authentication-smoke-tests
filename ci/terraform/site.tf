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

provider "aws" {
  region = var.aws_region

  dynamic "assume_role" {
    for_each = var.deployer_role_arn != null ? [var.deployer_role_arn] : []
    content {
      role_arn = assume_role.value
    }
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
}

provider "time" {}

locals {
  // Using a local rather than the default_tags option on the AWS provider, as the latter has known issues which produce errors on apply.
  default_tags = {
    environment = var.environment
    application = "smoke-tests"
  }
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_partition" "current" {}
