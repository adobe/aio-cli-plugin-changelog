
class LabelsFilter {
  constructor (labels) {
    this.labels = labels
  }

  execute (data) {
    if (!this.labels.length) {
      return data
    }
    return data.filter((item) => {
      if (!item.labels) {
        return true
      }

      for (let i = 0; i < this.labels.length; i++) {
        if (item.labels.nodes.map(labelItem => labelItem.name).includes(this.labels[i])) {
          return false
        }
      }
      return true
    })
  }
}

module.exports = LabelsFilter
