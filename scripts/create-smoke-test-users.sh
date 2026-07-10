#!/bin/bash
set -euo pipefail

usage() {
  cat << EOF
Usage: $0 <MFA_TYPE> [OPTIONS]

Creates DynamoDB items for a single smoke test user in the specified environment.

Arguments:
  MFA_TYPE  The MFA type for the user. Must be one of: sms, auth-app

Options:
  --environment, -e       Target environment (default: dev)
  --email                 User email (required)
  --password              User password (required)
  --phone                 User phone number (default: +447700900000, required for sms)
  --auth-app-secret       Auth app TOTP secret (required for auth-app)
  -h, --help              Show this help message

Examples:
  $0 sms --email user@example.com --password 'P@ssw0rd!'
  $0 sms -e staging --email user@example.com --password 'P@ssw0rd!' --phone +447700900002
  $0 auth-app --email user@example.com --password 'P@ssw0rd!' --auth-app-secret TOTP_SECRET
  $0 auth-app -e prod --email user@example.com --password 'P@ssw0rd!' --auth-app-secret TOTP_SECRET
EOF
}

if [[ $# -eq 0 || ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

MFA_TYPE="${1}"
shift

ENVIRONMENT="dev"
EMAIL=""
PHONE=""
PASSWORD=""
AUTH_APP_SECRET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --environment | -e)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --password)
      PASSWORD="$2"
      shift 2
      ;;
    --phone)
      PHONE="$2"
      shift 2
      ;;
    --auth-app-secret)
      AUTH_APP_SECRET="$2"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown option '$1'"
      usage
      exit 1
      ;;
  esac
done

# Validate email is provided
if [[ -z ${EMAIL} ]]; then
  echo "Error: --email is required"
  exit 1
fi

# Validate password is provided
if [[ -z ${PASSWORD} ]]; then
  echo "Error: --password is required"
  exit 1
fi

# Validate and set defaults based on MFA type
case "${MFA_TYPE}" in
  sms)
    PHONE="${PHONE:-+447700900000}"
    ;;
  auth-app)
    if [[ -z ${AUTH_APP_SECRET} ]]; then
      echo "Error: --auth-app-secret is required for auth-app MFA type"
      exit 1
    fi
    ;;
  *)
    echo "Error: MFA_TYPE must be one of: sms, auth-app"
    echo "Got: '${MFA_TYPE}'"
    usage
    exit 1
    ;;
esac

SALT_BASE64=$(openssl rand -base64 32)
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

HASHED_PASSWORD=$(echo -n "${PASSWORD}" | argon2 "$(openssl rand -hex 32)" -e -id -v 13 -k 15360 -t 2 -p 1)

create_sms_user() {
  local email="$1"
  local phone="$2"
  # shellcheck disable=SC2155
  local subject_id=$(openssl rand -hex 16)
  # shellcheck disable=SC2155
  local public_subject_id=$(openssl rand -hex 16)

  echo "Creating DynamoDB items for SMS MFA user"
  echo "Email: ${email}, Phone: ${phone}"
  echo "Subject ID: ${subject_id}, Public Subject ID: ${public_subject_id}"

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
  echo "User profile item inserted"

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
  echo "User credentials item inserted"

  echo "DynamoDB items created successfully for SMS MFA user"
}

create_auth_app_user() {
  local email="$1"
  local auth_app_secret="$2"
  # shellcheck disable=SC2155
  local subject_id=$(openssl rand -hex 16)
  # shellcheck disable=SC2155
  local public_subject_id=$(openssl rand -hex 16)
  # shellcheck disable=SC2155
  local mfa_identifier=$(openssl rand -hex 16)

  echo "Creating DynamoDB items for Auth App MFA user"
  echo "Email: ${email}, MFA: Auth App"
  echo "Subject ID: ${subject_id}, Public Subject ID: ${public_subject_id}"

  # shellcheck disable=SC2086
  aws dynamodb put-item \
    --table-name "${ENVIRONMENT}-user-profile" \
    --item '{
      "Email": {"S": "'${email}'"},
      "EmailVerified": {"N": "1"},
      "SubjectID": {"S": "'${subject_id}'"},
      "PublicSubjectID": {"S": "'${public_subject_id}'"},
      "mfaMethodsMigrated": {"N": "1"},
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
  echo "User profile item inserted"

  # shellcheck disable=SC2086
  aws dynamodb put-item \
    --table-name "${ENVIRONMENT}-user-credentials" \
    --item '{
      "Email": {"S": "'${email}'"},
      "Updated": {"S": "'${CURRENT_DATE}'"},
      "SubjectID": {"S": "'${subject_id}'"},
      "Password": {"S": "'${HASHED_PASSWORD}'"},
      "Created": {"S": "'${CURRENT_DATE}'"},
      "MfaMethods": {"L": [
        {
          "M": {
            "MfaMethodType": {"S": "AUTH_APP"},
            "CredentialValue": {"S": "'${auth_app_secret}'"},
            "MethodVerified": {"N": "1"},
            "Enabled": {"N": "1"},
            "Updated": {"S": "'${CURRENT_DATE}'"},
            "PriorityIdentifier": {"S": "DEFAULT"},
            "MFAIdentifier": {"S": "'${mfa_identifier}'"}
          }
        }
      ]}
    }'
  echo "User credentials item inserted"

  echo "DynamoDB items created successfully for Auth App MFA user"
}

echo "Using environment: ${ENVIRONMENT}"
echo

case "${MFA_TYPE}" in
  sms)
    create_sms_user "${EMAIL}" "${PHONE}"
    ;;
  auth-app)
    create_auth_app_user "${EMAIL}" "${AUTH_APP_SECRET}"
    ;;
esac
