environment                         = "sandpit"
shared_state_bucket                 = "digital-identity-dev-tfstate"
account_management_url              = "https://build.account.gov.uk"
password                            = "not-a-real-password"
username                            = "hello@gov.uk"
ipv_smoke_test_username             = ""
phone                               = "07700900222"
ipv_smoke_test_phone                = "07700900333"
integration_password                = ""
issuer_base_url                     = "https://oidc.build.account.gov.uk"
integration_issuer_base_url         = "https://oidc.integration.account.gov.uk"
dns_state_bucket                    = ""
dns_state_key                       = ""
dns_state_role                      = ""
cronitor_api_key                    = ""
cronitor_monitor_key                = ""
pagerduty_p1_alerts_endpoint        = ""
pagerduty_p2_alerts_endpoint        = ""
pagerduty_cronitor_alerts_endpoint  = ""
basic_auth_username                 = "u"
basic_auth_password                 = "p"
integration_basic_auth_username     = ""
integration_basic_auth_password     = ""
slack_hook_uri                      = "some-slack-uri"
create_account_metric_alarm_enabled = false
ipv_sign_in_metric_alarm_enabled    = false


alerts_code_s3_key                      = "di-monitoring-utils/alerts.zip/sandpit-smoketest"
heartbeat_code_s3_key                   = "di-monitoring-utils/heartbeat.zip/sandpit-smoketest"
hashed_password                         = "123456"
code_s3_bucket                          = "sandpit-smoke-test-sms-codes"
use_integration_env_for_sign_in_journey = true

logging_endpoint_arns = []