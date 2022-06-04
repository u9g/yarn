const fs = require('fs')
const fsp = fs.promises
const path = require('path')

async function walk(dir, func) {
    const items = await fsp.readdir(dir)
    const proms = []
    for (const item of items) {
        const itemPath = path.join(dir, item)
        const stats = await fsp.stat(itemPath)
        if (stats.isFile()) {
            proms.push(func(itemPath))
        } else if (stats.isDirectory()) {
            proms.push(walk(itemPath, func))
        }
    }
    await Promise.all(proms)
}

async function main() {
    const baseDir = process.argv[2]
    if (baseDir.includes('.')) console.log('YOUR BASE DIR HAS A .')
    await walk(baseDir, async (name) => {
        const oldName = name
        let newName = name.replace(/\/|\\/g, '_')
        if (baseDir !== '.') {
            newName = newName.replace(baseDir.replace(/\/|\\/g, '_'), '')
        }
        if (newName.startsWith('_')) {
            newName = newName.substring(1)
        }
        console.log(`${oldName} => ${newName}`)
        await fsp.rename(oldName, newName)
    })
}

main()
