<!--
Copyright 2018 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
-->

aio-cli-plugin-changelog
=====================

Config Plugin for the Adobe I/O CLI

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Configuration example](#configuration)
<!-- tocstop -->
# Usage
```
$ aio plugins:install -g @adobe/aio-cli-plugin-changelog
$ # OR
$ aio discover -i
$ aio changelog --help...
$ aio config set <GITHUB_TOKEN>
```

# Commands
<!-- commands -->
* [`aio changelog:generate`](#aio changelog:generate)

## `aio changelog:generate`

```
USAGE
  $ aio changelog:generate

OPTIONS
  -c, --config-path  Path to local config   
  -t, --type-path    Local config path type (Absolute or Relative)
  -n, --namespace    Namespaces, example: organization/repository:branch (Multiple param)
  --verbose     show all config values
```

### Configuration example:
<!-- configuration -->
```
{
  "combine": {
    "oco-test/buddy-repo:master": {}
  },
  "loader": {
    "name": "PullRequest",
    "config": {
      "exclude": {
        "labels": []
      },
      "groupBy": {
        "name" : "labels",
        "config": {
          "Enhancement": []
        }
      }
    }
  },
  "output": {
    "override": false,
    "template": "pullrequest-issue",
    "filename": "CHANGELOG.md"
  }
}
```
