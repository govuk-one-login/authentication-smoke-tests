variable "deployer_role_arn" {
  default     = ""
  description = "The name of the AWS role to assume, leave blank when running locally"
  type        = string
}

variable "environment" {
  type = string
}

variable "service_domain_name" {
  default = "auth.ida.digital.cabinet-office.gov.uk"
}

variable "aws_region" {
  default = "eu-west-2"
}

variable "smoke_test_lambda_zip_file" {
  default     = "../../dist/canary.zip"
  description = "Location of the smoke tester Lambda ZIP file"
  type        = string
}