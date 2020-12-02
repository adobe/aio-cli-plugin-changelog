import type { FileManagerInterface } from './api/file-manager-interface.js.flow'

const loaders = {}
const LoadManager:FileManagerInterface = {
  get: (name: string):Function => {
    if (!loaders[name]) {
      loaders[name] = require(`./loaders/${name}.js`)
    }
    return loaders[name]
  }
}

module.exports = LoadManager
