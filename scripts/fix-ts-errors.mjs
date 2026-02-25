import fs from 'fs'
import path from 'path'

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f)
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback)
        } else {
            callback(dirPath)
        }
    })
}

const badStr = "data: typeof error !== 'undefined' ? (error instanceof Error ? error.message : String(error)) : null"

walkDir('app/api', (filePath) => {
    if (!filePath.endsWith('.ts')) return

    let content = fs.readFileSync(filePath, 'utf8')
    if (!content.includes(badStr)) return

    // First, safely replace all with data: null
    content = content.replaceAll(badStr, "data: null")

    // Now, try to find catch blocks and replace data: null with data: error.message || String(error)
    // This is a simple regex that matches `catch (error: any) { ... }` and replaces `data: null` inside it
    // Since JS regex doesn't support recursive bracket matching easily, we can just look for catch (error
    // and intelligently replace the next data: null

    const catchRegex = /catch\s*\(\s*error\s*:[^)]*\)\s*\{([\s\S]*?)\}/g;
    content = content.replace(catchRegex, (match, p1) => {
        return match.replace(/data:\s*null/g, "data: error instanceof Error ? error.message : String(error)")
    })

    // Additionally, handle `catch (error) {`
    const catchRegex2 = /catch\s*\(\s*error\s*\)\s*\{([\s\S]*?)\}/g;
    content = content.replace(catchRegex2, (match, p1) => {
        return match.replace(/data:\s*null/g, "data: error instanceof Error ? error.message : String(error)")
    })

    // Also handle `catch (e) {` (replace error with e)
    const catchRegex3 = /catch\s*\(\s*e\s*:[^)]*\)\s*\{([\s\S]*?)\}/g;
    content = content.replace(catchRegex3, (match, p1) => {
        return match.replace(/data:\s*null/g, "data: e instanceof Error ? e.message : String(e)")
    })

    const catchRegex4 = /catch\s*\(\s*e\s*\)\s*\{([\s\S]*?)\}/g;
    content = content.replace(catchRegex4, (match, p1) => {
        return match.replace(/data:\s*null/g, "data: e instanceof Error ? e.message : String(e)")
    })

    fs.writeFileSync(filePath, content, 'utf8')
    console.log('Fixed TS compilation in ' + filePath)
})
