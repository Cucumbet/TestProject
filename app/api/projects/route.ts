import { NextResponse } from "next/server"
import { listProjects, createProject } from "@/lib/server/store"

export async function GET() {
  const projects = await listProjects()
  return NextResponse.json({ ok: true, projects })
}

export async function POST(request: Request) {
  const { name } = await request.json()
  if (!name) return NextResponse.json({ ok: false, error: "name required" }, { status: 400 })
  const project = await createProject(name)
  return NextResponse.json({ ok: true, project })
}


