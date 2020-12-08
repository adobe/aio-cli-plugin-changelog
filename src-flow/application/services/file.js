const pathLib = require('path')
const fs = require('fs')
module.exports = {
  load: (path:string, type:string):JSON|Error => {
    const filepath:string = type === 'relative' ? pathLib.join(process.cwd(), path) : path
    return require(filepath)
  },

  create: (path:string, data:string):void|Error => {
    fs.writeFile(path, data, function (err) {
      if (err) return err
    })
  }
}
