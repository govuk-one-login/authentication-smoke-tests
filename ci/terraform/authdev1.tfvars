environment                           = "authdev1"
shared_state_bucket                   = "di-auth-development-tfstate"
password                              = "not-a-real-password"
ipv_smoke_test_username               = "alex.lazar@digital.cabinet-office.gov.uk"
ipv_smoke_test_phone                  = "07700900333"
integration_password                  = "123123"
issuer_base_url                       = "https://oidc.build.account.gov.uk"
integration_issuer_base_url           = "https://oidc.integration.account.gov.uk"
cronitor_api_key                      = ""
cronitor_monitor_key                  = ""
pagerduty_p1_alerts_endpoint          = ""
pagerduty_p2_alerts_endpoint          = ""
pagerduty_cronitor_alerts_endpoint    = ""
basic_auth_username                   = "u"
basic_auth_password                   = "p"
integration_basic_auth_username       = "u"
integration_basic_auth_password       = "p"
slack_hook_uri                        = "some-slack-uri"
sign_in_smoke_test_username           = "alex.lazar2@digital.cabinet-office.gov.uk"
sign_in_smoke_test_phone              = "123123"
create_account_metric_alarm_enabled   = false
ipv_sign_in_metric_alarm_enabled      = false
create_account_heartbeat_ping_enabled = false
ipv_sign_in_heartbeat_ping_enabled    = false
sign_in_metric_alarm_enabled          = false
sign_in_heartbeat_ping_enabled        = false
smoke_test_cron_expression            = "1/03 09-17 ? * MON-FRI *"
synthetics_user_delete_path           = "/delete"
test_services_api_hostname            = "adwhbb23"
test_services_api_key                 = "awdhawd"
username_create_account               = "alex.lazar1@digital.cabinet-office.gov.uk"

alerts_code_s3_key                      = "di-monitoring-utils/alerts.zip/authdev1-smoketest"
heartbeat_code_s3_key                   = "di-monitoring-utils/heartbeat.zip/authdev1-smoketest"
hashed_password                         = "123123"
code_s3_bucket                          = "authdev1-smoke-test-sms-codes"
use_integration_env_for_sign_in_journey = true

logging_endpoint_arns = []

terms_and_conditions_version = "1.0"
