
variable "canary_handler" {
  type = string
}

variable "canary_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "slack_hook_uri" {
  type = string
}

variable "smoke_test_cron_expression" {
  type = string
}

variable "canary_source_bucket" {
  type = string
}

variable "canary_source_key" {
  type = string
}

variable "canary_source_version_id" {
  type = string
}

variable "artifact_s3_location" {
  type = string
}

variable "artefact_bucket_arn" {
  type = string
}

variable "sms_bucket_name_arn" {
  type = string
}

variable "sms_bucket_name" {
  type = string
}

variable "fire_drill" {
  type    = string
  default = "0"
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

variable "account_management_url" {
  type = string
}

variable "username" {
  type = string
}

variable "password" {
  type = string
}

variable "phone" {
  type = string
}

variable "ipv_smoke_test_phone" {
  type = string
}

variable "basic_auth_username" {
  type = string
}

variable "basic_auth_password" {
  type = string
}

variable "sns_topic_pagerduty_p1_alerts_arn" {
  type = string
}

variable "sns_topic_pagerduty_p2_alerts_arn" {
  type = string
}

variable "sns_topic_slack_alerts_arn" {
  type = string
}

variable "client_id" {
  type = string
}

variable "client_base_url" {
  type = string
}

variable "id_enabled_client_base_url" {
  type    = string
  default = "http://localhost:3032"
}

variable "issuer_base_url" {
  type = string
}
variable "integration_issuer_base_url" {
  type        = string
  default     = ""
  description = "In some upstream environments e.g. sandpit, not all functionality may be enabled e.g. IPV. Sometimes we might therefore choose to use integration"

}
variable "client_private_key" {
  type = string
}