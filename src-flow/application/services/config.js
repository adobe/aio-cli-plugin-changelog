const fileLoader = require('../../application/file-loader')
const _ = require('lodash')

class ConfigService {
  client: Object
  aioConfig: Object
  constructor (githubService:Object, aioConfig: Object) {
    this.githubRestClient = githubService.getRestClient()
    this.aioConfig = aioConfig
  }

  parseNamespace (namespace:string):Object {
    const parsed = namespace.match(/(.*)\/(.*):(.*)/)
    return {
      organization: parsed[1],
      repository: parsed[2],
      branch: parsed[3]
    }
  }

  async getInRepoConfigs (namespaces:Array, configPath:string = '/.github/changelog.json'):Object {
    const result = {}
    for (const namespace of namespaces) {
      const { organization, repository, branch } = this.parseNamespace(namespace)
      const response = await this.githubRestClient.repos.getContent({
        owner: organization,
        path: configPath,
        repo: repository,
        ref: branch || 'master'
      }).then((res) => res.data || {}).catch(() => {})
      result[namespace] = response
        ? JSON.parse(Buffer.from(response.content, 'base64').toString('binary'))
        : {}
    }
    return result
  }

  async getLocalConfigs (namespaces:Array, configPath?:string, pathType:string):Object {
    const localConfig = configPath
      ? fileLoader.load(configPath, pathType)
      : this.aioConfig.get('changelog') || {}

    return !namespaces.length ? localConfig : filterItems(localConfig, namespaces)
  }

  async validate (config:Object):Array<string> {
    const requiredFields = ['tag', 'loader.name', 'template']
    const errors = []
    Object.keys(config).forEach(namespace => {
      const invalidFields = requiredFields.filter(field => !_.get(config[namespace], field))
      if (!invalidFields.length) {
        return
      }
      errors.push(
        invalidFields.length === 1
          ? `${namespace} is invalid. Field ${invalidFields[0]} is required`
          : `${namespace} is invalid. Fields: ${invalidFields.join(', ')} are required`
      )
    })
    return errors
  }
}

const filterItems = (localConfig:Object, namespace:Array):Object => {
  const res = {}
  namespace.forEach(item => { res[item] = localConfig[item] })
  return res
}

module.exports = ConfigService
