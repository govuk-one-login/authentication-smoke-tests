output "canary_id" {
  value = aws_synthetics_canary.smoke_tester.id
}

output "canary_arn" {
  value = aws_synthetics_canary.smoke_tester.arn
}