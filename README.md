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
<!-- tocstop -->
# Usage
```
$ aio plugins:install -g @adobe/aio-cli-plugin-changelog
$ # OR
$ aio discover -i
$ aio changelog --help...
$ aio config set <GITHUB_TOKEN>
```

# Installation
<!-- commands -->
* [`aio changelog`](#aio-changelog)

## `aio changelog`

```
Changelog generation tool

USAGE
  $ aio changelog

OPTIONS
  -c, --config-path=config-path      Local config path
  -n, --namespace=namespace          [default: ] Namespace, example: organization/repository:branch
  -t, --path-type=absolute|relative  [default: absolute] Local config path type

EXAMPLE
  $ aio changelog
```
<!-- commandsstop -->

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
