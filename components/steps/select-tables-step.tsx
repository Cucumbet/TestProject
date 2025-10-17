"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronDown, ChevronRight, Edit2, AlertCircle } from "lucide-react"
import type { MigrationState } from "../migration-wizard"

interface SelectTablesStepProps {
  state: MigrationState
  setState: (state: MigrationState) => void
  onNext: () => void
  onPrevious: () => void
}

// Mock data
const MOCK_SCHEMAS = {
  HR: [
    { name: "EMPLOYEES", rowCount: 107, pk: "EMPLOYEE_ID", fks: ["DEPARTMENT_ID"] },
    { name: "DEPARTMENTS", rowCount: 27, pk: "DEPARTMENT_ID", fks: [] },
    { name: "JOBS", rowCount: 19, pk: "JOB_ID", fks: [] },
  ],
  SALES: [
    { name: "CUSTOMERS", rowCount: 319, pk: "CUSTOMER_ID", fks: [] },
    { name: "ORDERS", rowCount: 105, pk: "ORDER_ID", fks: ["CUSTOMER_ID"] },
    { name: "ORDER_ITEMS", rowCount: 665, pk: "ORDER_ITEM_ID", fks: ["ORDER_ID", "PRODUCT_ID"] },
  ],
}

export function SelectTablesStep({ state, setState, onNext, onPrevious }: SelectTablesStepProps) {
  const [expandedSchemas, setExpandedSchemas] = useState<Record<string, boolean>>({ HR: true, SALES: true })
  const [searchTerm, setSearchTerm] = useState("")
  const [tableDestNames, setTableDestNames] = useState<Record<string, string>>(state.destinationOverrides ? Object.fromEntries(Object.entries(state.destinationOverrides).map(([k, v]) => [k, v.name])) : {})
  const [tableDestSchemas, setTableDestSchemas] = useState<Record<string, string>>(state.destinationOverrides ? Object.fromEntries(Object.entries(state.destinationOverrides).map(([k, v]) => [k, v.schema])) : {})
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showMappings, setShowMappings] = useState(false)
  const [mappingMode, setMappingMode] = useState<"append" | "delete" | "create">("append")
  const [identityInsert, setIdentityInsert] = useState(false)

  const toggleSchema = (schema: string) => {
    setExpandedSchemas((prev) => ({ ...prev, [schema]: !prev[schema] }))
  }

  const toggleTable = (tableId: string) => {
    setState({
      ...state,
      selectedTables: state.selectedTables.includes(tableId)
        ? state.selectedTables.filter((t) => t !== tableId)
        : [...state.selectedTables, tableId],
    })
  }

  const getDestName = (schema: string, table: string) => {
    const key = `${schema}.${table}`
    return tableDestNames[key] || table
  }

  const updateDestName = (schema: string, table: string, newName: string) => {
    const key = `${schema}.${table}`
    setTableDestNames((prev) => ({ ...prev, [key]: newName }))
    setState({
      ...state,
      destinationOverrides: {
        ...state.destinationOverrides,
        [key]: { schema: tableDestSchemas[key] || "dbo", name: newName },
      },
    })
  }

  // Replace mock with backend discovery once on mount
  const [remoteSchemas, setRemoteSchemas] = useState<typeof MOCK_SCHEMAS | null>(null)
  if (!remoteSchemas) {
    // fire and forget
    fetch("/api/discovery", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        const map: any = {}
        for (const s of d?.data?.schemas || []) map[s.name] = s.tables
        setRemoteSchemas(map)
      })
      .catch(() => setRemoteSchemas(MOCK_SCHEMAS))
  }

  const schemasToUse = remoteSchemas || MOCK_SCHEMAS

  const filteredSchemas = Object.entries(schemasToUse).filter(
    ([schema, tables]) =>
      schema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tables.some((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const selectedTableData = selectedTable
    ? schemasToUse[selectedTable.split(".")[0] as keyof typeof schemasToUse]?.find(
        (t) => t.name === selectedTable.split(".")[1],
      )
    : null

  const totalRowsSelected = state.selectedTables.reduce((sum, tableId) => {
    const [schema, table] = tableId.split(".")
    const tableData = schemasToUse[schema as keyof typeof schemasToUse]?.find((t) => t.name === table)
    return sum + (tableData?.rowCount || 0)
  }, 0)

  const ddlPreview = state.selectedTables
    .map((id) => {
      const [schema, table] = id.split(".")
      const dest = getDestName(schema, table)
      const destSchema = tableDestSchemas[id] || "dbo"
      return `CREATE TABLE [${destSchema}].[${dest}] (\n  /* columns will be generated */\n);`
    })
    .join("\n\n")

  function ValidatedNameInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const isValid = /^[A-Za-z_][A-Za-z0-9_]{0,127}$/.test(value)
    return (
      <div className="flex-1">
        <Input
          className={`${isValid ? "" : "border-red-500"}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {!isValid && <p className="text-xs text-red-500 mt-1">Invalid SQL Server name</p>}
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-1">Select Source Tables and Views</h2>
        <p className="text-sm text-muted-foreground">Choose one or more tables and views to copy.</p>
      </div>

      <Card className="border border-border">
        <div className="p-3 border-b border-border bg-muted/20">
          <Input
            placeholder="Search schemas/tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md text-sm"
          />
        </div>
        <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border grid grid-cols-2 gap-4">
          <div>Source: C:\Users\User\Oracle...</div>
          <div>Destination: SQL Server (mock)</div>
        </div>

        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Tables and views</TableHead>
                <TableHead className="w-72">Destination</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchemas.map(([schema, tables]) => (
                <>
                  <TableRow key={`${schema}-hdr`} className="bg-muted/20">
                    <TableCell colSpan={3}>
                      <button
                        onClick={() => toggleSchema(schema)}
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        {expandedSchemas[schema] ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {schema}
                      </button>
                    </TableCell>
                  </TableRow>
                  {expandedSchemas[schema] &&
                    tables.map((t) => {
                      const id = `${schema}.${t.name}`
                      const selected = state.selectedTables.includes(id)
                      const destSchema = tableDestSchemas[id] || "dbo"
                      return (
                        <TableRow key={id} className={`hover:bg-muted/40 ${selectedTable === id ? "bg-primary/10" : ""}`} onClick={() => setSelectedTable(id)}>
                          <TableCell>
                            <Checkbox checked={selected} onChange={() => toggleTable(id)} />
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{t.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              <Input
                                className="w-16 text-center"
                                value={destSchema}
                                onChange={(e) => {
                                  const v = e.target.value
                                  setTableDestSchemas((p) => ({ ...p, [id]: v }))
                                  setState({
                                    ...state,
                                    destinationOverrides: {
                                      ...state.destinationOverrides,
                                      [id]: { schema: v, name: getDestName(schema, t.name) },
                                    },
                                  })
                                }}
                              />
                              <span className="text-muted-foreground">[</span>
                              <ValidatedNameInput
                                value={getDestName(schema, t.name)}
                                onChange={(v) => updateDestName(schema, t.name, v)}
                              />
                              <span className="text-muted-foreground">]</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="px-4 py-3 flex justify-end gap-2 border-t border-border">
          <Button onClick={() => setShowMappings(true)} disabled={!selectedTable}>
            Edit Mappings...
          </Button>
          <Button variant="outline" className="bg-transparent" onClick={() => setShowPreview(true)}>
            Preview...
          </Button>
        </div>
      </Card>

      <div className="flex justify-between gap-4 mt-4">
        <div className="flex gap-2">
          <Button onClick={onPrevious} variant="outline" className="bg-transparent">
            <span className="mr-1">&lt; Back</span>
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-transparent" onClick={() => setShowPreview(true)}>
            Preview...
          </Button>
          <Button onClick={onNext} disabled={state.selectedTables.length === 0}>
            Next &gt;
          </Button>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview (Mock)</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm text-foreground bg-muted/20 p-4 rounded border border-border max-h-[60vh] overflow-auto">
{ddlPreview}
          </pre>
        </DialogContent>
      </Dialog>

      <Dialog open={showMappings} onOpenChange={setShowMappings}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Column Mappings (Mock)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Source: <span className="font-mono">{selectedTable || "(select a table)"}</span>
            </div>
            {selectedTable && (
              <div className="text-sm text-muted-foreground">
                Destination: <span className="font-mono">[{tableDestSchemas[selectedTable] || "dbo"}].[{getDestName(selectedTable.split(".")[0], selectedTable.split(".")[1])}]</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="mode" checked={mappingMode === "create"} onChange={() => setMappingMode("create")} />
                  Create destination table
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="mode" checked={mappingMode === "delete"} onChange={() => setMappingMode("delete")} />
                  Delete rows in destination table
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="mode" checked={mappingMode === "append"} onChange={() => setMappingMode("append")} />
                  Append rows to the destination table
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={identityInsert} onChange={(e) => setIdentityInsert(e.target.checked)} />
                Enable identity insert
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-56">Source</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-20">Nullable</TableHead>
                  <TableHead className="w-16">Size</TableHead>
                  <TableHead className="w-20">Precision</TableHead>
                  <TableHead className="w-16">Scale</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedTable
                  ? [
                      "ID",
                      "NAME",
                      "DESCRIPTION",
                      "CREATED_AT",
                      "UPDATED_AT",
                      "IS_ACTIVE",
                    ]
                  : ["ID", "NAME", "CREATED_AT"]).map((col, idx) => (
                  <TableRow key={col}>
                    <TableCell className="font-mono text-xs">{col}</TableCell>
                    <TableCell>
                      <Input defaultValue={col} />
                    </TableCell>
                    <TableCell>
                      <select className="w-full px-3 py-2 rounded bg-input border border-border text-sm">
                        <option>INT</option>
                        <option>VARCHAR</option>
                        <option>DATETIME2</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Checkbox defaultChecked={idx !== 0} />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue={idx === 1 ? 255 : ""} />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue="" />
                    </TableCell>
                    <TableCell>
                      <Input defaultValue="" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => setShowMappings(false)}>
                OK
              </Button>
              <Button onClick={onNext}>Open Full Editor...</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
