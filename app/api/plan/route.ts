import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { selectedTables } = await request.json()
  const order = (selectedTables || []).map((t: string, i: number) => ({ table: t, order: i + 1 }))
  const ddl = (selectedTables || [])
    .map((t: string) => {
      const [schema, table] = t.split(".")
      return `IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '${schema}')\n  EXEC('CREATE SCHEMA ${schema}');\nGO\nCREATE TABLE [${schema}].[${table}] (\n  /* columns */\n);\nGO`;
    })
    .join("\n\n")
  return NextResponse.json({ ok: true, plan: { order, ddl } })
}


