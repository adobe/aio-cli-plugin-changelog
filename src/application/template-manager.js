
const templates = {}
const TemplateManager = {
  get: (name) => {
    if (!templates[name]) {
      templates[name] = require(`./templates/${name}.js`)
    }
    return templates[name]
  }
}

module.exports = TemplateManager
