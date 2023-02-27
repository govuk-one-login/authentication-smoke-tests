output "smoke_tests_client_id" {
  value = random_string.stub_rp_client_id[0].result
}