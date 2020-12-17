
const normalizedPath = require('path').join(__dirname, 'loaders')
const filters = {}
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  const filter = new (require('./filters/' + file))()
  filters[filter.getName()] = filter
})

module.exports = ({
  get: (name) => {
    if (!filters[name]) {
      throw new Error(`Filter ${name} does not exist.`)
    }
    return filters[name]
  }
})
