module.exports = function silentRequire (path) {
  try {
    return require(path)
  } catch (e) {
    const {
      code
    } = e

    if (code !== 'MODULE_NOT_FOUND') console.error(e)
  }
}
