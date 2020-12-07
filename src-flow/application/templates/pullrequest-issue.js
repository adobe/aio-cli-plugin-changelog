const _ = require('lodash')

module.exports = (data:Object):string => {
  let result = ''
  Object.keys(data).forEach((tag:string) => {
    result += tagTemplate(tag, data[tag].createdAt)
    const contributionType = _.groupBy(data[tag].data, 'contributionType')
    Object.keys(contributionType).forEach((type:string) => {
      result += contributionTypeTemplate(type)
      contributionType[type].forEach(pr => {
        result += contributionTemplate(pr.organization, pr.repository, pr.number, pr.title, pr.author)
      })
    })
  })

  return result
}

const tagTemplate = (tag:string, creationDate:string) => `
  ## ${tag}(${creationDate})
  ============= \n
`
const contributionTypeTemplate = (contributionType:string) => `
  ### ${contributionType} \n
`
const contributionTemplate = (org:string, repo:string, number:number, description:string, author:string) => `
  * [${org}/${repo}#${number}](https://github.com/${org}/${repo}/pull/${number}) -- ${description} by @${author} \n
`
