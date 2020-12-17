const _ = require('lodash')
const formatFns = require('date-fns/format')

module.exports = (data) => {
  let result = ''
  Object.keys(data).forEach((np) => {
    result += namespaceTemplate(np)
    Object.keys(data[np]).forEach((tag) => {
      result += tagTemplate(tag, data[np][tag].createdAt)
      const contributionType = _.groupBy(data[np][tag].data, 'contributionType')
      Object.keys(contributionType).forEach((type) => {
        result += contributionTypeTemplate(type)
        contributionType[type].forEach(pr => {
          result += contributionTemplate(pr.organization, pr.repository, pr.number, pr.title, pr.author)
        })
      })
    })
  })

  return result
}

const namespaceTemplate = (namespace) => `
  \n${namespace}
  =============`

const tagTemplate = (tag, creationDate) => `
  ## ${tag} (${formatFns(creationDate.getTime(), 'yyyy-MM-dd')})`

const contributionTypeTemplate = (contributionType) => `
  ### ${contributionType}
`
const contributionTemplate = (org, repo, number, description, author) => `
  * [${org}/${repo}#${number}](https://github.com/${org}/${repo}/pull/${number})
  -- ${description} by [@${author}](https://github.com/${author})`
