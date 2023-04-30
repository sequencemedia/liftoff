const chai = require('chai')
const {
  expect
} = chai

const getOpts = require('../../../lib/get-opts')

const NAME = 'MOCK NAME'

describe('getOpts', () => {
  describe('With valid arguments', () => {
    describe('With `name`', () => {
      describe('`processTitle`, `moduleName`, and `configFile` are defined', () => {
        it('returns the values', () => {
          const opts = getOpts({
            name: NAME,
            processTitle: 'MOCK PROCESS TITLE',
            configName: 'MOCK CONFIG NAME',
            moduleName: 'MOCK MODULE NAME'
          })

          expect(opts.processTitle)
            .to.equal('MOCK PROCESS TITLE')

          expect(opts.configName)
            .to.equal('MOCK CONFIG NAME')

          expect(opts.moduleName)
            .to.equal('MOCK MODULE NAME')
        })
      })

      describe('`processTitle`, `moduleName`, and `configFile` are not defined', () => {
        it('derives the values from `name`', () => {
          const opts = getOpts({ name: NAME })

          expect(opts.processTitle)
            .to.equal(NAME)

          expect(opts.configName)
            .to.equal(NAME + 'file')

          expect(opts.moduleName)
            .to.equal(NAME)
        })
      })
    })

    describe('Without `name` or `processTitle`', () => {
      it('throws', () => {
        expect(() => { getOpts() })
          .to.throw('You must specify a processTitle.')
      })
    })

    describe('Without `name` or `configName`', () => {
      it('throws', () => {
        expect(() => { getOpts({ processTitle: NAME }) })
          .to.throw('You must specify a configName.')
      })
    })

    describe('Without `name` or `moduleName`', () => {
      it('throws', () => {
        expect(() => { getOpts({ processTitle: NAME, configName: NAME }) })
          .to.throw('You must specify a moduleName.')
      })
    })
  })

  describe('With invalid arguments', () => {
    it('throws', () => {
      expect(() => { getOpts(null) })
        .to.throw()

      expect(() => { getOpts(undefined) })
        .to.throw()

      expect(() => { getOpts({}) })
        .to.throw()
    })
  })
})
