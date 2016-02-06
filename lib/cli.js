#!/usr/bin/env node

'use strict';

var stdin = process.stdin;
var stdout = process.stdout;
var argv = require('minimist')(process.argv.slice(2));

var stylishReporter = require('./stylish-reporter');

function writeReport(inputString) {
    stdout.write(stylishReporter(inputString))
    stdout.write('\n');
}

if (!stdin.isTTY) {
    var chunks = [];
    stdin.on('data', function(chunk) {
        chunks.push(chunk);
    });
    stdin.on('end', function() {
        stdout.write(stylishReporter(JSON.parse(chunks.join(''))));
        stdout.write('\n');
    });
} else if (argv.json) {
    stdout.write(stylishReporter(JSON.parse(argv.json)));
    stdout.write('\n');
} else {
    stdout.write('usage: try piping something in or using --json="{ \"filename\": [errors...] }"\n');
    process.exit();
}
