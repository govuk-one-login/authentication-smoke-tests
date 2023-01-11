#!/usr/bin/env bash

set -eu
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

function runTerraform() {
  echo "Running ${1} Terraform..."
  pushd "${DIR}/ci/terraform/${1}" > /dev/null
  rm -rf .terraform/
  terraform init -backend-config=sandpit.hcl
  terraform apply -var-file sandpit.tfvars -var-file sandpit-stub-clients.tfvars ${2}
  popd > /dev/null
}

function usage() {
  cat <<USAGE
  A script to deploy the GOV.UK Sign in smoke tests to the sandpit environment.
  Requires a GDS CLI, AWS CLI and jq installed and configured.

  Usage:
    $0 [-b|--build] [-c|--clean] [-s|--shared] [-o|--oidc] [-a|--account-management] [--audit] [--destroy] [-p|--prompt]

  Options:
    -b, --build               run yarn install and build tasks (default)
    --destroy                 run all terraform with the -destroy flag (destroys all managed resources)
    -p, --prompt              will prompt for plan review before applying any terraform

    If no options specified the default actions above will be carried out without prompting.
USAGE
}

BUILD=0
TERRAFORM_OPTS="-auto-approve"
if [[ $# == 0 ]]; then
  BUILD=1
fi
while [[ $# -gt 0 ]]; do
  case $1 in
    -b|--build)
      BUILD=1
      ;;
    --destroy)
      TERRAFORM_OPTS="-destroy"
      ;;
    -p|--prompt)
      TERRAFORM_OPTS=""
      ;;
    *)
      usage
      exit 1
      ;;
  esac
  shift
done

if [[ $BUILD == "1" ]]; then
  echo "Building deployment artefacts ... "
  pushd "${DIR}" > /dev/null
  yarn clean && yarn install --production && yarn build
  mkdir -p ../release-artefacts/
  cp dist/*.zip ../release-artefacts/
  popd > /dev/null
  echo "done!"
fi

echo -n "Getting AWS credentials ... "
eval $(gds aws digital-identity-dev -e)
echo "done!"

runTerraform "." "${TERRAFORM_OPTS}"