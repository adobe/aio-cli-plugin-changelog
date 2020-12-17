
const groups = {}
const GroupManager = {
  get: (name) => {
    if (!groups[name]) {
      groups[name] = require(`./groups/${name}.js`)
    }
    return groups[name]
  }
}

module.exports = GroupManager
