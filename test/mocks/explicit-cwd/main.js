const Liftoff = require('../../..')

const liftoff = new Liftoff({
  name: 'app'
})

liftoff.launch({ cwd: __dirname }, ({ modulePath }) => {
  console.log(`MOCK LIFTOFF ${modulePath}`)
})
