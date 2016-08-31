'use strict';

var fs = require('fs');
var path = require('path');

var extend = require('lodash/extend');
var forEach = require('lodash/forEach');

var chalk = require('chalk');
var table = require('text-table');
var sprintf = require('sprintf-js').sprintf;
var wrap = require('word-wrap');

/**
 * ## stylishReporter
 *
 * Converts JSON-formatted linter errors to Stylish
 *
 * @param  {Object} errorFiles: mapping of files to an array of linter error objects
 * @param  {Object} [options.verbose]: whether to include the reason, enabled by default
 * @param  {Object} [options.wrapReason]: character limit for the reason before wrapping
 * @return {String} Stylish-formatted errors
 */
function stylishReporter(errorFiles, options) {
    var ret = '';

    options = extend({
        verbose: true,
        wrapReason: 80,
    }, options);

    var colors = {};
    if (fs.existsSync(path.resolve('.stylishcolors'))) {
        var rc = fs.readFileSync('.stylishcolors', {
            encoding: 'utf8'
        });
        colors = JSON.parse(rc);
    }

    colors = extend({
        meta: 'gray',
        reason: 'white',
        linter: 'gray',
        warning: 'yellow',
        error: 'red',
        noProblem: 'green'
    }, colors);

    var totalProblems = 0;
    var totalErrors = 0;
    var totalWarnings = 0;

    forEach(errorFiles, function(errors, path) {
        var lines = [];
        forEach(errors, function(error) {
            if (typeof error === 'string') {
                error = {reason: error};
            }

            // Since text-table doesn't support wrapping, we work around it manually
            var reason = error.reason || error.message || '';
            if (options.verbose && options.wrapReason) {
                reason = wrap(reason, {
                    width: options.wrapReason === true ? 80 : options.wrapReason,
                });
            }

            // Looping through the split lines allows us to keep the word-wrapped reason aligned
            forEach(reason.split('\n'), function(reason, i) {
                var line = [];
                line.push(chalk[colors.meta](i ? ' ' : [error.line || 0, error.column || 0].join(':')));

                switch (error.severity) {
                    case 'warning':
                        totalProblems++;
                        totalWarnings++;
                        line.push(chalk[colors.warning](i ? ' ' : 'warning'));
                        break;
                    case 'error':
                    default:
                        totalProblems++;
                        totalErrors++;
                        line.push(chalk[colors.error](i ? ' ' : 'error'));
                        break;
                }

                if (options.verbose) {
                    line.push(chalk[colors.reason](reason));
                }

                line.push(chalk[colors.linter](i ? ' ' : error.linter || ''));

                // Add the lines
                lines.push(line);
            });
        });

        // Output the report for the file
        ret += chalk.underline(path) + '\n';
        ret += table(lines, {
            align: ['r', 'l', 'l', 'l'],
        }) + '\n\n';
    });

    // Add the summary to the results
    var resultColor = colors.noProblem;
    if (totalProblems > 0) {
        resultColor = totalErrors ? colors.error : colors.warning;
        ret += chalk[resultColor].bold(sprintf(
            '✖ %d %s (%d %s, %d %s)',
            totalProblems, totalProblems === 1 ? 'problem' : 'problems',
            totalErrors, totalErrors === 1 ? 'error' : 'errors',
            totalWarnings, totalWarnings === 1 ? 'warning' : 'warnings'
        ));
    } else {
        ret += chalk[resultColor].bold('✔ No problems');
    }

    return '\n' + ret.trim() + '\n';
}

module.exports = stylishReporter;
