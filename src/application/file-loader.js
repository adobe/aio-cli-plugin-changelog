const pathLib = require('path')
module.exports = {
  load: (path, type) => {
    const filepath = type === 'relative' ? pathLib.join(process.cwd(), path) : path
    return require(filepath)
  }
}
