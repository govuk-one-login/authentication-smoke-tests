#!/bin/bash
set -euo pipefail

##############################################################################
# store-passkey-secrets.sh
#
# Stores the generated passkey credential values into Secrets Manager.
# CloudFormation resolves these secrets into SSM parameters at deploy time.
#
# Expects the output file from generate-passkey-credential.sh:
#   - secrets-values.json
#
# Requirements: aws cli, jq
##############################################################################

usage() {
  cat << EOF
Usage: $0 --environment <ENV> [--input-dir <DIR>]

Stores the passkey credential values in Secrets Manager.

Arguments:
  --environment   Target environment (e.g. dev, build, staging)
  --input-dir     Directory containing secrets-values.json (default: current directory)

Prerequisites:
  Run generate-passkey-credential.sh first to produce the input files.
  Ensure you have AWS credentials configured for the account containing the secrets.

Examples:
  $0 --environment dev
  $0 --environment authdev3 --input-dir ./output
EOF
}

ENVIRONMENT=""
INPUT_DIR="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --input-dir)
      INPUT_DIR="$2"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ -z ${ENVIRONMENT} ]]; then
  echo "Error: --environment is required." >&2
  usage
  exit 1
fi

# Check dependencies
for cmd in aws jq; do
  if ! command -v "${cmd}" &> /dev/null; then
    echo "Error: ${cmd} is required but not found." >&2
    exit 1
  fi
done

SECRETS_FILE="${INPUT_DIR}/secrets-values.json"

if [[ ! -f ${SECRETS_FILE} ]]; then
  echo "Error: ${SECRETS_FILE} not found." >&2
  echo "Run generate-passkey-credential.sh first." >&2
  exit 1
fi

echo "Environment:  ${ENVIRONMENT}"
echo "Input dir:    ${INPUT_DIR}"
echo

# Read values from secrets-values.json using jq
CREDENTIAL_ID=$(jq -r '.["credential-id"]' "${SECRETS_FILE}")
PRIVATE_KEY=$(jq -r '.["credential-private-key"]' "${SECRETS_FILE}")
RP_ID=$(jq -r '.["rp-id"]' "${SECRETS_FILE}")
USER_HANDLE=$(jq -r '.["user-handle"]' "${SECRETS_FILE}")

put_secret() {
  local secret_name="$1"
  local secret_value="$2"

  echo "  Storing: ${secret_name}"

  # Try to create the secret; if it already exists, update it
  if aws secretsmanager describe-secret --secret-id "${secret_name}" &> /dev/null; then
    aws secretsmanager put-secret-value \
      --secret-id "${secret_name}" \
      --secret-string "${secret_value}"
  else
    aws secretsmanager create-secret \
      --name "${secret_name}" \
      --secret-string "${secret_value}"
  fi
}

put_secret "/deploy/${ENVIRONMENT}/smoke_passkey_credential_id" "${CREDENTIAL_ID}"
put_secret "/deploy/${ENVIRONMENT}/smoke_passkey_credential_private_key" "${PRIVATE_KEY}"
put_secret "/deploy/${ENVIRONMENT}/smoke_passkey_rp_id" "${RP_ID}"
put_secret "/deploy/${ENVIRONMENT}/smoke_passkey_user_handle" "${USER_HANDLE}"

echo
echo "✅ Secrets stored. Redeploy the stack to update SSM parameters."
