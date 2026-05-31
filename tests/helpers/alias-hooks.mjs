/**
 * Node module-resolution hook that teaches the built-in test runner how to
 * resolve the project's `@/` path alias (configured in tsconfig.json) and how
 * to load extensionless TypeScript imports.
 *
 * Used via the "test" npm script (see package.json).
 *
 * This keeps the test suite dependency-free — it relies only on Node 22's
 * native TypeScript type-stripping plus these resolve hooks. No vitest/jest.
 */
import { fileURLToPath, pathToFileURL } from 'node:url'
import { existsSync, statSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

// Use the project's own TypeScript compiler to transpile test/lib sources.
// Unlike Node's native type-stripping, ts.transpileModule correctly elides
// type-only imports such as `import { LabMarker } from '@/types/lab'`, which
// this codebase relies on.
const require = createRequire(import.meta.url)
const ts = require('typescript')

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const tryExts = ['.ts', '.tsx', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json']

function resolveToFile(basePath) {
  // Exact file
  if (existsSync(basePath) && statSync(basePath).isFile()) return basePath
  // With each candidate extension
  for (const ext of tryExts) {
    if (existsSync(basePath + ext)) return basePath + ext
  }
  // As a directory with an index file
  for (const ext of tryExts) {
    const indexPath = path.join(basePath, 'index' + ext)
    if (existsSync(indexPath)) return indexPath
  }
  return null
}

export async function resolve(specifier, context, nextResolve) {
  // Map the `@/` alias to the project root.
  if (specifier.startsWith('@/')) {
    const target = resolveToFile(path.join(projectRoot, specifier.slice(2)))
    if (target) return { url: pathToFileURL(target).href, shortCircuit: true }
  }

  // Resolve extensionless relative imports (e.g. `./markers`) that point at .ts.
  if (specifier.startsWith('.') && context.parentURL) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL))
    const target = resolveToFile(path.resolve(parentDir, specifier))
    if (target) return { url: pathToFileURL(target).href, shortCircuit: true }
  }

  return nextResolve(specifier, context)
}

/**
 * Registering a resolve hook disables Node's automatic TypeScript type
 * stripping, so we strip types ourselves for .ts/.tsx files.
 */
export async function load(url, context, nextLoad) {
  if (/\.(ts|tsx|mts|cts)(\?|$)/.test(url)) {
    const fileName = fileURLToPath(url)
    const source = readFileSync(fileName, 'utf8')
    const { outputText } = ts.transpileModule(source, {
      fileName,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.ReactJSX,
        verbatimModuleSyntax: false,
        esModuleInterop: true,
        isolatedModules: true,
      },
    })
    return { format: 'module', source: outputText, shortCircuit: true }
  }
  return nextLoad(url, context)
}
