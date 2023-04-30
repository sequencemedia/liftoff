const crypto = require('node:crypto')
const path = require('node:path')

const chai = require('chai')
const {
  expect
} = chai
const sinon = require('sinon')

const registerLoader = require('../../../lib/register-loader')

const {
  EventEmitter
} = require('events')

const FIXTURES_PATH = path.resolve(__dirname, '../../fixtures/register-loader')

describe('registerLoader', () => {
  let eventEmitter

  beforeEach(() => {
    eventEmitter = new EventEmitter()
  })

  describe('`registerLoader()`', () => {
    it('Should emit a `require` event when registering a loader succeeds', () => {
      const loaderPath = path.join(FIXTURES_PATH, 'require-cfg.js')
      const configPath = path.join(FIXTURES_PATH, 'application.cfg')
      const extensions = { '.cfg': loaderPath }

      const spy = sinon.spy()

      eventEmitter
        .on('require', spy)
        .on('requireFail', () => {
          expect.fail('Event `requireFail` was emitted')
        })

      registerLoader(eventEmitter, extensions, configPath)

      expect(spy)
        .to.have.been.calledWith(loaderPath)
    })

    it('Should emit only a `require` event when registering a loader both fails and succeeds', () => {
      const loaderPath = path.join(FIXTURES_PATH, 'require-conf.js')
      const configPath = path.join(FIXTURES_PATH, 'application.conf')
      const extensions = { '.conf': ['MOCK MODULE NAME', loaderPath] }

      const spy = sinon.spy()

      eventEmitter
        .on('require', spy)
        .on('requireFail', () => {
          expect.fail('Event `requireFail` was emitted')
        })

      registerLoader(eventEmitter, extensions, configPath)

      expect(spy)
        .to.have.been.calledWith(loaderPath)
    })

    it('Should emit a `requireFail` event when a loader is not found', () => {
      const loaderPath = path.join(FIXTURES_PATH, crypto.randomUUID())
      const configPath = path.join(FIXTURES_PATH, 'application.tmp')
      const extensions = { '.tmp': ['MOCK MODULE NAME', loaderPath] }

      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => {
          expect.fail('Event `require` was emitted')
        })

      registerLoader(eventEmitter, extensions, configPath)

      expect(spy.firstCall.firstArg)
        .to.equal('MOCK MODULE NAME')

      expect(spy.firstCall.lastArg)
        .to.be.instanceOf(Error)

      expect(spy.secondCall.firstArg)
        .to.equal(loaderPath)

      expect(spy.secondCall.lastArg)
        .to.be.instanceOf(Error)
    })

    it('Should emit a `requireFail` event when registering a loader fails', () => {
      const loaderPath = path.join(FIXTURES_PATH, 'require-fail.js')
      const configPath = path.join(FIXTURES_PATH, 'application.tmp')
      const extensions = { '.tmp': loaderPath }

      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => {
          expect.fail('Event `require` was emitted')
        })

      registerLoader(eventEmitter, extensions, configPath)

      expect(spy)
        .to.have.been.calledWith(loaderPath)
    })
  })

  describe('`extensions`', () => {
    it('Should do nothing when `extensions` is null', () => {
      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter)

      registerLoader(eventEmitter, null, 'aaa/bbb.cfg')
      registerLoader(eventEmitter, null, 'aaa/bbb.cfg', '.')

      // .js is one of default extensions
      registerLoader(eventEmitter, null, 'aaa/bbb.js')
      registerLoader(eventEmitter, null, 'aaa/bbb.js', '.')

      return expect(spy)
        .not.to.have.been.called
    })

    it('Should do nothing when `extensions` is illegal type', () => {
      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter, 123, 'aaa/bbb.cfg')
      registerLoader(eventEmitter, true, 'aaa/bbb.cfg')
      registerLoader(eventEmitter, () => {}, 'aaa/bbb.cfg')
      registerLoader(eventEmitter, ['.rc', '.cfg'], 'aaa/bbb.cfg')

      // .js is one of default extensions
      registerLoader(eventEmitter, 123, 'aaa/bbb.js')
      registerLoader(eventEmitter, true, 'aaa/bbb.js')
      registerLoader(eventEmitter, () => {}, 'aaa/bbb.js')
      registerLoader(eventEmitter, ['.js', '.json'], 'aaa/bbb.js')

      return expect(spy)
        .not.to.have.been.called
    })

    it('Should do nothing when `extensions` is a string', () => {
      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter, '.cfg', 'aaa/bbb.cfg')
      registerLoader(eventEmitter, '.js', 'aaa/bbb.js')

      return expect(spy)
        .not.to.have.been.called
    })
  })

  describe('`configPath`', () => {
    it('Should do nothing when `configPath` is null', () => {
      const extensions0 = ['.js', '.json', '.coffee', '.coffee.md']
      const extensions1 = {
        '.js': null,
        '.json': null,
        '.coffee': 'coffee-script/register',
        '.coffee.md': 'coffee-script/register'
      }

      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter, extensions0)
      registerLoader(eventEmitter, extensions1)
      registerLoader(eventEmitter, extensions0, null, '.')
      registerLoader(eventEmitter, extensions1, null, '.')

      return expect(spy)
        .not.to.have.been.called
    })

    it('Should do nothing when `configPath` is illegal type', () => {
      const extensions0 = ['.js', '.json', '.coffee', '.coffee.md']
      const extensions1 = {
        '.js': null,
        '.json': null,
        '.coffee': 'coffee-script/register',
        '.coffee.md': 'coffee-script/register'
      }

      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter, extensions0, 123)
      registerLoader(eventEmitter, extensions0, ['aaa', 'bbb'])
      registerLoader(eventEmitter, extensions1, {})
      registerLoader(eventEmitter, extensions1, () => {})

      return expect(spy)
        .not.to.have.been.called
    })

    it('Should do nothing when `configPath` does not have an extension in `extensions`', () => {
      const loaderPath = path.join(FIXTURES_PATH, 'require-rc.js')
      const configPath = path.join(FIXTURES_PATH, 'application.xxx')
      const extensions = { '.cfg': loaderPath }

      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter, extensions, configPath)

      return expect(spy)
        .not.to.have.been.called
    })

    it('Should do nothing when `configPath` has an extension which was already registered', () => {
      const loaderPath = path.join(FIXTURES_PATH, 'require-cfg.js')
      const configPath = path.join(FIXTURES_PATH, 'application.cfg')
      const extensions = { '.cfg': loaderPath }

      const spy = sinon.spy()

      eventEmitter
        .on('requireFail', spy)
        .on('require', () => spy)

      registerLoader(eventEmitter, extensions, configPath)

      return expect(spy)
        .not.to.have.been.called
    })
  })

  describe('`cwd`', () => {
    it('Should use `cwd` as a base directory', () => {
      const loaderPath = path.join(FIXTURES_PATH, 'require-rc.js')
      const configPath = 'application.rc'
      const extensions = { '.rc': loaderPath }

      const spy = sinon.spy()

      eventEmitter
        .on('require', spy)
        .on('requireFail', () => {
          expect.fail('Event `requireFail` was emitted')
        })

      registerLoader(eventEmitter, extensions, configPath, FIXTURES_PATH)

      expect(spy)
        .to.have.been.calledWith(loaderPath)
    })
  })
})
