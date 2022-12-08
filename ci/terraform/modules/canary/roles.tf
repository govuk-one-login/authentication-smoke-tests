
resource "aws_iam_role" "smoke_tester_role" {
  count              = var.environment == "production" ? 0 : 1
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-${var.canary_name}-canary-execution-role"
}

resource "aws_iam_role_policy_attachment" "canary_execution" {
  count      = var.environment == "production" ? 0 : 1
  policy_arn = aws_iam_policy.canary_execution.arn
  role       = aws_iam_role.smoke_tester_role[0].name
}

resource "aws_iam_role_policy_attachment" "sms_bucket_policy" {
  count      = var.environment == "production" ? 0 : 1
  policy_arn = aws_iam_policy.sms_bucket_policy.arn
  role       = aws_iam_role.smoke_tester_role[0].name
}

resource "aws_iam_role_policy_attachment" "parameter_policy" {
  count      = var.environment == "production" ? 0 : 1
  policy_arn = aws_iam_policy.parameter_policy.arn
  role       = aws_iam_role.smoke_tester_role[0].name
}

resource "aws_iam_role_policy_attachment" "basic_auth_parameter_policy" {
  count      = var.environment == "production" ? 0 : 1
  policy_arn = aws_iam_policy.basic_auth_parameter_policy[0].arn
  role       = aws_iam_role.smoke_tester_role[0].name
}