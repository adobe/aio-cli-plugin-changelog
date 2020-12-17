const path = require('path')
const fs = require('fs')
const { flags } = require('@oclif/command')

module.exports = {
  generate: (
    folder,
    prefixLong,
    prefixShort,
    description,
    config = {},
    placeholder = '[name]'
  ) => {
    const commands = {}
    const normalizedPath = path.join(__dirname, `./${folder}`)
    fs.readdirSync(normalizedPath).forEach(filename => {
      const file = filename.split('.').slice(0, -1).join('.')
      const desc = description.replace(placeholder, file)
      commands[`${prefixLong}-${file}`] = flags.string({
        char: `${prefixShort}${file[0]}`,
        description: desc,
        ...config
      })
    })
    return commands
  }
}
