#!/usr/bin/env bash
set -euo pipefail

# Ensure we're in the root directory of the repo
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null 2>&1 && pwd)"

if [ $# -ne 0 ]; then
  echo "Error: This script does not accept any arguments"
  exit 1
fi

# -------------
# Prerequisites
# -------------
if ! command -v sam &> /dev/null; then
  echo "Deploying template requires AWS sam cli to be installed. See https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html for installation instructions."
  exit 1
fi

if ! command -v yq &> /dev/null; then
  echo "Deploying template requires yq  'brew install yq' "
  exit 1
fi

function sso_login() {
  export AWS_ACCOUNT=di-authentication-development
  export AWS_PROFILE=di-authentication-development-AWSAdministratorAccess
  export AWS_REGION="eu-west-2"

  if ! aws sts get-caller-identity &> /dev/null; then
    aws sso login --profile "${AWS_PROFILE}" || exit 1
  fi
}

SAMCONFIG_FILE=${SAMCONFIG_FILE:-${DIR}/scripts/authdev3-samconfig.toml}

cd "${DIR}"

printf "Deploying in environment %s\n" "authdev3"
read -r -p "Review changeset before deployment? (y/n): " confirm_choice
if [[ ${confirm_choice} =~ ^[Yy]$ ]]; then
  CONFIRM_CHANGESET_OPTION="--confirm-changeset"
else
  CONFIRM_CHANGESET_OPTION="--no-confirm-changeset"
fi

echo "Building deployment artefacts ... "
yarn run build:all
echo "done!"

sso_login

aws s3 cp "${DIR}/dist/synthetics.zip" s3://authdev3-smoke-test-githubartifactsourcebucket/synthetics.zip

S3objectVersion=$(aws s3api head-object --bucket authdev3-smoke-test-githubartifactsourcebucket --key synthetics.zip --query 'VersionId' --output text)

echo "Lint template file"
sam validate --lint

echo "Running sam build on template file"
sam build --parallel

yq -i ".Resources.SignInCanary.Properties.Code.S3ObjectVersion = \"${S3objectVersion}\"" ".aws-sam/build/template.yaml"

yq -i ".Resources.SignInWithIPVCanary.Properties.Code.S3ObjectVersion = \"${S3objectVersion}\"" ".aws-sam/build/template.yaml"

yq -i ".Resources.CreateAccountCanary.Properties.Code.S3ObjectVersion = \"${S3objectVersion}\"" ".aws-sam/build/template.yaml"

sam deploy \
  --no-fail-on-empty-changeset \
  --config-env "authdev3" \
  --config-file "${SAMCONFIG_FILE}" \
  ${CONFIRM_CHANGESET_OPTION}

echo "Deployment complete!"
