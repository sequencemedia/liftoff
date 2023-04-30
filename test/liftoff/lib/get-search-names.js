const chai = require('chai')
const {
  expect
} = chai

const getSearchNames = require('../../../lib/get-search-names.js')

describe('getSearchNames', () => {
  describe('With valid opts', () => {
    describe('`configName` is a regular expression', () => {
      it('returns an array containing `configName`', () => {
        const searchNames = /MOCK SEARCH NAMES/

        expect(getSearchNames({ configName: searchNames }))
          .to.have.members([searchNames])
      })
    })

    describe('With one extension in `extensions`', () => {
      it('returns an array of search names', () => {
        const extensions = getSearchNames({ configName: 'foo', extensions: ['.js'] })

        expect(extensions)
          .to.have.members(['foo.js'])
      })
    })

    describe('With several extensions in `extensions`', () => {
      it('returns an array of search names', () => {
        const extensions = getSearchNames({ configName: 'foo', extensions: ['.js', '.coffee'] })

        expect(extensions)
          .to.have.members(['foo.js', 'foo.coffee'])
      })
    })
  })

  describe('With invalid opts', () => {
    it('throws', () => {
      expect(() => { getSearchNames() })
        .to.throw()

      expect(() => { getSearchNames(null) })
        .to.throw()

      expect(() => { getSearchNames({}) })
        .to.throw()
    })

    describe('`configName` is defined', () => {
      describe('Without `extensions`', () => {
        it('throws', () => {
          expect(() => { getSearchNames({ configName: 'foo' }) })
            .to.throw()
        })
      })

      describe('With invalid `extensions`', () => {
        it('throws', () => {
          expect(() => { getSearchNames({ configName: 'foo', extensions: '?' }) })
            .to.throw()
        })
      })
    })

    describe('`configName` is undefined', () => {
      it('throws', () => {
        expect(() => { getSearchNames({ extensions: ['.js'] }) })
          .to.throw()
      })
    })

    describe('`extensions` is not an array', () => {
      it('throws', () => {
        expect(() => { getSearchNames({ configName: 'foo' }) })
          .to.throw()

        expect(() => { getSearchNames({ configName: 'foo', extensions: null }) })
          .to.throw()

        expect(() => { getSearchNames({ configName: 'foo', extensions: '.js' }) })
          .to.throw()
      })
    })
  })
})
