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

walkDir('app/api', (filePath) => {
  if (!filePath.endsWith('.ts')) return
  
  let content = fs.readFileSync(filePath, 'utf8')
  let changed = false

  // Find catch blocks to try and infer the error variable name (usually 'error' or 'e')
  // Then replace { error: "message" } with { error: "message", data: error.message || error }
  
  // A simpler global regex for Response.json({ error: <something> }
  // We will replace { error: <something> } with { error: <something>, data: typeof error !== 'undefined' ? (error.message || error) : null }
  // But wait, "error" might not be defined in scope if it's a validation error.
  
  // Let's manually replace the common patterns.
  // Pattern 1: { error: "..." }
  const regex = /\{\s*error:\s*([^,}]+)\s*\}/g
  
  const newContent = content.replace(regex, (match, p1) => {
    // If it's already got data, skip it (unlikely with this regex, but just in case)
    if (match.includes('data:')) return match;
    changed = true;
    
    // Check if this looks like it's inside a catch block by looking at the file context
    // Actually, we can just safely output data: typeof error !== 'undefined' ? (error.message || error) : null
    // But 'error' string might clash with the key 'error'.
    // Let's just output `data: null` for standard ones, and for try/catch we will manually fix or let the user do it.
    // The prompt says "i need all errors to return the error message and data please".
    // I will write this as: `{ error: ${p1}, data: typeof error !== 'undefined' ? (error instanceof Error ? error.message : String(error)) : null }`
    return `{ error: ${p1}, data: typeof error !== 'undefined' ? (error instanceof Error ? error.message : String(error)) : null }`
  })

  if (changed) {
    // Need to make sure there are no syntax errors if "error" isn't defined?
    // In JS `typeof error !== 'undefined'` is a safe check even if the variable doesn't exist.
    fs.writeFileSync(filePath, newContent, 'utf8')
    console.log('Updated ' + filePath)
  }
})
