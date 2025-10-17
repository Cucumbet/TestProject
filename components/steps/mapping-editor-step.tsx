"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ChevronDown, ChevronRight, Key, Link2 } from "lucide-react"
import type { MigrationState } from "../migration-wizard"

interface MappingEditorStepProps {
  state: MigrationState
  setState: (state: MigrationState) => void
  onNext: () => void
  onPrevious: () => void
}

// Mock column data
const MOCK_COLUMNS = {
  "HR.EMPLOYEES": [
    { name: "EMPLOYEE_ID", oracleType: "NUMBER(4)", sqlType: "INT", nullable: false, isPK: true, isFK: false },
    {
      name: "FIRST_NAME",
      oracleType: "VARCHAR2(20)",
      sqlType: "VARCHAR(20)",
      nullable: false,
      isPK: false,
      isFK: false,
    },
    {
      name: "LAST_NAME",
      oracleType: "VARCHAR2(25)",
      sqlType: "VARCHAR(25)",
      nullable: false,
      isPK: false,
      isFK: false,
    },
    { name: "EMAIL", oracleType: "VARCHAR2(25)", sqlType: "VARCHAR(25)", nullable: true, isPK: false, isFK: false },
    {
      name: "PHONE_NUMBER",
      oracleType: "VARCHAR2(20)",
      sqlType: "VARCHAR(20)",
      nullable: true,
      isPK: false,
      isFK: false,
    },
    { name: "HIRE_DATE", oracleType: "DATE", sqlType: "DATETIME2", nullable: false, isPK: false, isFK: false },
    { name: "JOB_ID", oracleType: "VARCHAR2(10)", sqlType: "VARCHAR(10)", nullable: false, isPK: false, isFK: true },
    { name: "SALARY", oracleType: "NUMBER(8,2)", sqlType: "DECIMAL(8,2)", nullable: true, isPK: false, isFK: false },
    {
      name: "COMMISSION_PCT",
      oracleType: "NUMBER(2,2)",
      sqlType: "DECIMAL(2,2)",
      nullable: true,
      isPK: false,
      isFK: false,
    },
    { name: "DEPARTMENT_ID", oracleType: "NUMBER(4)", sqlType: "INT", nullable: true, isPK: false, isFK: true },
  ],
}

const SQL_SERVER_TYPES = [
  "INT",
  "BIGINT",
  "SMALLINT",
  "TINYINT",
  "DECIMAL",
  "NUMERIC",
  "FLOAT",
  "REAL",
  "VARCHAR",
  "NVARCHAR",
  "CHAR",
  "NCHAR",
  "TEXT",
  "NTEXT",
  "DATETIME2",
  "DATE",
  "TIME",
  "VARBINARY",
  "BINARY",
  "XML",
]

