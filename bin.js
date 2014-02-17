#!/usr/bin/env node
var spawn = require('spawn-command')
var parallel = require('./')

var args = process.argv
args.shift()
args.shift()

var tasks = []
var after
var arg

while (arg = args.shift()) {
  if (arg === '--') {
    after = args.shift()
  } else {
    tasks.push(arg)
  }
}

function done () {
  process.exit(1)
}

parallel({
  commands: tasks,
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr
}, function () {
  if (after) {
    var p = spawn(after)
    p.stdout.pipe(process.stdout)
    p.stderr.pipe(process.stderr)
    p.on('end', done)
    p.on('close', done)
  } else {
    done()
  }
})