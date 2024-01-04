import { exec } from 'node:child_process'
import crypto from 'node:crypto'
import path from 'path'
import { use, expect } from 'chai'
import sinon from 'sinon'
import sinonChai from '@sequencemedia/sinon-chai'
import resolve from 'resolve'
import Liftoff from '#liftoff'

use(sinonChai)

const NAME = 'MOCK LIFTOFF'

const DEFAULT_OPTIONS = {
  processTitle: NAME,
  configName: NAME + 'file',
  moduleName: NAME,
  extensions: {
    '.js': null,
    '.json': null,
    '.coffee': 'coffee-script/register',
    '.coffee.md': 'coffee-script/register'
  },
  searchPaths: [
    'test/fixtures/search-paths'
  ]
}

describe('Liftoff', () => {
  describe('`configFiles`', () => {
    describe('Without `configFiles`', () => {
      it('assigns an object literal to `configFiles` on the env flags', (done) => {
        const liftoff = new Liftoff({
          name: NAME
        })

        liftoff.prepare({}, (env) => {
          expect(env.configFiles)
            .to.eql({})

          done()
        })
      })
    })

    describe('With `configFiles`', () => {
      it('finds config files', (done) => {
        const liftoff = new Liftoff({
          name: NAME,
          configFiles: {
            index: {
              currentdir: '.',
              test: {
                path: 'test/fixtures/config-files'
              },
              findingup: {
                path: 'test/liftoff',
                cwd: 'test/fixtures/config-files',
                findUp: true
              }
            },
            package: {
              currentdir: '.',
              test: {
                path: 'test/fixtures/config-files'
              },
              findingup: {
                path: 'test/liftoff',
                cwd: 'test/fixtures/config-files',
                findUp: true
              }
            }
          }
        })

        liftoff.prepare({}, (env) => {
          expect(env.configFiles)
            .to.eql({
              index: {
                currentdir: path.resolve('./index.js'),
                test: path.resolve('./test/fixtures/config-files/index.json'),
                findingup: null
              },
              package: {
                currentdir: path.resolve('./package.json'),
                test: null,
                findingup: null
              }
            })

          done()
        })
      })

      describe('Without `cwd`', () => {
        it('uses default `cwd`', (done) => {
          const liftoff = new Liftoff({
            name: NAME,
            configFiles: {
              index: {
                cwd: {
                  path: '.',
                  extensions: ['.js', '.json']
                }
              }
            }
          })

          liftoff.prepare({
            cwd: 'test/fixtures/config-files'
          }, (env) => {
            expect(env.configFiles)
              .to.eql({
                index: {
                  cwd: path.resolve('./test/fixtures/config-files/index.json')
                }
              })

            done()
          })
        })
      })

      describe('Without `extensions`', () => {
        it('uses default `extensions`', (done) => {
          const liftoff = new Liftoff({
            extensions: { '.md': null, '.txt': null },
            name: NAME,
            configFiles: {
              README: {
                markdownOne: {
                  path: '.'
                },
                textOne: {
                  path: 'test/fixtures/config-files'
                },
                markdownTwo: {
                  path: '.',
                  extensions: ['.js', '.json']
                },
                textTwo: {
                  path: 'test/fixtures/config-files',
                  extensions: ['.js', '.json']
                }
              }
            }
          })

          liftoff.prepare({}, (env) => {
            expect(env.configFiles)
              .to.eql({
                README: {
                  markdownOne: path.resolve('./README.md'),
                  textOne: path.resolve('./test/fixtures/config-files/README.txt'),
                  markdownTwo: null,
                  textTwo: null
                }
              })

            done()
          })
        })
      })

      it('loads files', (done) => {
        const liftoff = new Liftoff({
          extensions: {
            '.md': './test/fixtures/config-files/require-md'
          },
          name: NAME,
          configFiles: {
            README: {
              textIsNull: {
                path: 'test/fixtures/config-files'
              },
              textHasError: {
                path: 'test/fixtures/config-files',
                extensions: {
                  '.txt': './test/fixtures/config-files/require-non-exist'
                }
              },
              text: {
                path: 'test/fixtures/config-files',
                extensions: {
                  '.txt': './test/fixtures/config-files/require-txt'
                }
              },
              markdown: {
                path: '.'
              },
              markdownBadExtOne: {
                path: '.',
                extensions: {
                  '.txt': './test/fixtures/config-files/require-txt'
                }
              },
              markdownBadExtTwo: {
                path: '.',
                extensions: {
                  '.txt': `./test/fixtures/config-files/${crypto.randomUUID()}`
                }
              }
            },
            // Intrinsic extension-loader mappings are prioritized.
            index: {
              test: {
                path: 'test/fixtures/config-files',
                extensions: { // ignored
                  '.js': './test/fixtures/config-files/require-js',
                  '.json': './test/fixtures/config-files/require-json'
                }
              }
            }
          }
        })

        const requireSpy = sinon.stub()
        const requireFailSpy = sinon.stub()

        liftoff
          .on('require', requireSpy)
          .on('requireFail', requireFailSpy)

        liftoff.prepare({}, (env) => {
          expect(env.configFiles)
            .to.eql({
              README: {
                text: path.resolve('./test/fixtures/config-files/README.txt'),
                textIsNull: null,
                textHasError: path.resolve('./test/fixtures/config-files/README.txt'),
                markdown: path.resolve('./README.md'),
                markdownBadExtOne: null,
                markdownBadExtTwo: null
              },
              index: {
                test: path.resolve('./test/fixtures/config-files/index.json')
              }
            })

          expect(requireSpy)
            .to.be.calledTwice

          expect(requireSpy.firstCall.firstArg)
            .to.equal('./test/fixtures/config-files/require-txt')

          expect(requireSpy.lastCall.firstArg)
            .to.equal('./test/fixtures/config-files/require-md')

          expect(requireFailSpy)
            .to.be.calledOnce

          expect(requireFailSpy.firstCall.firstArg)
            .to.equal('./test/fixtures/config-files/require-non-exist')

          done()
        })
      })
    })
  })

  describe('`buildEnvironment()`', () => {
    describe('Implicit current working directory', () => {
      it('resolves the module path', (done) => {
        exec('cd test/mocks/implicit-cwd && node .', (e, stdout) => {
          expect(e)
            .to.be.null

          expect(stdout)
            .to.include('MOCK LIFTOFF')

          expect(stdout)
            .to.include('/test/mocks/implicit-cwd/main.js')

          done()
        })
      })
    })

    describe('Explicit current working directory', () => {
      it('resolves the module path', (done) => {
        /**
         *  `cwd` is defined in main.js
         */
        exec('node test/mocks/explicit-cwd/main.js', (e, stdout) => {
          expect(e)
            .to.be.null

          expect(stdout)
            .to.include('MOCK LIFTOFF')

          expect(stdout)
            .to.include('/test/mocks/explicit-cwd/main.js')

          done()
        })
      })
    })

    describe('With `cwd`', () => {
      const {
        env: {
          NODE_PATH
        }
      } = process

      afterEach(() => {
        if (NODE_PATH) {
          process.env.NODE_PATH = NODE_PATH
        } else {
          delete process.env.NODE_PATH
        }
      })

      it('requires local module', () => {
        const liftoff = new Liftoff({ name: NAME })

        const cwd = 'MOCK CWD'
        const spy = sinon.spy(resolve, 'sync')

        // Ensure NODE_PATH is not defined
        delete process.env.NODE_PATH

        liftoff.buildEnvironment({ cwd })

        expect(spy)
          .to.be.calledWith(NAME, { basedir: path.join(process.cwd(), cwd), paths: [] })

        spy.restore()
      })

      it('does not use search paths', () => {
        const liftoff = new Liftoff({ name: NAME })

        const cwd = 'MOCK CWD'
        const spy = sinon.spy(resolve, 'sync')

        // Ensure NODE_PATH is not defined
        delete process.env.NODE_PATH

        const { configPath } = liftoff.buildEnvironment({ cwd })

        expect(configPath)
          .to.be.null

        spy.restore()
      })
    })

    describe('Without `cwd`', () => {
      const {
        env: {
          NODE_PATH
        }
      } = process

      afterEach(() => {
        if (NODE_PATH) {
          process.env.NODE_PATH = NODE_PATH
        } else {
          delete process.env.NODE_PATH
        }
      })

      describe('With `NODE_PATH`', () => {
        it('requires the module on the `NODE_PATH`', () => {
          const liftoff = new Liftoff({ name: NAME })

          const cwd = 'MOCK CWD'
          const spy = sinon.spy(resolve, 'sync')

          // Define NODE_PATH
          process.env.NODE_PATH = path.join('MOCK NODE PATH', cwd)

          liftoff.buildEnvironment()

          expect(spy)
            .to.be.calledWith(NAME, { basedir: process.cwd(), paths: [path.join('MOCK NODE PATH', cwd)] })

          spy.restore()
        })
      })

      it('sets the current working directory to the default', () => {
        const liftoff = new Liftoff({ name: 'mocha' })

        const { cwd } = liftoff.buildEnvironment()

        expect(cwd)
          .to.equal(path.resolve('.'))
      })

      it('derives `modulePath` from the default current working directory', () => {
        const liftoff = new Liftoff({ name: 'mocha' })

        const { modulePath } = liftoff.buildEnvironment()

        expect(modulePath)
          .to.equal(path.resolve('./node_modules/mocha/index.js'))
      })

      it('requires the module', () => {
        const liftoff = new Liftoff({ name: 'mocha' })

        const { modulePackage } = liftoff.buildEnvironment()

        expect(modulePackage)
          .to.be.instanceOf(Object)
      })
    })
  })

  describe('`prepare()`', () => {
    describe('With valid arguments', () => {
      it('should set the process.title to the moduleName', () => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)

        liftoff.prepare({}, () => {})

        expect(process.title)
          .to.equal(liftoff.moduleName)
      })

      describe('With `completions`', () => {
        it('should invoke `completions`', (done) => {
          const completions = sinon.spy()

          const liftoff = new Liftoff({
            ...DEFAULT_OPTIONS,
            completions
          })

          liftoff.prepare({ completion: true }, () => {})

          expect(completions)
            .to.have.been.called

          done()
        })
      })

      it('should invoke callback with `liftoff` as context', (done) => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)

        liftoff.prepare({}, function func () {
          expect(this)
            .to.equal(liftoff)

          done()
        })
      })

      it('should invoke callback with `env` as first argument', (done) => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)
        const ENV = liftoff.buildEnvironment()

        liftoff.prepare({}, (env) => {
          expect(env)
            .to.eql(ENV)

          done()
        })
      })
    })

    describe('With invalid arguments', () => {
      it('throws', () => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)

        expect(() => { liftoff.prepare({}) })
          .to.throw()
      })
    })
  })

  describe('`execute()`', () => {
    describe('With valid arguments', () => {
      it('should invoke callback with `liftoff` as context', (done) => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)

        liftoff.execute({}, function func () {
          expect(this)
            .to.equal(liftoff)

          done()
        })
      })

      it('should invoke callback with `env` as first argument', (done) => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)
        const ENV = liftoff.buildEnvironment()

        liftoff.execute(ENV, (env) => {
          /**
           *  Without spy
           */
          expect(env)
            .to.eql(ENV)

          done()
        })
      })

      describe('With `v8Flags`', () => {
        describe('`v8Flags` is an array', () => {
          it('should respawn if process.argv has values from v8flags', (done) => {
            exec('node test/mocks/v8-flags-array-respawn.js --lazy', (e, stdout) => {
              expect(e)
                .to.be.null

              expect(stdout)
                .to.include('MOCK LIFTOFF RESPAWN ["--lazy"]')

              expect(stdout)
                .to.include('MOCK LIFTOFF DONE')

              done()
            })
          })

          it('should not respawn if process.argv does not have values from v8flags', (done) => {
            exec('node test/mocks/v8-flags-array-respawn.js', (e, stdout) => {
              expect(e)
                .to.be.null

              expect(stdout)
                .not.to.include('MOCK LIFTOFF RESPAWN')

              expect(stdout)
                .to.include('MOCK LIFTOFF DONE')

              done()
            })
          })
        })

        describe('`v8Flags` is a function', () => {
          it('should respawn if process.argv has v8 flags', (done) => {
            exec('node test/mocks/v8-flags-function-respawn.js --lazy', (e, stdout) => {
              expect(e)
                .to.be.null

              expect(stdout)
                .to.include('MOCK LIFTOFF RESPAWN ["--lazy"]')

              expect(stdout)
                .to.include('MOCK LIFTOFF DONE')

              done()
            })
          })

          it('should not respawn if process.argv does not have v8 flags', (done) => {
            exec('node test/mocks/v8-flags-function-respawn.js', (e, stdout) => {
              expect(e)
                .to.be.null

              expect(stdout)
                .not.to.include('MOCK LIFTOFF RESPAWN')

              expect(stdout)
                .to.include('MOCK LIFTOFF DONE')

              done()
            })
          })
        })

        it('throws if v8Flags throws', (done) => {
          exec('node test/mocks/v8-flags-error-no-respawn.js --lazy', function (e, stdout, stderr) {
            expect(e)
              .to.be.instanceOf(Error)

            expect(stdout)
              .not.to.include('MOCK LIFTOFF RESPAWN ["--lazy"]')

            expect(stdout)
              .not.to.include('MOCK LIFTOFF DONE')

            expect(stderr)
              .to.be.include('MOCK LIFTOFF ERROR')

            done()
          })
        })

        it('should respawn if v8 flag is set by node flags', (done) => {
          exec('node test/mocks/v8-flags-respawn-node-flags.js', (e, stdout) => {
            expect(e)
              .to.be.null

            expect(stdout)
              .to.include('MOCK LIFTOFF RESPAWN ["--lazy"]')

            expect(stdout)
              .to.include('MOCK LIFTOFF DONE')

            done()
          })
        })

        it('should respawn if v8 flag is set by cli flags and node flags', (done) => {
          exec('node test/mocks/v8-flags-respawn-node-flags.js --harmony', (e, stdout) => {
            expect(e)
              .to.be.null

            expect(stdout)
              .to.include('MOCK LIFTOFF RESPAWN ["--lazy","--harmony"]')

            expect(stdout)
              .to.include('MOCK LIFTOFF DONE')

            done()
          })
        })

        it('should respawn if cli flags has v8 flags with values', (done) => {
          exec('node test/mocks/v8-flags-array-with-values-respawn.js --stack_size=2048', (e, stdout) => {
            expect(e)
              .to.be.null

            expect(stdout)
              .to.include('MOCK LIFTOFF RESPAWN ["--stack_size=2048"]')

            expect(stdout)
              .to.include('MOCK LIFTOFF DONE')

            done()
          })
        })

        it('should respawn if cli flags has v8 flags with values', (done) => {
          exec('node test/mocks/v8-flags-function-with-values-respawn.js --stack_size=2048', (e, stdout) => {
            expect(e)
              .to.be.null

            expect(stdout)
              .to.include('MOCK LIFTOFF RESPAWN ["--stack_size=2048"]')

            expect(stdout)
              .to.include('MOCK LIFTOFF DONE')

            done()
          })
        })
      })

      describe('Without `v8Flags`', () => {
        it('should respawn with node flags', (done) => {
          exec('node test/mocks/no-v8-flags-respawn-node-flags.js', (e, stdout) => {
            expect(e)
              .to.be.null

            expect(stdout)
              .to.include('MOCK LIFTOFF RESPAWN ["--lazy"]')

            expect(stdout)
              .to.include('MOCK LIFTOFF DONE')

            done()
          })
        })

        it('should not respawn without node flags', (done) => {
          exec('node test/mocks/no-v8-flags-no-respawn.js', (e, stdout, stderr) => {
            expect(e)
              .to.be.null

            expect(stdout)
              .not.to.include('MOCK LIFTOFF RESPAWN')

            expect(stdout)
              .to.include('MOCK LIFTOFF DONE')

            done()
          })
        })
      })
    })

    describe('With invalid arguments', () => {
      it('throws', () => {
        const liftoff = new Liftoff(DEFAULT_OPTIONS)

        expect(() => { liftoff.execute({}) })
          .to.throw()
      })
    })
  })

  describe('`requireLocal()`', () => {
    describe('With valid arguments', () => {
      it('requires local modules', (done) => {
        const liftoff = new Liftoff({ name: NAME, require: ['coffeescript/register'] })

        const requireSpy = sinon.spy()
        const requireFailSpy = sinon.spy()

        liftoff
          .on('require', requireSpy)
          .on('requireFail', requireFailSpy)

        liftoff.prepare({ require: ['coffeescript/register'] }, (env) => {
          liftoff.execute(env, (env) => {
            expect(env.require)
              .to.eql(['coffeescript/register'])

            expect(requireSpy)
              .to.be.calledWith('coffeescript/register', sinon.match.instanceOf(Object))

            expect(requireFailSpy)
              .not.to.be.called

            done()
          })
        })
      })

      it('requires local modules only once even when respawned', (done) => {
        exec('node test/mocks/v8-flags-respawn-with-require.js', (e, stdout) => {
          expect(e)
            .to.be.null

          expect(stdout)
            .to.include('MOCK LIFTOFF RESPAWN ["--lazy"]')

          expect(stdout.match(/MOCK LIFTOFF REQUIRE coffeescript\/register/g))
            .to.have.length(1)

          expect(stdout)
            .to.include('MOCK LIFTOFF DONE')

          done()
        })
      })

      it('emits a `require` event with the module name and module', (done) => {
        const liftoff = new Liftoff({ name: NAME })

        const moduleName = 'mocha'

        liftoff.on('require', async (name, module) => {
          expect(name)
            .to.equal(moduleName)

          expect(module)
            .to.be.a('function')

          done()
        })

        liftoff.requireLocal(moduleName, './test/liftoff')
      })

      it('emits a `requireFail` event with the module name', (done) => {
        const liftoff = new Liftoff({ name: NAME })

        const moduleName = crypto.randomUUID()

        liftoff.on('requireFail', (name) => {
          expect(name)
            .to.equal(moduleName)

          done()
        })

        liftoff.requireLocal(moduleName, './test/liftoff')
      })
    })

    describe('With invalid arguments', () => {
      it('fails', (done) => {
        const liftoff = new Liftoff({ name: NAME })

        const moduleName = crypto.randomUUID()

        const requireSpy = sinon.spy()
        const requireFailSpy = sinon.spy()

        liftoff
          .on('require', requireSpy)
          .on('requireFail', requireFailSpy)

        liftoff.prepare({ require: moduleName }, (env) => {
          liftoff.execute(env, (env) => {
            expect(env.require)
              .to.eql([moduleName])

            expect(requireSpy)
              .not.to.have.been.called

            expect(requireFailSpy)
              .to.have.been.calledWith(moduleName, sinon.match.instanceOf(Error))

            done()
          })
        })
      })
    })
  })
})
