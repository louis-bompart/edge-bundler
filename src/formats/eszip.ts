import { join, resolve } from 'path'

import { DenoBridge } from '../bridge.js'
import type { Bundle } from '../bundle.js'
import { EdgeFunction } from '../edge_function.js'
import { getFileHash } from '../utils/sha256.js'

interface BundleESZIPOptions {
  basePath: string
  buildID: string
  debug?: boolean
  deno: DenoBridge
  distDirectory: string
  functions: EdgeFunction[]
}

const bundleESZIP = async ({
  basePath,
  buildID,
  debug,
  deno,
  distDirectory,
  functions,
}: BundleESZIPOptions): Promise<Bundle> => {
  const extension = '.eszip'
  const destPath = join(distDirectory, `${buildID}${extension}`)
  const bundler = getESZIPBundler()
  const payload = {
    basePath,
    destPath,
    functions,
  }
  const flags = ['--allow-all']

  if (!debug) {
    flags.push('--quiet')
  }

  await deno.run(['run', ...flags, bundler, JSON.stringify(payload)])

  const hash = await getFileHash(destPath)

  return { extension, format: 'eszip2', hash }
}

const getESZIPBundler = () => {
  const { pathname } = new URL(import.meta.url)
  const bundlerPath = resolve(pathname, '../../../deno/bundle.ts')

  return bundlerPath
}

export { bundleESZIP }