"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, AlertTriangle, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import type { MigrationState } from "../migration-wizard"

interface DryRunStepProps {
  state: MigrationState
  setState: (state: MigrationState) => void
  onNext: () => void
  onPrevious: () => void
}

interface ValidationIssue {
  type: "error" | "warning" | "info"
  scope: string
  message: string
  suggestion: string
}

export function DryRunStep({ state, setState, onNext, onPrevious }: DryRunStepProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationComplete, setValidationComplete] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    issues: true,
    estimates: true,
  })

  const mockIssues: ValidationIssue[] = [
    {
      type: "warning",
      scope: "HR.EMPLOYEES",
      message: "SALARY column mapped to DECIMAL(8,2) - potential precision loss from NUMBER(8,2)",
      suggestion: "Consider using DECIMAL(10,2) for additional precision",
    },
    {
      type: "info",
      scope: "SALES.ORDERS",
      message: "Table has 105 rows - will be migrated in 1 batch",
      suggestion: "No action needed",
    },
  ]

  const [issues, setIssues] = useState<ValidationIssue[]>(mockIssues)
  const blockingErrors = issues.filter((i) => i.type === "error").length
  const warnings = issues.filter((i) => i.type === "warning").length
  const infos = issues.filter((i) => i.type === "info").length

  const handleRunValidation = async () => {
    setIsValidating(true)
    try {
      const res = await fetch("/api/dryrun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedTables: state.selectedTables }),
      })
      const data = await res.json()
      if (res.ok) setIssues(data.issues || [])
    } finally {
      setIsValidating(false)
      setValidationComplete(true)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 5: Dry-Run & Validation</h2>
        <p className="text-muted-foreground">Validate schema compatibility and estimate migration time.</p>
      </div>

      {/* Validation Summary Cards */}
      {validationComplete && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border border-border bg-red-500/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500/10">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blocking Errors</p>
                <p className="text-2xl font-bold text-foreground">{blockingErrors}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border bg-yellow-500/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-foreground">{warnings}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border bg-blue-500/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Info</p>
                <p className="text-2xl font-bold text-foreground">{infos}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-border bg-green-500/5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">OK Checks</p>
                <p className="text-2xl font-bold text-foreground">8</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Validation Issues Section */}
      {validationComplete && (
        <Card className="border border-border overflow-hidden mb-6">
          <button
            onClick={() => toggleSection("issues")}
            className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            {expandedSections["issues"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-semibold text-foreground">Validation Issues</span>
            <span className="ml-auto text-sm text-muted-foreground">{issues.length} issues found</span>
          </button>

          {expandedSections["issues"] && (
            <div className="p-6 border-t border-border space-y-3">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border ${
                    issue.type === "error"
                      ? "bg-red-500/5 border-red-500/30"
                      : issue.type === "warning"
                        ? "bg-yellow-500/5 border-yellow-500/30"
                        : "bg-blue-500/5 border-blue-500/30"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {issue.type === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {issue.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                      {issue.type === "info" && <AlertCircle className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {issue.scope}
                        </span>
                        <span
                          className={`text-xs font-semibold uppercase ${
                            issue.type === "error"
                              ? "text-red-600"
                              : issue.type === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        >
                          {issue.type}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">{issue.message}</p>
                      <p className="text-xs text-muted-foreground">💡 {issue.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Estimates Section */}
      {validationComplete && (
        <Card className="border border-border overflow-hidden mb-6">
          <button
            onClick={() => toggleSection("estimates")}
            className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            {expandedSections["estimates"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="font-semibold text-foreground">Migration Estimates</span>
          </button>

          {expandedSections["estimates"] && (
            <div className="p-6 border-t border-border space-y-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Total Rows</p>
                  <p className="text-3xl font-bold text-foreground">1,221</p>
                  <p className="text-xs text-muted-foreground mt-2">Across 6 tables</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Avg Row Size</p>
                  <p className="text-3xl font-bold text-foreground">~2.4 KB</p>
                  <p className="text-xs text-muted-foreground mt-2">Estimated</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Est. Duration</p>
                  <p className="text-3xl font-bold text-foreground">~4-6m</p>
                  <p className="text-xs text-muted-foreground mt-2">At 5K rows/sec</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Per-Table Estimates</h4>
                <div className="space-y-2">
                  {[
                    { table: "HR.DEPARTMENTS", rows: 27, duration: "~1s" },
                    { table: "HR.JOBS", rows: 19, duration: "~1s" },
                    { table: "HR.EMPLOYEES", rows: 107, duration: "~2s" },
                    { table: "SALES.CUSTOMERS", rows: 319, duration: "~3s" },
                    { table: "SALES.ORDERS", rows: 105, duration: "~2s" },
                    { table: "SALES.ORDER_ITEMS", rows: 665, duration: "~5s" },
                  ].map((item) => (
                    <div key={item.table} className="flex items-center justify-between p-3 bg-muted/20 rounded">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.table}</p>
                        <p className="text-xs text-muted-foreground">{item.rows.toLocaleString()} rows</p>
                      </div>
                      <p className="text-sm font-medium text-primary">{item.duration}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Validation Button */}
      {!validationComplete && (
        <Card className="p-8 border border-border flex flex-col items-center justify-center min-h-64">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-muted-foreground text-center mb-6">
            Click "Run Validations" to check schema compatibility and estimate migration time.
          </p>
          <Button onClick={handleRunValidation} disabled={isValidating} size="lg">
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Validations...
              </>
            ) : (
              "Run Validations"
            )}
          </Button>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 mt-8">
        <Button onClick={onPrevious} variant="outline" size="lg">
          Previous
        </Button>
        <Button onClick={onNext} disabled={blockingErrors > 0 || !validationComplete} size="lg">
          {blockingErrors > 0 ? "Fix Errors to Continue" : "Proceed to Execute"}
        </Button>
      </div>
    </div>
  )
}
