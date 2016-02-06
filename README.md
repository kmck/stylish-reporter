# Stylish Reporter

A quick-and-dirty utility to apply Stylish formatting to any (?) JSON-formatted linter errors.

Loosely based on [jshint-stylish-ex](https://www.npmjs.com/package/jshint-stylish-ex).

### Warning

I only wrote this because `scss-lint` didn't already have Stylish formatting that I could use in
the command line.

I haven't tested it on JSON-formatted output from other linters. Maybe it works?
Who knows! You're welcome to find out and submit a pull request if it doesn't.

## Usage

    scss-lint linty.scss --format=JSON | stylish-reporter
