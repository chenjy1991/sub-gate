#!/bin/bash
set -e

VERSION=$(node -p "require('./package.json').version")
IMAGE="chenjy0580/sub-gate"

echo "构建镜像 ${IMAGE}:${VERSION} ..."
docker build -t ${IMAGE}:latest -t ${IMAGE}:${VERSION} .

echo "推送镜像 ..."
docker push ${IMAGE}:latest
docker push ${IMAGE}:${VERSION}

echo "完成！已推送 ${IMAGE}:latest 和 ${IMAGE}:${VERSION}"
