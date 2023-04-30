const crypto = require('node:crypto')
const path = require('node:path')

const chai = require('chai')
const {
  expect
} = chai

const silentRequire = require('../../../lib/silent-require')

describe('silentRequire', () => {
  it('requires', () => {
    expect(silentRequire(path.resolve('./package.json')))
      .to.eql(require('../../../package'))
  })

  it('does not throw', () => {
    expect(() => { silentRequire(crypto.randomUUID()) })
      .not.to.throw()
  })
})
