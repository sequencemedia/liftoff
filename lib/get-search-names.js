module.exports = function getSearchNames (opts = {}) {
  const configName = opts.configName
  const extensions = opts.extensions

  if (!configName) {
    throw new Error('Please specify a configName.')
  }

  if (configName instanceof RegExp) {
    return [configName]
  }

  if (!Array.isArray(extensions)) {
    throw new Error('Please provide an array of valid extensions.')
  }

  return extensions.map((extension) => configName + extension)
}
