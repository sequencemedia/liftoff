const Liftoff = require('../../..')

const liftoff = new Liftoff({
  name: 'app'
})

liftoff.launch({}, ({ modulePath }) => {
  console.log(`MOCK LIFTOFF ${modulePath}`)
})
