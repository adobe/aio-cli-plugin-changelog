const pathLib = require('path')
const fs = require('fs')
module.exports = {
  load: (path, type) => {
    const filepath = type === 'relative' ? pathLib.join(process.cwd(), path) : path
    return require(filepath)
  },

  create: (path, data) => {
    fs.writeFile(path, data, function (err) {
      if (err) return err
    })
  }
}
