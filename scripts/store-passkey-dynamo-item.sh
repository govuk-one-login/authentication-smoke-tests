#!/bin/bash
set -euo pipefail

##############################################################################
# store-passkey-dynamo-item.sh
#
# Inserts the generated passkey credential record into the DynamoDB
# authenticator table.
#
# Expects the output file from generate-passkey-credential.sh:
#   - dynamo-item.json
#
# Requirements: aws cli
##############################################################################

usage() {
  cat << EOF
Usage: $0 --environment <ENV> [--input-dir <DIR>] [--table-name <TABLE>]

Inserts the passkey credential record into DynamoDB.

Arguments:
  --environment   Target environment (e.g. dev, build, staging)
  --input-dir     Directory containing dynamo-item.json (default: current directory)
  --table-name    DynamoDB table name override (default: <environment>-authenticator)

Prerequisites:
  Run generate-passkey-credential.sh first to produce the input files.
  Ensure you have AWS credentials configured for the account containing the DynamoDB table.

Examples:
  $0 --environment dev
  $0 --environment authdev3 --table-name authdev3-auth-authenticator
  $0 --environment build --input-dir ./output
EOF
}

ENVIRONMENT=""
INPUT_DIR="."
TABLE_NAME=""

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
    --table-name)
      TABLE_NAME="$2"
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
if ! command -v aws &> /dev/null; then
  echo "Error: aws cli is required but not found." >&2
  exit 1
fi

DYNAMO_FILE="${INPUT_DIR}/dynamo-item.json"

if [[ ! -f ${DYNAMO_FILE} ]]; then
  echo "Error: ${DYNAMO_FILE} not found." >&2
  echo "Run generate-passkey-credential.sh first." >&2
  exit 1
fi

# Default table name follows environment convention
if [[ -z ${TABLE_NAME} ]]; then
  TABLE_NAME="${ENVIRONMENT}-authenticator"
fi

echo "Environment:    ${ENVIRONMENT}"
echo "DynamoDB table: ${TABLE_NAME}"
echo "Input dir:      ${INPUT_DIR}"
echo

echo "Inserting passkey credential record..."

aws dynamodb put-item \
  --table-name "${TABLE_NAME}" \
  --item file://"${DYNAMO_FILE}"

echo
echo "✅ DynamoDB item inserted into ${TABLE_NAME}"
