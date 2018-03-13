#! /usr/bin/env node
var shell = require('shelljs');

shell.pwd();
shell.cd('dist/');
shell.find('.')
  .filter(function(file){ return file.match(/\.js$/);})
  .forEach(function(file){
    shell.echo('Delete file: ' + file);
    shell.rm(file);
  });
shell.cd('..');

