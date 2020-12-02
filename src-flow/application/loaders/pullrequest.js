import type { LoaderInterface } from '../api/loader-interface.js.flow'
import type { FilterInterface } from '../api/filter-interface.js.flow'
import type { PullRequestData } from '../api/data/pullrequest.js.flow'
import type { graphql } from '@octokit/graphql'

const formatFns = require('date-fns/format')

class PullRequestLoader implements LoaderInterface {
  client: graphql
  filters: Array<FilterInterface>
  constructor (
    githubClient: graphql,
    filters:Array<FilterInterface> = []
  ) {
    this.client = githubClient
    this.filters = filters
  }

  async execute (
    organization:string,
    repository:string,
    from:number,
    to:number
  ):Promise<Array<PullRequestData>> {
    const formatPattern = 'yyyy-MM-dd'
    const sdate = formatFns(from, formatPattern)
    const edate = formatFns(to, formatPattern)
    let cursor = null
    let hasNextPage = null
    let after = ''
    let query = ''
    let response = null
    let result = []
    do {
      after = cursor ? `after:"${cursor}"` : ''
      query = `{
        search(first: 1, query: "repo:${organization}/${repository} is:pr is:merged created:${sdate}..${edate}", type: ISSUE ${after}) {
          nodes {
            ... on PullRequest {
              title
              url
              number
              createdAt
              labels(first: 100) {
                nodes {
                  name
                }
              }
              author {
                login
                ... on User {
                  id
                  company
                  __typename
                }
                ... on Bot {
                  id
                  login
                  __typename
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`

      response = await this.client(query)
      hasNextPage = false// response.search.pageInfo.hasNextPage
      cursor = response.search.pageInfo.endCursor
      result = [...result, ...response.search.nodes]
    } while (hasNextPage)

    const regexpFirst = /\[bot\]/gm
    const regexpSecond = /(-|^)bot(-|$)/gm
    const regexpThird = /dependabot/gm
    result = result.filter((pr) => pr.author &&
        pr.author.login.search(regexpFirst) === -1 &&
        pr.author.login.search(regexpSecond) === -1 &&
        pr.author.login.search(regexpThird) === -1 &&
        pr.author.__typename === 'User'
    )

    console.log(result[0].labels.nodes)
    for (const filter of this.filters) {
      result = filter.execute(result)
    }

    return result
  }
}
module.exports = PullRequestLoader
