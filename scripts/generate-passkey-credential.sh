#!/bin/bash
set -euo pipefail

##############################################################################
# generate-passkey-credential.sh
#
# Generates an EC P-256 key pair for the passkey smoke test canary.
# Outputs:
#   - dynamo-item.json  (to insert into the authenticator DynamoDB table)
#   - secrets-values.json   (credential ID, private key, RP ID, user handle for Secrets Manager)
#
# Requirements: openssl, jq
# No python dependency — COSE encoding is done in pure bash.
##############################################################################

usage() {
  cat << EOF
Usage: $0 --rp-id <RP_ID> --public-subject-id <PUBLIC_SUBJECT_ID> [--output-dir <DIR>]

Generates a WebAuthn credential (EC P-256 key pair) for the passkey smoke test.

Arguments:
  --rp-id              Relying party ID (e.g. account.gov.uk)
  --public-subject-id  The user's public subject ID (from user-profile table)
  --output-dir         Directory to write output files (default: current directory)

Examples:
  $0 --rp-id account.gov.uk --public-subject-id abc123def456
  $0 --rp-id dev.account.gov.uk --public-subject-id abc123 --output-dir ./output
EOF
}

RP_ID=""
PUBLIC_SUBJECT_ID=""
OUTPUT_DIR="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --rp-id)
      RP_ID="$2"
      shift 2
      ;;
    --public-subject-id)
      PUBLIC_SUBJECT_ID="$2"
      shift 2
      ;;
    --output-dir)
      OUTPUT_DIR="$2"
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

if [[ -z ${RP_ID} || -z ${PUBLIC_SUBJECT_ID} ]]; then
  echo "Error: --rp-id and --public-subject-id are required." >&2
  usage
  exit 1
fi

# Check dependencies
for cmd in openssl jq; do
  if ! command -v "${cmd}" &> /dev/null; then
    echo "Error: ${cmd} is required but not found." >&2
    exit 1
  fi
done

mkdir -p "${OUTPUT_DIR}"

# Generate EC P-256 private key in PKCS#8 DER format
PRIVATE_KEY_DER=$(mktemp)
PRIVATE_KEY_PKCS8=$(mktemp)
trap 'rm -f "$PRIVATE_KEY_DER" "$PRIVATE_KEY_PKCS8"' EXIT

openssl genpkey -algorithm EC -pkeyopt ec_paramgen_curve:P-256 -outform DER -out "${PRIVATE_KEY_DER}" 2> /dev/null

# Convert to PKCS#8 DER explicitly — this is what CDP WebAuthn.addCredential expects
openssl pkcs8 -topk8 -nocrypt -inform DER -in "${PRIVATE_KEY_DER}" -outform DER -out "${PRIVATE_KEY_PKCS8}" 2> /dev/null

PRIVATE_KEY_B64=$(base64 < "${PRIVATE_KEY_PKCS8}" | tr -d '\n')

# Extract the public key x,y coordinates
# Get the uncompressed public key point (04 || x || y)
PUB_KEY_HEX=$(openssl pkey -inform DER -in "${PRIVATE_KEY_DER}" -pubout -outform DER 2> /dev/null \
  | openssl ec -pubin -inform DER -text -noout 2> /dev/null \
  | grep -A 5 "^pub:" \
  | tail -n +2 \
  | tr -d ' :\n')

# Remove the leading '04' uncompressed point indicator
X_HEX="${PUB_KEY_HEX:2:64}"
Y_HEX="${PUB_KEY_HEX:66:64}"

# Generate random credential ID (32 bytes) and base64url-encode
CREDENTIAL_ID_HEX=$(openssl rand -hex 32)
CREDENTIAL_ID_B64URL=$(echo -n "${CREDENTIAL_ID_HEX}" | xxd -r -p | base64 | tr '+/' '-_' | tr -d '=')

# User handle: public subject ID as UTF-8 bytes, base64url-encoded
USER_HANDLE_B64URL=$(printf '%s' "${PUBLIC_SUBJECT_ID}" | base64 | tr '+/' '-_' | tr -d '=')

# COSE-encode the public key in pure bash
# Structure: CBOR map(5) { 1:2, 3:-7, -1:1, -2:bstr(x), -3:bstr(y) }
#
# CBOR encoding:
#   A5       - map of 5 items
#   01 02    - unsigned(1): unsigned(2)        kty: EC2
#   03 26    - unsigned(3): negative(-7 = 0x26) alg: ES256
#   20 01    - negative(-1 = 0x20): unsigned(1) crv: P-256
#   21 5820  - negative(-2 = 0x21): bstr(32)   x-coordinate
#   [32 bytes of X]
#   22 5820  - negative(-3 = 0x22): bstr(32)   y-coordinate
#   [32 bytes of Y]
COSE_HEX="A5010203262001215820${X_HEX}225820${Y_HEX}"

# Convert COSE hex to base64url
COSE_B64URL=$(echo -n "${COSE_HEX}" | xxd -r -p | base64 | tr '+/' '-_' | tr -d '=')

# Timestamp
TIMESTAMP=$(date -u +"%Y-%m-%d:%H:%M:%S.000")

# Write DynamoDB item JSON
jq -n \
  --arg pub_sub_id "${PUBLIC_SUBJECT_ID}" \
  --arg sk "PASSKEY#${CREDENTIAL_ID_B64URL}" \
  --arg created "${TIMESTAMP}" \
  --arg credential "${COSE_B64URL}" \
  --arg cred_id "${CREDENTIAL_ID_B64URL}" \
  '{
    "PublicSubjectID": {"S": $pub_sub_id},
    "SK": {"S": $sk},
    "Created": {"S": $created},
    "Credential": {"S": $credential},
    "CredentialId": {"S": $cred_id},
    "PasskeyAaguid": {"S": "00000000-0000-0000-0000-000000000000"},
    "PasskeyBackedUp": {"BOOL": false},
    "PasskeyBackupEligible": {"BOOL": false},
    "PasskeyIsAttested": {"BOOL": false},
    "PasskeyIsResidentKey": {"BOOL": true},
    "PasskeySignCount": {"N": "0"},
    "PasskeyTransports": {"L": [{"S": "internal"}]}
  }' > "${OUTPUT_DIR}/dynamo-item.json"

# Write secrets values JSON
jq -n \
  --arg cred_id "${CREDENTIAL_ID_B64URL}" \
  --arg private_key "${PRIVATE_KEY_B64}" \
  --arg rp_id "${RP_ID}" \
  --arg user_handle "${USER_HANDLE_B64URL}" \
  '{
    "credential-id": $cred_id,
    "credential-private-key": $private_key,
    "rp-id": $rp_id,
    "user-handle": $user_handle
  }' > "${OUTPUT_DIR}/secrets-values.json"

echo "✅ Credential generated successfully"
echo
echo "  DynamoDB item:  ${OUTPUT_DIR}/dynamo-item.json"
echo "  Secrets values: ${OUTPUT_DIR}/secrets-values.json"
echo
echo "  Credential ID:  ${CREDENTIAL_ID_B64URL}"
echo "  RP ID:          ${RP_ID}"
echo
echo "Next steps:"
echo "  Run ./store-passkey-secrets.sh and ./store-passkey-dynamo-item.sh to push these values to AWS"
