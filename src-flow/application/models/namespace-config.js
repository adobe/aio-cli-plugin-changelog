const _ = require('lodash')

class NamespaceConfig {
  data: Object
  constructor (data:Object):void {
    this.data = data
  }

  getTag ():string {
    return this.data.tag
  }

  getLoaderName ():string {
    return this.data.loader.name
  }

  getFilters ():Object {
    return _.get(this.data, 'loader.config.exclude') || {}
  }

  getGroupName ():string {
    return _.get(this.data, 'loader.config.groupBy.name')
  }

  getGroupConfig ():Object {
    return _.get(this.data, 'loader.config.groupBy.config')
  }

  getTemplate ():string {
    return _.get(this.data, 'output.template')
  }

  getProjectPath ():string {
    return _.get(this.data, 'output.projectPath')
  }

  getFilename ():string {
    return _.get(this.data, 'output.filename')
  }

  getCombined ():Object {
    return _.get(this.data, 'combine')
  }
}

module.exports = NamespaceConfig
