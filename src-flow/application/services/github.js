const aioConfig = require('@adobe/aio-lib-core-config')
const { graphql } = require('@octokit/graphql')
const Octokit = require('@octokit/rest').Octokit

class Github {
  graphqlClient: Object
  restClient: Object
  constructor (token:string):void {
    this.graphqlClient = graphql.defaults({ headers: { authorization: `token ${token}` } })
    this.restClient = new Octokit({ auth: `token ${token}` })
  }

  async getTagCreationDate (tag:string, org:string, repo:string):Date {
    const ref = await this.restClient.git.getRef({
      owner: org,
      repo,
      ref: `tags/${tag}`
    }).then(res => res.data)
    const tagData = await this.restClient.git.getTag({
      owner: org,
      repo,
      tag_sha: ref.object.sha
    }).then(res => res.data)
    return new Date(tagData.tagger.date)
  }

  async getFirstRepoCommitDate (branch: string, org:string, repo:string):Date {
    let response = await this.graphqlClient(getFirstRepoCommitDateQuery(repo, org, branch, ''))
    const endCursor = response.repository.ref.target.history.pageInfo.endCursor
      .replace(' 0', ` ${response.repository.ref.target.history.totalCount - 2}`)
    response = await this.graphqlClient(getFirstRepoCommitDateQuery(repo, org, branch, `after: "${endCursor}"`))
    return new Date(response.repository.ref.target.history.nodes[0].committedDate)
  }

  async getAllTags (org:string, repo:string) {
    let query
    let cursor = null
    let hasNextPage = null
    let after = ''
    let response = null
    let result = []
    do {
      after = cursor ? `after:"${cursor}"` : ''
      query = `
        {
          repository(name: "${repo}", owner: "${org}") {
            refs(refPrefix: "refs/tags/", first: 100, orderBy: {field: TAG_COMMIT_DATE, direction: ASC} ${after}) {
              pageInfo {
                hasNextPage,
                endCursor
              }
              nodes {
                name
                target {
                  ... on Commit {
                    committedDate
                  }
                  ... on Tag {
                    tagger {
                      date
                    }
                  }
                }
              }
            }
          }
        }`
      response = await this.graphqlClient(query)
      hasNextPage = response.repository.refs.pageInfo.hasNextPage
      cursor = response.repository.refs.pageInfo.endCursor
      result = [...result, ...response.repository.refs.nodes]
    } while (hasNextPage)

    const data = {}
    result.forEach((item, index) => {
      data[item.name] = {
        from: result[index - 1] ? data[result[index - 1].name].to : new Date('2000/01/01'),
        to: new Date(item.target.committedDate || item.target.tagger.date)
      }
    })
    return data
  }

  getRestClient () {
    return this.restClient
  }

  getGraphQlClient () {
    return this.graphqlClient
  }
}

const getFirstRepoCommitDateQuery = (repo:string, org:string, branch:string, cursor:string):string => {
  return `query {
      repository(name: "${repo}", owner: "${org}") {
        ref(qualifiedName: "refs/heads/${branch}") {
          target {
            ... on Commit {
              history(first: 1, ${cursor}) {
                nodes {
                  oid
                  message
                  committedDate
                }
                totalCount
                pageInfo {
                  endCursor
                }
              }
            }
          }
        }
      }
    }`
}

module.exports = Github
