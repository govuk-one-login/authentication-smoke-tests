environment                           = "sandpit"
shared_state_bucket                   = "digital-identity-dev-tfstate"
password                              = "not-a-real-password"
ipv_smoke_test_username               = "not-real-ipv-username"
ipv_smoke_test_phone                  = "07700900333"
issuer_base_url                       = ""
integration_issuer_base_url           = "https://oidc.integration.account.gov.uk"
cronitor_api_key                      = ""
cronitor_monitor_key                  = ""
pagerduty_p1_alerts_endpoint          = ""
pagerduty_p2_alerts_endpoint          = ""
pagerduty_cronitor_alerts_endpoint    = ""
slack_hook_uri                        = "some-slack-uri"
sign_in_smoke_test_username           = "not-real-signin-username"
sign_in_smoke_test_phone              = "07700900444"
create_account_metric_alarm_enabled   = false
ipv_sign_in_metric_alarm_enabled      = false
create_account_heartbeat_ping_enabled = false
ipv_sign_in_heartbeat_ping_enabled    = false
sign_in_metric_alarm_enabled          = false
sign_in_heartbeat_ping_enabled        = false
smoke_test_cron_expression            = "1/03 09-17 ? * MON-FRI *"
username_create_account               = "not-real-create-account-username"

create_account_smoke_test = false


alerts_code_s3_key                      = "di-monitoring-utils/alerts.zip/sandpit-smoketest"
heartbeat_code_s3_key                   = "di-monitoring-utils/heartbeat.zip/sandpit-smoketest"
hashed_password                         = "123456"
code_s3_bucket                          = "sandpit-smoke-test-sms-codes"
use_integration_env_for_sign_in_journey = true

logging_endpoint_arns = []

phone_create_account = "01234567890"
