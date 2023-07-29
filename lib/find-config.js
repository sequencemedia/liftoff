const fs = require('fs')
const path = require('path')
const fileSearch = require('./file-search.js')

module.exports = function findConfig (opts = {}) {
  const searchNames = opts.searchNames
  let configPath = opts.configPath
  const searchPaths = opts.searchPaths

  // only search for a config if a path to one wasn't explicitly provided
  if (!configPath) {
    if (!Array.isArray(searchPaths)) {
      throw new Error('Please provide an array of search paths.')
    }

    if (!Array.isArray(searchNames)) {
      throw new Error('Please provide an array of search names.')
    }

    configPath = fileSearch(searchNames, searchPaths)
  }

  // confirm it exists
  if (fs.existsSync(configPath)) {
    // resolve it to an absolute path
    return path.resolve(configPath)
  }

  return null
}
