#!/usr/bin/env bash
# Use this file to your own code to run at NPM `prepublish` event.

cp -rf ./src/fonts/ ./dist/fonts/
cp -rf ./src/components/images/ ./dist/components/images/
cp -rf ./src/components/CanvasPIXI/images/ ./dist/components/CanvasPIXI/images/
cp ./src/ExplodingDots.css ./dist/
cp ./src/font-awesome.min.css ./dist/
cp ./src/components/CanvasPIXI/dot_drag_blue.json ./dist/components/CanvasPIXI/
cp ./src/components/CanvasPIXI/dot_drag_red.json ./dist/components/CanvasPIXI/
cp ./src/components/CanvasPIXI/dot_explode.json ./dist/components/CanvasPIXI/
cp ./src/components/CanvasPIXI/dot_implode.json ./dist/components/CanvasPIXI/

