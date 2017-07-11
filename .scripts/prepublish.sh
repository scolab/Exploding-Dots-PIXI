#!/bin/bash

# IMPORTANT
# ---------
# This is an auto generated file with React CDK.
# Do not modify this file.
# Use `.scripts/user/prepublish.sh instead`.

echo "=> Transpiling 'src' into ES5 ..."
echo ""
rm -rf ./dist
rm -rf ./ts-out
NODE_ENV=production ./node_modules/typescript/bin/tsc --outDir ./ts-out
NODE_ENV=production ./node_modules/.bin/babel --ignore tests,stories --plugins "transform-runtime,babel-plugin-transform-inline-environment-variables" ./ts-out --out-dir ./dist
rsync -av --include '*/' --include '*.json' --include '*.png' --include '*.jpg' --include '*.jpeg' --include '*.gif' --exclude '*' ./src/ ./dist/
rm -rf ./ts-out
echo ""
echo "=> Transpiling completed."

. .scripts/user/prepublish.sh
