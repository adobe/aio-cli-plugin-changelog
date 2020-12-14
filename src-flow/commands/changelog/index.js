/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type { LoaderInterface } from '../../application/api/loader-interface.js.flow'
import type { FilterInterface } from '../../application/api/filter-interface.js.flow'
import type { PullRequestData } from '../../application/api/data/pullrequest.js.flow'

const { Command, flags } = require('@oclif/command')
const loaderManager = require('../../application/loader-manager')
const filterManager = require('../../application/filter-manager')
const groupManager = require('../../application/group-manager')
const templateManager = require('../../application/template-manager')
const fileService = require('../../application/services/file')
const aioConfig = require('@adobe/aio-lib-core-config')
const ConfigService = require('../../application/services/config')
const TagService = require('../../application/services/tag')
const asyncService = require('../../application/services/async')
const GithubService = require('../../application/services/github')
const NamespaceConfig = require('../../application/models/namespace-config')
const _ = require('lodash')

class IndexCommand extends Command {
  async run () {
    const { flags, flags: { namespace } } = this.parse(IndexCommand)
    const githubService = new GithubService(aioConfig.get('GITHUB_TOKEN'))
    const configService = new ConfigService(githubService, aioConfig)
    const tagService = new TagService(githubService)
    const localConfig = await configService.getLocalConfigs(namespace, flags['config-path'], flags['path-type'])
    const inRepoConfig = await configService.getInRepoConfigs(Object.keys(localConfig))
    const commonConfig = _.merge(inRepoConfig, localConfig)
    const commonConfigErrors = await configService.validate(commonConfig)
    if (commonConfigErrors.length) {
      throw new Error(commonConfigErrors.join('\n'))
    }

    for (const np of Object.keys(commonConfig)) {
      const namespaceConfig = new NamespaceConfig(commonConfig[np])
      const template = templateManager.get(namespaceConfig.getTemplate())
      const namespacesTags = { [np]: { tag: namespaceConfig.getTag() }, ...namespaceConfig.getCombined() }
      const parsedNamespaces = _.mapValues(namespacesTags, (data, np) => configService.parseNamespace(np))
      const namespacesTagsRange = await asyncService.mapValuesAsync(parsedNamespaces, async (data, np) => {
        return await tagService.getTagDates(
          namespacesTags[np].tag,
          data.organization,
          data.repository
        )
      })
      const Loader = loaderManager.get(namespaceConfig.getLoaderName())
      const filtersConfig = namespaceConfig.getFilters()
      const GroupByClass = namespaceConfig.getGroupName() ? groupManager.get(namespaceConfig.getGroupName()) : null
      const groupBy = GroupByClass ? new GroupByClass(namespaceConfig.getGroupConfig()) : null
      const dataLoader:LoaderInterface = new Loader(
        githubService,
        Object.keys(filtersConfig).map((ftr:string) => {
          const FtrClass = filterManager.get(ftr)
          const filter: FilterInterface = new FtrClass(filtersConfig[ftr])
          return filter
        }),
        groupBy
      )
      const rs = await asyncService.mapValuesAsync(namespacesTagsRange, async (data, np) => {
        return await asyncService.mapValuesAsync(data, async (tagsRange, key) => {
          const data:Array<PullRequestData> = await dataLoader.execute(
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
      fileService.create(`${namespaceConfig.getProjectPath()}/${namespaceConfig.getFilename()}`, template(rs))
    }
  }
}

IndexCommand.flags = {
  'config-path': flags.string({ char: 'c', description: 'Local config path' }),
  namespace: flags.string({
    char: 'n',
    description: 'Namespace, example: organization/repository:branch',
    multiple: true,
    default: []
  }),
  'path-type': flags.string({
    char: 't',
    description: 'Local config path type',
    options: ['absolute', 'relative'],
    default: 'absolute'
  })
}

IndexCommand.description = 'Changelog generation tool'
IndexCommand.examples = [
  '$ aio changelog:generate'
]

module.exports = IndexCommand
