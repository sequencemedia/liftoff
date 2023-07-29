import {
  expect
} from 'chai'
import getSearchNames from '#get-search-names'

describe('./lib/get-search-names', () => {
  describe('With valid opts', () => {
    describe('`configName` is a regular expression', () => {
      it('returns an array containing `configName`', () => {
        const pattern = /MOCK SEARCH NAMES/

        expect(getSearchNames({ configName: pattern }))
          .to.have.members([pattern])
      })
    })

    describe('With one extension in `extensions`', () => {
      it('returns an array of search names', () => {
        expect(getSearchNames({ configName: 'foo', extensions: ['.js'] }))
          .to.have.members(['foo.js'])
      })
    })

    describe('With several extensions in `extensions`', () => {
      it('returns an array of search names', () => {
        expect(getSearchNames({ configName: 'foo', extensions: ['.js', '.coffee'] }))
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
