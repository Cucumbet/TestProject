import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Basic shape validation (mock)
    const required = ["host", "port", "database", "username", "password"]
    const missing = required.filter((k) => body?.[k] === undefined || body?.[k] === "")
    if (missing.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Missing fields: ${missing.join(", ")}` },
        { status: 400 },
      )
    }

    // Simulate connectivity check latency
    await new Promise((res) => setTimeout(res, 600))

    // Mock success based on simple heuristic
    const ok = Boolean(body.host) && Number.isInteger(Number(body.port))
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Invalid connection parameters" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }
}



