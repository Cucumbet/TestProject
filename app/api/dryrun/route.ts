import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { selectedTables } = await request.json()
  // Mock checks
  const issues = [
    {
      type: "warning",
      scope: selectedTables?.[0] || "HR.EMPLOYEES",
      message: "DECIMAL(8,2) may lose precision from NUMBER(8,2)",
      suggestion: "Consider DECIMAL(10,2)",
    },
  ]
  const estimates = {
    totalRows: 1221,
    perTable: (selectedTables || []).map((t: string) => ({ table: t, rows: Math.floor(Math.random() * 500) + 10 })),
  }
  return NextResponse.json({ ok: true, issues, estimates })
}


