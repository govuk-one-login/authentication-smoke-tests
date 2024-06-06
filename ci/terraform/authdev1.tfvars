environment                           = "authdev1"
shared_state_bucket                   = "di-auth-development-tfstate"
password                              = "not-a-real-password"
ipv_smoke_test_username               = "digital-identity-tech-team+smoke-tests-ipv@digital.cabinet-office.gov.uk"
ipv_smoke_test_phone                  = "07700900333"
integration_password                  = "123123"
issuer_base_url                       = "https://oidc.authdev1.sandpit.account.gov.uk"
integration_issuer_base_url           = "https://oidc.authdev1.sandpit.account.gov.uk"
cronitor_api_key                      = ""
cronitor_monitor_key                  = ""
pagerduty_p1_alerts_endpoint          = ""
pagerduty_p2_alerts_endpoint          = ""
pagerduty_cronitor_alerts_endpoint    = ""
basic_auth_username                   = "alex.lazar@digital.cabinet-office.gov.uk"
basic_auth_password                   = "not-a-real-password"
integration_basic_auth_username       = "any.user@digital.cabinet-office.gov.uk"
integration_basic_auth_password       = "not-a-real-password"
slack_hook_uri                        = "some-slack-uri"
sign_in_smoke_test_username           = "digital-identity-tech-team+smoke-tests-sign-in@digital.cabinet-office.gov.uk"
sign_in_smoke_test_phone              = "123123"
create_account_metric_alarm_enabled   = false
ipv_sign_in_metric_alarm_enabled      = false
create_account_heartbeat_ping_enabled = false
ipv_sign_in_heartbeat_ping_enabled    = false
sign_in_metric_alarm_enabled          = false
sign_in_heartbeat_ping_enabled        = false
smoke_test_cron_expression            = "1/03 09-17 ? * MON-FRI *"
synthetics_user_delete_path           = "/authdev1/synthetics-user"
test_services_api_hostname            = "rh4f1sxlpe.execute-api.eu-west-2.amazonaws.com"
test_services_api_key                 = "rKfQOYVAOY1so3pkzYmPM8b8die2WIN20co73rK5"
username_create_account               = "simulate-delivered@notifications.service.gov.uk"

alerts_code_s3_key                      = "di-monitoring-utils/alerts.zip/authdev1-smoketest"
heartbeat_code_s3_key                   = "di-monitoring-utils/heartbeat.zip/authdev1-smoketest"
hashed_password                         = "$argon2id$v=19$m=15360,t=2,p=1$OTViNmFkNTNjMjFmYWMyMWU2Y2EzMjVhNTcyOTcwY2ZlNjAxMWVlYWE3ODQyMDE5YjNlMmNjYzhmNTE5NmM3Yw$wYNfYRlDNl642cYCRC0nWGPdHhP535Ox0PI7+Zm782o"
code_s3_bucket                          = "authdev1-smoke-test-sms-codes"
use_integration_env_for_sign_in_journey = false

logging_endpoint_arns = []

terms_and_conditions_version = "1.1"
