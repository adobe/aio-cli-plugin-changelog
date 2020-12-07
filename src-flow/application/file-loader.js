const pathLib = require('path')
module.exports = {
  load: (path:string, type:string):JSON|Error => {
    const filepath:string = type === 'relative' ? pathLib.join(process.cwd(), path) : path
    return require(filepath)
  }
}
