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
const groupManager = require('../../application/groups-manager')
const aioConfig = require('@adobe/aio-lib-core-config')
const ConfigService = require('../../application/services/config')
const TagService = require('../../application/services/tag')
const GithubService = require('../../application/services/github')
const NamespaceConfig = require('../../application/models/namespace-config')
const templatePR = require('../../application/templates/pullrequest-issue')
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
    const result = {}
    if (commonConfigErrors.length) {
      throw new Error(commonConfigErrors.join('\n'))
    }

    for (const np of Object.keys(commonConfig)) {
      const namespaceConfig = new NamespaceConfig(commonConfig[np])
      const parsedNp = configService.parseNamespace(np)
      const tagsRange = await tagService.getTagDates(
        namespaceConfig.getTag(),
        parsedNp.organization,
        parsedNp.repository
      )
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
      for (const tagName of Object.keys(tagsRange)) {
        const data:PullRequestData = await dataLoader.execute(
          parsedNp.organization,
          parsedNp.repository,
          tagsRange[tagName].from,
          tagsRange[tagName].to
        )

        result[tagName] = {
          createdAt: tagsRange[tagName].to,
          data: data.map(item => ({
            ...item,
            repository: parsedNp.repository,
            organization: parsedNp.repository,
            author: item.author.login
          }))
        }
      }
      console.log(templatePR(result))
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
