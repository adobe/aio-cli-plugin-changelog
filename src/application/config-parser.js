const pathLib = require('path')
module.exports = {
  parseNamespace: (namespace) => {
    const parsed = namespace.match(/(.*)\/(.*):(.*)/)
    return {
      organization: parsed[1],
      repository: parsed[2],
      branch: parsed[3]
    }
  }
}
