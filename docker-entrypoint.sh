#!/bin/sh
if [ ! -f /app/data/admin.db ]; then
  echo "数据库不存在，正在初始化..."
  node seed.js
  echo "数据库初始化完成"
fi
exec node server.js
