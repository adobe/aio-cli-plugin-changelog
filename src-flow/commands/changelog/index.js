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
const config = require('@adobe/aio-lib-core-config')
const aioLogger = require('@adobe/aio-lib-core-logging')('changelog', { provider: 'debug' })
const loaderManager = require('../../application/loader-manager')
const filterManager = require('../../application/filter-manager')
const commandGenerator = require('../../application/command-generator')
const paramsToConfigConvertor = require('../../application/params-to-config-converter')
const { graphql } = require('@octokit/graphql')
const Octokit = require('@octokit/rest').Octokit

class IndexCommand extends Command {
  async run () {
    const params = this.parse(IndexCommand)
    const paramsConfig = paramsToConfigConvertor.convert(params)
    const localConfig = config.get('changelog') || {}
    const token = config.get('GITHUB_TOKEN')
    const graphqlAuthorized = graphql.defaults({ headers: { authorization: `token ${token}` } })
    const restAuthorized = new Octokit({ auth: `token ${token}` })
    const repositoryList = []

    if (params.flags.repository && params.flags.organization) {
      const paramsConfig = paramsToConfigConvertor.convert(params)
      repositoryList.push()
    }

    localConfig[`${params.flags.organization}/${params.flags.repository}`] || {}, paramsConfig

    /* if (flags.repository && flags.organization) {
      projectConfigs.push({
        ...(config.get(`changelog.${flags.repository}.${flags.organization}`) || {})

      })
    } */
    const Loader = loaderManager.get('pullrequest')
    const Filter = filterManager.get('labels')
    const filter: FilterInterface = new Filter(['Auto-Tests: Not Required'])
    const dataLoader:LoaderInterface = new Loader(graphqlAuthorized, [filter])
    const data:Array<PullRequestData> = await dataLoader.execute(
      'magento',
      'magento2',
      new Date('11/21/2019').getTime(),
      new Date().getTime()
    )
    console.log(data)
  }
}

IndexCommand.flags = {
  repository: flags.string({ char: 'rp', description: 'Repository name', dependsOn: ['organization'] }),
  organization: flags.string({ char: 'org', description: 'Organization name', dependsOn: ['repository'] }),
  loader: flags.string({ char: 'ld', description: 'Loader name' }),
  template: flags.string({ char: 't', description: 'Template name' }),
  tagFrom: flags.string({ char: 'tf', description: 'Tag from, optional' }),
  tagTo: flags.string({ char: 'tt', description: 'Tag to, optional' }),
  file: flags.string({ char: 'fl', description: 'Result file name', default: 'Changelog.md' }),
  save: flags.boolean({ char: 'sv', description: 'Save params to config', default: false }),
  override: flags.boolean({ char: 'ov', description: 'Override existed changelog.md file', default: false }),
  config: flags.string({ char: 'fl', description: 'Local config path' }),
  ...commandGenerator.generate(
    'filters',
    'filter',
    'fl',
    'Filter [name]',
    {
      multiple: true
    }
  )
}

IndexCommand.description = 'Changelog generation tool'
IndexCommand.examples = [
  '$ aio changelog:generate'
]

module.exports = IndexCommand
