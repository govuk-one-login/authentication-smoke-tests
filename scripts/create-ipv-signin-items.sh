#!/bin/bash
set -euo pipefail

usage() {
  cat << EOF
Usage: $0 [ENVIRONMENT] [IPV_EMAIL] [IPV_PHONE] [SIGN_IN_EMAIL] [SIGN_IN_PHONE]

Creates DynamoDB items for smoke test users in the specified environment.

Arguments:
  ENVIRONMENT     Target environment (default: dev)
  IPV_EMAIL       IPV user email (default: ipv-smoke-test@example.com)
  IPV_PHONE       IPV user phone (default: +447700900000)
  SIGN_IN_EMAIL   Sign-in user email (default: ipv-smoke-test-sign-in@example.com)
  SIGN_IN_PHONE   Sign-in user phone (default: +447700900001)

Examples:
  $0
  $0 prod
  $0 staging user1@example.com +447700900002 user2@example.com +447700900003
EOF
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

ENVIRONMENT="${1:-dev}"
SMOKE_IPV_EMAIL="${2:-ipv-smoke-test@example.com}"
SMOKE_IPV_PHONE="${3:-+447700900000}"
SMOKE_SIGN_IN_EMAIL="${4:-ipv-smoke-test-sign-in@example.com}"
SMOKE_SIGN_IN_PHONE="${5:-+447700900001}"

SALT_BASE64=$(openssl rand -base64 32)
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

SMOKE_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "/deploy/${ENVIRONMENT}/smoke_tester_password" \
  --query 'SecretString' --output text 2> /dev/null) || {
  echo "Error: Unable to retrieve smoke_tester_password secret."
  echo "This parameter needs to be created in same AWS account where DynamoDB table is located."
  exit 1
}

HASHED_PASSWORD=$(echo -n "${SMOKE_PASSWORD}" | argon2 "$(openssl rand -hex 32)" -e -id -v 13 -k 15360 -t 2 -p 1)

create_user_profile() {
  local email="$1"
  local phone="$2"
  local subject_id="$3"
  local public_subject_id="$4"
  # shellcheck disable=SC2086
  aws dynamodb put-item \
    --table-name "${ENVIRONMENT}-user-profile" \
    --item '{
      "Email": {"S": "'${email}'"},
      "EmailVerified": {"N": "1"},
      "PhoneNumberVerified": {"N": "1"},
      "SubjectID": {"S": "'${subject_id}'"},
      "PhoneNumber": {"S": "'${phone}'"},
      "PublicSubjectID": {"S": "'${public_subject_id}'"},
      "termsAndConditions": {
        "M": {
          "version": {"S": "1.0"},
          "timestamp": {"S": "'${CURRENT_DATE}'"}
        }
      },
      "Updated": {"S": "'${CURRENT_DATE}'"},
      "Created": {"S": "'${CURRENT_DATE}'"},
      "salt": {"B": "'${SALT_BASE64}'"}
    }'
}

create_user_credentials() {
  local email="$1"
  local subject_id="$2"
  # shellcheck disable=SC2086
  aws dynamodb put-item \
    --table-name "${ENVIRONMENT}-user-credentials" \
    --item '{
      "Email": {"S": "'${email}'"},
      "Updated": {"S": "'${CURRENT_DATE}'"},
      "SubjectID": {"S": "'${subject_id}'"},
      "Password": {"S": "'${HASHED_PASSWORD}'"},
      "Created": {"S": "'${CURRENT_DATE}'"}
    }'
}

create_user_setup() {
  local user_type="$1"
  local email="$2"
  local phone="$3"
  # shellcheck disable=SC2155
  local subject_id=$(openssl rand -hex 16)
  # shellcheck disable=SC2155
  local public_subject_id=$(openssl rand -hex 16)

  echo "Creating DynamoDB items for ${user_type} smoke test user"
  echo "Email: ${email}, Phone: ${phone}"
  echo "Subject ID: ${subject_id}, Public Subject ID: ${public_subject_id}"

  create_user_profile "${email}" "${phone}" "${subject_id}" "${public_subject_id}"
  echo "User profile item inserted"

  create_user_credentials "${email}" "${subject_id}"
  echo "User credentials item inserted"
  echo "DynamoDB items created successfully for ${user_type} smoke test user"
  echo
}

echo "Using environment: ${ENVIRONMENT}"
echo

echo "##########################CREATE IPV USER##########################"
create_user_setup "IPV" "${SMOKE_IPV_EMAIL}" "${SMOKE_IPV_PHONE}"

echo "##########################CREATE SIGN-IN USER##########################"
create_user_setup "Sign-In" "${SMOKE_SIGN_IN_EMAIL}" "${SMOKE_SIGN_IN_PHONE}"
