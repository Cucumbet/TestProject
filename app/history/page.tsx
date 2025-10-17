"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, History as HistoryIcon } from "lucide-react"

export default function HistoryPage() {
  const runs = [
    {
      id: "run_2025_10_17_1432",
      project: "HR Database Migration",
      startedAt: "2025-10-17 14:32:15",
      durationSec: 24,
      tables: 6,
      rows: 1242,
      status: "success" as const,
    },
    {
      id: "run_2025_10_16_1011",
      project: "Sales Snapshot",
      startedAt: "2025-10-16 10:11:02",
      durationSec: 42,
      tables: 5,
      rows: 980,
      status: "success" as const,
    },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <HistoryIcon className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Run History (Mock)</h1>
      </div>

      <Card className="border border-border">
        <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-border text-xs text-muted-foreground">
          <div>Run ID</div>
          <div>Project</div>
          <div>Started</div>
          <div>Duration</div>
          <div>Tables/Rows</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y divide-border">
          {runs.map((r) => (
            <div key={r.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center text-sm">
              <div className="font-mono text-muted-foreground truncate">{r.id}</div>
              <div className="text-foreground">{r.project}</div>
              <div className="text-foreground">{r.startedAt}</div>
              <div className="text-foreground">{r.durationSec}s</div>
              <div className="text-foreground">
                {r.tables} / {r.rows.toLocaleString()}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-transparent gap-2">
                  <Download className="w-4 h-4" /> JSON
                </Button>
                <Button variant="outline" className="bg-transparent gap-2">
                  <Download className="w-4 h-4" /> CSV
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}



