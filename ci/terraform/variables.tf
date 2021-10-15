variable "aws_region" {
  default = "eu-west-2"
}

variable "base_url" {
  type = string
}

variable "deployer_role_arn" {
  default     = ""
  description = "The name of the AWS role to assume, leave blank when running locally"
  type        = string
}

variable "environment" {
  type = string
}

variable "password" {
  type = string
}

variable "phone" {
  type = string
}

variable "shared_state_bucket" {
  default = ""
}

variable "smoke_test_lambda_zip_file" {
  default     = "../../dist/canary.zip"
  description = "Location of the smoke tester Lambda ZIP file"
  type        = string
}

variable "username" {
  type = string
}
