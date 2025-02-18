
resource "aws_iam_role" "smoke_tester_role" {
  assume_role_policy = data.aws_iam_policy_document.lambda_can_assume_policy.json
  name               = "${var.environment}-${var.canary_name}-canary-execution-role"

  depends_on = [
    data.aws_iam_policy_document.lambda_can_assume_policy
  ]
}

resource "aws_iam_role_policy_attachment" "canary_execution" {
  policy_arn = aws_iam_policy.canary_execution.arn
  role       = aws_iam_role.smoke_tester_role.name

  depends_on = [
    aws_iam_policy.canary_execution,
    aws_iam_role.smoke_tester_role
  ]
}

resource "aws_iam_role_policy_attachment" "sms_bucket_policy" {
  policy_arn = aws_iam_policy.sms_bucket_policy.arn
  role       = aws_iam_role.smoke_tester_role.name

  depends_on = [
    aws_iam_policy.sms_bucket_policy,
    aws_iam_role.smoke_tester_role
  ]
}

resource "aws_iam_role_policy_attachment" "signin_parameter_policy_attachment" {
  count      = var.create_account_smoke_test ? 0 : 1
  policy_arn = aws_iam_policy.signin_parameter_policy[0].arn
  role       = aws_iam_role.smoke_tester_role.name

  depends_on = [
    aws_iam_policy.signin_parameter_policy[0],
    aws_iam_role.smoke_tester_role
  ]
}

resource "aws_iam_role_policy_attachment" "create_parameter_policy_attachment" {
  count      = var.create_account_smoke_test ? 1 : 0
  policy_arn = aws_iam_policy.create_parameter_policy[0].arn
  role       = aws_iam_role.smoke_tester_role.name

  depends_on = [
    aws_iam_policy.create_parameter_policy[0],
    aws_iam_role.smoke_tester_role
  ]
}
