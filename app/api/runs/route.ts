import { NextResponse } from "next/server"
import { listRuns, startRun } from "@/lib/server/store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId") || undefined
  const runs = await listRuns(projectId)
  return NextResponse.json({ ok: true, runs })
}

export async function POST(request: Request) {
  const { projectId, tables } = await request.json()
  if (!projectId) return NextResponse.json({ ok: false, error: "projectId required" }, { status: 400 })
  const run = await startRun(projectId, Array.isArray(tables) ? tables : [])
  return NextResponse.json({ ok: true, run })
}


