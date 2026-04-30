import { createServer } from 'node:http'
import { createReadStream, existsSync, watch } from 'node:fs'
import { mkdir, rm, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildProject } from './build.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const port = 5173
const previewOnly = process.argv.includes('--preview')
let rebuildTimer = null

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'application/javascript; charset=utf-8'
    case '.css':
      return 'text/css; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.json':
      return 'application/json; charset=utf-8'
    default:
      return 'application/octet-stream'
  }
}

async function ensureDistReady() {
  await mkdir(distDir, { recursive: true })
  await buildProject()
}

function startServer() {
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const safePath = urlPath === '/' ? '/index.html' : urlPath
    const filePath = path.join(distDir, safePath)
    const normalizedDist = path.resolve(distDir)
    const normalizedFile = path.resolve(filePath)

    if (!normalizedFile.startsWith(normalizedDist)) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    try {
      const stat = await import('node:fs/promises').then(({ stat }) => stat(normalizedFile))
      if (stat.isDirectory()) {
        const indexPath = path.join(normalizedFile, 'index.html')
        if (existsSync(indexPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
          createReadStream(indexPath).pipe(res)
          return
        }
      }

      res.writeHead(200, { 'Content-Type': contentType(normalizedFile) })
      createReadStream(normalizedFile).pipe(res)
    } catch {
      const indexPath = path.join(distDir, 'index.html')
      if (existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        createReadStream(indexPath).pipe(res)
        return
      }
      res.writeHead(404)
      res.end('Not found')
    }
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`AI Shala frontend running at http://localhost:${port}`)
  })

  return server
}

function watchFiles() {
  const targets = [path.join(rootDir, 'src'), path.join(rootDir, 'public'), path.join(rootDir, 'index.html'), path.join(rootDir, 'tailwind.config.js'), path.join(rootDir, 'postcss.config.js')]
  for (const target of targets) {
    if (!existsSync(target)) continue
    const recursive = target.endsWith('src') || target.endsWith('public')
    watch(target, { recursive }, () => {
      if (rebuildTimer) clearTimeout(rebuildTimer)
      rebuildTimer = setTimeout(() => {
        buildProject().catch((error) => {
          console.error(error)
        })
      }, 200)
    })
  }
}

async function main() {
  await rm(distDir, { recursive: true, force: true })
  await ensureDistReady()

  startServer()
  if (!previewOnly) {
    watchFiles()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
