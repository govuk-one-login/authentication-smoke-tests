#!/usr/bin/env bash

set -eu
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

export DEPLOY_ENV="sandpit"
export AWS_PROFILE="gds-di-development-admin"

# shellcheck source=scripts/dev_deploy_common.sh
source "${DIR}/scripts/dev_deploy_common.sh"
