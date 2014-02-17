var spawn = require('spawn-command')

// Helper to defer done callback
function after (n, fn) {
  return function () {
    if (n === 1) fn()
    n--
  }
}

module.exports = function (opts, callback) {
  // Allow exitOnFirst flag to initiate process races
  var requiredCompletions = opts.commands.length
  if (opts.exitOnFirst) {
    requiredCompletions = 1
  }

  // When the done condition is triggered,
  // clean up remaining processes and respond
  var done = after(requiredCompletions, function () {
    running.forEach(function (p) {
      p.kill('SIGTERM')
    })
    callback()
  })

  // Keep list of running processes
  var running = []

  // Run each command and store in running list
  opts.commands.forEach(function (command) {
    var p = spawn(command)
    running.push(p)
    
    // Allow piping data into the processes
    if (opts.stdin) {
      opts.stdin.pipe(p.stdin)
    }
    if (opts.stdout) {
      p.stdout.pipe(opts.stdout)
    }
    if (opts.stderr) {
      p.stderr.pipe(opts.stderr)
    }

    // Remove from running list
    p.on('close', function () {
      running.splice(running.indexOf(p), 1)
      done()
    })
  })
}