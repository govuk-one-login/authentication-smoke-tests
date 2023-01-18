output "canary_id" {
  value = aws_synthetics_canary.smoke_tester.id
}

output "canary_arn" {
  value = aws_synthetics_canary.smoke_tester.arn
}

output "smoke_tests_client_id" {
  value = random_string.stub_rp_client_id[0].result
}