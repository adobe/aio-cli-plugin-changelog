const _ = require('lodash')
class TagService {
  githubService: Object
  restGithubClient: Object
  constructor (githubService:Object) {
    this.githubService = githubService
    this.restGithubClient = githubService.getRestClient()
  }

  async getTagDates (tag:string, org:string, repo:string):Object {
    const [start, end] = tag.split('..')
    const allRepositoryTags = await this.githubService.getAllTags(org, repo)
    const values = Object.values(allRepositoryTags)
    const startRange = allRepositoryTags[start] || values[0]
    const result = {}

    if (!allRepositoryTags[end]) {
      allRepositoryTags[end] = {
        from: _.last(values).to,
        to: new Date()
      }
    }
    const endRange = allRepositoryTags[end]
    const filtered = Object.keys(allRepositoryTags).filter(tagname =>
      startRange.from <= allRepositoryTags[tagname].from && endRange.to >= allRepositoryTags[tagname].to
    )
    filtered.forEach(tagname => { result[tagname] = allRepositoryTags[tagname] })
    return result
  }
}

module.exports = TagService
