const {
  EventEmitter
} = require('node:events')
const {
  isPlainObject
} = require('is-plain-object')
const rechoir = require('rechoir')

module.exports = function registerLoader (eventEmitter, extensions = {}, configPath, cwd) {
  if (eventEmitter instanceof EventEmitter && isPlainObject(extensions) && typeof configPath === 'string') {
    const autoloads = rechoir.prepare(extensions, configPath, cwd, true)
    if (autoloads instanceof Error) { // Only errors
      autoloads.failures
        .forEach(function (failed) {
          eventEmitter.emit('requireFail', failed.moduleName, failed.error)
        })
    } else {
      if (Array.isArray(autoloads)) { // Already required or no config.
        const succeeded = autoloads[autoloads.length - 1]
        eventEmitter.emit('require', succeeded.moduleName, succeeded.module)
      }
    }
  }
}
