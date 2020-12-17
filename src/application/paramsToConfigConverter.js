_cloneDeep = require('lodash')
module.exports = {
  convert: (params, filterPrefix) => {
    const {
      flags: {
        loader,
        template,
        repository,
        organization,
        tagTo,
        tagFrom,
        file,
        override
      }
    } = params

    const prefixRegExp = new RegExp(`${filterPrefix}-`)
    const filters = {}
    const keys = Object.keys(params.flags).map((flag) => {
      if ((prefixRegExp).test(flag)) {
        const key = flag.split(`${filterPrefix}-`)[1]
        filters[key] = params.flags[flag]
      }
    })

    return {
      [`${repository}/${organization}`]: {
        loader: {
          name: loader,
          config: {
            exclude: filters
          }
        }
      },
      tags: {
        from: tagFrom,
        to: tagTo
      },
      template,
      output: {
        filename: file,
        override
      }
    }
  }
}

const cleanse = obj => {
  Object.keys(obj).forEach(function (key) {
    // Get this value and its type
    const value = obj[key]
    const type = typeof value
    if (type === 'object') {
      cleanse(value)
      if (!Object.keys(value).length) {
        delete obj[key]
      }
    } else if (type === 'undefined') {
      delete obj[key]
    }
  })
}
