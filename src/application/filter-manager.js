
const filters = {}
const FileManager = {
  get: (name) => {
    if (!filters[name]) {
      filters[name] = require(`./filters/${name}.js`)
    }
    return filters[name]
  }
}

module.exports = FileManager
