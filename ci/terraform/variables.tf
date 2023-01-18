variable "account_management_url" {
  default = null
}

variable "aws_region" {
  default = "eu-west-2"
}

variable "cronitor_api_key" {
  type = string
}
variable "cronitor_monitor_key" {
  type = string
}

variable "deployer_role_arn" {
  default     = ""
  description = "The name of the AWS role to assume, leave blank when running locally"
  type        = string
}

variable "dns_state_bucket" {
  type = string
}

variable "dns_state_key" {
  type = string
}

variable "dns_state_role" {
  type = string
}

variable "environment" {
  type = string
}

variable "slack_hook_uri" {
  type = string
}

variable "password" {
  type = string
}

variable "hashed_password" {
  type        = string
  description = "The hashed version of the password"
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

variable "smoke_test_rate_minutes" {
  default     = 3
  description = "Minutes between smoke test executions"
  type        = number
}

variable "username" {
  type = string
}

variable "pagerduty_p1_alerts_endpoint" {
  type = string
}

variable "pagerduty_p2_alerts_endpoint" {
  type = string
}

variable "pagerduty_cronitor_alerts_endpoint" {
  type = string
}
variable "basic_auth_username" {
  type    = string
  default = null
}

variable "basic_auth_password" {
  type    = string
  default = null
}

variable "terms_and_conditions_version" {
  default = "1.1"
}

variable "code_s3_bucket" {
  type = string
}

variable "alerts_code_s3_key" {
  type = string
}

variable "heartbeat_code_s3_key" {
  type = string
}

variable "username_create_account" {
  type = string
}

variable "synthetics-user-delete-path" {
  type = string
}

variable "test-services-api-key" {
  type = string
}

variable "test-services-api-hostname" {
  type = string
}

variable "client_base_url" {
  type    = string
  default = "http://localhost:3031"
}

variable "issuer_base_url" {
  type = string
}

variable "stub_rp_clients" {
  default     = []
  type        = list(object({ client_name : string, callback_urls : list(string), logout_urls : list(string), test_client : string, scopes : list(string), client_type : string, identity_verification_supported : string, consent_required : string }))
  description = "The details of RP clients to provision in the Client table"
}