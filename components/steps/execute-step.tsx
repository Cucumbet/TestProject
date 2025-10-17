"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Pause, Play, Square, ChevronDown, ChevronRight } from "lucide-react"
import type { MigrationState } from "../migration-wizard"

interface ExecuteStepProps {
  state: MigrationState
  setState: (state: MigrationState) => void
  onNext: () => void
  onPrevious: () => void
}

interface TableProgress {
  name: string
  status: "queued" | "running" | "completed" | "failed"
  rowsCopied: number
  totalRows: number
  duration: number
  rate: number
  error?: string
}

export function ExecuteStep({ state, setState, onNext, onPrevious }: ExecuteStepProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [globalProgress, setGlobalProgress] = useState(0)
  const [tableProgress, setTableProgress] = useState<Record<string, TableProgress>>({})
  const [logs, setLogs] = useState<Array<{ level: string; message: string; timestamp: string }>>([])
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error">("all")
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  // Mock table data
  const tables = [
    { name: "HR.DEPARTMENTS", rows: 27 },
    { name: "HR.JOBS", rows: 19 },
    { name: "HR.EMPLOYEES", rows: 107 },
    { name: "SALES.CUSTOMERS", rows: 319 },
    { name: "SALES.ORDERS", rows: 105 },
    { name: "SALES.ORDER_ITEMS", rows: 665 },
  ]

  const totalRows = tables.reduce((sum, t) => sum + t.rows, 0)

  // Simulate migration execution
  useEffect(() => {
    if (!isRunning || isPaused) return

    if (!startTime) {
      setStartTime(Date.now())
      // Initialize table progress
      const initial: Record<string, TableProgress> = {}
      tables.forEach((table) => {
        initial[table.name] = {
          name: table.name,
          status: "queued",
          rowsCopied: 0,
          totalRows: table.rows,
          duration: 0,
          rate: 0,
        }
      })
      setTableProgress(initial)
      addLog("info", "Migration started")
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))

      setTableProgress((prev) => {
        const updated = { ...prev }
        let totalCopied = 0
        let completedTables = 0

        // Simulate progress
        tables.forEach((table, idx) => {
          const progress = updated[table.name]
          if (!progress) return

          if (idx < Math.floor(elapsedTime / 2)) {
            // Completed
            if (progress.status !== "completed") {
              updated[table.name] = {
                ...progress,
                status: "completed",
                rowsCopied: table.rows,
                duration: Math.random() * 5 + 2,
                rate: Math.floor(table.rows / (Math.random() * 3 + 2)),
              }
              addLog("info", `✓ ${table.name}: ${table.rows} rows copied`)
            }
            completedTables++
            totalCopied += table.rows
          } else if (idx === Math.floor(elapsedTime / 2)) {
            // Running
            const progress_pct = (elapsedTime % 2) / 2
            updated[table.name] = {
              ...progress,
              status: "running",
              rowsCopied: Math.floor(table.rows * progress_pct),
              duration: elapsedTime - idx * 2,
              rate: Math.floor((table.rows * progress_pct) / (elapsedTime - idx * 2 || 1)),
            }
            totalCopied += updated[table.name].rowsCopied
          } else {
            totalCopied += progress.rowsCopied
          }
        })

        setGlobalProgress(Math.floor((totalCopied / totalRows) * 100))

        if (completedTables === tables.length) {
          setIsRunning(false)
          addLog("info", "Migration completed successfully")
        }

        return updated
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isRunning, isPaused, startTime, elapsedTime])

  const addLog = (level: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        level,
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ])
  }

  const handleStart = async () => {
    setIsRunning(true)
    setIsPaused(false)
    try {
      // Create a run then invoke execute
      const projectId = typeof window !== "undefined" ? localStorage.getItem("projectId") : null
      const runRes = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, tables: state.selectedTables }),
      })
      const runData = await runRes.json()
      if (runRes.ok && runData?.run?.id) {
        await fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ runId: runData.run.id }),
        })
      }
    } catch {}
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleStop = () => {
    setIsRunning(false)
    setIsPaused(false)
    addLog("warn", "Migration stopped by user")
  }

  const toggleTableExpand = (tableName: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableName]: !prev[tableName] }))
  }

  const filteredLogs = logs.filter((log) => logFilter === "all" || log.level === logFilter)

  const completedTables = Object.values(tableProgress).filter((t) => t.status === "completed").length
  const failedTables = Object.values(tableProgress).filter((t) => t.status === "failed").length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 6: Execute Migration</h2>
        <p className="text-muted-foreground">Run the migration with real-time progress tracking.</p>
      </div>

      {/* Global Progress Section */}
      <Card className="p-6 border border-border mb-6">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Overall Progress</h3>
              <span className="text-sm font-bold text-primary">{globalProgress}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${globalProgress}%` }} />
            </div>
          </div>

          {/* KPI Chips */}
          <div className="grid grid-cols-5 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Elapsed</p>
              <p className="text-lg font-bold text-foreground">{elapsedTime}s</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Tables</p>
              <p className="text-lg font-bold text-foreground">
                {completedTables}/{tables.length}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Rows Copied</p>
              <p className="text-lg font-bold text-foreground">
                {Object.values(tableProgress)
                  .reduce((sum, t) => sum + t.rowsCopied, 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">Throughput</p>
              <p className="text-lg font-bold text-foreground">
                {Math.floor(
                  Object.values(tableProgress).reduce((sum, t) => sum + t.rowsCopied, 0) / (elapsedTime || 1),
                )}
                /s
              </p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="text-lg font-bold text-foreground">
                {Math.max(
                  0,
                  Math.floor(
                    totalRows /
                      (Object.values(tableProgress).reduce((sum, t) => sum + t.rowsCopied, 0) / (elapsedTime || 1) ||
                        1) -
                      elapsedTime,
                  ),
                )}
                s
              </p>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" className="gap-2">
                <Play className="w-4 h-4" />
                Start Migration
              </Button>
            ) : (
              <>
                <Button onClick={handlePause} variant="outline" size="lg" className="gap-2 bg-transparent">
                  <Pause className="w-4 h-4" />
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="lg"
                  className="gap-2 text-destructive bg-transparent"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Per-Table Progress */}
      <Card className="border border-border overflow-hidden mb-6">
        <div className="px-6 py-4 bg-muted/30 border-b border-border">
          <h3 className="font-semibold text-foreground">Per-Table Progress</h3>
        </div>
        <div className="divide-y divide-border">
          {tables.map((table) => {
            const progress = tableProgress[table.name]
            const isExpanded = expandedTables[table.name]

            return (
              <div key={table.name}>
                <button
                  onClick={() => toggleTableExpand(table.name)}
                  className="w-full px-6 py-4 hover:bg-muted/20 transition-colors flex items-center gap-3"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">{table.name}</span>
                      {progress?.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {progress?.status === "running" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                      {progress?.status === "failed" && <AlertCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    {progress && (
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progress.status === "completed"
                              ? "bg-green-500"
                              : progress.status === "running"
                                ? "bg-primary"
                                : "bg-muted"
                          }`}
                          style={{ width: `${(progress.rowsCopied / progress.totalRows) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {progress && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {progress.rowsCopied.toLocaleString()} / {progress.totalRows.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{progress.rate.toLocaleString()} rows/s</p>
                    </div>
                  )}
                </button>

                {isExpanded && progress && (
                  <div className="px-6 py-4 bg-muted/10 border-t border-border space-y-2">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-medium text-foreground capitalize">{progress.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-medium text-foreground">{progress.duration.toFixed(1)}s</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Batches</p>
                        <p className="font-medium text-foreground">
                          {Math.ceil(progress.rowsCopied / 10000)} / {Math.ceil(progress.totalRows / 10000)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="font-medium text-foreground">
                          {Math.round((progress.rowsCopied / progress.totalRows) * 100)}%
                        </p>
                      </div>
                    </div>
                    {progress.error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-600">
                        {progress.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Live Logs */}
      <Card className="border border-border overflow-hidden">
        <div className="px-6 py-4 bg-muted/30 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Live Logs</h3>
          <div className="flex gap-2">
            {(["all", "info", "warn", "error"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  logFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {filter.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64 overflow-auto bg-muted/5 p-4 font-mono text-xs space-y-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-muted-foreground flex-shrink-0">{log.timestamp}</span>
                <span
                  className={`flex-shrink-0 font-semibold ${
                    log.level === "error" ? "text-red-500" : log.level === "warn" ? "text-yellow-500" : "text-green-500"
                  }`}
                >
                  [{log.level.toUpperCase()}]
                </span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No logs yet</p>
          )}
        </div>
      </Card>

      <div className="flex justify-between gap-4 mt-8">
        <Button onClick={onPrevious} variant="outline" size="lg" disabled={isRunning}>
          Previous
        </Button>
        <Button onClick={onNext} disabled={globalProgress < 100} size="lg">
          Next
        </Button>
      </div>
    </div>
  )
}
