"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"
import type { MigrationState } from "../migration-wizard"

interface PlanStepProps {
  state: MigrationState
  setState: (state: MigrationState) => void
  onNext: () => void
  onPrevious: () => void
}

// Mock dependency data
const MOCK_DEPENDENCIES = {
  "HR.DEPARTMENTS": { order: 1, dependencies: [] },
  "HR.JOBS": { order: 1, dependencies: [] },
  "HR.EMPLOYEES": { order: 2, dependencies: ["HR.DEPARTMENTS", "HR.JOBS"] },
  "SALES.CUSTOMERS": { order: 1, dependencies: [] },
  "SALES.ORDERS": { order: 2, dependencies: ["SALES.CUSTOMERS"] },
  "SALES.ORDER_ITEMS": { order: 3, dependencies: ["SALES.ORDERS"] },
}

export function PlanStep({ state, setState, onNext, onPrevious }: PlanStepProps) {
  const [conflictBehavior, setConflictBehavior] = useState<"skip" | "truncate" | "fail">("fail")
  const [batchSize, setBatchSize] = useState(10000)
  const [maxParallel, setMaxParallel] = useState(4)
  const [transactionMode, setTransactionMode] = useState<"per-table" | "per-batch">("per-table")
  const [maxRetries, setMaxRetries] = useState(3)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    graph: true,
    settings: true,
  })
  const [showDDL, setShowDDL] = useState(false)
  const [ddlText, setDdlText] = useState("")

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Build dependency order
  const sortedTables = state.selectedTables.sort((a, b) => {
    const orderA = MOCK_DEPENDENCIES[a as keyof typeof MOCK_DEPENDENCIES]?.order || 0
    const orderB = MOCK_DEPENDENCIES[b as keyof typeof MOCK_DEPENDENCIES]?.order || 0
    return orderA - orderB
  })

  const hasCycles = false // Mock: no cycles detected

  const handleGeneratePlan = async () => {
    // Mock DDL for preview
    try {
      const res = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selectedTables: state.selectedTables }) })
      const data = await res.json()
      if (res.ok) {
        setDdlText(data.plan?.ddl || "")
        setShowDDL(true)
      }
    } catch {}
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 4: Dependencies & Plan</h2>
        <p className="text-muted-foreground">Review migration order, configure execution settings, and generate DDL.</p>
      </div>

      {/* Dependency Graph Section */}
      <Card className="border border-border overflow-hidden mb-6">
        <button
          onClick={() => toggleSection("graph")}
          className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {expandedSections["graph"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-semibold text-foreground">Dependency Graph & Migration Order</span>
          {hasCycles && <AlertTriangle className="w-4 h-4 text-yellow-600 ml-auto" />}
        </button>

        {expandedSections["graph"] && (
          <div className="p-6 border-t border-border space-y-6">
            {/* Visual Graph Representation */}
            <div className="bg-muted/20 rounded-lg p-6 min-h-64 flex items-center justify-center">
              <div className="w-full">
                <div className="space-y-4">
                  {[1, 2, 3].map((level) => {
                    const tablesAtLevel = sortedTables.filter(
                      (t) => MOCK_DEPENDENCIES[t as keyof typeof MOCK_DEPENDENCIES]?.order === level,
                    )
                    if (tablesAtLevel.length === 0) return null

                    return (
                      <div key={level}>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Level {level}</p>
                        <div className="flex flex-wrap gap-3">
                          {tablesAtLevel.map((table) => (
                            <div
                              key={table}
                              className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-sm font-medium text-primary"
                            >
                              {table}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Textual Order List */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Topological Order</h4>
              <div className="space-y-2">
                {sortedTables.map((table, index) => {
                  const deps = MOCK_DEPENDENCIES[table as keyof typeof MOCK_DEPENDENCIES]?.dependencies || []
                  return (
                    <div key={table} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{table}</p>
                        {deps.length > 0 && (
                          <p className="text-xs text-muted-foreground">Depends on: {deps.join(", ")}</p>
                        )}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    </div>
                  )
                })}
              </div>
            </div>

            {hasCycles && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-600">Circular Dependencies Detected</p>
                  <p className="text-sm text-yellow-600/80">
                    Foreign keys will be applied after data load to resolve cycles.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Conflict Behavior Section */}
      <Card className="border border-border overflow-hidden mb-6">
        <button
          onClick={() => toggleSection("conflict")}
          className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {expandedSections["conflict"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-semibold text-foreground">Conflict Behavior</span>
        </button>

        {expandedSections["conflict"] && (
          <div className="p-6 border-t border-border space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">If destination table exists:</label>
              <div className="space-y-2">
                {(["skip", "truncate", "fail"] as const).map((behavior) => (
                  <label
                    key={behavior}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="conflict"
                      value={behavior}
                      checked={conflictBehavior === behavior}
                      onChange={(e) => setConflictBehavior(e.target.value as typeof behavior)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{behavior}</p>
                      <p className="text-xs text-muted-foreground">
                        {behavior === "skip" && "Skip the table and continue"}
                        {behavior === "truncate" && "Truncate existing data and append new rows"}
                        {behavior === "fail" && "Fail the migration (default)"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Performance Settings Section */}
      <Card className="border border-border overflow-hidden mb-6">
        <button
          onClick={() => toggleSection("settings")}
          className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          {expandedSections["settings"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-semibold text-foreground">Performance Settings</span>
        </button>

        {expandedSections["settings"] && (
          <div className="p-6 border-t border-border space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Batch Size (rows)</label>
                <Input
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number.parseInt(e.target.value))}
                  min={1000}
                  step={1000}
                />
                <p className="text-xs text-muted-foreground mt-1">Rows per batch for bulk copy</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Max Parallel Tables</label>
                <Input
                  type="number"
                  value={maxParallel}
                  onChange={(e) => setMaxParallel(Number.parseInt(e.target.value))}
                  min={1}
                  max={16}
                />
                <p className="text-xs text-muted-foreground mt-1">Concurrent table migrations</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Transaction Mode</label>
                <div className="space-y-2">
                  {(["per-table", "per-batch"] as const).map((mode) => (
                    <label key={mode} className="flex items-center gap-2 p-2 rounded hover:bg-muted/30 cursor-pointer">
                      <input
                        type="radio"
                        name="transaction"
                        value={mode}
                        checked={transactionMode === mode}
                        onChange={(e) => setTransactionMode(e.target.value as typeof mode)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground capitalize">{mode.replace("-", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Max Retries</label>
                <Input
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number.parseInt(e.target.value))}
                  min={0}
                  max={10}
                />
                <p className="text-xs text-muted-foreground mt-1">Exponential backoff on transient errors</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Summary */}
      <Card className="p-6 border border-border bg-muted/20">
        <h4 className="text-sm font-semibold text-foreground mb-4">Migration Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Tables</p>
            <p className="text-2xl font-bold text-foreground">{state.selectedTables.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Batch Size</p>
            <p className="text-2xl font-bold text-foreground">{(batchSize / 1000).toFixed(0)}K</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Parallelism</p>
            <p className="text-2xl font-bold text-foreground">{maxParallel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Est. Duration</p>
            <p className="text-2xl font-bold text-foreground">~5m</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleGeneratePlan} variant="outline" className="bg-transparent">Generate Plan (DDL Preview)</Button>
        </div>
      </Card>

      <div className="flex justify-between gap-4 mt-8">
        <Button onClick={onPrevious} variant="outline" size="lg">
          Previous
        </Button>
        <Button onClick={onNext} size="lg">
          Next
        </Button>
      </div>

      <Dialog open={showDDL} onOpenChange={setShowDDL}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>DDL Preview (Mock)</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/20 p-4 rounded border border-border max-h-[60vh] overflow-auto">
{ddlText}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}
