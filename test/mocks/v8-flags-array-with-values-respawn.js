require('module-alias/register')

const Liftoff = require('~')

const liftoff = new Liftoff({
  name: 'v8FlagsTest',
  v8flags: ['--stack_size']
})

liftoff
  .on('respawn', function (flags) {
    console.log(`MOCK LIFTOFF RESPAWN ${JSON.stringify(flags)}`)
  })

liftoff.prepare({}, function (env) {
  liftoff.execute(env, function done () { // done (env, argv) {
    console.log('MOCK LIFTOFF DONE')
  })
})
