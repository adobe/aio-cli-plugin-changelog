module.exports = {
  mapValuesAsync: (obj, asyncFn) => {
    const keys = Object.keys(obj)
    const promises = keys.map(k => {
      return asyncFn(obj[k], k).then(newValue => {
        return { key: k, value: newValue }
      })
    })
    return Promise.all(promises).then(values => {
      const newObj = {}
      values.forEach(v => {
        newObj[v.key] = v.value
      })
      return newObj
    })
  }
}
