
const _ = require('lodash')

class LabelsGroup {
  constructor (map) {
    this.map = map
  }

  execute (data) {
    if (!Object.keys(this.map).length) {
      return data
    }

    return data.map(item => {
      const temp = []
      Object.keys(this.map).forEach(type => {
        if (
          this.map[type].filter(label => _.includes(item.labels.nodes.map(data => data.name), label)).length
        ) {
          temp.push(type)
        }
      })
      item.contributionType = temp.join(', ')
      return item
    })
  }
}

module.exports = LabelsGroup
