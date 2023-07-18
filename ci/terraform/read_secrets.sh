#!/bin/bash
ENVIRONMENT=$1

if [ "$ENVIRONMENT" = "dev" ]; then
	ENVIRONMENT="build";
fi

secrets=$(aws secretsmanager list-secrets --filter Key="name",Values="/deploy/$ENVIRONMENT/" --region eu-west-2 | jq -c '.SecretList[]')

for i in $secrets; do
  arn=$(echo $i | jq -r '.ARN')
  name=$(echo $i | jq -r '.Name | split("/") | last')
  value=$(aws secretsmanager get-secret-value --secret-id $arn | jq -r '.SecretString')
  VAR=(TF_VAR_$name=$value)
  export $VAR
done

export TF_VAR_hashed_password=`echo -n "${TF_VAR_smoke_tester_password}" | argon2 $(openssl rand -hex 32) -e -id -v 13 -k 15360 -t 2 -p 1`
