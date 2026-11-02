#!/bin/sh
# BRIDGE-MENTOR standalone build: npm install && npm run build -> dist/index.html
set -e
npm install
npm run build
cp dist/entry.html ./index.html
echo "Built ./index.html"
