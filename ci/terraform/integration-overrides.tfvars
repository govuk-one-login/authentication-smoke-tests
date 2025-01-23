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

#This will run the smoke tests every 1 minutes between 09:00 - 17:00 (UTC) Mon - Fri
# Setting cron to run every 1 min for secure  pileine migration once migration is done will revert back to run every 3 min
smoke_test_cron_expression = "* 08-17 ? * MON-FRI *"