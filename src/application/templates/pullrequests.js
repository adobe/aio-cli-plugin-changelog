const _ = require('lodash')

module.exports = (data) => {
  const groupedByNamespace = _.groupBy(data, 'namespace')
  Object.keys(groupedByNamespace).forEach(namespace => {
    groupedByNamespace[namespace] = groupBy(groupedByNamespace[namespace], 'contributionType')
  })
}
