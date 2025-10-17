import { promises as fs } from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), ".data")
const STORE_FILE = path.join(DATA_DIR, "store.json")

export interface ProjectRecord {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface RunRecord {
  id: string
  projectId: string
  status: "queued" | "running" | "succeeded" | "failed"
  startedAt: string
  finishedAt?: string
  tables?: string[]
  logs: { level: "info" | "warn" | "error"; message: string; ts: string }[]
}

interface StoreShape {
  projects: ProjectRecord[]
  runs: RunRecord[]
}

async function ensureStore(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.access(STORE_FILE)
  } catch {
    const initial: StoreShape = { projects: [], runs: [] }
    await fs.writeFile(STORE_FILE, JSON.stringify(initial, null, 2), "utf8")
  }
}

async function readStore(): Promise<StoreShape> {
  await ensureStore()
  const raw = await fs.readFile(STORE_FILE, "utf8")
  return JSON.parse(raw) as StoreShape
}

async function writeStore(store: StoreShape): Promise<void> {
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf8")
}

export async function listProjects(): Promise<ProjectRecord[]> {
  const db = await readStore()
  return db.projects
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  const db = await readStore()
  return db.projects.find((p) => p.id === id)
}

export async function createProject(name: string): Promise<ProjectRecord> {
  const db = await readStore()
  const now = new Date().toISOString()
  const rec: ProjectRecord = { id: `proj_${Date.now()}`, name, createdAt: now, updatedAt: now }
  db.projects.push(rec)
  await writeStore(db)
  return rec
}

export async function updateProject(id: string, name: string): Promise<ProjectRecord | undefined> {
  const db = await readStore()
  const rec = db.projects.find((p) => p.id === id)
  if (!rec) return undefined
  rec.name = name
  rec.updatedAt = new Date().toISOString()
  await writeStore(db)
  return rec
}

export async function deleteProject(id: string): Promise<boolean> {
  const db = await readStore()
  const before = db.projects.length
  db.projects = db.projects.filter((p) => p.id !== id)
  await writeStore(db)
  return db.projects.length < before
}

export async function listRuns(projectId?: string): Promise<RunRecord[]> {
  const db = await readStore()
  return projectId ? db.runs.filter((r) => r.projectId === projectId) : db.runs
}

export async function startRun(projectId: string, tables: string[]): Promise<RunRecord> {
  const db = await readStore()
  const run: RunRecord = {
    id: `run_${Date.now()}`,
    projectId,
    status: "queued",
    startedAt: new Date().toISOString(),
    tables,
    logs: [{ level: "info", message: "Run created", ts: new Date().toISOString() }],
  }
  db.runs.push(run)
  await writeStore(db)
  return run
}

export async function updateRunStatus(id: string, status: RunRecord["status"], logMessage?: string): Promise<RunRecord | undefined> {
  const db = await readStore()
  const run = db.runs.find((r) => r.id === id)
  if (!run) return undefined
  run.status = status
  if (status === "succeeded" || status === "failed") {
    run.finishedAt = new Date().toISOString()
  }
  if (logMessage) {
    run.logs.push({ level: "info", message: logMessage, ts: new Date().toISOString() })
  }
  await writeStore(db)
  return run
}


