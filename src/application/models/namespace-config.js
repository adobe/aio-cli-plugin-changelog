const _ = require('lodash')

class NamespaceConfig {
  constructor (data) {
    this.data = data
  }

  getTag () {
    return this.data.tag
  }

  getLoaderName () {
    return this.data.loader.name
  }

  getFilters () {
    return _.get(this.data, 'loader.config.exclude') || {}
  }

  getGroupName () {
    return _.get(this.data, 'loader.config.groupBy.name')
  }

  getGroupConfig () {
    return _.get(this.data, 'loader.config.groupBy.config')
  }

  getTemplate () {
    return _.get(this.data, 'output.template')
  }

  getProjectPath () {
    return _.get(this.data, 'output.projectPath')
  }

  getFilename () {
    return _.get(this.data, 'output.filename')
  }

  getCombined () {
    return _.get(this.data, 'combine')
  }
}

module.exports = NamespaceConfig
