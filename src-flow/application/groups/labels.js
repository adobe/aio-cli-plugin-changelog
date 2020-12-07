import type { PullRequestData } from '../api/data/pullrequest.js.flow'
const _ = require('lodash')

class LabelsGroup {
    map: Array<string>
    constructor (map:Object<string>) {
      this.map = map
    }

    execute (data:Array<PullRequestData>): Array<PullRequestData> {
      if (!Object.keys(this.map).length) {
        return data
      }
      return data.map(item => {
        const temp = []
        Object.keys(this.map).forEach(type => {
          if (this.map[type].filter(label => _.includes(item.labels.nodes, label))) {
            temp.push(type)
          }
        })
        item.contributionType = temp.join(', ')
        return item
      })
    }
}

module.exports = LabelsGroup
