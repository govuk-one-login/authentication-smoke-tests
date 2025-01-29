issuer_base_url = "https://oidc.integration.account.gov.uk"

logging_endpoint_arns = [
  "arn:aws:logs:eu-west-2:885513274347:destination:csls_cw_logs_destination_prodpython"
]

create_account_metric_alarm_enabled   = true
create_account_heartbeat_ping_enabled = true

ipv_sign_in_metric_alarm_enabled   = true
ipv_sign_in_heartbeat_ping_enabled = false

sign_in_metric_alarm_enabled   = true
sign_in_heartbeat_ping_enabled = true

#This will run the smoke tests every 3 minutes between 09:00 - 17:00 (UTC) Mon - Fri
smoke_test_cron_expression = "0/03 08-17 ? * MON-FRI *"