#!/usr/bin/env bash
set -euo pipefail

if ! command -v "gh" &> /dev/null; then
  echo "'gh' is required to run this script. Please install it from https://cli.github.com/"
  exit 1
fi

# Update the remote to get the latest branches
git remote update &> /dev/null

current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ -z "${current_branch}" ]; then
  echo "Failed to determine current branch"
  exit 1
fi

if ! git merge-base --is-ancestor HEAD "@{u}"; then
  echo "Local branch appears to be diverged from remote. This may be okay, I just thought you should know."
fi

echo "Triggering GitHub workflow to deploy to dev"
echo
gh workflow run "build-and-deploy-dev-sp.yml" --ref "${current_branch}"

echo
echo "Now watching workflow progress"
echo
workflow_status=queued
workflow_conclusion=na
workflow_url=na
while [[ ${workflow_status} != "completed" ]]; do
  echo "Workflow status: ${workflow_status}. Checking again in 15 seconds"
  sleep 15
  workflow_response=$(gh run list --workflow=build-and-deploy-dev-sp.yml --json status,conclusion,url | jq ".[0]")
  workflow_status=$(jq -r ".status" <<< "${workflow_response}")
  workflow_conclusion=$(jq -r ".conclusion" <<< "${workflow_response}")
  workflow_url=$(jq -r ".url" <<< "${workflow_response}")
done

echo ""

if [[ ${workflow_conclusion} == "success" ]]; then
  echo "Workflow is complete"
  echo
  echo "Now watching the CodePipeline logs. Manually escape this when you want"
  echo
  AWS_PROFILE=di-authentication-development-AWSAdministratorAccess
  export AWS_PROFILE
  source scripts/export_aws_creds.sh
  aws logs tail /aws/codebuild/Deploy-dev-smoke-test-pipeline --follow
fi

if [[ ${workflow_conclusion} == "failure" ]]; then
  echo "Workflow has failed. More detail at ${workflow_url}"
fi

if [[ ${workflow_conclusion} == "cancelled" ]]; then
  echo "Workflow was cancelled. More detail at ${workflow_url}"
fi
