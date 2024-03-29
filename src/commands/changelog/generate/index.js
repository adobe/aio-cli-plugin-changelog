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
const AdobeChangelogGenerator = require('@adobe/changelog-generator')
const aioConfig = require('@adobe/aio-lib-core-config')
const {cli} = require('cli-ux')
const startGeneration = `
==========================
Start changelog generation
==========================
`;
const endGeneration = `
=============================
Changelog generation finished
=============================
`;
const generationMessage = (data) => `
Changelog for "${data.namespace}" is generated.
See "${data.path}${data.filename}"
`;

class IndexCommand extends Command {
  async run () {
    const { flags, flags: { namespace } } = this.parse(IndexCommand)
    const token = flags.token || aioConfig.get('GITHUB_TOKEN');
    const githubUrl = flags['github-url'] || aioConfig.get('GITHUB_URL') || 'https://api.github.com';
    const adobeChangelogGenerator = new AdobeChangelogGenerator(token, githubUrl, flags['config'])
    cli.action.start(startGeneration);
    const generating = await adobeChangelogGenerator.generate(namespace);
    generating.forEach(promise => promise.then(data => {cli.action.start(generationMessage(data))}));
    Promise.all(generating).then(() => cli.action.stop(endGeneration));
  }
}

IndexCommand.flags = {
  'config': flags.string({
    char: 'c',
    required: true,
    description: 'Path to the configuration located on your local machine'
  }),
  namespaces: flags.string({
    char: 'n',
    description: 'Generate changelog for specific namespace, example: organization/repository:branch',
    multiple: true,
    default: []
  })
}

IndexCommand.description = 'Changelog generation tool'
IndexCommand.examples = [
  '$ aio changelog:generate'
]

module.exports = IndexCommand
