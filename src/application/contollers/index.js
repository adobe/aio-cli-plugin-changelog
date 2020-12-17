
const aioConfig = require('@adobe/aio-lib-core-config')
const _ = require('lodash')
const GithubService = require('../services/github')
const ConfigService = require('../services/config')
const TagService = require('../services/tag')
const asyncService = require('../services/async')
const templateManager = require('../../application/template-manager')
const NamespaceConfig = require('../models/namespace-config')
const loaderManager = require('../../application/loader-manager')
const filterManager = require('../../application/filter-manager')
const groupManager = require('../../application/group-manager')

class Index {
  constructor (token) {
    this.githubService = new GithubService(token || aioConfig.get('GITHUB_TOKEN'))
    this.configService = new ConfigService(this.githubService, aioConfig)
    this.tagService = new TagService(this.githubService)
  }

  async getConfig (repositories, configPath, pathType) {
    const localConfig = await this.configService.getLocalConfigs(repositories, configPath, pathType)
    const inRepoConfig = await this.configService.getInRepoConfigs(Object.keys(localConfig))
    const commonConfig = _.merge(inRepoConfig, localConfig)
    const commonConfigErrors = await this.configService.validate(commonConfig)
    if (commonConfigErrors.length) {
      throw new Error(commonConfigErrors.join('\n'))
    }
    return commonConfig
  }

  async execute (config) {
    return await asyncService.mapValuesAsync(config, async (npConfig, np) => {
      const namespaceConfig = new NamespaceConfig(npConfig)
      const namespacesTags = { [np]: { tag: namespaceConfig.getTag() }, ...namespaceConfig.getCombined() }
      const parsedNamespaces = _.mapValues(namespacesTags, (data, np) => this.configService.parseNamespace(np))
      const namespacesTagsRange = await asyncService.mapValuesAsync(parsedNamespaces, async (data, np) => {
        return await this.tagService.getTagDates(
          namespacesTags[np].tag,
          data.organization,
          data.repository
        )
      })
      const Loader = loaderManager.get(namespaceConfig.getLoaderName())
      const filtersConfig = namespaceConfig.getFilters()
      const GroupByClass = namespaceConfig.getGroupName() ? groupManager.get(namespaceConfig.getGroupName()) : null
      const groupBy = GroupByClass ? new GroupByClass(namespaceConfig.getGroupConfig()) : null
      const dataLoader = new Loader(
        this.githubService,
        Object.keys(filtersConfig).map((ftr) => {
          const FtrClass = filterManager.get(ftr)
          const filter = new FtrClass(filtersConfig[ftr])
          return filter
        }),
        groupBy
      )

      return templateManager.get(namespaceConfig.getTemplate())(
        await asyncService.mapValuesAsync(namespacesTagsRange, async (data, np) => {
          return await asyncService.mapValuesAsync(data, async (tagsRange) => {
            const data = await dataLoader.execute(
              parsedNamespaces[np].organization,
              parsedNamespaces[np].repository,
              tagsRange.from,
              tagsRange.to
            )
            return {
              createdAt: tagsRange.to,
              data: data.map(item => ({
                ...item,
                repository: parsedNamespaces[np].repository,
                organization: parsedNamespaces[np].organization,
                author: item.author.login
              }))
            }
          })
        })
      )
    })
  }
}

module.exports = Index
