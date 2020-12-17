
const loaders = {}
const LoadManager = {
  get: (name) => {
    name = name.toLowerCase()
    if (!loaders[name]) {
      loaders[name] = require(`./loaders/${name}.js`)
    }
    return loaders[name]
  }
}

module.exports = LoadManager
