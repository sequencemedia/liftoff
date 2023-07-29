import path from 'node:path'
import {
  expect
} from 'chai'
import getCwd from '#get-cwd'

describe('./lib/get-cwd', () => {
  describe('With `cwd`', () => {
    describe('`cwd` is a string', () => {
      it('returns `cwd`', () => {
        expect(getCwd({ cwd: '../' }))
          .to.equal(path.resolve('../'))
      })
    })

    describe('`cwd` is not a string', () => {
      it('does not return `cwd`', () => {
        expect(getCwd({ cwd: true }))
          .not.to.be.true
      })
    })
  })

  describe('Without `cwd`', () => {
    describe('With `configPath`', () => {
      describe('`configPath` is a string', () => {
        it('derives the current working directory from `configPath`', () => {
          expect(getCwd({ configPath: './test/fixtures/mochafile.js' }))
            .to.equal(path.resolve('./test/fixtures'))
        })
      })

      describe('`configPath` is not a string', () => {
        it('does not return `configPath`', () => {
          expect(getCwd({ configPath: true }))
            .not.to.be.true
        })
      })
    })
  })

  describe('Otherwise', () => {
    it('should return the process current working directory', () => {
      expect(getCwd())
        .to.equal(process.cwd())
    })
  })
})
