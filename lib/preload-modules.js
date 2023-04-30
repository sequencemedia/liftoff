const toUnique = (accumulator, name) => accumulator.includes(name) ? accumulator : accumulator.concat(name)

module.exports = function preloadModules (liftoff, { require = [], cwd }) {
  require
    .reduce(toUnique, [])
    .forEach((name) => {
      liftoff.requireLocal(name, cwd)
    })
}
