import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { homedir } from 'node:os'

export interface CliConfig {
  apiBase: string
  apiKey?: string
}

const CONFIG_DIR = join(homedir(), '.reqtap')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const CURSOR_FILE = join(CONFIG_DIR, 'cursors.json')

export async function loadConfig(overrides: Partial<CliConfig> = {}): Promise<CliConfig> {
  const defaults: CliConfig = {
    apiBase: process.env.REQTAP_API_BASE ?? 'http://localhost:3333',
  }

  try {
    const stored = JSON.parse(await readFile(CONFIG_FILE, 'utf8')) as Partial<CliConfig>
    return normalizeConfig({ ...defaults, ...stored, ...overrides })
  } catch {
    return normalizeConfig({ ...defaults, ...overrides })
  }
}

export async function saveConfig(config: CliConfig) {
  await mkdir(CONFIG_DIR, { recursive: true })
  await writeFile(CONFIG_FILE, JSON.stringify(normalizeConfig(config), null, 2))
}

export async function loadCursor(key: string) {
  try {
    const cursors = JSON.parse(await readFile(CURSOR_FILE, 'utf8')) as Record<string, string>
    return cursors[key] ?? ''
  } catch {
    return ''
  }
}

export async function saveCursor(key: string, value: string) {
  await mkdir(CONFIG_DIR, { recursive: true })

  let cursors: Record<string, string> = {}
  try {
    cursors = JSON.parse(await readFile(CURSOR_FILE, 'utf8')) as Record<string, string>
  } catch {
    cursors = {}
  }

  cursors[key] = value
  await writeFile(CURSOR_FILE, JSON.stringify(cursors, null, 2))
}

export function cursorKey(config: CliConfig, command: string, token: string, target = '') {
  return [command, config.apiBase, token, target].join('|')
}

function normalizeConfig(config: CliConfig): CliConfig {
  return {
    ...config,
    apiBase: config.apiBase.replace(/\/$/, ''),
  }
}
