#!/bin/bash
# 前端构建脚本

echo "开始构建前端项目..."

# 安装依赖
npm install --legacy-peer-deps

# 设置生产环境API地址
export VITE_API_BASE_URL=https://your-domain.com/api

# 构建项目
npm run build

echo "前端构建完成！"
echo "构建文件位于: dist/ 目录" 