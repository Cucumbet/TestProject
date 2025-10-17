import { NextResponse } from "next/server"
import { updateRunStatus } from "@/lib/server/store"

export async function POST(request: Request) {
  const { runId } = await request.json()
  if (!runId) return NextResponse.json({ ok: false, error: "runId required" }, { status: 400 })
  await updateRunStatus(runId, "running", "Execution started")
  // Simulate completion shortly after
  setTimeout(() => updateRunStatus(runId, "succeeded", "Execution completed"), 1500)
  return NextResponse.json({ ok: true })
}


