import { mkdir, rm, readFile, writeFile, cp, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { rollup } from 'rollup'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const assetsDir = path.join(distDir, 'assets')
const srcDir = path.join(rootDir, 'src')
const publicDir = path.join(rootDir, 'public')
const tempDir = path.join(rootDir, '.tmp-build')
const runtimeConfigPath = path.join(distDir, 'runtime-config.js')

function resolveApiUrl() {
  const configured = process.env.AI_SHALA_API_URL || process.env.VITE_API_URL || '/api'
  return configured.replace(/\/$/, '')
}

export async function buildProject() {
  await rm(distDir, { recursive: true, force: true })
  await rm(tempDir, { recursive: true, force: true })
  await mkdir(assetsDir, { recursive: true })

  await buildStyles()
  await buildScripts()
  await copyStaticAssets()
  await writeRuntimeConfig()

  const indexHtml = await readFile(path.join(rootDir, 'index.html'), 'utf8')
  await writeFile(path.join(distDir, 'index.html'), indexHtml, 'utf8')
}

async function writeRuntimeConfig() {
  const apiUrl = resolveApiUrl()
  const runtimeScript = `window.__AI_SHALA_API_URL__ = ${JSON.stringify(apiUrl)};\n`
  await writeFile(runtimeConfigPath, runtimeScript, 'utf8')
}

async function buildStyles() {
  const inputPath = path.join(srcDir, 'index.css')
  const outputPath = path.join(assetsDir, 'app.css')
  const input = await readFile(inputPath, 'utf8')
  const result = await postcss([tailwindcss, autoprefixer]).process(input, {
    from: inputPath,
    to: outputPath,
  })
  await writeFile(outputPath, result.css, 'utf8')
}

async function buildScripts() {
  await transpileSources()

  const bundle = await rollup({
    input: path.join(tempDir, 'main.js'),
    plugins: [
      nodeResolve({
        browser: true,
        extensions: ['.mjs', '.js', '.json'],
      }),
      commonjs(),
    ],
    onwarn(warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return
      warn(warning)
    },
  })

  await bundle.write({
    file: path.join(assetsDir, 'app.js'),
    format: 'esm',
    sourcemap: false,
  })

  await bundle.close()
}

async function transpileSources() {
  await mkdir(tempDir, { recursive: true })
  await transpileTree(srcDir, tempDir)
}

async function transpileTree(sourceRoot, targetRoot) {
  const entries = await readdir(sourceRoot, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      const source = path.join(sourceRoot, entry.name)
      const target = path.join(targetRoot, entry.name)
      if (entry.isDirectory()) {
        await mkdir(target, { recursive: true })
        await transpileTree(source, target)
        return
      }
      if ((entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) || entry.name.endsWith('.tsx')) {
        const sourceText = await readFile(source, 'utf8')
        const output = ts.transpileModule(sourceText, {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2020,
            jsx: ts.JsxEmit.ReactJSX,
            esModuleInterop: true,
            isolatedModules: true,
          },
          fileName: source,
        })
        const jsTarget = target.replace(/\.(ts|tsx)$/u, '.js')
        await writeFile(jsTarget, output.outputText, 'utf8')
        return
      }
      await cp(source, target)
    })
  )
}

async function copyStaticAssets() {
  if (!existsSync(publicDir)) return

  const entries = await readdir(publicDir, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      const source = path.join(publicDir, entry.name)
      const target = path.join(distDir, entry.name)
      if (entry.isDirectory()) {
        await cp(source, target, { recursive: true })
      } else {
        await cp(source, target)
      }
    })
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  buildProject().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
