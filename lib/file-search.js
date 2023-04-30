const findUp = require('findup-sync')

module.exports = function fileSearch (names, paths) {
  let path

  let i = 0
  const j = paths.length
  for (i, j; i < j; i++) {
    const cwd = paths[i]
    path = findUp(names, { cwd, nocase: true })
    if (path) break
  }

  return path
}
