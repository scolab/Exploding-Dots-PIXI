#!/usr/bin/env bash
# Use this file to your own code to run at NPM `prepublish` event.

cp -rf ./src/fonts/ ./dist/fonts/
cp -rf ./src/components/images/ ./dist/components/images/
cp -rf ./src/components/CanvasPIXI/images/ ./dist/components/CanvasPIXI/images/
cp ./src/ExplodingDots.css ./dist/
cp ./src/font-awesome.min.css ./dist/
cp ./src/do_drag_blue.json ./dist/
cp ./src/do_drag_red.json ./dist/
cp ./src/dot_explode.json ./dist/
cp ./src/dot_implode.json ./dist/

