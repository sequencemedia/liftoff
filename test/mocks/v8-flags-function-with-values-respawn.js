const Liftoff = require('../..')

const liftoff = new Liftoff({
  name: 'v8FlagsTest',
  v8flags (done) {
    process.nextTick(() => {
      done(null, ['--stack_size'])
    })
  }
})

liftoff
  .on('respawn', function done (flags) {
    console.log(`MOCK LIFTOFF RESPAWN ${JSON.stringify(flags)}`)
  })

liftoff.prepare({}, function done (env) {
  liftoff.execute(env, function done () { // done (env, argv) {
    console.log('MOCK LIFTOFF DONE')
  })
})
