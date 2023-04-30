const path = require('path')

module.exports = function getCwd (opts = {}) {
  const configPath = opts.configPath
  let cwd = opts.cwd

  // if a path to the config was provided, but not the cwd,
  // then use the config directory
  if (typeof configPath === 'string' && !cwd) {
    cwd = path.dirname(path.resolve(configPath))
  }

  if (typeof cwd === 'string') {
    return path.resolve(cwd)
  }

  return process.cwd()
}
