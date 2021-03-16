/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Command, flags } = require('@oclif/command')
// eslint-disable-next-line node/no-extraneous-require
const AdobeChangelogGenerator = require('adobe-changelog-generator')
const aioConfig = require('@adobe/aio-lib-core-config')

class IndexCommand extends Command {
  async run () {
    const { flags, flags: { namespace } } = this.parse(IndexCommand)
    const token = flags.token || aioConfig.get('GITHUB_TOKEN')
    const adobeChangelogGenerator = new AdobeChangelogGenerator(token, flags['config-path'], flags['path-type'])
    await adobeChangelogGenerator.generate(namespace)
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
  '$ aio changelog'
]

module.exports = IndexCommand
