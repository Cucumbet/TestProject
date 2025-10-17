"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import type { MigrationState } from "../migration-wizard"

interface ConnectionsStepProps {
  state: MigrationState
  setState: (state: MigrationState) => void
  onNext: () => void
}

export function ConnectionsStep({ state, setState, onNext }: ConnectionsStepProps) {
  const [testingOracle, setTestingOracle] = useState(false)
  const [testingSqlServer, setTestingSqlServer] = useState(false)
  const [oracleStatus, setOracleStatus] = useState<"idle" | "success" | "error">("idle")
  const [sqlServerStatus, setSqlServerStatus] = useState<"idle" | "success" | "error">("idle")
  const [projectName, setProjectName] = useState(state.projectName)
  const [oracleError, setOracleError] = useState<string>("")
  const [sqlError, setSqlError] = useState<string>("")

  const handleTestOracle = async () => {
    setTestingOracle(true)
    setOracleError("")
    try {
      const res = await fetch("/api/test/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.oracleConnection),
      })
      const data = await res.json()
      if (res.ok && data?.ok) {
        setOracleStatus("success")
      } else {
        setOracleStatus("error")
        setOracleError(data?.error || "Connection failed")
      }
    } catch (e: any) {
      setOracleStatus("error")
      setOracleError("Unexpected error during test")
    } finally {
      setTestingOracle(false)
    }
  }

  const handleTestSqlServer = async () => {
    setTestingSqlServer(true)
    setSqlError("")
    try {
      const res = await fetch("/api/test/sqlserver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.sqlServerConnection),
      })
      const data = await res.json()
      if (res.ok && data?.ok) {
        setSqlServerStatus("success")
      } else {
        setSqlServerStatus("error")
        setSqlError(data?.error || "Connection failed")
      }
    } catch (e: any) {
      setSqlServerStatus("error")
      setSqlError("Unexpected error during test")
    } finally {
      setTestingSqlServer(false)
    }
  }

  const handleSaveAndContinue = () => {
    setState({ ...state, projectName })
    onNext()
  }

  const canContinue = oracleStatus === "success" && sqlServerStatus === "success" && projectName.trim()

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Step 1: Database Connections</h2>
        <p className="text-muted-foreground">Configure your Oracle source and SQL Server destination databases.</p>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium text-foreground mb-2">Project Name</label>
        <Input
          placeholder="e.g., HR Database Migration"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Oracle Connection */}
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Oracle (Source)</h3>
            {oracleStatus === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {oracleStatus === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Host</label>
              <Input
                placeholder="localhost"
                value={state.oracleConnection.host}
                onChange={(e) =>
                  setState({
                    ...state,
                    oracleConnection: { ...state.oracleConnection, host: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Port</label>
                <Input
                  type="number"
                  placeholder="1521"
                  value={state.oracleConnection.port}
                  onChange={(e) =>
                    setState({
                      ...state,
                      oracleConnection: { ...state.oracleConnection, port: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Service/SID</label>
                <Input
                  placeholder="ORCL"
                  value={state.oracleConnection.service}
                  onChange={(e) =>
                    setState({
                      ...state,
                      oracleConnection: { ...state.oracleConnection, service: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <Input
                placeholder="admin"
                value={state.oracleConnection.username}
                onChange={(e) =>
                  setState({
                    ...state,
                    oracleConnection: { ...state.oracleConnection, username: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={state.oracleConnection.password}
                onChange={(e) =>
                  setState({
                    ...state,
                    oracleConnection: { ...state.oracleConnection, password: e.target.value },
                  })
                }
              />
            </div>
            <Button
              onClick={handleTestOracle}
              disabled={testingOracle}
              variant="outline"
              className="w-full bg-transparent"
            >
              {testingOracle ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            {oracleStatus === "error" && oracleError && (
              <p className="text-xs text-red-500">{oracleError}</p>
            )}
          </div>
        </Card>

        {/* SQL Server Connection */}
        <Card className="p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">SQL Server (Destination)</h3>
            {sqlServerStatus === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
            {sqlServerStatus === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Host</label>
              <Input
                placeholder="localhost"
                value={state.sqlServerConnection.host}
                onChange={(e) =>
                  setState({
                    ...state,
                    sqlServerConnection: { ...state.sqlServerConnection, host: e.target.value },
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Port</label>
                <Input
                  type="number"
                  placeholder="1433"
                  value={state.sqlServerConnection.port}
                  onChange={(e) =>
                    setState({
                      ...state,
                      sqlServerConnection: { ...state.sqlServerConnection, port: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Database</label>
                <Input
                  placeholder="master"
                  value={state.sqlServerConnection.database}
                  onChange={(e) =>
                    setState({
                      ...state,
                      sqlServerConnection: { ...state.sqlServerConnection, database: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Username</label>
              <Input
                placeholder="sa"
                value={state.sqlServerConnection.username}
                onChange={(e) =>
                  setState({
                    ...state,
                    sqlServerConnection: { ...state.sqlServerConnection, username: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={state.sqlServerConnection.password}
                onChange={(e) =>
                  setState({
                    ...state,
                    sqlServerConnection: { ...state.sqlServerConnection, password: e.target.value },
                  })
                }
              />
            </div>
            <Button
              onClick={handleTestSqlServer}
              disabled={testingSqlServer}
              variant="outline"
              className="w-full bg-transparent"
            >
              {testingSqlServer ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            {sqlServerStatus === "error" && sqlError && <p className="text-xs text-red-500">{sqlError}</p>}
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <Button onClick={handleSaveAndContinue} disabled={!canContinue} size="lg">
          Save & Continue
        </Button>
      </div>
    </div>
  )
}
