
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

variable "create_account_smoke_test" {
  type = bool
}

variable "metric_alarms_enabled" {
  type = bool
}

variable "heartbeat_ping_enabled" {
  type = bool
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
  type    = string
  default = null
}

variable "test-services-api-key" {
  type    = string
  default = null
}

variable "test-services-api-hostname" {
  type    = string
  default = null
}

variable "username" {
  type = string
}

variable "password" {
  type    = string
  default = null
}

variable "phone" {
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

variable "issuer_base_url" {
  type = string
}

variable "client_private_key" {
  type = string
}

variable "cloudwatch_key_arn" {
  type        = string
  description = "The ARN of the KMS key to use log encryption"
}

variable "cloudwatch_log_retention" {
  type        = number
  description = "The number of days to retain Cloudwatch logs for"
}

variable "logging_endpoint_arns" {
  type        = list(string)
  default     = []
  description = "Amazon Resource Name (ARN) for the CSLS endpoints to ship logs to"
}