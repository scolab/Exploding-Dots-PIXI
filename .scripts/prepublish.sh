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
echo "----- Compile typescript -----"
NODE_ENV=production npx tsc --outDir ./ts-out
echo "----- Compile to es5 -----"
NODE_ENV=production npx babel --ignore tests,stories --plugins "transform-runtime,babel-plugin-transform-inline-environment-variables" ./ts-out --out-dir ./dist
echo "----- Copy files -----"
rsync -av --include '*/' --include '*.json' --include '*.png' --include '*.jpg' --include '*.jpeg' --include '*.gif' --exclude '*' ./src/ ./dist/
echo "----- Clean -----"
rm -rf ./ts-out
echo ""
echo "=> Transpiling completed."

. .scripts/user/prepublish.sh
