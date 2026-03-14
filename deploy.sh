#!/bin/bash
set -e

VERSION=$(node -p "require('./package.json').version")
IMAGE="chenjy0580/sub-gate"

# 确保 buildx builder 存在
docker buildx inspect subgate-builder >/dev/null 2>&1 || \
  docker buildx create --name subgate-builder --use

docker buildx use subgate-builder

echo "构建并推送 ${IMAGE}:${VERSION} (amd64 + arm64) ..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${IMAGE}:latest \
  -t ${IMAGE}:${VERSION} \
  --push .

echo "完成！已推送 ${IMAGE}:latest 和 ${IMAGE}:${VERSION}"
