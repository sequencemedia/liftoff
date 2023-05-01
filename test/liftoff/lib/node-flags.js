require('module-alias/register')

const chai = require('chai')
const {
  expect
} = chai
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const {
  getNodeFlags,
  getNodeFlagsFromArgv
} = require('~/lib/node-flags')

chai.use(sinonChai)

describe('./lib/node-flags', () => {
  describe('`getNodeFlags()`', () => {
    describe('The first argument is an array', () => {
      it('returns the array', () => {
        expect(getNodeFlags([]))
          .to.have.members([])

        expect(getNodeFlags(['--lazy', '--use_strict', '--harmony']))
          .to.have.members(['--lazy', '--harmony', '--use_strict'])
      })
    })

    describe('The first argument is a function', () => {
      const env = { cwd: '.' }

      it('executes the function and returns the result', () => {
        const one = sinon.stub().returns([])

        expect(getNodeFlags(one, env))
          .to.have.members([])

        expect(one)
          .to.have.been.calledWith(env)

        const two = sinon.stub().returns(['--lazy', '--harmony'])

        expect(getNodeFlags(two, env))
          .to.have.members(['--lazy', '--harmony'])

        expect(two)
          .to.have.been.calledWith(env)
      })
    })

    describe('The first argument is a string', () => {
      it('returns an array containing the string', () => {
        expect(getNodeFlags('--lazy'))
          .to.have.members(['--lazy'])
      })
    })

    describe('The first argument is neither an array, a function, nor a string', () => {
      it('returns an array', () => {
        expect(getNodeFlags(undefined))
          .to.have.members([])

        expect(getNodeFlags(null))
          .to.have.members([])

        expect(getNodeFlags(true))
          .to.have.members([])

        expect(getNodeFlags(false))
          .to.have.members([])

        expect(getNodeFlags(0))
          .to.have.members([])

        expect(getNodeFlags(123))
          .to.have.members([])

        expect(getNodeFlags({}))
          .to.have.members([])

        expect(getNodeFlags({ length: 1 }))
          .to.have.members([])
      })
    })
  })

  describe('`getNodeFlagsFromArgv()`', () => {
    it('returns node flags when arguments are from respawning', () => {
      const command = ['node', '--lazy', '--harmony', '--use_strict', './aaa/bbb/app.js', '--ccc', 'ddd', '-e', 'fff']

      expect(getNodeFlagsFromArgv(command))
        .to.deep.equal(['--lazy', '--harmony', '--use_strict'])
    })

    it('does not return flags after "--"', () => {
      const command = ['node', '--lazy', '--', '--harmony', '--use_strict', './aaa/bbb/app.js', '--ccc', 'ddd', '-e', 'fff']

      expect(getNodeFlagsFromArgv(command))
        .to.deep.equal(['--lazy'])
    })

    it('returns node flags when arguments are node flags', () => {
      const command = ['node', '--lazy', '--harmony', '--use_strict']

      expect(getNodeFlagsFromArgv(command))
        .to.deep.equal(['--lazy', '--harmony', '--use_strict'])
    })

    it('returns an array when arguments have no node flags', () => {
      const command = ['node', './aaa/bbb/app.js', '--aaa', 'bbb', '-c', 'd']

      expect(getNodeFlagsFromArgv(command))
        .to.deep.equal([])
    })
  })
})
