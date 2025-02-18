environment                           = "sandpit"
shared_state_bucket                   = "digital-identity-dev-tfstate"
password                              = "not-a-real-password"
ipv_smoke_test_username               = "not-real-ipv-username"
integration_password                  = "not-a-real-password"
issuer_base_url                       = "https://oidc.build.account.gov.uk"
integration_issuer_base_url           = "https://oidc.integration.account.gov.uk"
cronitor_api_key                      = "not-a-real-key"
cronitor_monitor_key                  = "not-a-real-key"
pagerduty_p1_alerts_endpoint          = "not-a-real-endpoint"
pagerduty_p2_alerts_endpoint          = "not-a-real-endpoint"
pagerduty_cronitor_alerts_endpoint    = "not-a-real-endpoint"
slack_hook_uri                        = "some-slack-uri"
sign_in_smoke_test_username           = "not-real-signin-username"
create_account_metric_alarm_enabled   = false
ipv_sign_in_metric_alarm_enabled      = false
create_account_heartbeat_ping_enabled = false
ipv_sign_in_heartbeat_ping_enabled    = false
sign_in_metric_alarm_enabled          = false
sign_in_heartbeat_ping_enabled        = false
smoke_test_cron_expression            = "1/03 09-17 ? * MON-FRI *"
synthetics_user_delete_path           = "not-a-real-path"
test_services_api_hostname            = "not-a-real-hostname"
test_services_api_key                 = "not-a-real-key"
username_create_account               = "not-real-username"

# The following are all reserved by Ofcom 'for use in drama': https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama/
# They are also Notify test numbers: https://docs.notifications.service.gov.uk/rest-api.html#phone-numbers
phone_create_account     = "07700900222"
ipv_smoke_test_phone     = "07700900000"
sign_in_smoke_test_phone = "07700900111"

alerts_code_s3_key                      = "di-monitoring-utils/alerts.zip/sandpit-smoketest"
heartbeat_code_s3_key                   = "di-monitoring-utils/heartbeat.zip/sandpit-smoketest"
hashed_password                         = "123456"
code_s3_bucket                          = "sandpit-smoke-test-sms-codes"
use_integration_env_for_sign_in_journey = true

logging_endpoint_arns = []

# if we deploy with these dummy values, the canaries will fail, so don't start them.
start_canaries = {
  sign-in          = false
  sign-in-with-ipv = false
  create-account   = false
}
