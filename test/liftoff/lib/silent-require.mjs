import crypto from 'node:crypto'
import path from 'node:path'
import {
  expect
} from 'chai'
import silentRequire from '#silent-require'

import PACKAGE from '../../../package.json' assert { type: 'json' }

describe('./lib/silent-require', () => {
  it('requires', () => {
    expect(silentRequire(path.resolve('./package.json')))
      .to.eql(PACKAGE)
  })

  it('does not throw', () => {
    expect(() => { silentRequire(crypto.randomUUID()) })
      .not.to.throw()
  })
})
