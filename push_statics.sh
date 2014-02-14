#!/usr/bin/env bash

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

assets=$DIR/appcubator/dist_static/*
echo "Deploying: $assets"

s3cmd sync --force --reduced-redundancy --acl-public $assets s3://$AWS_STORAGE_BUCKET_NAME/

