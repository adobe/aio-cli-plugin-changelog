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

  getGroupName ():Object {
    return _.get(this.data, 'loader.config.groupBy.name')
  }

  getGroupConfig ():Object {
    return _.get(this.data, 'loader.config.groupBy.config')
  }
}

module.exports = NamespaceConfig
