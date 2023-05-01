require('module-alias/register')

const Liftoff = require('~/.')

const liftoff = new Liftoff({
  name: 'test',
  v8flags: ['--harmony']
})

liftoff
  .on('respawn', (flags) => {
    console.log(`MOCK LIFTOFF RESPAWN ${JSON.stringify(flags)}`)
  })
  .on('require', (name) => {
    console.log(`MOCK LIFTOFF REQUIRE ${name}`)
  })

liftoff.launch({
  require: 'coffeescript/register',
  forcedFlags: ['--lazy']
}, () => {
  console.log('MOCK LIFTOFF DONE')
})
