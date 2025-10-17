"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Download, RotateCcw, AlertCircle } from "lucide-react"

interface SummaryStepProps {
  state: any
}

export function SummaryStep({ state }: SummaryStepProps) {
  const mockResults = {
    tablesCompleted: 6,
    totalTables: 6,
    rowsCopied: 1242,
    duration: 24,
    errors: 0,
    warnings: 2,
    startTime: "2025-10-17 14:32:15",
    endTime: "2025-10-17 14:32:39",
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 7: Summary & History</h2>
        <p className="text-muted-foreground">Migration completed. Review results and download logs.</p>
      </div>

      {/* Success Banner */}
      <Card className="p-8 border border-green-500/30 bg-green-500/5 mb-8">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-green-600 mb-1">Migration Completed Successfully</h3>
            <p className="text-green-600/80">All tables migrated without blocking errors.</p>
          </div>
        </div>
      </Card>

      {/* Results Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Tables Migrated</p>
          <p className="text-3xl font-bold text-foreground">
            {mockResults.tablesCompleted}/{mockResults.totalTables}
          </p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Total Rows</p>
          <p className="text-3xl font-bold text-foreground">{mockResults.rowsCopied.toLocaleString()}</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Duration</p>
          <p className="text-3xl font-bold text-foreground">{mockResults.duration}s</p>
        </Card>
        <Card className="p-6 border border-border">
          <p className="text-xs text-muted-foreground mb-2">Throughput</p>
          <p className="text-3xl font-bold text-foreground">
            {Math.floor(mockResults.rowsCopied / mockResults.duration)}/s
          </p>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="p-6 border border-border mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-6">Migration Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Time</p>
              <p className="text-sm font-medium text-foreground">{mockResults.startTime}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">End Time</p>
              <p className="text-sm font-medium text-foreground">{mockResults.endTime}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Blocking Errors</p>
              <p className="text-sm font-medium text-foreground">{mockResults.errors}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Warnings</p>
              <p className="text-sm font-medium text-foreground">{mockResults.warnings}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Per-Table Summary */}
      <Card className="p-6 border border-border mb-8">
        <h3 className="text-lg font-semibold text-foreground mb-4">Per-Table Results</h3>
        <div className="space-y-2">
          {[
            { table: "HR.DEPARTMENTS", rows: 27, duration: 1.2, status: "completed" },
            { table: "HR.JOBS", rows: 19, duration: 0.8, status: "completed" },
            { table: "HR.EMPLOYEES", rows: 107, duration: 2.1, status: "completed" },
            { table: "SALES.CUSTOMERS", rows: 319, duration: 3.4, status: "completed" },
            { table: "SALES.ORDERS", rows: 105, duration: 2.0, status: "completed" },
            { table: "SALES.ORDER_ITEMS", rows: 665, duration: 5.2, status: "completed" },
          ].map((item) => (
            <div key={item.table} className="flex items-center justify-between p-3 bg-muted/20 rounded">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.table}</p>
                  <p className="text-xs text-muted-foreground">{item.rows.toLocaleString()} rows</p>
                </div>
              </div>
              <p className="text-sm font-medium text-primary">{item.duration.toFixed(1)}s</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Warnings */}
      {mockResults.warnings > 0 && (
        <Card className="p-6 border border-yellow-500/30 bg-yellow-500/5 mb-8">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-600 mb-2">Warnings</h4>
              <ul className="text-sm text-yellow-600/80 space-y-1">
                <li>• HR.EMPLOYEES: SALARY column precision may be reduced</li>
                <li>• SALES.ORDER_ITEMS: Consider adding indexes for foreign keys</li>
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" size="lg" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Download Logs (JSON)
        </Button>
        <Button variant="outline" size="lg" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Download Logs (CSV)
        </Button>
        <Button size="lg" className="gap-2 ml-auto">
          <RotateCcw className="w-4 h-4" />
          Start New Migration
        </Button>
      </div>
    </div>
  )
}
