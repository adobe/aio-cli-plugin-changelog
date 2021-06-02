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
const {cli} = require('cli-ux')
const startGeneration = `
==========================
Start generation sample config
==========================
`;
const endGeneration = path => `
=============================
Sample config generation finished:
${path}
=============================
`;

class IndexCommand extends Command {
  async run () {
      const { flags: { path, type } } = this.parse(IndexCommand)
      const adobeChangelogGenerator = new AdobeChangelogGenerator();
      cli.action.start(startGeneration);
      const result = await adobeChangelogGenerator.generateConfigSample(type, path);
      cli.action.stop(endGeneration(result.path));
  }
}

IndexCommand.flags = {
  type: flags.string({
      char: 't',
      description: 'Type of config sample',
      default: 'short',
      options: ['short', 'long']
  }),
  path: flags.string({
    char: 'p',
    description: 'Path to generated sample file'
  })
}

IndexCommand.description = 'Generate config sample for Changelog Generation application'
IndexCommand.examples = [
  '$ aio changelog:generate-config-sample'
]

module.exports = IndexCommand
