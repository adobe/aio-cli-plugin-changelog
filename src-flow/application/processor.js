const normalizedPath = require('path').join(__dirname, 'loaders')
const loaders = {}
require('fs').readdirSync(normalizedPath).forEach(function (file) {
  const loader = new (require('./loaders/' + file))()
  loaders[loader.getName()] = loader
})

module.exports = ({
  get: (name: string) => {
    if (!loaders[name]) {
      throw new Error(`Loader ${name} does not exist.`)
    }
  }
})
