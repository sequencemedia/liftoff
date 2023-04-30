const crypto = require('node:crypto')
const path = require('node:path')

const chai = require('chai')
const {
  expect
} = chai

const findConfig = require('../../../lib/find-config')

describe('findConfig', () => {
  describe('With `configName`', () => {
    describe('`configName` is valid', () => {
      it('returns an absolute path', () => {
        expect(findConfig({ configPath: './test/fixtures/mochafile.js' }))
          .to.equal(path.resolve('./test/fixtures/mochafile.js'))
      })
    })

    describe('`configName` is invalid', () => {
      it('returns null', () => {
        expect(findConfig({ configPath: crypto.randomUUID() }))
          .to.equal(null)
      })
    })
  })

  describe('Without `configName`', () => {
    it('returns an absolute path to the first config file found', () => {
      expect(findConfig({ searchNames: ['mochafile.js', 'mochafile.coffee'], searchPaths: ['test/fixtures'] }))
        .to.equal(path.resolve('./test/fixtures/mochafile.js'))

      expect(findConfig({ searchNames: ['mochafile.js', 'mochafile.coffee'], searchPaths: ['test/fixtures/search-paths', 'test/fixtures/coffee'] }))
        .to.equal(path.resolve('./test/fixtures/search-paths/mochafile.js'))

      expect(findConfig({ searchNames: ['mochafile.js'], searchPaths: ['test/fixtures/search-paths', 'test/fixtures/coffee'] }))
        .to.equal(path.resolve('./test/fixtures/search-paths/mochafile.js'))
    })

    describe('`searchPaths` is invalid', () => {
      it('throws', () => {
        expect(() => { findConfig({ searchNames: ['mochafile.js', 'mochafile.coffee'] }) })
          .to.throw()

        expect(() => { findConfig({ searchNames: ['mochafile.js', 'mochafile.coffee'], searchPaths: null }) })
          .to.throw()

        expect(() => { findConfig({ searchNames: ['mochafile.js', 'mochafile.coffee'], searchPaths: 'test/fixtures/search-paths' }) })
          .to.throw()
      })
    })

    describe('`searchNames` is invalid', () => {
      it('throws', () => {
        expect(() => { findConfig({ searchPaths: ['../'] }) }).to.throw()

        expect(() => { findConfig({ searchPaths: ['test/fixtures/search-paths', 'test/fixtures/coffee'] }) })
          .to.throw()

        expect(() => { findConfig({ searchNames: null, searchPaths: ['test/fixtures/search-paths', 'test/fixtures/coffee'] }) })
          .to.throw()

        expect(() => { findConfig({ searchNames: '', searchPaths: ['test/fixtures/search-paths', 'test/fixtures/coffee'] }) })
          .to.throw()
      })
    })
  })

  describe('With invalid opts', () => {
    it('throws', () => {
      expect(() => { findConfig() })
        .to.throw()

      expect(() => { findConfig(null) })
        .to.throw()

      expect(() => { findConfig({}) })
        .to.throw()
    })
  })
})
