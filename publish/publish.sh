#!/bin/bash
set -o errexit
set -o nounset
set -o pipefail
 
# 修改这里的名称（项目名去掉-web）
WEB_NAME=AI-inspect
 
ROOT=$(cd `dirname $0`/..; pwd)
VERSION=`date +%Y%m%d`'-'${BUILD_ID:-}
WEB_REPOSITORY=${WEB_REPOSITORY:-.}
 
ENV=""
add_env() { if [ -n "${2-}" ]; then ENV="${ENV} -e $1=$2"; fi }
add_env npm_config_registry ${npm_registry:-}
add_env npm_config_proxy ${http_proxy:-}
add_env npm_config_https_proxy ${https_proxy:-}
docker run --rm -v $ROOT:/build  -w /build \
  -e GIT_SSL_NO_VERIFY=true \
  -e npm_config_strict_ssl=false \
  ${ENV} \
  -v /root/.ssh/id_rsa:/root/.ssh/id_rsa \
  -v /root/.ssh/known_hosts:/root/.ssh/known_hosts \
  af.hikvision.com.cn/docker-bbg/library/node:20.12.0 sh -c \
  "npm install && npm run ${1:-"build"}"

echo  ${WEB_NAME}-${VERSION}.tar
cd ${ROOT}/dist
tar czf ${WEB_REPOSITORY}/${WEB_NAME}-${VERSION}.tar .
jfrog rt upload --exclude-patterns=".*;*/.*" --flat=false ./ "generic-ebg-debug/yunmou/web/$WEB_NAME/$VERSION-$2/" 