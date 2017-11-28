#!/usr/bin/env bash

BASE_DIR=`dirname $0`

aws s3 sync ${BASE_DIR}/src s3://dev.aronim.com --quiet --acl public-read --exclude="libs/aws-sdk*" --profile aronim --delete && \
  aws cloudfront create-invalidation --distribution-id E3G8KRTK0HFUG5 --paths / /index.html
