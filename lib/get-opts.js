const extend = require('extend')

module.exports = function (opts = {}) {
  const defaults = {
    extensions: {
      '.js': null,
      '.json': null
    },
    searchPaths: []
  }

  if (opts.name) {
    if (!opts.processTitle) {
      opts.processTitle = opts.name
    }

    if (!opts.configName) {
      opts.configName = opts.name + 'file'
    }

    if (!opts.moduleName) {
      opts.moduleName = opts.name
    }
  }

  if (!opts.processTitle) {
    throw new Error('You must specify a processTitle.')
  }

  if (!opts.configName) {
    throw new Error('You must specify a configName.')
  }

  if (!opts.moduleName) {
    throw new Error('You must specify a moduleName.')
  }

  return extend(defaults, opts)
}