export function MappingEditorStep({ state, setState, onNext, onPrevious }: MappingEditorStepProps) {
  const [selectedTable, setSelectedTable] = useState(state.selectedTables[0] || "")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    columns: true,
    keys: true,
  })
  const [columnMappings, setColumnMappings] = useState<Record<string, any>>({})
  const [excludedColumns, setExcludedColumns] = useState<Set<string>>(new Set())

  const columns = MOCK_COLUMNS[selectedTable as keyof typeof MOCK_COLUMNS] || []

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleExcludeColumn = (columnName: string) => {
    const newExcluded = new Set(excludedColumns)
    if (newExcluded.has(columnName)) {
      newExcluded.delete(columnName)
    } else {
      newExcluded.add(columnName)
    }
    setExcludedColumns(newExcluded)
  }

  const updateColumnMapping = (columnName: string, field: string, value: any) => {
    setColumnMappings((prev) => ({
      ...prev,
      [columnName]: {
        ...prev[columnName],
        [field]: value,
      },
    }))
  }

  const pkColumns = columns.filter((c) => c.isPK)
  const fkColumns = columns.filter((c) => c.isFK)
  const regularColumns = columns.filter((c) => !c.isPK && !c.isFK)

  const hasLossyMappings = columns.some((col) => {
    const mapping = columnMappings[col.name]
    if (!mapping) return false
    // Check for potential data loss scenarios
    if (col.oracleType.includes("CLOB") && !mapping.sqlType?.includes("MAX")) return true
    if (col.oracleType.includes("NUMBER") && mapping.sqlType === "INT") return true
    return false
  })

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 3: Edit Column Mappings</h2>
        <p className="text-muted-foreground">Configure column-level mappings, data types, and constraints.</p>
      </div>

      {/* Table Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-2">Select Table</label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground"
        >
          {state.selectedTables.map((table) => (
            <option key={table} value={table}>
              {table}
            </option>
          ))}
        </select>
      </div>

      {/* Warnings */}
      {hasLossyMappings && (
        <Card className="p-4 mb-6 border border-yellow-500/30 bg-yellow-500/5">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Potential Data Loss Detected</p>
              <p className="text-sm text-yellow-600/80">
                Some column mappings may result in data loss. Review carefully.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Column Mappings */}
      <div className="space-y-4">
        {/* Primary Keys Section */}
        {pkColumns.length > 0 && (
          <Card className="border border-border overflow-hidden">
            <button
              onClick={() => toggleSection("keys")}
              className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {expandedSections["keys"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Key className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Primary Keys ({pkColumns.length})</span>
            </button>

            {expandedSections["keys"] && (
              <div className="p-6 space-y-4 border-t border-border">
                {pkColumns.map((col) => (
                  <div key={col.name} className="space-y-3 p-4 bg-muted/20 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Source Column</label>
                        <Input value={col.name} disabled className="bg-muted/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Source Type</label>
                        <Input value={col.oracleType} disabled className="bg-muted/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Dest Column</label>
                        <Input
                          placeholder={col.name}
                          value={columnMappings[col.name]?.destName || ""}
                          onChange={(e) => updateColumnMapping(col.name, "destName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Dest Type</label>
                        <select
                          value={columnMappings[col.name]?.sqlType || col.sqlType}
                          onChange={(e) => updateColumnMapping(col.name, "sqlType", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
                        >
                          {SQL_SERVER_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Foreign Keys Section */}
        {fkColumns.length > 0 && (
          <Card className="border border-border overflow-hidden">
            <button
              onClick={() => toggleSection("fks")}
              className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {expandedSections["fks"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Link2 className="w-4 h-4 text-accent" />
              <span className="font-semibold text-foreground">Foreign Keys ({fkColumns.length})</span>
            </button>

            {expandedSections["fks"] && (
              <div className="p-6 space-y-4 border-t border-border">
                {fkColumns.map((col) => (
                  <div key={col.name} className="space-y-3 p-4 bg-muted/20 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Source Column</label>
                        <Input value={col.name} disabled className="bg-muted/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Source Type</label>
                        <Input value={col.oracleType} disabled className="bg-muted/50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Dest Column</label>
                        <Input
                          placeholder={col.name}
                          value={columnMappings[col.name]?.destName || ""}
                          onChange={(e) => updateColumnMapping(col.name, "destName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Dest Type</label>
                        <select
                          value={columnMappings[col.name]?.sqlType || col.sqlType}
                          onChange={(e) => updateColumnMapping(col.name, "sqlType", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
                        >
                          {SQL_SERVER_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Regular Columns Section */}
        {regularColumns.length > 0 && (
          <Card className="border border-border overflow-hidden">
            <button
              onClick={() => toggleSection("columns")}
              className="w-full flex items-center gap-3 px-6 py-4 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {expandedSections["columns"] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span className="font-semibold text-foreground">Regular Columns ({regularColumns.length})</span>
            </button>

            {expandedSections["columns"] && (
              <div className="p-6 space-y-4 border-t border-border">
                {regularColumns.map((col) => (
                  <div key={col.name} className="space-y-3 p-4 bg-muted/20 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{col.name}</p>
                        <p className="text-xs text-muted-foreground">{col.oracleType}</p>
                      </div>
                      <Checkbox
                        checked={!excludedColumns.has(col.name)}
                        onChange={() => toggleExcludeColumn(col.name)}
                        label="Include"
                      />
                    </div>

                    {!excludedColumns.has(col.name) && (
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Dest Column</label>
                          <Input
                            placeholder={col.name}
                            value={columnMappings[col.name]?.destName || ""}
                            onChange={(e) => updateColumnMapping(col.name, "destName", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Dest Type</label>
                          <select
                            value={columnMappings[col.name]?.sqlType || col.sqlType}
                            onChange={(e) => updateColumnMapping(col.name, "sqlType", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
                          >
                            {SQL_SERVER_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">Nullable</label>
                          <Checkbox
                            checked={columnMappings[col.name]?.nullable ?? col.nullable}
                            onChange={(checked) => updateColumnMapping(col.name, "nullable", checked)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      <div className="flex justify-between gap-4 mt-8">
        <Button onClick={onPrevious} variant="outline" size="lg">
          Previous
        </Button>
        <Button onClick={onNext} size="lg">
          Next
        </Button>
      </div>
    </div>
  )
}
