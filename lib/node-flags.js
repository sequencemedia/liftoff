function getNodeFlags (args, env) {
  if (args instanceof Function) {
    return args.call(this, env)
  }

  if (Array.isArray(args)) {
    return [...args]
  }

  if (typeof args === 'string') {
    return [args]
  }

  return []
}

function getNodeFlagsFromArgv (argv) {
  const flags = []

  const args = Array.from(argv).slice(1)
  while (args.length) {
    const arg = args.shift()

    // if the condition is met then halt
    if ((!/^-/.test(arg)) || arg === '--') break

    // otherwise push it onto the array
    flags.push(arg)
  }

  return flags
}

module.exports = {
  getNodeFlags,
  getNodeFlagsFromArgv
}
