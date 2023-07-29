const path = require('node:path')
const {
  EventEmitter
} = require('events')

const extend = require('extend')
const resolve = require('resolve')
const flaggedRespawn = require('flagged-respawn')
const {
  isPlainObject
} = require('is-plain-object')
const objectMap = require('object.map')
const fined = require('fined')

const getCwd = require('./lib/get-cwd.js')
const findConfig = require('./lib/find-config.js')
const fileSearch = require('./lib/file-search.js')
const silentRequire = require('./lib/silent-require.js')

const getOpts = require('./lib/get-opts.js')
const getSearchNames = require('./lib/get-search-names.js')
const registerLoader = require('./lib/register-loader.js')
const preloadModules = require('./lib/preload-modules.js')
const nodeFlags = require('./lib/node-flags.js')

class Liftoff extends EventEmitter {
  constructor (opts) {
    super()

    extend(this, getOpts(opts))

    this.requireLocal = this.requireLocal.bind(this)
    this.buildEnvironment = this.buildEnvironment.bind(this)
    this.handleV8Flags = this.handleV8Flags.bind(this)
    this.prepare = this.prepare.bind(this)
    this.execute = this.execute.bind(this)
    this.launch = this.launch.bind(this)
  }

  requireLocal (module, basedir) {
    try {
      const result = require(resolve.sync(module, { basedir }))
      this.emit('require', module, result)
      return result
    } catch (e) {
      this.emit('requireFail', module, e)
    }
  }

  getCwd (opts = {}) {
    return getCwd(opts)
  }

  getEnv (opts = {}) {
    return this.buildEnvironment(opts)
  }

  buildEnvironment (opts = {}) {
    // get modules we want to preload
    let preload = opts.require || []

    // ensure items to preload is an array
    if (!Array.isArray(preload)) {
      preload = [preload].filter(Boolean)
    }

    // duplicate search paths (to allow mutations)
    let searchPaths = this.searchPaths.slice()

    // get the cwd
    let cwd = getCwd(opts) // || process.cwd()

    // if cwd was provided then use it for search paths
    if (opts.cwd) {
      searchPaths = [cwd]
    } else {
      // otherwise add it to the top of search paths
      searchPaths.unshift(cwd)
    }

    // compute the search names
    const searchNames = getSearchNames({
      configName: this.configName,
      extensions: Object.keys(this.extensions)
    })

    // compute the configPath
    const configPath = findConfig({
      searchNames,
      searchPaths,
      configPath: opts.configPath
    })

    // if we have a config path assign it to config base
    let configBase = cwd
    if (configPath) {
      configBase = path.dirname(configPath)
    }

    // if cwd wasn't provided it should match configBase
    if (!opts.cwd) {
      cwd = configBase
    }

    // locate module in config base or cwd
    let modulePath
    let modulePackage = {}
    try {
      const {
        env: {
          NODE_PATH
        }
      } = process

      const paths = (
        NODE_PATH
          ? NODE_PATH.split(path.delimiter)
          : []
      )

      modulePath = resolve.sync(this.moduleName, { basedir: configBase || cwd, paths })
      const modulePackagePath = fileSearch('package.json', [modulePath])
      modulePackage = silentRequire(modulePackagePath)
    } catch (e) {
      const {
        code
      } = e

      if (code !== 'MODULE_NOT_FOUND') console.error(e)
    }

    // if we have a configuration but we failed to find a local module, maybe
    // we are developing against ourselves?
    if (!modulePath && configPath) {
      // check the package.json sibling to our config to see if its `name`
      // matches the module we're looking for
      const modulePackagePath = fileSearch('package.json', [configBase])
      modulePackage = silentRequire(modulePackagePath)
      if (modulePackage && modulePackage.name === this.moduleName) {
        // if it does, our module path is `main` inside package.json
        modulePath = path.join(path.dirname(modulePackagePath), modulePackage.main || 'index.js')
        // And the current working directory is configBase
        cwd = configBase
      } else {
        // clear if we just required a package for some other project
        modulePackage = {}
      }
    }

    let configFiles = {}
    if (isPlainObject(this.configFiles)) {
      const extensions = this.extensions
      const notFound = {
        path: null
      }

      configFiles = objectMap(this.configFiles, (pathSpecs, name) => {
        const defaultPathSpec = {
          name,
          cwd,
          extensions
        }

        return objectMap(pathSpecs, (pathSpec) => {
          const {
            extension,
            path
          } = fined(pathSpec, defaultPathSpec) || notFound

          registerLoader(this, extension, path, cwd)

          return path
        })
      })
    }

    return {
      cwd,
      require: preload,
      searchNames,
      configPath,
      configBase,
      modulePath,
      modulePackage,
      configFiles
    }
  }

  handleV8Flags (done) {
    if (this.v8flags instanceof Function) {
      this.v8flags((e, flags) => {
        if (e) {
          done(e)
        } else {
          done(null, flags)
        }
      })
    } else {
      process.nextTick(() => {
        done(null, this.v8flags)
      })
    }
  }

  prepare (opts, done) {
    if (done instanceof Function !== true) {
      throw new Error('You must provide a callback function.')
    }

    process.title = this.processTitle

    const completion = opts.completion
    if (completion && this.completions) {
      return this.completions(completion)
    }

    const env = this.buildEnvironment(opts)

    done.call(this, env)
  }

  execute (env, forcedFlags, done) {
    if (forcedFlags instanceof Function) {
      done = forcedFlags
      forcedFlags = undefined
    }

    if (done instanceof Function !== true) {
      throw new Error('You must provide a callback function.')
    }

    this.handleV8Flags((e, flags = []) => {
      if (e) {
        throw e
      }

      flaggedRespawn(flags, process.argv, forcedFlags, (ready, child, argv) => {
        if (child !== process) {
          const forcedFlags = nodeFlags.getNodeFlagsFromArgv(argv)
          this.emit('respawn', forcedFlags, child)
        }

        if (ready) {
          preloadModules(this, env)
          registerLoader(this, this.extensions, env.configPath, env.cwd)

          done.call(this, env, argv)
        }
      })
    })
  }

  launch (opts, done) {
    if (done instanceof Function !== true) {
      throw new Error('You must provide a callback function.')
    }

    this.prepare(opts, (env) => {
      const forcedFlags = nodeFlags.getNodeFlags(opts.forcedFlags, env)
      this.execute(env, forcedFlags, done)
    })
  }
}

module.exports = Liftoff
