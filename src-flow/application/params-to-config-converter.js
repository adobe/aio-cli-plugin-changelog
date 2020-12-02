module.exports = {
  convert: (params:Object, filterPrefix:string):Object => {
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
    Object.keys(params.flags).forEach((flag:string):Array => {
      if ((prefixRegExp).test(flag)) {
        const key = flag.split(`${filterPrefix}-`)[1]
        filters[key] = params.flags[flag]
      }
    })

    const paramsConfig = {
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
    cleanse(paramsConfig)
    return paramsConfig
  }
}

const cleanse = obj => {
  Object.keys(obj).forEach(function (key) {
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
