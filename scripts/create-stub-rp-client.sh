#!/bin/bash
set -euo pipefail

usage() {
  cat << EOF
Usage: $0 [ENVIRONMENT] [CLIENT_NAME] [CLIENT_TYPE]

Creates DynamoDB item for stub RP client in the specified environment.

Arguments:
  ENVIRONMENT   Target environment (default: dev)
  CLIENT_NAME   Client name (default: di-auth-smoketest-microclient-dev)

Examples:
  $0
  $0 integration
  $0 integration di-auth-smoketest-microclient-integration
EOF
}

if [[ ${1:-} == "-h" || ${1:-} == "--help" ]]; then
  usage
  exit 0
fi

ENVIRONMENT="${1:-dev}"
CLIENT_NAME="${2:-di-auth-smoketest-microclient-${ENVIRONMENT}}"

CLIENT_ID=$(openssl rand -hex 16)
# CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

PRIVATE_KEY=$(openssl genrsa 2048 2> /dev/null)
PUBLIC_KEY=$(echo "${PRIVATE_KEY}" | openssl rsa -pubout 2> /dev/null | sed '/-----BEGIN PUBLIC KEY-----/d' | sed '/-----END PUBLIC KEY-----/d' | tr -d '\n')

create_stub_rp_client() {
  local table_name="${ENVIRONMENT}-client-registry"

  echo "Creating stub RP client: ${CLIENT_NAME}"
  echo "Client ID: ${CLIENT_ID}"
  # shellcheck disable=SC2086
  aws dynamodb put-item \
    --table-name "${table_name}" \
    --item '{
      "ClientID": {"S": "'${CLIENT_ID}'"},
      "ClientName": {"S": "'${CLIENT_NAME}'"},
      "Contacts": {
        "L": [{
          "S": "contact+'${CLIENT_NAME}'@example.com"
        }]
      },
      "PostLogoutRedirectUrls": {
        "L": [
          {"S": "http://localhost:3032/signed-out"},
          {"S": "http://localhost:3031/signed-out"}
        ]
      },
      "RedirectUrls": {
        "L": [
          {"S": "http://localhost:3032/callback"},
          {"S": "http://localhost:3031/callback"}
        ]
      },
      "Scopes": {
        "L": [
          {"S": "openid"},
          {"S": "email"},
          {"S": "phone"}
        ]
      },
      "Claims": {
        "L": [
          {"S": "https://vocab.account.gov.uk/v1/coreIdentityJWT"},
          {"S": "https://vocab.account.gov.uk/v1/passport"},
          {"S": "https://vocab.account.gov.uk/v1/address"},
          {"S": "https://vocab.account.gov.uk/v1/drivingPermit"}
        ]
      },
      "PublicKey": {"S": "'${PUBLIC_KEY}'"},
      "ServiceType": {"S": "MANDATORY"},
      "SubjectType": {"S": "pairwise"},
      "CookieConsentShared": {"N": "1"},
      "ConsentRequired": {"N": "0"},
      "IdentityVerificationSupported": {"N": "1"},
      "ClientType": {"S": "web"},
      "TestClient": {"N": "1"},
      "SmokeTest": {"N": "1"}
    }'
}

echo "Using environment: ${ENVIRONMENT}"

create_stub_rp_client
echo "Stub RP client created successfully"
echo "PRIVATE_KEY: ${PRIVATE_KEY}"
echo "PUBLIC_KEY: ${PUBLIC_KEY}"
