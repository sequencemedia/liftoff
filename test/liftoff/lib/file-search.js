const crypto = require('node:crypto')
const path = require('node:path')

const chai = require('chai')
const {
  expect
} = chai

const fileSearch = require('../../../lib/file-search')

describe('fileSearch', () => {
  describe('With a valid file name array', () => {
    it('returns a file path', () => {
      expect(fileSearch(['package.json'], [process.cwd()]))
        .to.equal(path.resolve(__dirname, '../../../package.json'))
    })
  })

  describe('With a valid file name string', () => {
    it('returns a file path', () => {
      expect(fileSearch('package.json', [process.cwd()]))
        .to.equal(path.resolve(__dirname, '../../../package.json'))
    })
  })

  describe('With an invalid file name array', () => {
    it('returns null', () => {
      expect(fileSearch([crypto.randomUUID()], ['../../']))
        .to.be.null
    })
  })

  describe('With an invalid file name string', () => {
    it('returns null', () => {
      expect(fileSearch(crypto.randomUUID(), ['../../']))
        .to.be.null
    })
  })
})
